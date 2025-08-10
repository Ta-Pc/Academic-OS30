"use client";
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { WeekView } from './WeekView.view';

// Shape returned from /api/week-view (subset used here)
type ApiResponse = {
  weekRange: { start: string; end: string };
  weeklyPriorities: Array<{ id: string; title: string; moduleCode: string; dueDate?: string; priorityScore: number; type: string }>;
  moduleSummaries: Array<{
    moduleId: string; code: string; title: string; creditHours: number; priorityScore: number;
  }>;
  tacticalTasks: Array<{ id: string; title: string; status: string; type: string; dueDate: string; module?: { id: string; code: string; title: string } }>; // legacy tasks
};

async function fetchWeek(userId: string, date?: string): Promise<ApiResponse> {
  const url = new URL('/api/week-view', window.location.origin);
  if (date) url.searchParams.set('date', date);
  // userId implicitly derived server-side now; still pass if available for forwards compatibility
  if (userId) url.searchParams.set('userId', userId);
  const res = await fetch(url.toString(), { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch week');
  return res.json();
}

export function WeekViewContainer({ userId, date }: { userId?: string; date?: string }) {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openModuleId, setOpenModuleId] = useState<string | null>(null);

  // Derive history state for slide-over: ?module=ID in query
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initial = params.get('module');
    if (initial) setOpenModuleId(initial);
    function onPop() {
      const sp = new URLSearchParams(window.location.search);
      const m = sp.get('module');
      setOpenModuleId(m);
    }
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const openModule = useMemo(() => data?.moduleSummaries.find(m => m.moduleId === openModuleId) || null, [data, openModuleId]);

  const openModuleViaHistory = useCallback((moduleId: string) => {
    const url = new URL(window.location.toString());
    url.searchParams.set('module', moduleId);
    window.history.pushState({ moduleId }, '', url.toString());
    setOpenModuleId(moduleId);
  }, []);

  const closeModuleViaHistory = useCallback(() => {
    const url = new URL(window.location.toString());
    url.searchParams.delete('module');
    window.history.pushState({}, '', url.toString());
    setOpenModuleId(null);
  }, []);

  useEffect(() => {
    if (!userId) return; // wait for server provided user id
    let alive = true;
    setLoading(true);
    setError(null);
    fetchWeek(userId, date)
      .then(j => { if (alive) setData(j); })
      .catch(e => { if (alive) setError(e?.message || 'Failed'); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [userId, date]);

  const overallWeightedAverage = useMemo(() => {
    // Placeholder heuristic: normalize priorityScore (0-100) average -> acts as an engagement proxy
    if (!data?.moduleSummaries.length) return 0;
    const avg = data.moduleSummaries.reduce((s, m) => s + (m.priorityScore || 0), 0) / data.moduleSummaries.length;
    return Math.round(avg * 10) / 10;
  }, [data]);

  const taskStats = useMemo(() => {
    type LegacyTask = { status: string };
    const tasks: LegacyTask[] = (data?.tacticalTasks || []).map(t => ({ status: t.status }));
    const completed = tasks.filter(t => t.status === 'COMPLETED').length;
    const pending = tasks.length - completed;
    return { completed, pending };
  }, [data]);

  if (loading && !data) return <div className="p-4">Loading…</div>;
  if (error && !data) return <div className="p-4 text-danger-600">{error}</div>;
  if (!data) return <div className="p-4">No data</div>;

  return (
    <WeekView
      week={{ start: data.weekRange.start, end: data.weekRange.end }}
      priorities={data.weeklyPriorities}
      moduleSummaries={data.moduleSummaries}
      overallWeightedAverage={overallWeightedAverage}
      taskStats={taskStats}
      onOpenModule={openModuleViaHistory}
      openModule={openModule ? { moduleId: openModule.moduleId, code: openModule.code, title: openModule.title, creditHours: openModule.creditHours } : undefined}
      onCloseModule={closeModuleViaHistory}
    />
  );
}


