import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { EditAssignmentModalView } from '../modals/EditAssignmentModal.view';

const meta: Meta<typeof EditAssignmentModalView> = {
  title: 'UI/Modals/EditAssignmentModal',
  component: EditAssignmentModalView,
  parameters: { layout: 'fullscreen' },
};
export default meta;

 type Story = StoryObj<typeof EditAssignmentModalView>;

export const Basic: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    const [val, setVal] = useState<number | null>(50);
    return (
      <div className="h-screen bg-slate-100 p-8">
        <button className="btn btn-primary" onClick={() => setOpen(true)}>Open</button>
        <EditAssignmentModalView
          open={open}
          title="Edit Score"
          initialValue={val}
          onChange={setVal}
          onSave={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
        <div className="mt-4 text-sm">Value: {String(val)}</div>
      </div>
    );
  },
};
