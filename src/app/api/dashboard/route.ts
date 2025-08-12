import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';

// Minimal shapes (avoid Prisma types during build lint stage)
type Assignment = { id: string; title: string; dueDate: Date | null; status: string; score: number | null; weight: number | null };
type TacticalTask = { status: string };
type ModuleRecord = { id: string; code: string; title: string; creditHours: number; createdAt: Date; status?: string; assignments?: Assignment[] };

type ModuleSummary = {
  id: string;
  code: string;
  title: string;
  creditHours: number;
  createdAt: Date;
  currentGrade: number;
  currentAverageMark: number;
};

export async function GET() {
  try {
    // Remove user dependency - get all modules and data
    const [modules, lateAssignments, upcomingAssignments, tasksAll] = await Promise.all<[
      Promise<ModuleRecord[]>,
      Promise<(Assignment & { module: { id: string; code: string; title: string } })[]>,
      Promise<(Assignment & { module: { id: string; code: string; title: string } })[]>,
      Promise<TacticalTask[]>
    ]>([
      prisma.module.findMany({
        where: { status: 'ACTIVE' },
        include: { assignments: true, tasks: true },
      }) as Promise<ModuleRecord[]>,
      prisma.assignment.findMany({
        where: { status: 'DUE' },
        include: { module: true },
        orderBy: { dueDate: 'asc' },
        take: 10,
      }),
      (() => {
        const now = new Date();
        const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
        return prisma.assignment.findMany({
          where: {
            dueDate: { gte: now, lte: in3Days },
            status: { in: ['PENDING', 'DUE'] },
          },
          include: { module: true },
          orderBy: { dueDate: 'asc' },
          take: 10,
        });
      })(),
      prisma.tacticalTask.findMany({ select: { status: true } }) as Promise<TacticalTask[]>,
    ]);

    const computePercent = (a: { score: number | null }): number => {
      const score = a.score == null ? 0 : Number(a.score);
      // Score is already a percentage (0-100) since maxScore was removed
      return score;
    };

    const modulesSummary: ModuleSummary[] = modules.map((mod) => {
      const graded = (mod.assignments || []).filter((a) => a.score != null && a.status === 'GRADED');
      
      // Calculate weighted grade for this module
      const totalAssignmentWeight = graded.reduce((sum: number, a) => sum + (Number(a.weight) || 0), 0);
      const weightedScore = graded.reduce((sum: number, a) => sum + (computePercent(a) * (Number(a.weight) || 0)), 0);
      
      const currentGrade = totalAssignmentWeight > 0 ? weightedScore / totalAssignmentWeight : 0;
      const currentAverageMark = graded.length > 0
        ? graded.reduce((s: number, a) => s + computePercent(a), 0) / graded.length
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

    // Overall performance: weighted average across all graded assignments
    const allGradedAssignments = modules.flatMap(m => 
      (m.assignments || []).filter(a => a.score != null && a.status === 'GRADED')
    );
    
    const totalWeight = allGradedAssignments.reduce((sum, a) => sum + (Number(a.weight) || 0), 0);
    const totalWeightedScore = allGradedAssignments.reduce(
      (sum, a) => sum + (computePercent(a) * (Number(a.weight) || 0)), 
      0
    );
    
    const overallWeightedAverage = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;

    // Task progress: use actual tactical tasks, not assignments
    const completedTasks = tasksAll.filter((t: TacticalTask) => t.status === 'COMPLETED').length;
    const totalTasks = tasksAll.length;
    const pendingTasks = totalTasks - completedTasks;

    return NextResponse.json({
      data: modulesSummary,
      widgets: {
        urgent: {
          lateAssignments: lateAssignments.map((a) => ({
            id: a.id,
            title: a.title,
            dueDate: a.dueDate,
            module: { id: a.module.id, code: a.module.code, title: a.module.title },
          })),
          upcomingAssignments: upcomingAssignments.map((a) => ({
            id: a.id,
            title: a.title,
            dueDate: a.dueDate,
            module: { id: a.module.id, code: a.module.code, title: a.module.title },
          })),
          strugglingModules: strugglingModules.map((m) => ({
            id: m.id,
            code: m.code,
            title: m.title,
            currentAverageMark: m.currentAverageMark,
          })),
        },
        metrics: {
          overallWeightedAverage,
          tasks: { completed: completedTasks, pending: pendingTasks },
        },
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}

