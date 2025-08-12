import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _req: NextRequest,
  { params }: { params: { moduleId: string } }
) {
  try {
    const { moduleId } = params;
    
    // Support lookup by both id (CUID) and code (like STK110)
    const isCuid = /^c[a-z0-9]{24,}$/i.test(moduleId);
    const whereClause = isCuid ? { id: moduleId } : { code: moduleId };
    
    const module = await prisma.module.findFirst({
      where: whereClause,
      include: {
        components: true,
        assignments: true,
      },
    });
    if (!module) return NextResponse.json({ error: 'module not found' }, { status: 404 });

    const target = typeof module.targetMark === 'number' ? module.targetMark : 0; // percent target on 0-100

    // Compute using score as percentage (0-100) - no maxScore needed
  const graded = module.assignments.filter((a) => a.score != null && a.status === 'GRADED');
  const toPercent = (a: { score: number | null }): number => {
      const score = Number(a.score);
      return score; // score is already a percentage
    };

    // Σ contribution where contribution = gradePercent * weight
  const currentObtainedMark = graded.reduce((sum: number, a) => {
      const pct = toPercent(a) / 100;
      const weight = Number(a.weight) || 0;
      const contribution = pct * weight;
      return sum + contribution;
    }, 0);

    const totalWeightAssessed = graded.reduce((sum: number, a) => sum + (Number(a.weight) || 0), 0);
    const avgPercent = graded.length > 0
      ? graded.reduce((s: number, a) => s + toPercent(a), 0) / graded.length
      : 0;

    const remainingWeight = Math.max(0, 100 - totalWeightAssessed);
    let requiredAveOnRemaining = 0;
    if (remainingWeight > 0) {
      requiredAveOnRemaining = Math.max(0, Math.min(100, ((target - currentObtainedMark) / remainingWeight) * 100));
    }
    const currentPredictedSemesterMark = currentObtainedMark + remainingWeight * (avgPercent / 100);

    // Enrich assignments with derived gradePercent and contribution for UI table
  const assignments = (module.assignments || []).map((a) => {
      const hasScore = a?.score != null;
      const scoreNum = hasScore ? Number(a.score) : null;
      const gradePercent = hasScore ? Number(scoreNum) : null; // score is already a percentage
      const contribution = hasScore && a?.status === 'GRADED'
        ? ((gradePercent as number) / 100) * (Number(a?.weight) || 0)
        : null;
      return {
        id: a.id,
        title: a.title,
        dueDate: a.dueDate,
        score: a.score,
        weight: a.weight,
        status: a.status,
        componentId: a.componentId,
        gradePercent,
        contribution,
      };
    });

    return NextResponse.json({
      data: {
        module: { id: module.id, code: module.code, title: module.title, targetMark: module.targetMark },
        totalWeightAssessed,
        currentObtainedMark,
        currentAverageMark: avgPercent,
        remainingWeight,
        requiredAveOnRemaining,
        currentPredictedSemesterMark,
        assignments,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}

