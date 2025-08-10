"use client";
import React, { useCallback, useState } from 'react';
import { AssignmentsTable } from '@/components/AssignmentsTable';
import type { AssignmentForTable } from '@/components/AssignmentsTable';
import { useWeekStore } from '@/lib/week-store';
import { ModuleDetailView } from '@ui';

interface AnalyticsData {
  module: { id: string; code: string; title: string; creditHours?: number; targetMark?: number | null };
  assignments: AssignmentForTable[];
  currentObtainedMark: number;
  remainingWeight: number;
  currentPredictedSemesterMark: number;
}
export function ModuleDetailContainer({ moduleId, initial }: { moduleId: string; initial: AnalyticsData }) {
  const [analytics, setAnalytics] = useState<AnalyticsData>(initial);
  const lastViewedWeek = useWeekStore(s => s.lastViewedWeek);
  const refresh = useCallback(async () => {
    const res = await fetch(`/api/modules/${moduleId}/analytics`, { cache: 'no-store' });
    if (res.ok) {
  const j: { data: AnalyticsData } = await res.json();
  setAnalytics(j.data);
    }
  }, [moduleId]);

  function goBackToWeek() {
    if (typeof window === 'undefined') return;
    const url = new URL('/week-view', window.location.origin);
    if (lastViewedWeek) url.searchParams.set('date', lastViewedWeek);
    window.location.href = url.toString();
  }

  const a = analytics;
  return (
    <ModuleDetailView
      header={{ code: a.module.code, title: a.module.title, credits: a.module.creditHours ?? 0 }}
      stats={{
        currentObtained: a.currentObtainedMark,
        remainingWeight: a.remainingWeight,
        predictedSemesterMark: a.currentPredictedSemesterMark,
      }}
      assignmentsSection={<AssignmentsTable assignments={a.assignments as AssignmentForTable[]} onAfterUpdate={refresh} />}
      onBackToWeek={goBackToWeek}
      hasLastViewedWeek={!!lastViewedWeek}
    />
  );
}


