
import React, { useState } from 'react';
import { WeeklyMissionItemView } from './WeeklyMissionItem.view';
import { EditAssignmentModalView } from '../modals/EditAssignmentModal.view';

export type WeeklyMission = {
  id: string;
  title: string;
  moduleCode?: string;
  dueDate?: string | Date;
  status?: 'PENDING' | 'DUE' | 'COMPLETE' | 'GRADED' | 'MISSED';
  priorityScore?: number;
  type?: string;
  score?: number | null;
};

export type WeeklyMissionListViewProps = {
  items: WeeklyMission[];
  emptyLabel?: string;
  maxItems?: number;
  onToggle?: (item: WeeklyMission) => void;
  onAssignmentSave?: (item: WeeklyMission, newScore: number | null) => void;
};


export function WeeklyMissionListView({ items, emptyLabel = 'No missions', maxItems = 10, onToggle, onAssignmentSave }: WeeklyMissionListViewProps) {
  const [editModal, setEditModal] = useState<{ open: boolean; item: WeeklyMission | null }>({ open: false, item: null });
  const [editScore, setEditScore] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!items.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-6xl mb-4">🎯</div>
        <div className="text-lg font-medium text-slate-700 mb-2">All caught up!</div>
        <div className="text-sm text-slate-500">{emptyLabel}</div>
      </div>
    );
  }

  const displayItems = items.slice(0, maxItems);
  const hasMore = items.length > maxItems;

  const handleEdit = (item: WeeklyMission) => {
    setEditModal({ open: true, item });
    setEditScore(item.score ?? null);
    setError(null);
  };

  const handleSave = async () => {
    if (!editModal.item) return;
    setSaving(true);
    setError(null);
    try {
      if (onAssignmentSave) {
        await onAssignmentSave(editModal.item, editScore);
      }
      setEditModal({ open: false, item: null });
    } catch (e: any) {
      setError(e?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      {displayItems.map(i => (
        <WeeklyMissionItemView
          key={i.id}
          item={i}
          onClick={() => handleEdit(i)}
        />
      ))}
      {hasMore && (
        <div className="text-center py-4">
          <div className="text-sm text-slate-500 bg-slate-50 rounded-lg py-3 px-4 border border-slate-200">
            <span className="font-medium">+{items.length - maxItems} more items</span>
            <div className="text-xs mt-1">Showing top {maxItems} priorities</div>
          </div>
        </div>
      )}
      <EditAssignmentModalView
        open={editModal.open}
        title={editModal.item?.title || ''}
        initialValue={editScore}
        onChange={setEditScore}
        onSave={handleSave}
        onCancel={() => setEditModal({ open: false, item: null })}
        saving={saving}
        error={error}
      />
    </div>
  );
}
