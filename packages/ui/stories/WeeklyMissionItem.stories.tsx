import type { Meta, StoryObj } from '@storybook/react';
import { WeeklyMissionItemView } from '../week/WeeklyMissionItem.view';

const meta: Meta<typeof WeeklyMissionItemView> = {
  title: 'UI/Week/WeeklyMissionItemView',
  component: WeeklyMissionItemView,
};
export default meta;

type Story = StoryObj<typeof WeeklyMissionItemView>;

export const Pending: Story = {
  args: { title: 'Read Chapter 3', dueDate: new Date(), moduleCode: 'MATH101', status: 'PENDING' },
};

export const Completed: Story = {
  args: { title: 'Practice Set 2', dueDate: new Date(), moduleCode: 'PHYS201', status: 'COMPLETED' },
};


