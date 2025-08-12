import React from 'react';
import { WeeklyMissionItemView } from './WeeklyMissionItem.view';

export type WeeklyMission = {
  id: string;
  title: string;
  moduleCode?: string;
  dueDate?: string | Date;
  status?: 'PENDING' | 'DUE' | 'COMPLETE' | 'GRADED' | 'MISSED';
  priorityScore?: number;
  type?: string;
};

export type WeeklyMissionListViewProps = {
  items: WeeklyMission[];
  emptyLabel?: string;
  maxItems?: number;
  onToggle?: (item: WeeklyMission) => void;
};

export function WeeklyMissionListView({ items, emptyLabel = 'No missions', maxItems = 10, onToggle }: WeeklyMissionListViewProps) {
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

  return (
    <div className="space-y-3">
      {displayItems.map(i => (
        <WeeklyMissionItemView 
          key={i.id} 
          title={i.title} 
          moduleCode={i.moduleCode} 
          dueDate={i.dueDate} 
          status={i.status}
          priorityScore={i.priorityScore}
          type={i.type}
          onToggle={onToggle ? () => onToggle(i) : undefined}
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
    </div>
  );
}
