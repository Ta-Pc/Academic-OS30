import React, { useState } from 'react';
import { ImporterShell } from 'packages/ui/import/ImporterShell.view';

export default { title: 'Importer/Wizard', component: ImporterShell };

export const WithTermMapping = () => {
  const [step, setStep] = useState<1|2|3|4|5>(3);
  const [selectedTermId, setSelectedTermId] = useState<string|null>(null);
  const existingTerms = [
    { id: 't1', title: 'Semester 1 2025', startDate: '2025-02-10T00:00:00.000Z', endDate: '2025-06-30T00:00:00.000Z' },
  ];
  return (
    <ImporterShell
      step={step}
      importType="modules"
      onChangeImportType={() => {}}
      headers={['Code','Title','Credit Hours']}
      mapping={{}}
      onChangeMapping={() => {}}
      onUploadFile={()=>{}}
      onPreview={()=> setStep(4)}
      onImport={()=> setStep(5)}
      result={{ preview: { valid: [{ code: 'ABC101' }], errors: [] } }}
      missingModules={[]}
      needsTermMapping
      modulesNeedingTerms={['ABC101','XYZ202']}
      existingTerms={existingTerms}
      selectedTermId={selectedTermId}
      onSelectExistingTerm={setSelectedTermId}
      newTermDraft={{ title: 'New Term', startDate: '2025-07-10', endDate: '2025-11-01' }}
      onChangeNewTermDraft={()=>{}}
      onCreateNewTerm={()=>{}}
      termOverlaps={[]}
    />
  );
};
