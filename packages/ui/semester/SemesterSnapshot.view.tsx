import React from 'react';

export type SemesterSnapshotViewProps = {
  overallWeightedAverage: number;
  tasks: { completed: number; pending: number };
};

export function SemesterSnapshotView({ overallWeightedAverage, tasks }: SemesterSnapshotViewProps) {
  const tone = overallWeightedAverage >= 70 ? 'good' : overallWeightedAverage >= 50 ? 'default' : 'bad';
  const toneClass =
    tone === 'good' ? 'bg-success-50 text-success-900 ring-success-200' :
    tone === 'bad' ? 'bg-danger-50 text-danger-900 ring-danger-200' :
    'bg-white text-slate-900 ring-slate-200';

  return (
    <div className={`card ring-1 ring-inset ${toneClass}`}>
      <div className="card-body">
        <div className="text-sm text-slate-600">Overall Weighted Average</div>
        <div className="mt-1 text-3xl font-semibold">{Math.round(overallWeightedAverage * 10) / 10}%</div>
        <div className="mt-1 text-xs text-slate-500">Completed {tasks.completed} · Pending {tasks.pending}</div>
      </div>
    </div>
  );
}


