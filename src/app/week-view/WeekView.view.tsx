'use client';
import React from 'react';
import { WeekViewPageView } from '@ui/week/WeekViewPage.view';

export type WeekViewProps = {
  week: { start: string | Date; end: string | Date };
  priorities: Array<{ id: string; title: string; moduleCode: string; dueDate?: string; priorityScore: number; type: string }>;
  moduleSummaries: Array<{ moduleId: string; code: string; title: string; creditHours: number; priorityScore: number }>;
  overallWeightedAverage: number;
  taskStats: { completed: number; pending: number };
  openModule?: { moduleId: string; code: string; title: string; creditHours: number } | undefined;
  onOpenModule?: (moduleId: string) => void;
  onCloseModule?: () => void;
  onPrevWeek?: () => void;
  onNextWeek?: () => void;
  onToday?: () => void;
};

export function WeekView({
  week,
  priorities,
  moduleSummaries,
  overallWeightedAverage,
  taskStats,
  openModule,
  onOpenModule,
  onCloseModule,
  onPrevWeek,
  onNextWeek,
  onToday,
}: WeekViewProps) {
  // Use the modern UI component from the packages/ui library 
  return (
    <WeekViewPageView
      week={week}
      priorities={priorities}
      moduleSummaries={moduleSummaries}
      overallWeightedAverage={overallWeightedAverage}
      taskStats={taskStats}
      openModule={openModule}
      onOpenModule={onOpenModule}
      onCloseModule={onCloseModule}
      onPrevWeek={onPrevWeek}
      onNextWeek={onNextWeek}
      onToday={onToday}
    />
  );
}


