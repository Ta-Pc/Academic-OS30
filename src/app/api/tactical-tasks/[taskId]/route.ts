import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
type TacticalTaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    const { taskId } = params;
    const body = await req.json();
    const status = body?.status as TacticalTaskStatus | undefined;
    const userId = body?.userId as string | undefined;

    const existing = await prisma.tacticalTask.findUnique({ where: { id: taskId }, include: { module: true } });
    if (!existing) return NextResponse.json({ error: 'not found' }, { status: 404 });
    // No ownership check needed since we removed users

    if (!status || !['PENDING', 'IN_PROGRESS', 'COMPLETED'].includes(status)) {
      return NextResponse.json({ error: 'invalid status' }, { status: 400 });
    }

    const updated = await prisma.tacticalTask.update({ where: { id: taskId }, data: { status } });
    return NextResponse.json({ data: updated });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}


