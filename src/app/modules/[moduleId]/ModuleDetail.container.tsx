"use client";
import React, { useCallback, useState } from 'react';
import AssignmentsTable from '@/components/AssignmentsTable';
import type { AssignmentForTable } from '@/components/AssignmentsTable';

export function ModuleDetailContainer({ moduleId, initial }: { moduleId: string; initial: any }) {
  const [analytics, setAnalytics] = useState(initial);
  const refresh = useCallback(async () => {
    const res = await fetch(`/api/modules/${moduleId}/analytics`, { cache: 'no-store' });
    if (res.ok) {
      const j = await res.json();
      setAnalytics(j.data);
    }
  }, [moduleId]);

  const a = analytics;
  return (
    <div className="space-y-6">
      <AssignmentsTable assignments={a.assignments as AssignmentForTable[]} moduleId={moduleId} onAfterSave={refresh} />
    </div>
  );
}


