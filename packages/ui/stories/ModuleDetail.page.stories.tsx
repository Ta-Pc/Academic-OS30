import type { Meta, StoryObj } from '@storybook/react';
import { ModuleDetailView } from '../modules/ModuleDetail.view';

const meta: Meta<typeof ModuleDetailView> = {
  title: 'UI/Modules/ModuleDetailPage',
  component: ModuleDetailView,
  argTypes: {
    onBackToWeek: { action: 'back-to-week-clicked' },
  },
};

export default meta;

type Story = StoryObj<typeof ModuleDetailView>;

const mockAssignmentsTable = (
  <table className="table">
    <thead>
      <tr>
        <th>Title</th>
        <th className="text-right">Score</th>
        <th className="text-right">Max</th>
        <th className="text-right">Weight</th>
        <th className="text-right">Contribution</th>
        <th className="text-center">Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr className="hover:bg-slate-50">
        <td>
          <div className="font-medium">Module Test 1</div>
          <div className="text-xs text-slate-500">Due 2025-03-26T10:00:00+02:00</div>
        </td>
        <td className="text-right">82.0</td>
        <td className="text-right">100</td>
        <td className="text-right">50.0%</td>
        <td className="text-right">41.00%</td>
        <td className="text-center">
          <button className="btn btn-secondary">Edit</button>
        </td>
      </tr>
      <tr className="hover:bg-slate-50">
        <td>
          <div className="font-medium">Module Test 2</div>
          <div className="text-xs text-slate-500">Due 2025-05-10T10:00:00+02:00</div>
        </td>
        <td className="text-right">—</td>
        <td className="text-right">100</td>
        <td className="text-right">25.0%</td>
        <td className="text-right">—</td>
        <td className="text-center">
          <button className="btn btn-secondary">Edit</button>
        </td>
      </tr>
      <tr className="hover:bg-slate-50">
        <td>
          <div className="font-medium">Practical Test</div>
          <div className="text-xs text-slate-500">Due 2025-05-23T10:00:00+02:00</div>
        </td>
        <td className="text-right">40.0</td>
        <td className="text-right">50</td>
        <td className="text-right">25.0%</td>
        <td className="text-right">20.00%</td>
        <td className="text-center">
          <button className="btn btn-secondary">Edit</button>
        </td>
      </tr>
    </tbody>
  </table>
);

export const Default: Story = {
  args: {
    header: { 
      code: 'STK110', 
      title: 'Statistics 110', 
      credits: 12 
    },
    stats: { 
      currentObtained: 61.0, 
      remainingWeight: 25.0, 
      predictedSemesterMark: 67.2,
      targetMark: 75
    },
    assignmentsSection: mockAssignmentsTable,
    hasLastViewedWeek: false,
  },
};

export const WithLastViewedWeek: Story = {
  args: {
    ...Default.args,
    hasLastViewedWeek: true,
  },
};

export const HighPerforming: Story = {
  args: {
    header: { 
      code: 'INF171', 
      title: 'Information Systems Analysis and Design', 
      credits: 12 
    },
    stats: { 
      currentObtained: 88.5, 
      remainingWeight: 20.0, 
      predictedSemesterMark: 91.2,
      targetMark: 80
    },
    assignmentsSection: mockAssignmentsTable,
    hasLastViewedWeek: true,
  },
};

export const NeedsImprovement: Story = {
  args: {
    header: { 
      code: 'EKN120', 
      title: 'Economics 120', 
      credits: 12 
    },
    stats: { 
      currentObtained: 42.0, 
      remainingWeight: 60.0, 
      predictedSemesterMark: 58.3,
      targetMark: 65
    },
    assignmentsSection: mockAssignmentsTable,
    hasLastViewedWeek: false,
  },
};

export const AllCompleted: Story = {
  args: {
    header: { 
      code: 'COS212', 
      title: 'Data Structures & Algorithms', 
      credits: 16 
    },
    stats: { 
      currentObtained: 76.8, 
      remainingWeight: 0, 
      predictedSemesterMark: 76.8,
      targetMark: 75
    },
    assignmentsSection: mockAssignmentsTable,
    hasLastViewedWeek: true,
  },
};
