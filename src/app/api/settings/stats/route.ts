import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get comprehensive database statistics
    const [
      moduleStats,
      assignmentStats,
      taskStats,
      userStats,
      termStats,
      degreeStats,
      studyLogStats
    ] = await Promise.all([
      // Module statistics
      prisma.module.aggregate({
        _count: true,
        _avg: { creditHours: true, targetMark: true },
        _sum: { creditHours: true }
      }),
      
      // Assignment statistics
      prisma.assignment.aggregate({
        _count: true,
        _avg: { maxScore: true, score: true, weight: true },
        _sum: { weight: true }
      }),
      
      // Tactical task statistics
      prisma.tacticalTask.groupBy({
        by: ['status'],
        _count: true
      }),
      
      // User statistics
      prisma.user.count(),
      
      // Term statistics
      prisma.term.groupBy({
        by: ['type'],
        _count: true
      }),
      
      // Degree statistics
      prisma.degree.count(),
      
      // Study log statistics
      prisma.studyLog.aggregate({
        _count: true,
        _sum: { durationMin: true },
        _avg: { durationMin: true }
      })
    ]);

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentActivity = await prisma.studyLog.count({
      where: {
        date: {
          gte: thirtyDaysAgo
        }
      }
    });

    // Get assignment status distribution
    const assignmentStatusStats = await prisma.assignment.groupBy({
      by: ['status'],
      _count: true
    });

    // Get module status distribution
    const moduleStatusStats = await prisma.module.groupBy({
      by: ['status'],
      _count: true
    });

    // Calculate completion rates
    const completedAssignments = await prisma.assignment.count({
      where: { status: 'GRADED' }
    });
    
    const completedTasks = await prisma.tacticalTask.count({
      where: { status: 'COMPLETED' }
    });

    const stats = {
      overview: {
        totalModules: moduleStats._count,
        totalAssignments: assignmentStats._count,
        totalTasks: taskStats.reduce((sum, group) => sum + group._count, 0),
        totalUsers: userStats,
        totalTerms: termStats.reduce((sum, group) => sum + group._count, 0),
        totalDegrees: degreeStats,
        totalStudyLogs: studyLogStats._count
      },
      
      academic: {
        totalCreditHours: moduleStats._sum.creditHours || 0,
        averageCreditHours: moduleStats._avg.creditHours || 0,
        averageTargetMark: moduleStats._avg.targetMark || 0,
        totalAssignmentWeight: assignmentStats._sum.weight || 0,
        averageAssignmentScore: assignmentStats._avg.score || 0,
        averageMaxScore: assignmentStats._avg.maxScore || 0
      },
      
      progress: {
        assignmentCompletionRate: assignmentStats._count > 0 
          ? ((completedAssignments / assignmentStats._count) * 100).toFixed(1)
          : '0',
        taskCompletionRate: taskStats.length > 0
          ? ((completedTasks / taskStats.reduce((sum, group) => sum + group._count, 0)) * 100).toFixed(1)
          : '0'
      },
      
      activity: {
        totalStudyTime: studyLogStats._sum.durationMin || 0,
        averageStudySession: studyLogStats._avg.durationMin || 0,
        recentStudyLogs: recentActivity,
        studyTimeHours: ((studyLogStats._sum.durationMin || 0) / 60).toFixed(1)
      },
      
      distributions: {
        tasksByStatus: taskStats.reduce((acc, group) => {
          acc[group.status] = group._count;
          return acc;
        }, {} as Record<string, number>),
        
        assignmentsByStatus: assignmentStatusStats.reduce((acc, group) => {
          acc[group.status] = group._count;
          return acc;
        }, {} as Record<string, number>),
        
        modulesByStatus: moduleStatusStats.reduce((acc, group) => {
          acc[group.status] = group._count;
          return acc;
        }, {} as Record<string, number>),
        
        termsByType: termStats.reduce((acc, group) => {
          acc[group.type] = group._count;
          return acc;
        }, {} as Record<string, number>)
      },
      
      performance: {
        activeModules: await prisma.module.count({ where: { status: 'ACTIVE' } }),
        upcomingAssignments: await prisma.assignment.count({
          where: {
            dueDate: {
              gte: new Date(),
              lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Next 7 days
            }
          }
        }),
        overdueAssignments: await prisma.assignment.count({
          where: {
            dueDate: {
              lt: new Date()
            },
            status: {
              not: 'GRADED'
            }
          }
        })
      }
    };

    return NextResponse.json({
      success: true,
      data: stats,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
