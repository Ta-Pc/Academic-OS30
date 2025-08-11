'use client';
import React from 'react';
import { WeekViewPageView } from '@ui/week/WeekViewPage.view';

export type WeekViewProps = {
  week: { start: string | Date; end: string | Date };
  priorities: Array<{ id: string; title: string; moduleCode: string; dueDate?: string; priorityScore: number; type: string }>;
  moduleSummaries: Array<{ moduleId: string; code: string; title: string; creditHours: number; priorityScore: number }>;
  overallWeightedAverage: number;
  taskStats: { completed: number; pending: number };
  onOpenWhatIf?: () => void;
};

export function WeekView({
  week,
  priorities,
  moduleSummaries,
  overallWeightedAverage,
  taskStats,
}: WeekViewProps) {
  // Use the modern UI component from the packages/ui library with proper heading structure
  return (
    <div className="space-y-6">
      {/* Main heading that tests expect */}
      <h1 className="text-2xl font-bold text-gray-900">Weekly Mission Brief</h1>
      
      {/* Modern UI component */}
      <WeekViewPageView
        week={week}
        priorities={priorities}
        moduleSummaries={moduleSummaries}
        overallWeightedAverage={overallWeightedAverage}
        taskStats={taskStats}
      />
    </div>
  );
}


