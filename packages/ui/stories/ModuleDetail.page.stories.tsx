import type { Meta, StoryObj } from '@storybook/react';
import { ModuleDetailView } from '../modules/ModuleDetail.view';

const meta: Meta<typeof ModuleDetailView> = {
  title: 'UI/Modules/ModuleDetailPage',
  component: ModuleDetailView,
};

export default meta;

type Story = StoryObj<typeof ModuleDetailView>;

export const Default: Story = {
  args: {
    header: { code: 'CSE101', title: 'Intro Computer Science', credits: 12 },
    stats: { currentObtained: 48.2, remainingWeight: 51.8, predictedSemesterMark: 72.4 },
    assignmentsSection: (
      <table className="table">
        <thead><tr><th>Title</th><th>Score</th><th>Weight</th><th>Contribution</th></tr></thead>
        <tbody>
          <tr><td>Quiz 1</td><td>80%</td><td>10%</td><td>8%</td></tr>
          <tr><td>Project</td><td>92%</td><td>30%</td><td>27.6%</td></tr>
          <tr><td>Midterm</td><td>65%</td><td>20%</td><td>13%</td></tr>
        </tbody>
      </table>
    ),
    hasLastViewedWeek: true,
  },
};
