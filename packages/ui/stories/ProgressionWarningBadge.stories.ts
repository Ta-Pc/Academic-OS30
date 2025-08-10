import type { Meta, StoryObj } from '@storybook/react';
import { ProgressionWarningBadgeView } from '../left/ProgressionWarningBadge.view';

const meta: Meta<typeof ProgressionWarningBadgeView> = {
  title: 'Left Sidebar/ProgressionWarningBadge',
  component: ProgressionWarningBadgeView,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'ProgressionWarningBadge shows a warning indicator when progression issues exist. Clicking opens the ProgressionDetail modal with remediation steps.'
      }
    }
  },
  argTypes: {
    onOpenDetails: { action: 'open details clicked' }
  }
};

export default meta;
type Story = StoryObj<typeof ProgressionWarningBadgeView>;

export const OnTrack: Story = {
  args: {
    warnings: []
  }
};

export const LowSeverityWarning: Story = {
  args: {
    warnings: [
      'Some modules need attention for optimal performance'
    ]
  }
};

export const MediumSeverityWarning: Story = {
  args: {
    warnings: [
      'Data Science & Machine Learning electives behind schedule: 6/36 credits'
    ]
  }
};

export const HighSeverityWarning: Story = {
  args: {
    warnings: [
      'Year 2 progress is concerning: only 35.5% of credits passed',
      '2 modules are at risk: EKN120, STK220'
    ]
  }
};

export const MultipleWarnings: Story = {
  args: {
    warnings: [
      'Year 1 progress is concerning: only 25.0% of credits passed',
      '3 modules are at risk: EKN120, STK110, INF171',
      'Data Science & Machine Learning electives behind schedule: 0/36 credits',
      '5 overdue assignments require immediate attention'
    ]
  }
};

export const OverdueAssignments: Story = {
  args: {
    warnings: [
      '3 overdue assignments require immediate attention'
    ]
  }
};
