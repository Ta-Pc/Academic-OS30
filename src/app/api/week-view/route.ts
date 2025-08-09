import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { startOfWeek, endOfWeek } from 'date-fns';
type StudyLog = { id: string; durationMin: number; loggedAt: Date };
type TacticalTask = { id: string; title: string; status: string; type: string; dueDate: Date; module: { id: string; code: string; title: string } };

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    let userId = url.searchParams.get('userId');
    const dateParam = url.searchParams.get('date');
    if (!userId) {
      userId = (await prisma.user.findFirst({ select: { id: true } }))?.id || null as any;
    }
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

    const baseDate = dateParam ? new Date(dateParam) : new Date();
    const start = startOfWeek(baseDate, { weekStartsOn: 1 });
    const end = endOfWeek(baseDate, { weekStartsOn: 1 });

    const tasks: Array<TacticalTask & { module: { id: string; code: string; title: string } }> = await prisma.tacticalTask.findMany({
      where: {
        module: { ownerId: userId },
        dueDate: { gte: start, lte: end },
      },
      include: { module: true },
      orderBy: [{ type: 'asc' }, { dueDate: 'asc' }],
    });

    const studyLogs: StudyLog[] = await prisma.studyLog.findMany({
      where: { userId, loggedAt: { gte: start, lte: end } },
    });

    const totalStudyMinutes = studyLogs.reduce((s, l) => s + l.durationMin, 0);

    return NextResponse.json({
      data: { start, end, tasks, studyLogs, totalStudyMinutes },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}

