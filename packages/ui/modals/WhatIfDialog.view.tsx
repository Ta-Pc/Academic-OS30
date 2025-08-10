import React, { useEffect, useRef } from 'react';

export type WhatIfAssignment = {
  id: string;
  title: string;
  weight: number;
  score: number | null;
  maxScore: number | null;
};

export type WhatIfPrediction = {
  currentObtained: number;
  remainingWeight: number;
  predictedSemesterMark: number;
  requiredAverageOnRemaining: number | null;
};

export type WhatIfDialogViewProps = {
  open: boolean;
  module: { id: string; code: string; title: string; targetMark: number | null };
  assignments: WhatIfAssignment[];
  workingChanges: Record<string, number | null>; // assignmentId -> new score
  prediction?: WhatIfPrediction | null;
  loading?: boolean;
  committing?: boolean;
  error?: string | null;
  onChange: (assignmentId: string, value: number | null) => void;
  onSimulate: () => void; // calls API sessionOnly
  onCommit: () => void; // calls API commit
  onClose: () => void;
  onReset: () => void; // discard local changes
};

/** Accessible What-If simulation dialog (presentational). */
export function WhatIfDialogView(props: WhatIfDialogViewProps) {
  const { open, module, assignments, workingChanges, prediction, loading, committing, error, onChange, onSimulate, onCommit, onClose, onReset } = props;
  const lastActive = useRef<HTMLElement | null>(null);
  const firstFocusable = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) {
      lastActive.current = document.activeElement as HTMLElement;
      setTimeout(() => firstFocusable.current?.focus(), 20);
      const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.preventDefault(); onClose(); } };
      window.addEventListener('keydown', onKey);
      return () => window.removeEventListener('keydown', onKey);
    } else if (lastActive.current) {
      lastActive.current.focus();
    }
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="whatIfHeading">
      <div className="absolute inset-0 bg-slate-900/40" onClick={() => !loading && onClose()} />
      <div className="absolute inset-0 overflow-y-auto p-4 flex items-start justify-center">
        <div className="card w-full max-w-2xl mt-8 shadow-xl animate-fade-in">
          <div className="card-header flex items-center justify-between">
            <h2 id="whatIfHeading" className="text-sm font-semibold text-slate-700">What-If: {module.code}</h2>
            <button className="btn btn-secondary btn-sm" onClick={onClose} aria-label="Close what-if dialog">×</button>
          </div>
          <div className="card-body space-y-4">
            <p className="text-xs text-slate-600">Simulate potential scores before committing. Session-only simulations won&apos;t persist until you click Commit.</p>
            <div className="overflow-x-auto">
              <table className="table text-xs">
                <thead>
                  <tr>
                    <th className="text-left">Title</th>
                    <th className="text-right">Weight</th>
                    <th className="text-right">Current</th>
                    <th className="text-right">New Score (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map(a => {
                    const working = workingChanges[a.id];
                    return (
                      <tr key={a.id} className="hover:bg-slate-50">
                        <td>{a.title}</td>
                        <td className="text-right">{round1(a.weight)}%</td>
                        <td className="text-right">{a.score == null ? '—' : (a.maxScore ? round1(a.score) : `${round1(a.score)}%`)}</td>
                        <td className="text-right">
                          <input
                            ref={firstFocusable.current ? undefined : firstFocusable}
                            type="number"
                            className="input input-xs w-24"
                            data-testid={`whatif-input-${a.id}`}
                            value={working == null ? '' : working}
                            min={0}
                            max={100}
                            step="0.1"
                            onChange={e => onChange(a.id, e.target.value === '' ? null : Number(e.target.value))}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
              <Stat label="Current Obtained" value={prediction ? `${round1(prediction.currentObtained)}%` : '—'} />
              <Stat label="Remaining Weight" value={prediction ? `${round1(prediction.remainingWeight)}%` : '—'} />
              <Stat label="Predicted Semester Mark" value={prediction ? `${round1(prediction.predictedSemesterMark)}%` : '—'} dataTestId="predictedSemesterMark" />
              <Stat label="Req. Avg on Remaining" value={prediction?.requiredAverageOnRemaining == null ? '—' : `${round1(prediction.requiredAverageOnRemaining)}%`} />
            </div>
            {error && <div className="text-danger-600 text-sm" role="alert">{error}</div>}
            <div className="flex justify-between items-center pt-2 border-t border-slate-200">
              <div className="flex gap-2">
                <button className="btn btn-ghost btn-sm" onClick={onReset} disabled={loading || committing}>Reset</button>
                <button className="btn btn-secondary btn-sm" onClick={onSimulate} disabled={loading || committing}>Simulate</button>
              </div>
              <div className="flex gap-2">
                <button className="btn btn-ghost btn-sm" onClick={onClose} disabled={loading || committing}>Close</button>
                <button className="btn btn-primary btn-sm" data-testid="whatif-commit" onClick={onCommit} disabled={loading || committing}>{committing ? 'Committing…' : 'Commit'}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, dataTestId }: { label: string; value: string; dataTestId?: string }) {
  return (
    <div className="px-3 py-2 rounded bg-slate-100 flex flex-col min-w-[130px]" data-testid={dataTestId}>
      <span className="text-[10px] tracking-wide uppercase text-slate-500">{label}</span>
      <span className="font-medium text-slate-800 text-sm">{value}</span>
    </div>
  );
}

function round1(n: number) { return Math.round(n * 10) / 10; }
