import { startOfWeek, endOfWeek } from 'date-fns';

describe('week-view unit shape', () => {
  test('priority scoring heuristic ordering', () => {
    function score(days: number, weight: number) {
      let s = weight;
      if (days <= 1) s += 20; else if (days <= 3) s += 10; else if (days <= 7) s += 5;
      s += Math.max(0, 15 - days);
      return s;
    }
    const items = [
      { id: 'a', days: 10, weight: 10 },
      { id: 'b', days: 2, weight: 5 },
      { id: 'c', days: 0, weight: 2 },
    ].map(i => ({ ...i, score: score(i.days, i.weight) }));
    const sorted = [...items].sort((x, y) => y.score - x.score);
    expect(sorted[0].id).toBe('c');
    expect(sorted[1].id).toBe('b');
  });

  test('week boundaries Monday-Sunday', () => {
    const base = new Date('2025-08-13');
    const s = startOfWeek(base, { weekStartsOn: 1 });
    const e = endOfWeek(base, { weekStartsOn: 1 });
    expect(s.getDay()).toBe(1);
    expect(e.getDay()).toBe(0);
  });
});
