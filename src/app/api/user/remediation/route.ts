import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export interface RemediationAction {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  estimatedHours: number;
  moduleCode?: string;
  type: 'study' | 'assignment' | 'admin' | 'review';
}

export async function GET() {
  try {
    // Get the first user (using same pattern as other APIs)
    const userId = (await prisma.user.findFirst({ select: { id: true } }))?.id;
    if (!userId) {
      return NextResponse.json({ 
        error: 'No user found' 
      }, { status: 404 });
    }

    // Get user's modules with their completion status and assignments
    const modules = await prisma.module.findMany({
      where: { ownerId: userId },
      include: {
        assignments: {
          select: { 
            id: true,
            title: true,
            dueDate: true,
            status: true,
            score: true, 
            maxScore: true, 
            weight: true,
            type: true
          }
        }
      }
    });

    const actions: RemediationAction[] = [];
    let actionIdCounter = 1;

    const now = new Date();

    // Analyze each module and generate recommendations
    for (const module of modules) {
      const moduleAnalysis = analyzeModule(module, now);
      
      // Generate actions based on module analysis
      actions.push(...generateModuleActions(module, moduleAnalysis, actionIdCounter));
      actionIdCounter += actions.length;
    }

    // Add general study recommendations
    actions.push(...generateGeneralActions(modules, actionIdCounter));

    // Sort by priority and limit to top 10 most relevant
    const sortedActions = actions
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      })
      .slice(0, 10);

    return NextResponse.json({ actions: sortedActions });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to get remediation actions';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

interface ModuleWithAssignments {
  id: string;
  code: string;
  title: string;
  creditHours: number;
  assignments: Array<{
    id: string;
    title: string;
    dueDate: Date | null;
    status: string;
    score: number | null;
    maxScore: number | null;
    weight: number;
    type: string;
  }>;
}

interface ModuleAnalysis {
  currentAverage: number;
  isAtRisk: boolean;
  overdueAssignments: Array<{
    id: string;
    title: string;
    dueDate: Date | null;
    status: string;
    type: string;
  }>;
  upcomingAssignments: Array<{
    id: string;
    title: string;
    dueDate: Date | null;
    status: string;
    type: string;
  }>;
  hasGrades: boolean;
}

function analyzeModule(module: ModuleWithAssignments, now: Date): ModuleAnalysis {
  const assignments = module.assignments || [];
  
  // Calculate current average
  const gradedAssignments = assignments.filter((a) => a.status === 'GRADED' && a.score !== null);
  const totalWeight = gradedAssignments.reduce((sum: number, a) => sum + a.weight, 0);
  const weightedScore = gradedAssignments.reduce((sum: number, a) => {
    if (a.maxScore && a.maxScore > 0) {
      return sum + ((a.score as number) / a.maxScore) * a.weight;
    }
    return sum;
  }, 0);
  
  const currentAverage = totalWeight > 0 ? (weightedScore / totalWeight) * 100 : 0;
  
  // Find overdue assignments
  const overdueAssignments = assignments.filter((a) => 
    a.status === 'PENDING' && a.dueDate && new Date(a.dueDate) < now
  );
  
  // Find upcoming assignments (next 2 weeks)
  const twoWeeksFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  const upcomingAssignments = assignments.filter((a) => 
    a.status === 'PENDING' && a.dueDate && 
    new Date(a.dueDate) >= now && new Date(a.dueDate) <= twoWeeksFromNow
  );

  return {
    currentAverage,
    isAtRisk: currentAverage > 0 && currentAverage < 50,
    overdueAssignments,
    upcomingAssignments,
    hasGrades: gradedAssignments.length > 0
  };
}

function generateModuleActions(module: ModuleWithAssignments, analysis: ModuleAnalysis, startId: number): RemediationAction[] {
  const actions: RemediationAction[] = [];
  let actionId = startId;

  // Handle overdue assignments
  analysis.overdueAssignments.forEach((assignment) => {
    actions.push({
      id: `action-${actionId++}`,
      title: `Complete overdue: ${assignment.title}`,
      description: `Submit ${assignment.title} for ${module.code}. This assignment is overdue and requires immediate attention.`,
      priority: 'high',
      estimatedHours: assignment.type === 'TEST' ? 3 : assignment.type === 'GROUP' ? 5 : 2,
      moduleCode: module.code,
      type: 'assignment'
    });
  });

  // Handle upcoming assignments
  analysis.upcomingAssignments.slice(0, 2).forEach((assignment) => {
    const daysUntilDue = Math.ceil((new Date(assignment.dueDate as Date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    actions.push({
      id: `action-${actionId++}`,
      title: `Prepare for: ${assignment.title}`,
      description: `${assignment.title} is due in ${daysUntilDue} days. Start preparation now to avoid last-minute stress.`,
      priority: daysUntilDue <= 3 ? 'high' : 'medium',
      estimatedHours: assignment.type === 'TEST' ? 4 : assignment.type === 'GROUP' ? 3 : 2,
      moduleCode: module.code,
      type: 'study'
    });
  });

  // Handle at-risk modules
  if (analysis.isAtRisk) {
    actions.push({
      id: `action-${actionId++}`,
      title: `Intensive review: ${module.code}`,
      description: `Current average is ${Math.round(analysis.currentAverage)}%. Review all course material and seek help from tutors or lecturers.`,
      priority: 'high',
      estimatedHours: 6,
      moduleCode: module.code,
      type: 'review'
    });

    actions.push({
      id: `action-${actionId++}`,
      title: `Schedule consultation: ${module.code}`,
      description: `Book office hours with the lecturer to discuss specific areas of difficulty and get personalized guidance.`,
      priority: 'medium',
      estimatedHours: 1,
      moduleCode: module.code,
      type: 'admin'
    });
  }

  // General study recommendations for modules with good performance
  if (!analysis.isAtRisk && analysis.hasGrades && analysis.currentAverage >= 70) {
    actions.push({
      id: `action-${actionId++}`,
      title: `Advanced practice: ${module.code}`,
      description: `You're performing well! Try additional practice problems or explore advanced topics to excel further.`,
      priority: 'low',
      estimatedHours: 3,
      moduleCode: module.code,
      type: 'study'
    });
  }

  return actions;
}

function generateGeneralActions(modules: ModuleWithAssignments[], startId: number): RemediationAction[] {
  const actions: RemediationAction[] = [];
  let actionId = startId;

  // Study schedule optimization
  actions.push({
    id: `action-${actionId++}`,
    title: 'Create weekly study schedule',
    description: 'Plan dedicated study time for each module to ensure consistent progress and avoid last-minute cramming.',
    priority: 'medium',
    estimatedHours: 1,
    type: 'admin'
  });

  // Study group formation
  actions.push({
    id: `action-${actionId++}`,
    title: 'Form study groups',
    description: 'Connect with classmates to form study groups for collaborative learning and mutual support.',
    priority: 'low',
    estimatedHours: 2,
    type: 'admin'
  });

  // Resource utilization
  actions.push({
    id: `action-${actionId++}`,
    title: 'Utilize university resources',
    description: 'Visit the academic support center, library study spaces, and online learning resources available through the university.',
    priority: 'low',
    estimatedHours: 2,
    type: 'admin'
  });

  return actions;
}
