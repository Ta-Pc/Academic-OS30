import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
// Use inline shapes to avoid depending on generated Prisma types at build time
type Module = { id: string; code: string; title: string; creditHours: number; createdAt: Date };

type ModuleSummary = Pick<Module, 'id' | 'code' | 'title' | 'creditHours' | 'createdAt'> & {
  currentGrade: number; // Σ (grade% * weight)
  currentAverageMark: number; // average of graded assignment percents
};

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    let userId = url.searchParams.get('userId');
    if (!userId) {
      userId = (await prisma.user.findFirst({ select: { id: true } }))?.id || null as any;
    }
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

    const [modules, lateAssignments, upcomingAssignments, tasksAll] = await Promise.all([
      prisma.module.findMany({
        where: { ownerId: userId },
        include: { assignments: true, tasks: true },
      }) as unknown as Promise<Array<any>>, // widen type to any for server-only runtime
      prisma.assignment.findMany({
        where: { module: { ownerId: userId }, status: 'LATE' },
        include: { module: true },
        orderBy: { dueDate: 'asc' },
        take: 10,
      }),
      (() => {
        const now = new Date();
        const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
        return prisma.assignment.findMany({
          where: {
            module: { ownerId: userId },
            dueDate: { gte: now, lte: in3Days },
            status: { in: ['PENDING', 'DUE'] },
          },
          include: { module: true },
          orderBy: { dueDate: 'asc' },
          take: 10,
        });
      })(),
      prisma.tacticalTask.findMany({ where: { module: { ownerId: userId } }, select: { status: true } }),
    ]);

    const computePercent = (a: any): number => {
      const score = Number(a.score);
      const max = a.maxScore != null ? Number(a.maxScore) : null;
      if (max && Number.isFinite(max) && max > 0) return (score / max) * 100;
      return score; // assume already a percent
    };

    const modulesSummary: ModuleSummary[] = (modules as any[]).map((mod: any) => {
      const graded = (mod.assignments || []).filter((a: any) => a.score != null && a.status === 'GRADED');
      const currentGrade = graded.reduce((sum: number, a: any) => sum + (computePercent(a) / 100) * (Number(a.weight) || 0), 0);
      const currentAverageMark = graded.length > 0
        ? graded.reduce((s: number, a: any) => s + computePercent(a), 0) / graded.length
        : 0;
      return {
        id: mod.id,
        code: mod.code,
        title: mod.title,
        creditHours: mod.creditHours,
        createdAt: mod.createdAt,
        currentGrade,
        currentAverageMark,
      } satisfies ModuleSummary;
    });

    const strugglingModules = modulesSummary
      .filter((m) => m.currentAverageMark > 0 && m.currentAverageMark < 50)
      .slice(0, 10);

    // Overall performance: credit-hour weighted average of currentAverageMark over ACTIVE modules
    const activeModules = modules.filter((m) => m.status === 'ACTIVE');
    const weighted = activeModules.reduce(
      (acc, m) => {
        const summary = modulesSummary.find((mm) => mm.id === m.id)!;
        const weight = Number(m.creditHours) || 0;
        acc.totalWeight += weight;
        acc.weightedSum += (summary.currentAverageMark || 0) * weight;
        return acc;
      },
      { totalWeight: 0, weightedSum: 0 }
    );
    const overallWeightedAverage = weighted.totalWeight > 0 ? weighted.weightedSum / weighted.totalWeight : 0;

    const tasksCompleted = (tasksAll as any[]).filter((t: any) => t.status === 'COMPLETED').length;
    const tasksPending = (tasksAll as any[]).filter((t: any) => t.status === 'PENDING').length;

    return NextResponse.json({
      data: modulesSummary,
      widgets: {
        urgent: {
          lateAssignments: (lateAssignments as any[]).map((a: any) => ({
            id: a.id,
            title: a.title,
            dueDate: a.dueDate,
            module: { id: a.module.id, code: a.module.code, title: a.module.title },
          })),
          upcomingAssignments: (upcomingAssignments as any[]).map((a: any) => ({
            id: a.id,
            title: a.title,
            dueDate: a.dueDate,
            module: { id: a.module.id, code: a.module.code, title: a.module.title },
          })),
          strugglingModules: (strugglingModules as any[]).map((m: any) => ({
            id: m.id,
            code: m.code,
            title: m.title,
            currentAverageMark: m.currentAverageMark,
          })),
        },
        metrics: {
          overallWeightedAverage,
          tasks: { completed: tasksCompleted, pending: tasksPending },
        },
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}

