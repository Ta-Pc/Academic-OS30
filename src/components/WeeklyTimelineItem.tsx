import React from 'react';
type Assignment = { id: string; title: string; dueDate: string | Date | null; score: number | null };
type Module = { code: string; title: string };

export type WeeklyTimelineItemProps = {
  assignment: Pick<Assignment, 'id' | 'title' | 'dueDate' | 'score'> & {
    module?: Pick<Module, 'code' | 'title'> | null;
  };
};

export default function WeeklyTimelineItem({ assignment }: WeeklyTimelineItemProps) {
  return (
    <div className="card">
      <div className="card-body flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="font-medium truncate">{assignment.title}</div>
          <div className="text-sm text-slate-600">Due: {assignment.dueDate ? new Date(assignment.dueDate).toLocaleString() : '—'}</div>
          <div className="text-xs mt-1 text-slate-500">
            Module: {assignment.module?.code ?? assignment.module?.title ?? '—'}
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div className="text-sm text-slate-700">{assignment.score != null ? 'Graded' : '—'}</div>
          <div className="text-xs text-slate-500">Score: {assignment.score ?? '—'}%</div>
        </div>
      </div>
    </div>
  );
}

