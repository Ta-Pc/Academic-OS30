import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { updateSingleAssignmentStatus } from '@/lib/assignment-status';
import { AssignmentStatus } from '@prisma/client';

export async function GET(
  req: NextRequest,
  { params }: { params: { assignmentId: string } }
) {
  try {
    const { assignmentId } = params;
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        module: {
          select: {
            code: true,
            title: true,
          },
        },
      },
    });

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    return NextResponse.json({ assignment });
  } catch (error) {
    console.error('Failed to get assignment:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { assignmentId: string } }
) {
  try {
    const { assignmentId } = params;
  const body = await req.json();
  const { score, status } = body as { score?: number | null; status?: AssignmentStatus };
  console.log('PATCH /api/assignments/[assignmentId] received:', { score, status });

    const existing = await prisma.assignment.findUnique({ where: { id: assignmentId } });
    if (!existing) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    const updateData: { score?: number | null; status?: AssignmentStatus } = {};

    if (score !== undefined) {
      if (score === null) {
        updateData.score = null;
      } else {
        if (typeof score !== 'number' || isNaN(score) || score < 0 || score > 100) {
          return NextResponse.json({ error: 'Score must be a number between 0 and 100' }, { status: 400 });
        }
        updateData.score = score;
        updateData.status = 'GRADED';
      }
    }

    if (status) {
      console.log('AssignmentStatus enum values:', Object.values(AssignmentStatus));
      if (Object.values(AssignmentStatus).includes(status)) {
        updateData.status = status;
      } else {
        console.error('Invalid status value received:', status);
        return NextResponse.json({ error: 'Invalid status value', received: status, allowed: Object.values(AssignmentStatus) }, { status: 400 });
      }
    }

    const updated = await prisma.assignment.update({
      where: { id: assignmentId },
      data: updateData,
    });

    // If score was cleared, re-evaluate status based on due date
    if (score === null) {
      await updateSingleAssignmentStatus(assignmentId);
    }

    return NextResponse.json({ data: updated });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
