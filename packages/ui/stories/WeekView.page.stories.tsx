import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { WeekView, WeekViewProps } from '../../../src/app/week-view/WeekView.view';

// Helper to generate mock module summaries
const makeModule = (i: number) => ({
  moduleId: `m-${i}`,
  code: `MOD${100 + i}`,
  title: `Sample Module ${i}`,
  creditHours: (i % 4) + 2,
  priorityScore: Math.round(Math.random() * 100),
});

const baseWeek = { start: new Date().toISOString(), end: new Date(Date.now() + 6 * 86400000).toISOString() };

const meta: Meta<typeof WeekView> = {
  title: 'Page/WeekView',
  component: WeekView,
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj<typeof WeekView>;

const baseProps: WeekViewProps = {
  week: baseWeek,
  priorities: Array.from({ length: 8 }, (_, i) => ({
    id: `p-${i}`,
    title: `Priority Task ${i + 1}`,
    moduleCode: `MOD${100 + (i % 5)}`,
    dueDate: new Date(Date.now() + (i + 1) * 3600_000).toISOString(),
    priorityScore: 80 - i * 3,
    type: 'ASSIGNMENT',
  })),
  moduleSummaries: Array.from({ length: 6 }, (_, i) => makeModule(i + 1)),
  overallWeightedAverage: 62.5,
  taskStats: { completed: 12, pending: 7 },
  onOpenModule: () => {},
  onCloseModule: () => {},
};

export const Normal: Story = {
  render: () => <div className="p-6 bg-slate-50 min-h-screen"><WeekView {...baseProps} /></div>,
};

export const LowData: Story = {
  render: () => (
    <div className="p-6 bg-slate-50 min-h-screen">
      <WeekView {...baseProps} priorities={[]} moduleSummaries={baseProps.moduleSummaries.slice(0,2)} taskStats={{ completed: 1, pending: 1 }} />
    </div>
  ),
};

export const ProgressionWarning: Story = {
  render: () => (
    <div className="p-6 bg-slate-50 min-h-screen">
      <WeekView {...baseProps} overallWeightedAverage={42.3} />
    </div>
  ),
};
