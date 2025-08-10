"use client";
import { useEffect, useMemo, useState } from 'react';
import { WhatIfDialogView } from '@ui/modals/WhatIfDialog.view';
import { useWhatIf } from '@/hooks/useWhatIf';
import { pushModal, closeModal, listenModal } from '@/lib/modal-history';
import AssignmentsTable from '@/components/AssignmentsTable';
import { getBaseUrl } from '@/lib/base-url';

type AnalyticsData = {
  module: { id: string; code: string; title: string; targetMark: number | null };
  totalWeightAssessed: number;
  currentObtainedMark: number;
  currentAverageMark: number;
  remainingWeight: number;
  requiredAveOnRemaining: number;
  currentPredictedSemesterMark: number;
  assignments: Array<{
    id: string;
    title: string;
    dueDate: string | null;
    score: number | null;
    maxScore: number | null;
    weight: number;
    contribution: number | null;
  }>;
};

export default function ClientAnalytics({ moduleId, initial }: { moduleId: string; initial: AnalyticsData }) {
  const [data, setData] = useState<AnalyticsData>(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showWhatIf, setShowWhatIf] = useState(false);

  const baseUrl = useMemo(() => getBaseUrl(), []);

  async function refetch() {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch(`${baseUrl}/api/modules/${moduleId}/analytics`, { cache: 'no-store' });
      if (!resp.ok) throw new Error(await resp.text());
      const json = await resp.json();
      setData(json.data);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to refresh';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Invalidate on mount just in case SSR cache interfered
    refetch();
  }, [moduleId]);

  // What-If hook (lazy when shown)
  const whatIf = useWhatIf(showWhatIf ? moduleId : null);

  // History integration for modal
  useEffect(() => {
    const unsub = listenModal(st => {
      if (!st) setShowWhatIf(false); else if (st.modal === 'whatif' && st.id === moduleId) setShowWhatIf(true);
    });
    // On mount, check if URL already has modal
    const url = new URL(window.location.toString());
    if (url.searchParams.get('modal') === 'whatif' && url.searchParams.get('id') === moduleId) setShowWhatIf(true);
    return () => unsub();
  }, [moduleId]);

  function openWhatIf() {
    pushModal('whatif', moduleId);
    setShowWhatIf(true);
  }
  function closeWhatIf() {
    closeModal(); // triggers popstate -> sets showWhatIf false
  }

  async function onCommitWhatIf() {
    await whatIf.commit();
    await refetch();
    closeWhatIf();
  }

  return (
    <>
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="card">
          <div className="card-body">
            <div className="text-sm text-slate-600">Current Obtained Mark</div>
            <div className="text-2xl font-semibold" data-testid="currentObtainedMark">{(Math.round(data.currentObtainedMark * 10) / 10).toFixed(1)}%</div>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <div className="text-sm text-slate-600">Remaining Weight</div>
            <div className="text-2xl font-semibold">{(Math.round(data.remainingWeight * 10) / 10).toFixed(1)}%</div>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <div className="text-sm text-slate-600">Current Average Mark</div>
            <div className="text-2xl font-semibold">{(Math.round(data.currentAverageMark * 10) / 10).toFixed(1)}%</div>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <div className="text-sm text-slate-600">Required Avg on Remaining</div>
            <div className="text-2xl font-semibold">{(Math.round(data.requiredAveOnRemaining * 10) / 10).toFixed(1)}%</div>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <div className="text-sm text-slate-600">Predicted Semester Mark</div>
            <div className="text-2xl font-semibold">{(Math.round(data.currentPredictedSemesterMark * 10) / 10).toFixed(1)}%</div>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Assignments</h2>
          <div className="text-sm text-slate-500">{loading ? 'Refreshing…' : error ? <span className="text-danger-600">{error}</span> : null}</div>
        </div>
        <div>
          <button type="button" className="btn btn-primary btn-sm" onClick={openWhatIf} data-testid="open-whatif">What If</button>
        </div>
        <div className="card">
          <div className="card-body p-0">
            <AssignmentsTable
              assignments={data.assignments}
              moduleId={moduleId}
              onAfterSave={refetch}
            />
          </div>
        </div>
      </section>
      <WhatIfDialogView
        open={showWhatIf}
        module={whatIf.module || { id: moduleId, code: data.module.code, title: data.module.title, targetMark: data.module.targetMark }}
        assignments={whatIf.assignments}
        workingChanges={whatIf.working}
        prediction={whatIf.prediction || undefined}
        loading={whatIf.loading}
        committing={whatIf.committing}
        error={whatIf.error}
        onChange={whatIf.updateLocal}
        onSimulate={whatIf.simulate}
        onCommit={onCommitWhatIf}
        onClose={closeWhatIf}
        onReset={whatIf.reset}
      />
    </>
  );
}


