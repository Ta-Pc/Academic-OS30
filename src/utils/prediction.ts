/**
 * Prediction Utility
 * -------------------
 * Given a list of assignments (with weight & scores) computes:
 *  - currentObtained: Σ(gradePercent * normalizedWeight)/100 for graded assignments
 *  - remainingWeight: 100 - Σ(normalizedWeight of graded)
 *  - requiredAverageOnRemaining: average % needed across remaining weight to reach targetMark (if provided) else null
 *  - predictedSemesterMark: currentObtained + remainingWeight * (avgGradedPercent/100)
 *
 * Weights are NORMALIZED so that Σ(all weights)=100. This allows callers to supply
 * arbitrary relative weights (e.g. they total 40 or 120). If the total weight is 0 we fall back to zeros.
 */

export interface PredictionAssignmentLike {
  id?: string;
  weight: number; // relative weight (percent) – may not sum to 100 overall
  score: number | null; // student raw score or percentage if maxScore absent
  maxScore?: number | null; // if provided, score/maxScore => percentage
  status?: string | null; // 'GRADED' indicates inclusion (also include if score != null)
}

export interface ModulePredictionResult {
  currentObtained: number; // 0-100 weighted obtained so far
  remainingWeight: number; // 0-100 remaining weight still un-assessed
  requiredAverageOnRemaining: number | null; // 0-100 needed to hit targetMark (null if target missing / no remaining)
  predictedSemesterMark: number; // naive projection using average of graded for remaining weight
  gradedCount: number;
  normalizationFactor: number; // factor applied to original weights (100/sumWeights)
}

const toPercent = (a: PredictionAssignmentLike): number | null => {
  if (a.score == null) return null;
  const score = Number(a.score);
  if (a.maxScore != null && a.maxScore > 0) return (score / Number(a.maxScore)) * 100;
  return score; // treat as already percentage
};

export function computeModulePrediction(
  assignments: PredictionAssignmentLike[],
  opts?: { targetMark?: number | null }
): ModulePredictionResult {
  const list = assignments || [];
  const sumWeights = list.reduce((s, a) => s + (Number(a.weight) || 0), 0);
  if (!sumWeights || sumWeights <= 0) {
    return {
      currentObtained: 0,
      remainingWeight: 0,
      requiredAverageOnRemaining: null,
      predictedSemesterMark: 0,
      gradedCount: 0,
      normalizationFactor: 0,
    };
  }
  const normFactor = 100 / sumWeights;

  // Build graded & ungraded sets
  let currentObtained = 0;
  let totalGradedWeight = 0;
  let sumGradedPercents = 0;
  let gradedCount = 0;
  for (const a of list) {
    const pct = toPercent(a);
    if (pct == null) continue;
    // Determine graded: explicit status === 'GRADED' OR we have a score value
    if (a.status === 'GRADED' || pct != null) {
      const nWeight = (Number(a.weight) || 0) * normFactor;
      const contribution = (pct / 100) * nWeight;
      currentObtained += contribution;
      totalGradedWeight += nWeight;
      sumGradedPercents += pct;
      gradedCount += 1;
    }
  }

  const remainingWeight = Math.max(0, 100 - totalGradedWeight);
  const avgGradedPercent = gradedCount > 0 ? sumGradedPercents / gradedCount : 0;
  const predictedSemesterMark = currentObtained + remainingWeight * (avgGradedPercent / 100);

  let requiredAverageOnRemaining: number | null = null;
  const target = opts?.targetMark;
  if (typeof target === 'number' && remainingWeight > 0) {
    requiredAverageOnRemaining = ((target - currentObtained) / remainingWeight) * 100;
    // clamp to 0..100 for practical UI semantics
    requiredAverageOnRemaining = Math.min(100, Math.max(0, requiredAverageOnRemaining));
  }

  return {
    currentObtained: Number(currentObtained.toFixed(4)),
    remainingWeight: Number(remainingWeight.toFixed(4)),
    requiredAverageOnRemaining: requiredAverageOnRemaining == null ? null : Number(requiredAverageOnRemaining.toFixed(4)),
    predictedSemesterMark: Number(predictedSemesterMark.toFixed(4)),
    gradedCount,
    normalizationFactor: Number(normFactor.toFixed(6)),
  };
}

export default computeModulePrediction;
