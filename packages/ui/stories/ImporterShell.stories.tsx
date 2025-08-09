import type { Meta, StoryObj } from '@storybook/react';
import { ImporterShell } from '../import/ImporterShell.view';

const meta: Meta<typeof ImporterShell> = {
  title: 'UI/Importer/ImporterShell',
  component: ImporterShell,
};
export default meta;

type Story = StoryObj<typeof ImporterShell>;

export const Step1: Story = {
  args: {
    step: 1,
    importType: 'assignments',
    onChangeImportType: () => {},
    headers: [],
    mapping: {},
    onChangeMapping: () => {},
    onUploadFile: () => {},
    onPreview: () => {},
    onImport: () => {},
    result: null,
    missingModules: [],
  },
};


