"use client";
import { useState } from 'react';
import { useUserStore } from '@/lib/user-store';

export type AssignmentForTable = {
  id: string;
  title: string;
  dueDate: string | null;
  score: number | null;
  maxScore: number | null;
  weight: number;
  contribution: number | null;
};

export default function AssignmentsTable({ assignments, moduleId, onAfterSave }: { assignments: AssignmentForTable[]; moduleId: string; onAfterSave?: () => Promise<void> | void }) {
  return (
    <div className="overflow-x-auto">
      <table className="table">
        <thead>
          <tr>
            <th>Title</th>
            <th className="text-right">Score</th>
            <th className="text-right">Max</th>
            <th className="text-right">Weight</th>
            <th className="text-right">Contribution</th>
            <th className="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {assignments.map((a) => (
            <AssignmentRow key={a.id} a={a} moduleId={moduleId} onAfterSave={onAfterSave} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AssignmentRow({ a, onAfterSave }: { a: AssignmentForTable; moduleId: string; onAfterSave?: () => Promise<void> | void }) {
  const [open, setOpen] = useState(false);
  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td>
        <div className="font-medium">{a.title}</div>
        {a.dueDate && <div className="text-xs text-slate-500">Due {new Date(a.dueDate).toLocaleString()}</div>}
      </td>
      <td className="text-right">{a.score == null ? '—' : (a.maxScore == null ? `${round1(a.score)}%` : round1(a.score))}</td>
      <td className="text-right">{a.maxScore == null ? '—' : round1(a.maxScore)}</td>
      <td className="text-right">{round1(a.weight)}%</td>
      <td className="text-right">{a.contribution == null ? '—' : `${round2(a.contribution)}%`}</td>
      <td className="text-center">
        <button className="btn btn-secondary" data-testid={`edit-assignment-${a.id}`} onClick={() => setOpen(true)}>Edit</button>
  {open && <EditScoreModal assignmentId={a.id} initialScore={a.score} onClose={() => setOpen(false)} onAfterSave={onAfterSave} />}
      </td>
    </tr>
  );
}

function EditScoreModal({ assignmentId, initialScore, onClose, onAfterSave }: { assignmentId: string; initialScore: number | null; onClose: () => void; onAfterSave?: () => Promise<void> | void }) {
  const [value, setValue] = useState<string>(initialScore == null ? '' : String(initialScore));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentUser = useUserStore((s) => s.currentUser);

  async function onSave() {
    setSaving(true);
    setError(null);
    try {
  let effectiveUserId = currentUser?.id;
      if (!effectiveUserId) {
        try {
          const ses = await fetch('/api/session/user', { cache: 'no-store' });
          const j = ses.ok ? await ses.json() : null;
          effectiveUserId = j?.user?.id;
  } catch { /* ignore session fetch error */ }
      }
      const res = await fetch(`/api/assignments/${assignmentId}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ score: value === '' ? null : Number(value), userId: effectiveUserId }),
      });
  if (!res.ok) throw new Error(await res.text());
      onClose();
      // Actively re-fetch analytics to ensure UI reflects latest DB state
      if (onAfterSave) await onAfterSave();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to update');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="card w-full max-w-sm">
        <div className="card-header">
          <div className="text-sm font-semibold text-slate-700">Edit Score (%)</div>
        </div>
        <div className="card-body space-y-3">
        <input
          type="number"
          className="input"
          value={value}
          step="0.01"
          min={0}
          max={100}
          data-testid="score-input"
          onChange={(e) => setValue(e.target.value)}
        />
        {error && <div className="text-danger-600 text-sm">{error}</div>}
        <div className="flex justify-end gap-2">
          <button className="btn btn-ghost" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="btn btn-primary" data-testid="save-score" onClick={onSave} disabled={saving}>Save</button>
        </div>
        </div>
      </div>
    </div>
  );
}

function round1(n: number) { return Math.round(n * 10) / 10; }
function round2(n: number) { return Math.round(n * 100) / 100; }


