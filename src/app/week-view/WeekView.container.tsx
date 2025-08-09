"use client";
import React from 'react';
import { useWeekView } from '@/hooks/useWeekView';
import { WeekHeaderView } from 'packages/ui/week/WeekHeader.view';
import { TaskGroupList } from './task-group-list';

export function WeekViewContainer({ userId, date }: { userId?: string; date?: string }) {
  const { data, loading } = useWeekView(userId, date);
  if (!data) return <div className="p-4">{loading ? 'Loading…' : 'No data'}</div>;
  return (
    <div className="space-y-4">
      <WeekHeaderView start={data.start} end={data.end} />
      <TaskGroupList tasks={data.tasks as any} />
    </div>
  );
}


