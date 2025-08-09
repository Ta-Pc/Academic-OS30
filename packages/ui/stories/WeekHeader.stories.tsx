import type { Meta, StoryObj } from '@storybook/react';
import { WeekHeaderView } from '../week/WeekHeader.view';

const meta: Meta<typeof WeekHeaderView> = {
  title: 'UI/Week/WeekHeaderView',
  component: WeekHeaderView,
};
export default meta;

type Story = StoryObj<typeof WeekHeaderView>;

export const Default: Story = {
  args: {
    start: new Date(),
    end: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
  },
};


