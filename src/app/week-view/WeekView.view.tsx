'use client';
import React from 'react';
import { WeekViewPageView } from '@ui/week/WeekViewPage.view';

export type WeekViewProps = {
  week: { start: string | Date; end: string | Date };
  priorities: Array<{ id: string; title: string; moduleCode: string; dueDate?: string; priorityScore: number; type: string; status?: string }>;
  moduleSummaries: Array<{ moduleId: string; code: string; title: string; creditHours: number; priorityScore: number }>;
  overallWeightedAverage: number;
  taskStats: { completed: number; pending: number };
  weeklyAssignments: Array<{ id: string; title: string; status: string; score: number | null; weight: number; dueDate?: string }>;
  tacticalTasks: Array<{ id: string; title: string; status: string; type: string; dueDate: string; module?: { id: string; code: string; title: string } }>;
  openModule?: { moduleId: string; code: string; title: string; creditHours: number } | undefined;
  onOpenModule?: (moduleId: string) => void;
  onCloseModule?: () => void;
  onPrevWeek?: () => void;
  onNextWeek?: () => void;
  onToday?: () => void;
  onRefresh?: () => void;
  onTaskCreate?: (task: { title: string; type: string; dueDate: string; moduleId: string }) => Promise<void>;
  onTaskToggle?: (taskId: string) => Promise<void>;
};

export function WeekView({
  week,
  priorities,
  moduleSummaries,
  overallWeightedAverage,
  taskStats,
  weeklyAssignments,
  tacticalTasks,
  openModule,
  onOpenModule,
  onCloseModule,
  onPrevWeek,
  onNextWeek,
  onToday,
  onRefresh,
  onTaskCreate,
  onTaskToggle,
}: WeekViewProps) {
  // Use the modern UI component from the packages/ui library 
  return (
    <WeekViewPageView
      week={week}
      priorities={priorities}
      moduleSummaries={moduleSummaries}
      overallWeightedAverage={overallWeightedAverage}
      taskStats={taskStats}
      weeklyAssignments={weeklyAssignments}
      tacticalTasks={tacticalTasks}
      openModule={openModule}
      onOpenModule={onOpenModule}
      onCloseModule={onCloseModule}
      onPrevWeek={onPrevWeek}
      onNextWeek={onNextWeek}
      onToday={onToday}
      onRefresh={onRefresh}
      onTaskCreate={onTaskCreate}
      onTaskToggle={onTaskToggle}
    />
  );
}


