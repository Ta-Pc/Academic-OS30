import React from 'react';

/**
 * Format date and time consistently
 */
function formatDateTime(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleString('en-US', {
    timeZone: 'UTC',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

export type WeeklyMissionItemViewProps = {
  title: string;
  dueDate?: Date | string | null;
  moduleCode?: string | null;
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  onToggle?: () => void;
};

export function WeeklyMissionItemView({ title, dueDate, moduleCode, status = 'PENDING', onToggle }: WeeklyMissionItemViewProps) {
  const isDone = status === 'COMPLETED';
  return (
    <li className="flex items-center gap-3 p-3 hover:bg-slate-50 transition-colors">
      <input
        type="checkbox"
        checked={isDone}
        onChange={onToggle}
        className="h-4 w-4 accent-primary-600"
      />
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">
          {title}
          {dueDate && <span className="ml-2 text-xs text-slate-500">{formatDateTime(dueDate)}</span>}
        </div>
        {moduleCode && <div className="text-xs text-slate-600 truncate">{moduleCode}</div>}
      </div>
    </li>
  );
}


