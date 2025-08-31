import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest, { params }: { params: { moduleId: string } }) {
  try {
    const moduleId = params.moduleId;

    if (!moduleId) {
      return NextResponse.json({ error: 'Module ID is required' }, { status: 400 });
    }

    const module = await prisma.module.findUnique({
      where: { id: moduleId },
      include: {
        assignments: {
          select: {
            id: true,
            title: true,
            status: true,
            score: true,
            weight: true,
            dueDate: true,
            type: true,
            createdAt: true
          },
          orderBy: { dueDate: 'asc' }
        },
        tasks: {
          select: {
            id: true,
            title: true,
            status: true,
            type: true,
            dueDate: true,
            createdAt: true
          },
          orderBy: { dueDate: 'asc' }
        }
      }
    });

    if (!module) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }

    const now = new Date();
    
    // Assignment analytics
    const assignments = module.assignments;
    const gradedAssignments = assignments.filter(a => a.score !== null);
    const pendingAssignments = assignments.filter(a => a.status === 'PENDING');
    const dueAssignments = assignments.filter(a => a.status === 'DUE');
    const lateAssignments = assignments.filter(a => a.status === 'MISSED');
    
    // Performance calculations
    const totalWeight = assignments.reduce((sum, a) => sum + (a.weight || 0), 0);
    const gradedWeight = gradedAssignments.reduce((sum, a) => sum + (a.weight || 0), 0);
    const weightedScore = gradedAssignments.reduce((sum, a) => sum + ((a.score || 0) * (a.weight || 0)), 0);
    
    const currentGrade = gradedWeight > 0 ? weightedScore / gradedWeight : 0;
    const completionRate = assignments.length > 0 ? (gradedAssignments.length / assignments.length) * 100 : 0;
    
    // Task analytics
    const tasks = module.tasks;
    const completedTasks = tasks.filter(t => t.status === 'COMPLETED');
    const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS');
    const pendingTasks = tasks.filter(t => t.status === 'PENDING');
    
    // Upcoming deadlines (next 3)
    const upcomingAssignments = assignments
      .filter(a => a.dueDate && a.dueDate > now && a.status !== 'GRADED')
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
      .slice(0, 3);

    const upcomingTasks = tasks
      .filter(t => t.dueDate && t.dueDate > now && t.status !== 'COMPLETED')
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
      .slice(0, 3);

    // Recent activity (last 7 days)
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentActivity = [
      ...assignments
        .filter(a => a.createdAt > weekAgo && a.score !== null)
        .map(a => ({
          type: 'assignment_graded' as const,
          title: a.title,
          score: a.score,
          weight: a.weight,
          date: a.createdAt
        })),
      ...tasks
        .filter(t => t.createdAt > weekAgo || (t.status === 'COMPLETED'))
        .map(t => ({
          type: 'task_activity' as const,
          title: t.title,
          status: t.status,
          taskType: t.type,
          date: t.createdAt
        }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

    // Progress toward target
    const targetMark = module.targetMark || 75;
    const progressToTarget = currentGrade > 0 ? (currentGrade / targetMark) * 100 : 0;
    const onTrack = currentGrade >= targetMark * 0.8; // 80% of target is "on track"

    const moduleData = {
      id: module.id,
      code: module.code,
      title: module.title,
      creditHours: module.creditHours,
      targetMark,
      status: module.status,
      
      // Performance metrics
      currentGrade: Math.round(currentGrade * 10) / 10,
      completionRate: Math.round(completionRate * 10) / 10,
      progressToTarget: Math.round(progressToTarget * 10) / 10,
      onTrack,
      
      // Assignment breakdown
      assignmentStats: {
        total: assignments.length,
        graded: gradedAssignments.length,
        pending: pendingAssignments.length,
        due: dueAssignments.length,
        late: lateAssignments.length,
        totalWeight,
        gradedWeight,
        remainingWeight: totalWeight - gradedWeight
      },
      
      // Task breakdown
      taskStats: {
        total: tasks.length,
        completed: completedTasks.length,
        inProgress: inProgressTasks.length,
        pending: pendingTasks.length,
        completionRate: tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0
      },
      
      // Upcoming deadlines
      upcoming: {
        assignments: upcomingAssignments.map(a => ({
          id: a.id,
          title: a.title,
          weight: a.weight,
          dueDate: a.dueDate,
          status: a.status,
          daysUntil: Math.ceil((new Date(a.dueDate!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        })),
        tasks: upcomingTasks.map(t => ({
          id: t.id,
          title: t.title,
          type: t.type,
          dueDate: t.dueDate,
          status: t.status,
          daysUntil: Math.ceil((new Date(t.dueDate!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        }))
      },
      
      // Recent activity
      recentActivity
    };

    return NextResponse.json(moduleData);
    
  } catch (error) {
    console.error('Error fetching module details:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
