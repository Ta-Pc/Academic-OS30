import { prisma } from '@/lib/prisma';

/**
 * Assignment Status Management Utility
 * Automatically updates assignment statuses based on business logic:
 * 
 * PENDING: Assignment is upcoming (due date > today)
 * DUE: Assignment is due today or recently due (within 7 days) but not graded
 * LATE: Assignment is overdue (> 7 days past due date) and not graded  
 * GRADED: Assignment has a score/grade entered
 */

export async function updateAssignmentStatuses() {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  try {
    // Update GRADED status for assignments with scores
    await prisma.assignment.updateMany({
      where: {
        score: { not: null },
        status: { not: 'GRADED' }
      },
      data: { status: 'GRADED' }
    });

    // Update LATE status for overdue assignments without scores
    await prisma.assignment.updateMany({
      where: {
        dueDate: { lt: sevenDaysAgo },
        score: null,
        status: { not: 'LATE' }
      },
      data: { status: 'LATE' }
    });

    // Update DUE status for recently due assignments without scores
    await prisma.assignment.updateMany({
      where: {
        dueDate: { 
          gte: sevenDaysAgo,
          lt: now 
        },
        score: null,
        status: { not: 'DUE' }
      },
      data: { status: 'DUE' }
    });

    // Update PENDING status for future assignments
    await prisma.assignment.updateMany({
      where: {
        dueDate: { gte: now },
        score: null,
        status: { not: 'PENDING' }
      },
      data: { status: 'PENDING' }
    });

    console.log('✅ Assignment statuses updated successfully');
  } catch (error) {
    console.error('❌ Failed to update assignment statuses:', error);
    throw error;
  }
}

export async function updateSingleAssignmentStatus(assignmentId: string) {
  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId }
  });

  if (!assignment) {
    throw new Error('Assignment not found');
  }

  let newStatus = assignment.status;

  // If assignment has a score, it's graded
  if (assignment.score !== null) {
    newStatus = 'GRADED';
  } else if (assignment.dueDate) {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    if (assignment.dueDate < sevenDaysAgo) {
      newStatus = 'LATE';
    } else if (assignment.dueDate < now) {
      newStatus = 'DUE';
    } else {
      newStatus = 'PENDING';
    }
  }

  if (newStatus !== assignment.status) {
    await prisma.assignment.update({
      where: { id: assignmentId },
      data: { status: newStatus }
    });
  }

  return newStatus;
}
