/**
 * Priority Scoring Utility
 * -----------------------------------------
 * Produces a stable 0–100 score (& band) indicating urgency + impact.
 * Formula components (each normalized 0–1 unless stated):
 *  - impact: (weightPercent/100) * (moduleCredits / 20)
 *      Rationale: assignment weight scaled by relative module credit load (20 credits => factor 1).
 *  - proximity: logistic time-to-due transformation of daysUntilDue.
 *      Uses daysUntil = clamp(-5 .. 60). Earlier (negative / imminent) => value near 1, far future -> ~0.
 *  - deficit: max(0, (targetMark - currentPredicted)/100)  (need-to-improve component)
 *  - progression: bump for prerequisite criticality, historical failures, and missed assignments.
 *      progressionRaw = (isPrereqCritical ? 0.7 : 0) + min(0.4, failedBeforeCount * 0.2) + min(0.3, missedAssignmentsCount * 0.1)
 *      normalized progression = min(1, progressionRaw) (weight applied later)
 *  - creditMultiplier: (1 + moduleCredits / 30) (larger credit modules scale composite)
 *  - electiveBonus: small additive (<= 0.1) if DSM elective & user behind elective credits.
 * Weighted blend (weights sum to 1):
 *   blend = impact*0.35 + proximity*0.35 + deficit*0.15 + progression*0.15
 * Final:
 *   raw = (blend * creditMultiplier) + electiveBonus
 *   score = clamp(raw * 100, 0, 100)
 * Bands: HIGH > 70, MEDIUM 40–70, else LOW
 *
 * All components + intermediate values returned for audit / UI explanation.
 */
import { differenceInCalendarDays } from 'date-fns';

export interface PriorityScoreInput {
  weightPercent?: number | null;
  moduleCredits?: number | null;
  dueDate?: Date | null;
  referenceDate?: Date;
  targetMark?: number | null;
  currentPredicted?: number | null;
  isPrereqCritical?: boolean;
  failedBeforeCount?: number;
  missedAssignmentsCount?: number;
  isElectiveDSM?: boolean;
  electiveCreditDeficit?: number | null;
}

export interface PriorityScoreResult {
  score: number;
  band: 'HIGH' | 'MEDIUM' | 'LOW';
  components: {
    impact: number;
    proximity: number;
    deficit: number;
    progression: number;
    creditMultiplier: number;
    electiveBonus: number;
    blend: number;
    daysUntilDue: number | null;
  };
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

function logisticProximity(daysUntil: number | null): number {
  if (daysUntil === null) return 0.5;
  const d = clamp(daysUntil, -5, 60);
  const k = 1 / (1 + Math.exp((d - 3) / 3));
  return k;
}

export function getPriorityScore(input: PriorityScoreInput): PriorityScoreResult {
  const {
    weightPercent = 0,
    moduleCredits = 0,
    dueDate,
    referenceDate = new Date(),
    targetMark = 0,
    currentPredicted = 0,
    isPrereqCritical = false,
    failedBeforeCount = 0,
    missedAssignmentsCount = 0,
    isElectiveDSM = false,
    electiveCreditDeficit = 0,
  } = input;

  const daysUntilDue = dueDate ? differenceInCalendarDays(dueDate, referenceDate) : null;

  const impact = clamp(((weightPercent || 0) / 100) * ((moduleCredits || 0) / 20), 0, 2);
  const proximity = logisticProximity(daysUntilDue);
  const deficitRaw = targetMark && currentPredicted ? targetMark - currentPredicted : 0;
  const deficit = clamp(deficitRaw / 100, 0, 1);
  const progressionRaw = (isPrereqCritical ? 0.7 : 0) + clamp(failedBeforeCount * 0.2, 0, 0.4) + clamp(missedAssignmentsCount * 0.1, 0, 0.3);
  const progression = clamp(progressionRaw, 0, 1);
  const creditMultiplier = 1 + clamp((moduleCredits || 0) / 30, 0, 2);
  const electiveBonus = isElectiveDSM && electiveCreditDeficit && electiveCreditDeficit > 0 ? clamp(electiveCreditDeficit / 60, 0.05, 0.1) : 0;

  const blend = impact * 0.35 + proximity * 0.35 + deficit * 0.15 + progression * 0.15;
  const raw = (blend * creditMultiplier) + electiveBonus;
  const scaled = clamp(raw * 100, 0, 100);
  const score = Math.round(scaled);
  const band: PriorityScoreResult['band'] = score > 70 ? 'HIGH' : score >= 40 ? 'MEDIUM' : 'LOW';

  return {
    score,
    band,
    components: { impact, proximity, deficit, progression, creditMultiplier, electiveBonus, blend, daysUntilDue },
  };
}

export default getPriorityScore;
