import { useEffect, useState } from 'react';

type TacticalTask = { id: string; title: string; status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'; type: 'READ' | 'STUDY' | 'PRACTICE' | 'REVIEW' | 'ADMIN'; dueDate: string | Date };

export function useWeekView(userId: string | undefined, date?: string) {
  const [data, setData] = useState<{ start: Date; end: Date; tasks: TacticalTask[]; totalStudyMinutes: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    async function run() {
      if (!userId) return;
      setLoading(true);
      setError(null);
      try {
        const url = new URL('/api/week-view', window.location.origin);
        url.searchParams.set('userId', userId);
        if (date) url.searchParams.set('date', date);
        const res = await fetch(url.toString(), { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to fetch');
        const j = await res.json();
        if (!alive) return;
        setData({
          start: new Date(j.data.start),
          end: new Date(j.data.end),
          tasks: j.data.tasks,
          totalStudyMinutes: j.data.totalStudyMinutes,
        });
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message || 'Failed to load');
      } finally {
        if (alive) setLoading(false);
      }
    }
    run();
    return () => { alive = false; };
  }, [userId, date]);

  return { data, loading, error } as const;
}


