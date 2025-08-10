import React from 'react';

export interface ModuleDetailViewProps {
  header: { code: string; title: string; credits?: number | null };
  stats: { currentObtained: number; remainingWeight: number; predictedSemesterMark: number };
  assignmentsSection: React.ReactNode;
  onBackToWeek?: () => void;
  hasLastViewedWeek?: boolean;
}

function round1(n: number) { return (Math.round(n * 10) / 10).toFixed(1); }

export function ModuleDetailView({ header, stats, assignmentsSection, onBackToWeek, hasLastViewedWeek }: ModuleDetailViewProps) {
  return (
    <div className="space-y-8" data-testid="module-detail-root">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="text-sm text-slate-600">{header.code}</div>
          <h1 className="text-2xl font-semibold">{header.title}</h1>
          {header.credits != null && <div className="text-xs text-slate-500 mt-1">{header.credits} credits</div>}
        </div>
        <div className="flex gap-2">
          <button type="button" className="btn btn-secondary" onClick={onBackToWeek} data-testid="back-to-week">
            {hasLastViewedWeek ? 'Back to Week' : 'Week View'}
          </button>
        </div>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="card"><div className="card-body"><div className="text-xs text-slate-600">Current Obtained</div><div className="text-xl font-semibold" data-testid="currentObtainedMark">{round1(stats.currentObtained)}%</div></div></div>
        <div className="card"><div className="card-body"><div className="text-xs text-slate-600">Remaining Weight</div><div className="text-xl font-semibold">{round1(stats.remainingWeight)}%</div></div></div>
        <div className="card"><div className="card-body"><div className="text-xs text-slate-600">Predicted Semester</div><div className="text-xl font-semibold">{round1(stats.predictedSemesterMark)}%</div></div></div>
        <div className="card col-span-1 sm:col-span-2 lg:col-span-2"><div className="card-body"><div className="text-xs text-slate-600 mb-1">Progress Sparkline</div><div className="h-10 flex items-end gap-1">{Array.from({ length: 20 }).map((_,i)=> <div key={i} className="flex-1 bg-primary-200 rounded" style={{height:`${20 + (i%5)*10}%`}} />)}</div></div></div>
      </section>

      <section className="space-y-3" data-testid="assignments-section">
        <h2 className="text-lg font-semibold">Assignments</h2>
        <div className="card"><div className="card-body p-0">{assignmentsSection}</div></div>
      </section>
    </div>
  );
}
