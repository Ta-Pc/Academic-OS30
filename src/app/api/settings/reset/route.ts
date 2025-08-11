import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { confirmReset = false } = body;
    
    if (!confirmReset) {
      return NextResponse.json(
        { success: false, error: 'Reset confirmation required' },
        { status: 400 }
      );
    }

    // Get counts before deletion for reporting
    const beforeCounts = {
      modules: await prisma.module.count(),
      assignments: await prisma.assignment.count(),
      tacticalTasks: await prisma.tacticalTask.count(),
      studyLogs: await prisma.studyLog.count(),
      assessmentComponents: await prisma.assessmentComponent.count()
    };

    // Delete data in correct order (respecting foreign key constraints)
    await prisma.$transaction(async (tx) => {
      // Delete study logs first (no dependencies)
      await tx.studyLog.deleteMany({});
      
      // Delete tactical tasks (depends on modules)
      await tx.tacticalTask.deleteMany({});
      
      // Delete assignments (depends on modules and components)
      await tx.assignment.deleteMany({});
      
      // Delete assessment components (depends on modules)
      await tx.assessmentComponent.deleteMany({});
      
      // Delete modules (depends on terms)
      await tx.module.deleteMany({});
      
      // Delete terms (depends on degrees and academic years)
      await tx.term.deleteMany({});
      
      // Delete academic years
      await tx.academicYear.deleteMany({});
      
      // Delete degrees
      await tx.degree.deleteMany({});
      
      // Note: We're not deleting users as they might be needed for authentication
    });

    // Get counts after deletion for verification
    const afterCounts = {
      modules: await prisma.module.count(),
      assignments: await prisma.assignment.count(),
      tacticalTasks: await prisma.tacticalTask.count(),
      studyLogs: await prisma.studyLog.count(),
      assessmentComponents: await prisma.assessmentComponent.count()
    };

    return NextResponse.json({
      success: true,
      message: 'All academic data has been reset successfully',
      resetDetails: {
        beforeCounts,
        afterCounts,
        deletedCounts: {
          modules: beforeCounts.modules - afterCounts.modules,
          assignments: beforeCounts.assignments - afterCounts.assignments,
          tacticalTasks: beforeCounts.tacticalTasks - afterCounts.tacticalTasks,
          studyLogs: beforeCounts.studyLogs - afterCounts.studyLogs,
          assessmentComponents: beforeCounts.assessmentComponents - afterCounts.assessmentComponents
        }
      }
    });
  } catch (error) {
    console.error('Error resetting data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reset data' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Get current database statistics
    const stats = {
      degrees: await prisma.degree.count(),
      terms: await prisma.term.count(),
      modules: await prisma.module.count(),
      assignments: await prisma.assignment.count(),
      tacticalTasks: await prisma.tacticalTask.count(),
      studyLogs: await prisma.studyLog.count(),
      assessmentComponents: await prisma.assessmentComponent.count(),
      users: await prisma.user.count()
    };

    return NextResponse.json({
      success: true,
      data: stats,
      totalRecords: Object.values(stats).reduce((sum, count) => sum + count, 0)
    });
  } catch (error) {
    console.error('Error fetching reset statistics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
