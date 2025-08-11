import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { confirmReset } = await req.json();
    
    if (!confirmReset) {
      return NextResponse.json({ error: 'Reset confirmation required' }, { status: 400 });
    }

    // Delete all academic data in the correct order to avoid foreign key constraint issues
    const result = await prisma.$transaction(async (tx) => {
      // Delete child records first (they reference parent records)
      
      // 1. Delete study logs (they reference users and modules)
      const deletedStudyLogs = await tx.studyLog.deleteMany({});
      
      // 2. Delete assignments (they reference modules and components)
      const deletedAssignments = await tx.assignment.deleteMany({});
      
      // 3. Delete tactical tasks (they reference modules)
      const deletedTasks = await tx.tacticalTask.deleteMany({});
      
      // 4. Delete assessment components (they reference modules)
      const deletedComponents = await tx.assessmentComponent.deleteMany({});
      
      // 5. Delete modules (they reference terms)
      const deletedModules = await tx.module.deleteMany({});
      
      // 6. Delete terms (they reference degrees and academic years)
      const deletedTerms = await tx.term.deleteMany({});
      
      // 7. Delete academic years
      const deletedAcademicYears = await tx.academicYear.deleteMany({});
      
      // 8. Delete degrees
      const deletedDegrees = await tx.degree.deleteMany({});
      
      // Note: Users are preserved to maintain system access

      return {
        deletedStudyLogs: deletedStudyLogs.count,
        deletedAssignments: deletedAssignments.count,
        deletedTasks: deletedTasks.count,
        deletedComponents: deletedComponents.count,
        deletedModules: deletedModules.count,
        deletedTerms: deletedTerms.count,
        deletedAcademicYears: deletedAcademicYears.count,
        deletedDegrees: deletedDegrees.count
      };
    });

    return NextResponse.json({ 
      success: true, 
      message: 'All academic data has been completely reset successfully',
      summary: result
    });
  } catch (error) {
    console.error('Reset data error:', error);
    return NextResponse.json({ 
      error: 'Failed to reset data', 
      details: (error as Error).message 
    }, { status: 500 });
  }
}
