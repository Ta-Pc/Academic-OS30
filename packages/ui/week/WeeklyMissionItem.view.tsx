import React from 'react';
import { Clock, Target, CheckCircle, Circle, AlertCircle } from 'lucide-react';

/**
 * Format date and time consistently
 */
function formatDateTime(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleString('en-US', {
    timeZone: 'UTC',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Get relative time display
 */
function getRelativeTime(date: string | Date): { text: string; isUrgent: boolean } {
  const d = new Date(date);
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { text: `${Math.abs(diffDays)} days overdue`, isUrgent: true };
  } else if (diffDays === 0) {
    return { text: 'Due today', isUrgent: true };
  } else if (diffDays === 1) {
    return { text: 'Due tomorrow', isUrgent: true };
  } else if (diffDays <= 7) {
    return { text: `Due in ${diffDays} days`, isUrgent: diffDays <= 3 };
  } else {
    return { text: formatDateTime(date), isUrgent: false };
  }
}

export type WeeklyMissionItemViewProps = {
  item: {
    id: string;
    title: string;
    moduleCode?: string;
    dueDate?: string | Date;
    status?: 'PENDING' | 'DUE' | 'COMPLETE' | 'GRADED' | 'MISSED';
    priorityScore?: number;
    type?: string;
    score?: number | null;
  };
  onClick: () => void;
};

export function WeeklyMissionItemView({ item, onClick }: WeeklyMissionItemViewProps) {
  const { title, dueDate, moduleCode, status = 'PENDING', priorityScore, type } = item;
  const isDone = status === 'GRADED';
  const isComplete = status === 'COMPLETE';
  const isMissed = status === 'MISSED';
  const isDue = status === 'DUE';
  const timeInfo = dueDate ? getRelativeTime(dueDate) : null;
  const isUrgent = timeInfo?.isUrgent || status === 'DUE';

  const getTypeIcon = () => {
    switch (type?.toLowerCase()) {
      case 'read': return '📖';
      case 'study': return '📚';
      case 'practice': return '💻';
      case 'review': return '🔍';
      case 'admin': return '📋';
      case 'assignment': return '📝';
      default: return '📝';
    }
  };

  return (
    <li
      className={`group flex items-center gap-4 p-4 rounded-lg border transition-all duration-200 hover:shadow-md cursor-pointer ${
        isDone
          ? 'bg-green-50 border-green-200 hover:bg-green-100'
          : isComplete
          ? 'bg-blue-50 border-blue-200 hover:bg-blue-100'
          : isMissed || isUrgent
          ? 'bg-red-50 border-red-200 hover:bg-red-100'
          : isDue
          ? 'bg-orange-50 border-orange-200 hover:bg-orange-100'
          : 'bg-white border-slate-200 hover:bg-slate-50'
      }`}
      onClick={onClick}
      tabIndex={0}
      role="button"
      aria-label={`Edit assignment ${title}`}
      onKeyPress={e => { if (e.key === 'Enter' || e.key === ' ') onClick(); }}
    >
      <span className="flex-shrink-0">
        {isDone ? (
          <CheckCircle className="h-6 w-6 text-green-600" />
        ) : isComplete ? (
          <Target className="h-6 w-6 text-blue-600" />
        ) : isMissed ? (
          <AlertCircle className="h-6 w-6 text-red-600" />
        ) : isDue ? (
          <AlertCircle className="h-6 w-6 text-orange-600" />
        ) : (
          <Circle className="h-6 w-6 text-slate-400 group-hover:text-primary-500" />
        )}
      </span>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">{getTypeIcon()}</span>
          <span className={`font-medium truncate ${isDone ? 'line-through text-slate-500' : 'text-slate-900'}`}>{title}</span>
          {priorityScore && (
            <span className="flex-shrink-0 px-2 py-1 text-xs font-medium bg-primary-100 text-primary-700 rounded-full">
              PS {Math.round(priorityScore)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 text-sm">
          {moduleCode && (
            <span className="flex items-center gap-1 text-slate-600 font-medium">
              <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
              {moduleCode}
            </span>
          )}

          {timeInfo && (
            <span className={`flex items-center gap-1 ${
              isUrgent ? 'text-red-600 font-medium' : 'text-slate-500'
            }`}>
              {isUrgent ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <Clock className="h-4 w-4" />
              )}
              {timeInfo.text}
            </span>
          )}
        </div>
      </div>
    </li>
  );
}
