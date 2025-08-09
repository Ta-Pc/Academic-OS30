import type { Meta, StoryObj } from '@storybook/react';
import { ModuleQuickView } from '../modules/ModuleQuickView.view';

const meta: Meta<typeof ModuleQuickView> = {
  title: 'UI/Modules/ModuleQuickView',
  component: ModuleQuickView,
};
export default meta;

type Story = StoryObj<typeof ModuleQuickView>;

export const Default: Story = {
  args: {
    code: 'PHYS201',
    title: 'Electromagnetism',
    stats: { average: 68, creditHours: 15 },
  },
};


