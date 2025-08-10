import { getPriorityScore } from '@/utils/priorityScore';

describe('priorityScore', () => {
  test('higher weight increases impact', () => {
    const low = getPriorityScore({ weightPercent: 5, moduleCredits: 20, dueDate: new Date(Date.now() + 7*86400000) });
    const high = getPriorityScore({ weightPercent: 40, moduleCredits: 20, dueDate: new Date(Date.now() + 7*86400000) });
    expect(high.score).toBeGreaterThan(low.score);
  });

  test('imminent due date yields higher proximity', () => {
    const soon = getPriorityScore({ weightPercent: 10, moduleCredits: 12, dueDate: new Date(Date.now() + 1*86400000) });
    const far = getPriorityScore({ weightPercent: 10, moduleCredits: 12, dueDate: new Date(Date.now() + 30*86400000) });
    expect(soon.score).toBeGreaterThan(far.score);
  });

  test('overdue escalates score', () => {
    const overdue = getPriorityScore({ weightPercent: 5, moduleCredits: 16, dueDate: new Date(Date.now() - 2*86400000) });
    const future = getPriorityScore({ weightPercent: 5, moduleCredits: 16, dueDate: new Date(Date.now() + 10*86400000) });
    expect(overdue.score).toBeGreaterThan(future.score);
  });

  test('prereq critical + failed history increases progression', () => {
    const base = getPriorityScore({ weightPercent: 10, moduleCredits: 16, dueDate: new Date(Date.now() + 5*86400000) });
    const critical = getPriorityScore({ weightPercent: 10, moduleCredits: 16, dueDate: new Date(Date.now() + 5*86400000), isPrereqCritical: true, failedBeforeCount: 1 });
    expect(critical.score).toBeGreaterThan(base.score);
  });

  test('elective deficit adds bonus', () => {
    const noDef = getPriorityScore({ weightPercent: 10, moduleCredits: 12, dueDate: new Date(Date.now() + 14*86400000), isElectiveDSM: true, electiveCreditDeficit: 0 });
    const def = getPriorityScore({ weightPercent: 10, moduleCredits: 12, dueDate: new Date(Date.now() + 14*86400000), isElectiveDSM: true, electiveCreditDeficit: 24 });
    expect(def.score).toBeGreaterThan(noDef.score);
  });

  test('score capped at 100', () => {
    const extreme = getPriorityScore({ weightPercent: 100, moduleCredits: 60, dueDate: new Date(Date.now() - 3*86400000), isPrereqCritical: true, failedBeforeCount: 3, targetMark: 90, currentPredicted: 10 });
    expect(extreme.score).toBeLessThanOrEqual(100);
  });
});
