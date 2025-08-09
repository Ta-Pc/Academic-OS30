import React from 'react';
import { WeekHeaderView } from 'packages/ui/week/WeekHeader.view';
import { TaskGroupList } from './task-group-list';

export function WeekView({ start, end, tasks }: { start: Date | string; end: Date | string; tasks: any[] }) {
  return (
    <div className="space-y-4">
      <WeekHeaderView start={start} end={end} />
      <TaskGroupList tasks={tasks as any} />
    </div>
  );
}


