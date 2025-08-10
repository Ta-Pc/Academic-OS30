import { computeModulePrediction } from '@/utils/prediction';

describe('computeModulePrediction', () => {
  test('normalizes weights that do not sum to 100', () => {
    const res = computeModulePrediction([
      { weight: 100, score: 80, maxScore: 100, status: 'GRADED' },
      { weight: 100, score: 90, maxScore: 100, status: 'GRADED' },
    ]);
    // Each weight becomes 50 -> contribution = (0.8*50)+(0.9*50)=85
    expect(res.currentObtained).toBeCloseTo(85, 5);
    expect(res.remainingWeight).toBeCloseTo(0, 5);
    expect(res.predictedSemesterMark).toBeCloseTo(85, 5);
  });

  test('prediction projects average across remaining weight', () => {
    const res = computeModulePrediction([
      { weight: 20, score: 75, maxScore: 100, status: 'GRADED' },
      { weight: 40, score: null, maxScore: 100, status: 'PENDING' },
      { weight: 40, score: null, maxScore: 100, status: 'PENDING' },
    ]);
    // sum weights=100 (no normalization). currentObtained = 0.75*20 = 15. remaining=80. avgGraded=75 -> predicted = 15 + 80*0.75=75
    expect(res.currentObtained).toBeCloseTo(15, 5);
    expect(res.remainingWeight).toBeCloseTo(80, 5);
    expect(res.predictedSemesterMark).toBeCloseTo(75, 5);
  });

  test('required average computed when target provided', () => {
    const res = computeModulePrediction([
      { weight: 40, score: 50, maxScore: 100, status: 'GRADED' },
      { weight: 60, score: null, maxScore: 100, status: 'PENDING' },
    ], { targetMark: 75 });
    // currentObtained = 0.5*40=20. remaining=60 -> need (75-20)/60 *100 = 91.666... (clamped <=100)
    expect(res.requiredAverageOnRemaining).toBeCloseTo(91.666, 2);
  });
});
