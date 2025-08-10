import type { Meta, StoryObj } from '@storybook/react';
import { ProgressionDetailView, RemediationAction } from '../left/ProgressionDetail.view';

const meta: Meta<typeof ProgressionDetailView> = {
  title: 'UI/Left/ProgressionDetailView',
  component: ProgressionDetailView,
  parameters: {
    docs: {
      description: {
        component: 'ProgressionDetail modal shows detailed progression analysis with remediation steps and suggested weekly priorities.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof ProgressionDetailView>;

const sampleRemediationActions: RemediationAction[] = [
  {
    id: 'action-1',
    title: 'Complete overdue: Assignment 2',
    description: 'Submit Assignment 2 for STK110. This assignment is overdue and requires immediate attention.',
    priority: 'high',
    estimatedHours: 3,
    moduleCode: 'STK110',
    type: 'assignment',
  },
  {
    id: 'action-2',
    title: 'Intensive review: EKN120',
    description: 'Current average is 42%. Review all course material and seek help from tutors or lecturers.',
    priority: 'high',
    estimatedHours: 6,
    moduleCode: 'EKN120',
    type: 'review',
  },
  {
    id: 'action-3',
    title: 'Prepare for: Semester Test 2',
    description: 'Semester Test 2 is due in 5 days. Start preparation now to avoid last-minute stress.',
    priority: 'medium',
    estimatedHours: 4,
    moduleCode: 'INF171',
    type: 'study',
  },
  {
    id: 'action-4',
    title: 'Schedule consultation: STK110',
    description: 'Book office hours with the lecturer to discuss specific areas of difficulty and get personalized guidance.',
    priority: 'medium',
    estimatedHours: 1,
    moduleCode: 'STK110',
    type: 'admin',
  },
  {
    id: 'action-5',
    title: 'Create weekly study schedule',
    description: 'Plan dedicated study time for each module to ensure consistent progress and avoid last-minute cramming.',
    priority: 'low',
    estimatedHours: 1,
    type: 'admin',
  },
];

export const GoodProgress: Story = {
  args: {
    isOpen: true,
    warnings: [],
    progressData: {
      currentYear: 2,
      creditsPassedThisYear: 45,
      requiredCreditsForYear: 60,
      percentPassed: 75,
    },
    remediationActions: [
      {
        id: 'action-1',
        title: 'Advanced practice: STK210',
        description: "You're performing well! Try additional practice problems or explore advanced topics to excel further.",
        priority: 'low',
        estimatedHours: 3,
        moduleCode: 'STK210',
        type: 'study',
      },
      sampleRemediationActions[4], // General study schedule
    ],
    onClose: () => console.log('Modal closed'),
    onAddToWeek: (actionIds: string[]) => console.log('Added to week:', actionIds),
  },
};

export const AtRiskStudent: Story = {
  args: {
    isOpen: true,
    warnings: [
      'Year 2 progress is concerning: only 35% of credits passed',
      '2 modules are at risk: STK110, EKN120',
      '3 overdue assignments require immediate attention',
    ],
    progressData: {
      currentYear: 2,
      creditsPassedThisYear: 21,
      requiredCreditsForYear: 60,
      percentPassed: 35,
    },
    remediationActions: sampleRemediationActions,
    onClose: () => console.log('Modal closed'),
    onAddToWeek: (actionIds: string[]) => console.log('Added to week:', actionIds),
  },
};

export const BehindSchedule: Story = {
  args: {
    isOpen: true,
    warnings: [
      'Data Science & Machine Learning electives behind schedule: 12/36 credits',
      'Consider enrolling in additional elective modules for next semester',
    ],
    progressData: {
      currentYear: 3,
      creditsPassedThisYear: 40,
      requiredCreditsForYear: 50,
      percentPassed: 80,
    },
    remediationActions: [
      {
        id: 'action-1',
        title: 'Enroll in DSM electives',
        description: 'Register for COS330 (AI) and COS344 (Graphics) to catch up on elective requirements.',
        priority: 'medium',
        estimatedHours: 2,
        type: 'admin',
      },
      {
        id: 'action-2',
        title: 'Review elective prerequisites',
        description: 'Ensure you meet all prerequisites for available DSM elective modules.',
        priority: 'low',
        estimatedHours: 1,
        type: 'admin',
      },
    ],
    onClose: () => console.log('Modal closed'),
    onAddToWeek: (actionIds: string[]) => console.log('Added to week:', actionIds),
  },
};

export const FirstYearStudent: Story = {
  args: {
    isOpen: true,
    warnings: [
      '1 overdue assignments require immediate attention',
    ],
    progressData: {
      currentYear: 1,
      creditsPassedThisYear: 30,
      requiredCreditsForYear: 40,
      percentPassed: 75,
    },
    remediationActions: [
      {
        id: 'action-1',
        title: 'Complete overdue: Pre-class Assignment 3',
        description: 'Submit Pre-class Assignment 3 for STK110. This assignment is overdue and requires immediate attention.',
        priority: 'high',
        estimatedHours: 2,
        moduleCode: 'STK110',
        type: 'assignment',
      },
      {
        id: 'action-2',
        title: 'Form study groups',
        description: 'Connect with classmates to form study groups for collaborative learning and mutual support.',
        priority: 'low',
        estimatedHours: 2,
        type: 'admin',
      },
    ],
    onClose: () => console.log('Modal closed'),
    onAddToWeek: (actionIds: string[]) => console.log('Added to week:', actionIds),
  },
};

export const Closed: Story = {
  args: {
    isOpen: false,
    warnings: [],
    progressData: {
      currentYear: 1,
      creditsPassedThisYear: 30,
      requiredCreditsForYear: 40,
      percentPassed: 75,
    },
    remediationActions: [],
    onClose: () => console.log('Modal closed'),
    onAddToWeek: (actionIds: string[]) => console.log('Added to week:', actionIds),
  },
};
