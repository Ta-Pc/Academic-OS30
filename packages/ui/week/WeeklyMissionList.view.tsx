import React from 'react';
import { WeeklyMissionItemView } from './WeeklyMissionItem.view';

export type WeeklyMission = {
  id: string;
  title: string;
  moduleCode?: string;
  dueDate?: string | Date;
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
};

export type WeeklyMissionListViewProps = {
  items: WeeklyMission[];
  emptyLabel?: string;
};

export function WeeklyMissionListView({ items, emptyLabel = 'No missions' }: WeeklyMissionListViewProps) {
  if (!items.length) {
    return <div className="p-4 text-sm text-slate-500">{emptyLabel}</div>;
  }
  return (
    <ul className="divide-y divide-slate-200">{
      items.map(i => (
        <WeeklyMissionItemView key={i.id} title={i.title} moduleCode={i.moduleCode} dueDate={i.dueDate} status={i.status} />
      ))
    }</ul>
  );
}
