import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { startOfWeek, endOfWeek, differenceInCalendarDays } from 'date-fns';
import { z } from 'zod';
import { getPriorityScore } from '@/utils/priorityScore';

// Using shared priority score util (imported)

const querySchema = z.object({
  date: z.string().regex(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const parsed = querySchema.safeParse({ date: url.searchParams.get('date') || undefined });
    if (!parsed.success) return NextResponse.json({ error: 'Invalid query params', issues: parsed.error.issues }, { status: 400 });

    // Authentication stub: use seed user in dev if no auth header
    let userId: string | null = null;
    const authHeader = req.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      // decode token stub (not implemented) -> fallback to seed user
    }
    const seedUser = await prisma.user.findFirst({ where: { id: 'seed-user-1' } });
    userId = seedUser?.id || (await prisma.user.findFirst({ select: { id: true } }))?.id || null;
    if (!userId) return NextResponse.json({ error: 'No user available' }, { status: 404 });

    const baseDate = parsed.data.date ? new Date(parsed.data.date + 'T00:00:00') : new Date();
    const weekStart = startOfWeek(baseDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(baseDate, { weekStartsOn: 1 });

    // Fetch assignments due in range
    const assignments = await prisma.assignment.findMany({
      where: { module: { ownerId: userId }, dueDate: { gte: weekStart, lte: weekEnd } },
      include: { module: true },
      orderBy: [{ dueDate: 'asc' }],
    });

    const tacticalTasks = await prisma.tacticalTask.findMany({
      where: { module: { ownerId: userId }, dueDate: { gte: weekStart, lte: weekEnd } },
      include: { module: true },
      orderBy: [{ dueDate: 'asc' }],
    });

    // Study logs for total study minutes (legacy)
    const studyLogs = await prisma.studyLog.findMany({
      where: { userId, loggedAt: { gte: weekStart, lte: weekEnd } },
    });
    const totalStudyMinutes = studyLogs.reduce((s, l) => s + l.durationMin, 0);

    // Modules active during the week (intersection of date ranges)
    const modules = await prisma.module.findMany({
      where: {
        ownerId: userId,
        OR: [
          { startDate: { lte: weekEnd }, endDate: { gte: weekStart } },
          { startDate: null, endDate: null }, // fallback modules w/o dates
        ],
      },
    });

    const moduleSummaries = modules.map(m => {
      const modAssignments = assignments.filter(a => a.moduleId === m.id);
      const modTasks = tacticalTasks.filter(t => t.moduleId === m.id);
      const nextDue = [...modAssignments, ...modTasks]
        .map(i => (i as { dueDate: Date | null }).dueDate)
        .filter((d): d is Date => !!d)
        .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())[0];
      const daysUntilNext = nextDue ? differenceInCalendarDays(new Date(nextDue), new Date()) : null;
      const totalWeight = modAssignments.reduce((s, a) => s + (a.weight || 0), 0);
      const priorityScore = getPriorityScore({ weightPercent: totalWeight, moduleCredits: m.creditHours, dueDate: nextDue ? new Date(nextDue) : undefined, isPrereqCritical: false });
      return {
        moduleId: m.id,
        code: m.code,
        title: m.title,
        isCore: m.isCore,
        electiveGroup: m.electiveGroup,
        creditHours: m.creditHours,
        nextDueDate: nextDue,
        daysUntilNextDue: daysUntilNext,
        assignmentCount: modAssignments.length,
        taskCount: modTasks.length,
        priorityScore: priorityScore.score,
      };
    });

    // Weekly priorities: top items by priorityScore or due date urgency
  // using Date.now() directly for priority scoring calculations
    type PriorityItem = { type: string; id: string; title: string; moduleCode: string; dueDate: Date | undefined; weight: number; priorityScore: number };
    const weeklyPriorities: PriorityItem[] = [
      ...assignments.map(a => {
        const dueDate = a.dueDate ? new Date(a.dueDate) : undefined;
        const pr = getPriorityScore({ weightPercent: a.weight, moduleCredits: a.module.creditHours, dueDate });
        return { type: 'ASSIGNMENT', id: a.id, title: a.title, moduleCode: a.module.code, dueDate, weight: a.weight || 0, priorityScore: pr.score } as PriorityItem;
      }),
      ...tacticalTasks.map(t => {
        const dueDate = t.dueDate ? new Date(t.dueDate) : undefined;
        const pr = getPriorityScore({ weightPercent: 0, moduleCredits: t.module.creditHours, dueDate });
        return { type: 'TACTICAL_TASK', id: t.id, title: t.title, moduleCode: t.module.code, dueDate, weight: 0, priorityScore: pr.score } as PriorityItem;
      }),
    ].sort((a, b) => b.priorityScore - a.priorityScore).slice(0, 15);

    const body = {
      weekRange: { start: weekStart.toISOString(), end: weekEnd.toISOString() },
      assignments: assignments.map(a => ({
        id: a.id,
        title: a.title,
        dueDate: a.dueDate,
        weight: a.weight,
        status: a.status,
        module: { id: a.module.id, code: a.module.code, title: a.module.title, isCore: a.module.isCore },
      })),
      tacticalTasks: tacticalTasks.map(t => ({
        id: t.id,
        title: t.title,
        dueDate: t.dueDate,
        status: t.status,
        type: t.type,
        module: { id: t.module.id, code: t.module.code, title: t.module.title, isCore: t.module.isCore },
      })),
      moduleSummaries,
      weeklyPriorities,
      // Backwards compatible legacy shape for existing hook (can be removed once hook updated)
      data: {
        start: weekStart.toISOString(),
        end: weekEnd.toISOString(),
        tasks: tacticalTasks.map(t => ({ id: t.id, title: t.title, status: t.status, type: t.type, dueDate: t.dueDate })),
        totalStudyMinutes,
      },
    };

    return NextResponse.json(body, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}

