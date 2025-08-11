"use client";
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { rememberWeek } from '@/lib/week-store';
import { WeekView } from './WeekView.view';
import { addWeeks, subWeeks, startOfWeek, format } from 'date-fns';

// Shape returned from /api/week-view (subset used here)
type ApiResponse = {
  weekRange: { start: string; end: string };
  weeklyPriorities: Array<{ id: string; title: string; moduleCode: string; dueDate?: string; priorityScore: number; type: string; status?: string }>;
  moduleSummaries: Array<{
    moduleId: string; code: string; title: string; creditHours: number; priorityScore: number;
  }>;
  tacticalTasks: Array<{ id: string; title: string; status: string; type: string; dueDate: string; module?: { id: string; code: string; title: string } }>; // task system
  tasksThisWeek: Array<{ id: string; title: string; completed: boolean; type: string; dueDate: string }>; // comprehensive weekly tasks including assignments
  assignments: Array<{ id: string; title: string; status: string; score: number | null; weight: number; dueDate?: string }>; // weekly assignments
};

async function fetchWeek(date?: string): Promise<ApiResponse> {
  const url = new URL('/api/week-view', window.location.origin);
  if (date) url.searchParams.set('date', date);
  // No userId needed since we removed user authentication
  const res = await fetch(url.toString(), { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch week');
  return res.json();
}

async function fetchDashboard(): Promise<{ overallWeightedAverage: number; tasks: { completed: number; pending: number } }> {
  const res = await fetch('/api/dashboard', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch dashboard');
  const data = await res.json();
  return {
    overallWeightedAverage: data.widgets?.metrics?.overallWeightedAverage || 0,
    tasks: data.widgets?.metrics?.tasks || { completed: 0, pending: 0 }
  };
}

export function WeekViewContainer({ date }: { date?: string }) {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [dashboardData, setDashboardData] = useState<{ overallWeightedAverage: number; tasks: { completed: number; pending: number } } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openModuleId, setOpenModuleId] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState<string | undefined>(date);

  // Week navigation functions
  const navigateToWeek = useCallback((newDate: string) => {
    setCurrentDate(newDate);
    const url = new URL(window.location.toString());
    url.searchParams.set('date', newDate);
    window.history.pushState({}, '', url.toString());
  }, []);

  const handlePrevWeek = useCallback(() => {
    const current = currentDate ? new Date(currentDate) : new Date();
    const prevWeek = subWeeks(current, 1);
    const prevWeekDate = format(startOfWeek(prevWeek, { weekStartsOn: 1 }), 'yyyy-MM-dd');
    navigateToWeek(prevWeekDate);
  }, [currentDate, navigateToWeek]);

  const handleNextWeek = useCallback(() => {
    const current = currentDate ? new Date(currentDate) : new Date();
    const nextWeek = addWeeks(current, 1);
    const nextWeekDate = format(startOfWeek(nextWeek, { weekStartsOn: 1 }), 'yyyy-MM-dd');
    navigateToWeek(nextWeekDate);
  }, [currentDate, navigateToWeek]);

  const handleToday = useCallback(() => {
    const today = new Date();
    const thisWeekDate = format(startOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd');
    navigateToWeek(thisWeekDate);
  }, [navigateToWeek]);

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
    // Prefer history back so the previously pushed state (without module param) is restored
    if (openModuleId) {
      window.history.back();
      return;
    }
    // Fallback: if no module open just ensure param cleared
    const url = new URL(window.location.toString());
    url.searchParams.delete('module');
    window.history.replaceState({}, '', url.toString());
    setOpenModuleId(null);
  }, [openModuleId]);

  const handleRefresh = useCallback(() => {
    // Force a re-fetch of the week data and dashboard data
    setLoading(true);
    setError(null);
    
    Promise.all([
      fetchWeek(currentDate),
      fetchDashboard()
    ])
      .then(([weekData, dashData]) => {
        setData(weekData);
        setDashboardData(dashData);
      })
      .catch(e => setError(e?.message || 'Failed to refresh'))
      .finally(() => setLoading(false));
  }, [currentDate]);

  useEffect(() => {
    // Update currentDate if the prop changes
    setCurrentDate(date);
  }, [date]);

  useEffect(() => {
    // No need to wait for userId since we removed user authentication
    let alive = true;
    setLoading(true);
    setError(null);
    
    Promise.all([
      fetchWeek(currentDate),
      fetchDashboard()
    ])
      .then(([weekData, dashData]) => {
        if (alive) {
          setData(weekData);
          setDashboardData(dashData);
        }
      })
      .catch(e => { if (alive) setError(e?.message || 'Failed'); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [currentDate]); // Update dependency to use currentDate

  // Persist last viewed week for back-navigation from module detail page
  useEffect(() => {
    rememberWeek(currentDate);
  }, [currentDate]);

  // Use real dashboard data for performance, but calculate weekly task stats from week data
  const overallWeightedAverage = dashboardData?.overallWeightedAverage || 0;
  
  // Task creation handler
  const handleTaskCreate = useCallback(async (taskData: { title: string; type: string; dueDate: string; moduleId: string }) => {
    const response = await fetch('/api/tactical-tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create task');
    }
    
    return response.json();
  }, []);

  // Task toggle handler
  const handleTaskToggle = useCallback(async (taskId: string) => {
    const task = data?.tacticalTasks.find(t => t.id === taskId);
    if (!task) return;

    const nextStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    
    const response = await fetch(`/api/tactical-tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update task');
    }
    
    return response.json();
  }, [data]);

  // Weekly assignment progress calculation
  const weeklyAssignments = useMemo(() => {
    return data?.assignments || [];
  }, [data]);

  const taskStats = useMemo(() => {
    if (!data?.tacticalTasks) return { completed: 0, pending: 0 };
    
    // Calculate weekly task completion from tactical tasks (study/reading/practice tasks)
    // This represents study habits and learning progress, separate from assignment grades
    const completed = data.tacticalTasks.filter(t => t.status === 'COMPLETED').length;
    const total = data.tacticalTasks.length;
    const pending = total - completed;
    
    return { completed, pending };
  }, [data]);

  if (loading && !data) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <div className="text-lg font-medium text-slate-700">Loading your weekly mission...</div>
        <div className="text-sm text-slate-500 mt-2">Preparing your priorities and modules</div>
      </div>
    </div>
  );
  
  if (error && !data) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-6">
        <div className="text-6xl mb-4">⚠️</div>
        <div className="text-lg font-medium text-slate-700 mb-2">Something went wrong</div>
        <div className="text-sm text-slate-500 mb-4">{error}</div>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Reload page
        </button>
      </div>
    </div>
  );
  
  if (!data) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">📋</div>
        <div className="text-lg font-medium text-slate-700">No data available</div>
        <div className="text-sm text-slate-500 mt-2">Try refreshing the page</div>
      </div>
    </div>
  );

  return (
    <WeekView
      week={{ start: data.weekRange.start, end: data.weekRange.end }}
      priorities={data.weeklyPriorities}
      moduleSummaries={data.moduleSummaries}
      overallWeightedAverage={overallWeightedAverage}
      taskStats={taskStats}
      weeklyAssignments={weeklyAssignments}
      tacticalTasks={data.tacticalTasks || []}
      onOpenModule={openModuleViaHistory}
      openModule={openModule ? { moduleId: openModule.moduleId, code: openModule.code, title: openModule.title, creditHours: openModule.creditHours } : undefined}
      onCloseModule={closeModuleViaHistory}
      onPrevWeek={handlePrevWeek}
      onNextWeek={handleNextWeek}
      onToday={handleToday}
      onRefresh={handleRefresh}
      onTaskCreate={handleTaskCreate}
      onTaskToggle={handleTaskToggle}
    />
  );
}


