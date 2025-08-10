import type { Meta, StoryObj } from '@storybook/react';
import { ProgressionDetailView } from '../left/ProgressionDetail.view';

const meta: Meta<typeof ProgressionDetailView> = {
  title: 'Left Sidebar/ProgressionDetail',
  component: ProgressionDetailView,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'ProgressionDetail modal shows detailed progression analysis with remediation steps and suggested weekly priorities that can be added to the current week.'
      }
    }
  },
  argTypes: {
    onClose: { action: 'modal closed' },
    onAddToWeek: { action: 'actions added to week' }
  }
};

export default meta;
type Story = StoryObj<typeof ProgressionDetailView>;

const mockProgressData = {
  currentYear: 2,
  creditsPassedThisYear: 45,
  requiredCreditsForYear: 120,
  percentPassed: 37.5
};

const mockRemediationActions = [
  {
    id: 'action-1',
    title: 'Complete overdue: Module Test 2',
    description: 'Submit Module Test 2 for STK210. This assignment is overdue and requires immediate attention.',
    priority: 'high' as const,
    estimatedHours: 3,
    moduleCode: 'STK210',
    type: 'assignment' as const
  },
  {
    id: 'action-2',
    title: 'Intensive review: EKN220',
    description: 'Current average is 42%. Review all course material and seek help from tutors or lecturers.',
    priority: 'high' as const,
    estimatedHours: 6,
    moduleCode: 'EKN220',
    type: 'review' as const
  },
  {
    id: 'action-3',
    title: 'Prepare for: Semester Test 1',
    description: 'Semester Test 1 is due in 5 days. Start preparation now to avoid last-minute stress.',
    priority: 'medium' as const,
    estimatedHours: 4,
    moduleCode: 'INF271',
    type: 'study' as const
  },
  {
    id: 'action-4',
    title: 'Schedule consultation: EKN220',
    description: 'Book office hours with the lecturer to discuss specific areas of difficulty and get personalized guidance.',
    priority: 'medium' as const,
    estimatedHours: 1,
    moduleCode: 'EKN220',
    type: 'admin' as const
  },
  {
    id: 'action-5',
    title: 'Create weekly study schedule',
    description: 'Plan dedicated study time for each module to ensure consistent progress and avoid last-minute cramming.',
    priority: 'medium' as const,
    estimatedHours: 1,
    type: 'admin' as const
  },
  {
    id: 'action-6',
    title: 'Advanced practice: STK210',
    description: "You're performing well! Try additional practice problems or explore advanced topics to excel further.",
    priority: 'low' as const,
    estimatedHours: 3,
    moduleCode: 'STK210',
    type: 'study' as const
  }
];

export const Closed: Story = {
  args: {
    isOpen: false,
    warnings: [],
    progressData: mockProgressData,
    remediationActions: []
  }
};

export const OnTrackStudent: Story = {
  args: {
    isOpen: true,
    warnings: [],
    progressData: {
      currentYear: 2,
      creditsPassedThisYear: 95,
      requiredCreditsForYear: 120,
      percentPassed: 79.2
    },
    remediationActions: [
      {
        id: 'action-1',
        title: 'Advanced practice: STK210',
        description: "You're performing well! Try additional practice problems or explore advanced topics to excel further.",
        priority: 'low' as const,
        estimatedHours: 3,
        moduleCode: 'STK210',
        type: 'study' as const
      },
      {
        id: 'action-2',
        title: 'Form study groups',
        description: 'Connect with classmates to form study groups for collaborative learning and mutual support.',
        priority: 'low' as const,
        estimatedHours: 2,
        type: 'admin' as const
      }
    ]
  }
};

export const AtRiskStudent: Story = {
  args: {
    isOpen: true,
    warnings: [
      'Year 2 progress is concerning: only 37.5% of credits passed',
      '2 modules are at risk: EKN220, INF271',
      '1 overdue assignments require immediate attention'
    ],
    progressData: mockProgressData,
    remediationActions: mockRemediationActions
  }
};

export const CriticalStudent: Story = {
  args: {
    isOpen: true,
    warnings: [
      'Year 3 progress is concerning: only 15.8% of credits passed',
      '4 modules are at risk: EKN320, STK320, COS314, INF370',
      'Data Science & Machine Learning electives behind schedule: 6/36 credits',
      '8 overdue assignments require immediate attention'
    ],
    progressData: {
      currentYear: 3,
      creditsPassedThisYear: 19,
      requiredCreditsForYear: 120,
      percentPassed: 15.8
    },
    remediationActions: [
      ...mockRemediationActions,
      {
        id: 'action-7',
        title: 'Complete overdue: Final Project Proposal',
        description: 'Submit Final Project Proposal for INF370. This assignment is critically overdue.',
        priority: 'high' as const,
        estimatedHours: 8,
        moduleCode: 'INF370',
        type: 'assignment' as const
      },
      {
        id: 'action-8',
        title: 'Emergency tutoring session',
        description: 'Book immediate tutoring sessions for failing modules to prevent academic exclusion.',
        priority: 'high' as const,
        estimatedHours: 4,
        type: 'admin' as const
      }
    ]
  }
};

export const NoActions: Story = {
  args: {
    isOpen: true,
    warnings: [
      'Some minor improvements possible'
    ],
    progressData: {
      currentYear: 1,
      creditsPassedThisYear: 85,
      requiredCreditsForYear: 120,
      percentPassed: 70.8
    },
    remediationActions: []
  }
};
