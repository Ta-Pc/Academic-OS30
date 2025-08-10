"use client";
import { useState, useEffect } from 'react';
import { useUserStore } from '@/lib/user-store';
import { EditAssignmentModalView } from '@ui/modals/EditAssignmentModal.view';
import { pushModal, closeModal, listenModal } from '@/lib/modal-history';

export type AssignmentForTable = {
  id: string;
  title: string;
  dueDate: string | null;
  score: number | null;
  maxScore: number | null;
  weight: number;
  contribution: number | null;
};

export function AssignmentsTable({ assignments, onAfterUpdate }: {
  assignments: AssignmentForTable[];
  onAfterUpdate?: () => Promise<void> | void;
}) {
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
            <AssignmentRow key={a.id} a={a} onAfterSave={onAfterUpdate} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AssignmentRow({ a, onAfterSave }: { a: AssignmentForTable; onAfterSave?: () => Promise<void> | void }) {
  const [showEdit, setShowEdit] = useState(false);
  const [currentValue, setCurrentValue] = useState<number | null>(a.score);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentUser = useUserStore((s) => s.currentUser);

  // History integration for modal
  useEffect(() => {
    const unsub = listenModal(st => {
      if (!st) setShowEdit(false); 
      else if (st.modal === 'edit' && st.id === a.id) setShowEdit(true);
    });
    // On mount, check if URL already has modal for this assignment
    const url = new URL(window.location.toString());
    if (url.searchParams.get('modal') === 'edit' && url.searchParams.get('id') === a.id) setShowEdit(true);
    return () => unsub();
  }, [a.id]);

  function openEdit() {
    pushModal('edit', a.id);
    setShowEdit(true);
    setCurrentValue(a.score);
    setError(null);
  }

  function closeEdit() {
    closeModal(); // triggers popstate -> sets showEdit false
  }

  async function handleSave() {
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
      const res = await fetch(`/api/assignments/${a.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ score: currentValue, userId: effectiveUserId }),
      });
      if (!res.ok) throw new Error(await res.text());
      closeEdit();
      // Actively re-fetch analytics to ensure UI reflects latest DB state
      if (onAfterSave) await onAfterSave();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to update');
    } finally {
      setSaving(false);
    }
  }

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
        <button className="btn btn-secondary" data-testid={`edit-assignment-${a.id}`} onClick={openEdit}>Edit</button>
        <EditAssignmentModalView
          open={showEdit}
          title={`Edit Score: ${a.title}`}
          initialValue={currentValue}
          onChange={setCurrentValue}
          onSave={handleSave}
          onCancel={closeEdit}
          saving={saving}
          error={error}
        />
      </td>
    </tr>
  );
}

// Note: This component uses the EditAssignmentModal for score editing
// function EditScoreModal was here but unused after modal integration

// Handler function for EditAssignmentModal save - now unused
// async function handleSave(assignmentId: string, moduleId: string, onAfterSave?: () => Promise<void> | void, onClose?: () => void) {
//   // This will be called when EditAssignmentModal's onSave is triggered
//   // The modal manages its own value state, so we need a different approach
//   console.log('handleSave called but EditAssignmentModal manages its own state');
//   // For now, just close and let modal handle the save internally
//   if (onClose) onClose();
// }

function round1(n: number) { return Math.round(n * 10) / 10; }
function round2(n: number) { return Math.round(n * 100) / 100; }


