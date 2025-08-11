"use client";
import { useState } from 'react';
import { formatDateTime } from '@/utils/date-format';

export type AssignmentRowProps = {
  assignment: { id: string; title: string; dueDate: string; score: number | null };
};

export default function AssignmentRow({ assignment }: AssignmentRowProps) {
  const [open, setOpen] = useState(false);
  const [score, setScore] = useState<string>(assignment.score?.toString() ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSave() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/assignments/${assignment.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ score: score === '' ? null : Number(score) }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
      }
      setOpen(false);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to update';
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex items-center justify-between border rounded p-3">
      <div>
        <div className="font-medium">{assignment.title}</div>
        <div className="text-sm text-gray-600">Due {formatDateTime(assignment.dueDate)}</div>
        <div className="text-sm">Score: {assignment.score ?? '—'}%</div>
      </div>
      <div>
        <button className="px-3 py-1 border rounded" onClick={() => setOpen(true)}>Edit</button>
      </div>
      {open && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
          <div className="bg-white rounded p-4 w-full max-w-sm space-y-3">
            <div className="text-lg font-semibold">Edit Score (%)</div>
            <input
              type="number"
              className="border rounded w-full px-3 py-2"
              value={score}
              step="0.01"
              min={0}
              max={100}
              onChange={(e) => setScore(e.target.value)}
            />
            {error && <div className="text-red-600 text-sm">{error}</div>}
            <div className="flex justify-end gap-2">
              <button className="px-3 py-1" onClick={() => setOpen(false)} disabled={saving}>Cancel</button>
              <button className="px-3 py-1 border rounded bg-black text-white" onClick={onSave} disabled={saving}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


