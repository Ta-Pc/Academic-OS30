import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get all modules with their assignments
    const modules = await prisma.module.findMany({
      where: { status: 'ACTIVE' },
      include: { 
        assignments: true,
        tasks: true
      }
    });

    const actions = [];
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    for (const module of modules) {
      // Check for overdue assignments
      const overdueAssignments = module.assignments.filter(a => 
        a.dueDate && a.dueDate < now && a.status === 'PENDING'
      );
      
      if (overdueAssignments.length > 0) {
        actions.push({
          type: 'assignment',
          priority: 'high',
          title: `Complete overdue assignments in ${module.code}`,
          description: `You have ${overdueAssignments.length} overdue assignment(s) in ${module.title}`,
          moduleCode: module.code,
          count: overdueAssignments.length
        });
      }

      // Check for upcoming assignments
      const upcomingAssignments = module.assignments.filter(a => 
        a.dueDate && a.dueDate > now && a.dueDate <= weekFromNow && a.status === 'PENDING'
      );
      
      if (upcomingAssignments.length > 0) {
        actions.push({
          type: 'assignment',
          priority: 'medium',
          title: `Prepare for upcoming assignments in ${module.code}`,
          description: `You have ${upcomingAssignments.length} assignment(s) due within a week in ${module.title}`,
          moduleCode: module.code,
          count: upcomingAssignments.length
        });
      }

      // Check for poor performance (simplified logic)
      const gradedAssignments = module.assignments.filter(a => a.score != null && a.status === 'GRADED');
      if (gradedAssignments.length > 0) {
        const avgGrade = gradedAssignments.reduce((sum, a) => {
          const score = a.score || 0;
          const maxScore = a.maxScore || 100;
          return sum + (score / maxScore) * 100;
        }, 0) / gradedAssignments.length;

        if (avgGrade < 50) {
          actions.push({
            type: 'performance',
            priority: 'high',
            title: `Improve performance in ${module.code}`,
            description: `Your current average in ${module.title} is ${avgGrade.toFixed(1)}%. Consider additional study time.`,
            moduleCode: module.code,
            averageGrade: avgGrade
          });
        }
      }

      // Check for pending tasks
      const pendingTasks = module.tasks.filter(t => t.status === 'PENDING');
      if (pendingTasks.length > 2) {
        actions.push({
          type: 'task',
          priority: 'low',
          title: `Complete pending tasks in ${module.code}`,
          description: `You have ${pendingTasks.length} pending tactical tasks in ${module.title}`,
          moduleCode: module.code,
          count: pendingTasks.length
        });
      }
    }

    // Sort by priority (high, medium, low)
    const priorityOrder: { [key: string]: number } = { high: 3, medium: 2, low: 1 };
    actions.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);

    return NextResponse.json({
      actions: actions.slice(0, 10) // Limit to top 10 actions
    });
  } catch (error) {
    console.error('Remediation API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch remediation data' },
      { status: 500 }
    );
  }
}
