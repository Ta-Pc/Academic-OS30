import type { Meta, StoryObj } from '@storybook/react';
import { SemesterSnapshotView } from '../semester/SemesterSnapshot.view';

const meta: Meta<typeof SemesterSnapshotView> = {
  title: 'UI/Semester/SemesterSnapshotView',
  component: SemesterSnapshotView,
};
export default meta;

type Story = StoryObj<typeof SemesterSnapshotView>;

export const Default: Story = {
  args: {
    overallWeightedAverage: 66.4,
    tasks: { completed: 12, pending: 5 },
  },
};


