import type { Meta, StoryObj } from '@storybook/react';
import { ElectiveTrackerView } from '../left/ElectiveTracker.view';

const meta: Meta<typeof ElectiveTrackerView> = {
  title: 'Left Sidebar/ElectiveTracker',
  component: ElectiveTrackerView,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'ElectiveTracker shows DSM elective group progress with clickable progress bars that open module lists for the selected elective group.'
      }
    }
  },
  argTypes: {
    onViewModules: { action: 'view modules clicked' }
  }
};

export default meta;
type Story = StoryObj<typeof ElectiveTrackerView>;

export const Empty: Story = {
  args: {
    electiveGroups: []
  }
};

export const DSMCompleted: Story = {
  args: {
    electiveGroups: [
      {
        id: 'DSM',
        name: 'Data Science & Machine Learning',
        requiredCredits: 36,
        completedCredits: 36
      }
    ]
  }
};

export const DSMOnTrack: Story = {
  args: {
    electiveGroups: [
      {
        id: 'DSM',
        name: 'Data Science & Machine Learning',
        requiredCredits: 36,
        completedCredits: 24
      }
    ]
  }
};

export const DSMBehindSchedule: Story = {
  args: {
    electiveGroups: [
      {
        id: 'DSM',
        name: 'Data Science & Machine Learning',
        requiredCredits: 36,
        completedCredits: 6
      }
    ]
  }
};

export const MultipleElectiveGroups: Story = {
  args: {
    electiveGroups: [
      {
        id: 'DSM',
        name: 'Data Science & Machine Learning',
        requiredCredits: 36,
        completedCredits: 24
      },
      {
        id: 'CS',
        name: 'Computer Science',
        requiredCredits: 24,
        completedCredits: 12
      },
      {
        id: 'MATH',
        name: 'Advanced Mathematics',
        requiredCredits: 18,
        completedCredits: 18
      }
    ]
  }
};
