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

export const Step2Map: Story = {
  args: {
    ...Step1.args,
    step: 2,
    importType: 'modules',
    headers: ['Code', 'Title', 'Credit Hours'],
    mapping: { Code: 'code', Title: 'title', 'Credit Hours': 'creditHours' },
  },
};

export const Step3TermMapping: Story = {
  args: {
    ...Step1.args,
    step: 3,
    importType: 'modules',
    needsTermMapping: true,
    modulesNeedingTerms: ['MOD123','MOD456'],
    existingTerms: [
      { id: 't1', title: 'Spring 2025', startDate: '2025-01-05', endDate: '2025-05-20' },
    ],
    selectedTermId: null,
  },
};

export const Step4Preview: Story = {
  args: {
    ...Step1.args,
    step: 4,
    importType: 'modules',
    result: { preview: { valid: [{ code: 'M1' }], errors: [] } },
    missingModules: [],
  },
};

export const Step5Summary: Story = {
  args: {
    ...Step1.args,
    step: 5,
    importType: 'modules',
    result: { successCount: 2, total: 2, failures: [] },
    missingModules: [],
  },
};


