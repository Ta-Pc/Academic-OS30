import type { Meta, StoryObj } from '@storybook/react';
import { ModuleCardView } from '../modules/ModuleCard.view';

const meta: Meta<typeof ModuleCardView> = {
  title: 'UI/Modules/ModuleCardView',
  component: ModuleCardView,
};
export default meta;

type Story = StoryObj<typeof ModuleCardView>;

export const Default: Story = {
  args: {
    module: { id: 'm1', code: 'MATH101', title: 'Calculus I', creditHours: 12, createdAt: new Date(), currentAverageMark: 72, currentGrade: 30 },
  },
};


