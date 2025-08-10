import type { Meta, StoryObj } from '@storybook/react';
import { ElectiveTrackerView } from '../left/ElectiveTracker.view';

const meta: Meta<typeof ElectiveTrackerView> = {
  title: 'UI/Left/ElectiveTrackerView',
  component: ElectiveTrackerView,
  parameters: {
    docs: {
      description: {
        component: 'ElectiveTracker shows DSM elective group progress with clickable progress bars that open module lists.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof ElectiveTrackerView>;

export const WithDSMElectives: Story = {
  args: {
    electiveGroups: [
      {
        id: 'DSM',
        name: 'Data Science & Machine Learning',
        requiredCredits: 36,
        completedCredits: 18,
      },
    ],
    onViewModules: (groupId: string) => {
      console.log('View modules for group:', groupId);
    },
  },
};

export const MultipleElectiveGroups: Story = {
  args: {
    electiveGroups: [
      {
        id: 'DSM',
        name: 'Data Science & Machine Learning',
        requiredCredits: 36,
        completedCredits: 30,
      },
      {
        id: 'WEB',
        name: 'Web Development',
        requiredCredits: 24,
        completedCredits: 12,
      },
      {
        id: 'SEC',
        name: 'Cybersecurity',
        requiredCredits: 24,
        completedCredits: 6,
      },
    ],
    onViewModules: (groupId: string) => {
      console.log('View modules for group:', groupId);
    },
  },
};

export const CompletedElectives: Story = {
  args: {
    electiveGroups: [
      {
        id: 'DSM',
        name: 'Data Science & Machine Learning',
        requiredCredits: 36,
        completedCredits: 36,
      },
    ],
    onViewModules: (groupId: string) => {
      console.log('View modules for group:', groupId);
    },
  },
};

export const BehindSchedule: Story = {
  args: {
    electiveGroups: [
      {
        id: 'DSM',
        name: 'Data Science & Machine Learning',
        requiredCredits: 36,
        completedCredits: 6,
      },
    ],
    onViewModules: (groupId: string) => {
      console.log('View modules for group:', groupId);
    },
  },
};

export const NoElectives: Story = {
  args: {
    electiveGroups: [],
    onViewModules: (groupId: string) => {
      console.log('View modules for group:', groupId);
    },
  },
};
