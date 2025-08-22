import { prisma } from '@/lib/prisma';
import { AssignmentStatus } from '@prisma/client';

/**
 * Assignment Status Management Utility
 * Automatically updates assignment statuses based on business logic:
 *
 * PENDING: Assignment is upcoming (due date > today), not yet complete.
 * DUE: Assignment's due date is today or has passed, not graded or complete.
 * COMPLETE: Assignment is marked as complete by the user, but not yet graded.
 * GRADED: Assignment has a score/grade entered.
 * MISSED: Assignment is marked as missed by the user.
 */

export async function updateAssignmentStatuses() {
  const now = new Date();

  try {
    // Update GRADED status for assignments with scores
    await prisma.assignment.updateMany({
      where: {
        score: { not: null },
        status: { not: 'GRADED' },
      },
      data: { status: 'GRADED' },
    });

    // Update DUE status for past-due assignments that are not graded or complete
    await prisma.assignment.updateMany({
      where: {
        dueDate: { lt: now },
        score: null,
        status: { notIn: ['GRADED', 'COMPLETE', 'DUE', 'MISSED'] },
      },
      data: { status: 'DUE' },
    });

    // Update PENDING status for future assignments that are not yet complete
    await prisma.assignment.updateMany({
      where: {
        dueDate: { gte: now },
        score: null,
        status: { notIn: ['GRADED', 'COMPLETE', 'PENDING', 'MISSED'] },
      },
      data: { status: 'PENDING' },
    });

    console.log('✅ Assignment statuses updated successfully');
  } catch (error) {
    console.error('❌ Failed to update assignment statuses:', error);
    throw error;
  }
}

export async function updateSingleAssignmentStatus(assignmentId: string) {
  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
  });

  if (!assignment) {
    throw new Error('Assignment not found');
  }

  // If assignment has a score, it's graded, regardless of previous status
  if (assignment.score !== null) {
    if (assignment.status !== 'GRADED') {
      await prisma.assignment.update({
        where: { id: assignmentId },
        data: { status: 'GRADED' },
      });
    }
    return 'GRADED';
  }

  // If status is 'COMPLETE' or 'MISSED', don't automatically change it.
  if (assignment.status === 'COMPLETE' || assignment.status === 'MISSED') {
    return assignment.status;
  }

  let newStatus: AssignmentStatus = assignment.status;

  if (assignment.dueDate) {
    const now = new Date();
    if (assignment.dueDate < now) {
      // If assignment is past due and not graded, complete, or missed, mark as LATE
      newStatus = 'LATE';
    } else {
      newStatus = 'PENDING';
    }
  }

  if (newStatus !== assignment.status) {
    await prisma.assignment.update({
      where: { id: assignmentId },
      data: { status: newStatus },
    });
  }

  return newStatus;
}
