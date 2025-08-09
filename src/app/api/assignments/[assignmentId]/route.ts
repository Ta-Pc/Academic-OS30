import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { assignmentId: string } }
) {
  try {
    const { assignmentId } = params;
    const body = await req.json();
    const score = body?.score as number | null;
    let userId = body?.userId as string | undefined;
    // Dev convenience: fallback to first user if not provided
    if (!userId) {
      userId = (await prisma.user.findFirst({ select: { id: true } }))?.id;
    }
    if (!userId) {
      return NextResponse.json({ error: 'unauthorized: userId required' }, { status: 401 });
    }

    const existing = await prisma.assignment.findUnique({ where: { id: assignmentId }, include: { module: true } });
    if (!existing) return NextResponse.json({ error: 'not found' }, { status: 404 });
    if (existing.module?.ownerId && existing.module.ownerId !== userId) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }

    if (score !== null && score !== undefined) {
      if (typeof score !== 'number' || Number.isNaN(score)) {
        return NextResponse.json({ error: 'score must be a number' }, { status: 400 });
      }
      if (score < 0 || score > 100) {
        return NextResponse.json({ error: 'score must be between 0 and 100 (percent)' }, { status: 400 });
      }
    }

    const updated = await prisma.assignment.update({
      where: { id: assignmentId },
      data: {
        score,
        // Guarantee analytics inclusion semantics: when a score is set, mark as GRADED; when cleared, revert to PENDING
        status: score == null ? 'PENDING' : 'GRADED',
      },
    });
    return NextResponse.json({ data: updated });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}


