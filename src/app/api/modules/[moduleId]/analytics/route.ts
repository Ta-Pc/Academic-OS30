import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _req: NextRequest,
  { params }: { params: { moduleId: string } }
) {
  try {
    const { moduleId } = params;
    const module = await prisma.module.findUnique({
      where: { id: moduleId },
      include: {
        components: true,
        assignments: true,
      },
    });
    if (!module) return NextResponse.json({ error: 'module not found' }, { status: 404 });

    const target = typeof module.targetMark === 'number' ? module.targetMark : 0; // percent target on 0-100

    // Compute using score/maxScore when available, falling back to score as percentage (0-100)
  const graded = module.assignments.filter((a) => a.score != null && a.status === 'GRADED');
  const toPercent = (a: { score: number | null; maxScore: number | null }): number => {
      const score = Number(a.score);
      const max = a.maxScore != null ? Number(a.maxScore) : null;
      if (max && Number.isFinite(max) && max > 0) return (score / max) * 100;
      return score; // assume already a percentage
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
      const maxNum = a?.maxScore != null ? Number(a.maxScore) : null;
      const gradePercent = hasScore
        ? (maxNum && Number.isFinite(maxNum) && maxNum > 0 ? (Number(scoreNum) / Number(maxNum)) * 100 : Number(scoreNum))
        : null;
      const contribution = hasScore && a?.status === 'GRADED'
        ? ((gradePercent as number) / 100) * (Number(a?.weight) || 0)
        : null;
      return {
        id: a.id,
        title: a.title,
        dueDate: a.dueDate,
        score: a.score,
        maxScore: a.maxScore,
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

