import type { Meta, StoryObj } from '@storybook/react';
import { ProgressionWarningBadgeView } from '../left/ProgressionWarningBadge.view';

const meta: Meta<typeof ProgressionWarningBadgeView> = {
  title: 'UI/Left/ProgressionWarningBadgeView',
  component: ProgressionWarningBadgeView,
  parameters: {
    docs: {
      description: {
        component: 'ProgressionWarningBadge shows a warning indicator when progression issues exist. Clicking opens the ProgressionDetail modal.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof ProgressionWarningBadgeView>;

export const OnTrack: Story = {
  args: {
    warnings: [],
    onOpenDetails: () => {
      console.log('Opening progression details...');
    },
  },
};

export const SingleWarning: Story = {
  args: {
    warnings: [
      'Year 2 progress is concerning: only 35.5% of credits passed',
    ],
    onOpenDetails: () => {
      console.log('Opening progression details...');
    },
  },
};

export const MultipleWarnings: Story = {
  args: {
    warnings: [
      'Year 2 progress is concerning: only 35.5% of credits passed',
      '2 modules are at risk: STK110, EKN120',
      '3 overdue assignments require immediate attention',
    ],
    onOpenDetails: () => {
      console.log('Opening progression details...');
    },
  },
};

export const HighSeverityWarnings: Story = {
  args: {
    warnings: [
      '3 modules are at risk: STK110, EKN120, INF171',
      '5 overdue assignments require immediate attention',
    ],
    onOpenDetails: () => {
      console.log('Opening progression details...');
    },
  },
};

export const MediumSeverityWarnings: Story = {
  args: {
    warnings: [
      'Data Science & Machine Learning electives behind schedule: 12/36 credits',
      'Consider enrolling in additional elective modules for next semester',
    ],
    onOpenDetails: () => {
      console.log('Opening progression details...');
    },
  },
};

export const LowSeverityWarnings: Story = {
  args: {
    warnings: [
      'Study schedule optimization recommended',
      'Consider forming study groups for better collaboration',
    ],
    onOpenDetails: () => {
      console.log('Opening progression details...');
    },
  },
};
