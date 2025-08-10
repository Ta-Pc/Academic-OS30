import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { WhatIfDialogView } from '../modals/WhatIfDialog.view';

const sampleAssignments = [
  { id: 'a1', title: 'Test 1', weight: 40, score: 70, maxScore: 100 },
  { id: 'a2', title: 'Test 2', weight: 30, score: null, maxScore: 100 },
  { id: 'a3', title: 'Project', weight: 30, score: 85, maxScore: 100 },
];

const meta: Meta<typeof WhatIfDialogView> = {
  title: 'UI/Modals/WhatIfDialog',
  component: WhatIfDialogView,
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj<typeof WhatIfDialogView>;

export const Open: Story = {
  render: () => {
    const [working, setWorking] = useState<Record<string, number | null>>({ a1: 70, a2: null, a3: 85 });
    return (
      <div className="h-screen bg-slate-100">
        <WhatIfDialogView
          open
          module={{ id: 'm1', code: 'MATH101', title: 'Calculus I', targetMark: 75 }}
          assignments={sampleAssignments}
          workingChanges={working}
          prediction={{ currentObtained: 55.5, remainingWeight: 45, predictedSemesterMark: 68.2, requiredAverageOnRemaining: 72 }}
          onChange={(id, v) => setWorking(w => ({ ...w, [id]: v }))}
          onSimulate={() => {}}
          onCommit={() => {}}
          onClose={() => {}}
          onReset={() => setWorking({ a1: 70, a2: null, a3: 85 })}
        />
      </div>
    );
  },
};

export const WithError: Story = {
  render: () => (
    <div className="h-screen bg-slate-100">
      <WhatIfDialogView
        open
        module={{ id: 'm1', code: 'MATH101', title: 'Calculus I', targetMark: 75 }}
        assignments={sampleAssignments}
        workingChanges={{ a1: 70, a2: 90, a3: 85 }}
  prediction={undefined}
        error="Network error"
        onChange={() => {}}
        onSimulate={() => {}}
        onCommit={() => {}}
        onClose={() => {}}
        onReset={() => {}}
      />
    </div>
  ),
};
