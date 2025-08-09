import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
// Avoid build-time dependency on generated Prisma types
type Module = { id: string; code: string; title: string; creditHours: number; createdAt: Date } & {
  components: any[];
  assignments: any[];
  tasks: any[];
};

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    let userId = url.searchParams.get('userId');
    // Fallback: default to first user for local/dev tooling that omits userId
    if (!userId) {
      userId = (await prisma.user.findFirst({ select: { id: true } }))?.id || null as any;
    }
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

    const modules: Array<Module & { components: any[]; assignments: any[]; tasks: any[] }> = (await prisma.module.findMany({
      where: { ownerId: userId },
      include: { components: true, assignments: true, tasks: true },
    })) as any;

    // Enrich assignments with derived contribution = gradePercent * weight,
    // where gradePercent is derived from score/maxScore when available, else raw score (%)
    const enriched = modules.map((mod) => {
      const assignmentsWithContribution = (mod.assignments || []).map((a: any) => {
        const hasScore = a?.score != null;
        const scoreNum = Number(a?.score);
        const maxNum = a?.maxScore != null ? Number(a.maxScore) : null;
        const gradePercent = hasScore
          ? (maxNum && Number.isFinite(maxNum) && maxNum > 0 ? (scoreNum / maxNum) * 100 : scoreNum)
          : null;
        const contribution = hasScore && a?.status === 'GRADED'
          ? (gradePercent as number) / 100 * (Number(a?.weight) || 0)
          : null;
        return { ...a, gradePercent, contribution };
      });
      return { ...mod, assignments: assignmentsWithContribution };
    });

    return NextResponse.json({ data: enriched });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      ownerId?: string;
      code: string;
      title?: string;
      creditHours?: number;
    };
    let { ownerId, code, title, creditHours } = body;
    if (!ownerId || !code) {
      return NextResponse.json({ error: 'missing owner or code' }, { status: 400 });
    }
    title = title?.trim() || code;
    creditHours = typeof creditHours === 'number' ? creditHours : 12;

    const created = await prisma.module.create({ data: { ownerId, code, title, creditHours } });
    return NextResponse.json({ data: created }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}

