import React, { useState } from 'react';

export type ImporterShellProps = {
  step: 1 | 2 | 3 | 4 | 5;
  importType: 'modules' | 'assignments';
  onChangeImportType: (t: 'modules' | 'assignments') => void;
  headers: string[];
  mapping: Record<string, string>;
  onChangeMapping: (m: Record<string, string>) => void;
  onUploadFile: (file: File) => void;
  onPreview: () => void;
  onImport: () => void;
  result: {
    preview?: { valid?: unknown[]; errors?: unknown[] };
    successCount?: number;
    total?: number;
    failures?: Array<{ reason: string }>;
  } | null;
  missingModules: string[];
  renderAddModuleQuick?: () => React.ReactNode;
  // Term mapping step (optional when modules missing dates)
  needsTermMapping?: boolean;
  modulesNeedingTerms?: string[]; // list of module codes missing dates
  existingTerms?: Array<{ id: string; title: string; startDate: string; endDate: string }>;
  selectedTermId?: string | null;
  onSelectExistingTerm?: (id: string) => void;
  newTermDraft?: { title: string; startDate: string; endDate: string };
  onChangeNewTermDraft?: (d: { title: string; startDate: string; endDate: string }) => void;
  onCreateNewTerm?: () => void;
  termOverlaps?: Array<{ id: string; title: string; startDate: string; endDate: string }>;
};

export function ImporterShell({ step, importType, onChangeImportType, headers, mapping, onChangeMapping, onUploadFile, onPreview, onImport, result, missingModules, renderAddModuleQuick, needsTermMapping, modulesNeedingTerms = [], existingTerms = [], selectedTermId, onSelectExistingTerm, newTermDraft, onChangeNewTermDraft, onCreateNewTerm, termOverlaps = [] }: ImporterShellProps) {
  // local UI state for choosing existing vs creating new term (radios)
  const [termMode, setTermMode] = useState<'existing' | 'create'>('existing');
  function stepTitle(s: 1 | 2 | 3 | 4 | 5): string {
    switch (s) {
      case 1: return 'Upload CSV';
      case 2: return 'Map Columns';
    case 3: return 'Map Terms';
    case 4: return 'Preview & Validate';
    case 5: return 'Summary';
    }
  }
  return (
    <main className="container mx-auto py-8 space-y-6">
      <h1 className="text-3xl font-semibold">Smart CSV Importer</h1>
      <div className="card">
        <div className="card-header">
      <div className="text-sm font-semibold text-slate-700">Step {step} of 5: {stepTitle(step)}</div>
        </div>
      </div>

  {step === 1 && (
        <section className="card">
          <div className="card-body space-y-4">
            <div>
              <label className="mr-2 font-medium">Import type:</label>
      <select id="import-type" data-testid="importer-type-select" className="select w-60" value={importType} onChange={(e) => onChangeImportType(e.target.value as 'modules' | 'assignments')}>
                <option value="modules">Modules</option>
                <option value="assignments">Assignments</option>
              </select>
            </div>
            <label className="block">
              <span className="block mb-2">Upload CSV</span>
      <input data-testid="importer-file-input" className="file:mr-4 file:btn file:btn-secondary file:px-3 file:py-2" type="file" accept=".csv" onChange={(e) => e.target.files && onUploadFile(e.target.files[0])} />
            </label>
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="card">
          <div className="card-header" data-testid="map-columns-header">
            <div className="text-sm font-semibold text-slate-700">Map Columns</div>
          </div>
          <div className="card-body p-0">
            <div className="overflow-auto">
              <table className="table">
                <thead><tr><th>CSV Column</th><th>Map to field</th></tr></thead>
                <tbody>
                {headers.map((h) => (
                  <tr key={h}>
                    <td>{h}</td>
                    <td>
                      <input className="input w-80" data-testid={`map-${h}`} value={mapping[h] ?? ''} onChange={(e) => onChangeMapping({ ...mapping, [h]: e.target.value })} placeholder="Type target field (e.g. code, title, creditHours) or leave blank" />
                    </td>
                  </tr>
                ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="card-body border-t border-slate-200">
            <button className="btn btn-primary" onClick={onPreview}>Preview & Validate</button>
          </div>
        </section>
      )}

      {step === 3 && needsTermMapping && (
        <section className="card" data-testid="term-mapping-step">
          <div className="card-header">
            <div className="text-sm font-semibold text-slate-700">Assign Term to Modules</div>
          </div>
          <div className="card-body space-y-4">
            <p className="text-sm text-slate-600">{modulesNeedingTerms.length} modules are missing start/end dates. Assign them to an existing Term or create a new one.</p>
            <div className="flex gap-6 items-start flex-wrap">
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" name="term-mode" data-testid="term-existing-radio" value="existing" checked={termMode === 'existing'} onChange={() => setTermMode('existing')} /> Existing Term
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" name="term-mode" data-testid="term-create-radio" value="create" checked={termMode === 'create'} onChange={() => setTermMode('create')} /> Create New Term
              </label>
            </div>
            {termMode === 'existing' && (
              <div className="space-y-2" data-testid="term-existing-select-wrapper">
                <label className="block font-medium mb-1">Existing Terms</label>
                <select className="select w-full max-w-md" value={selectedTermId || ''} onChange={(e) => onSelectExistingTerm?.(e.target.value)}>
                  <option value="">-- Select a Term --</option>
                  {existingTerms.map(t => (
                    <option key={t.id} value={t.id}>{t.title} ({t.startDate.slice(0,10)} → {t.endDate.slice(0,10)})</option>
                  ))}
                </select>
              </div>
            )}
            {termMode === 'create' && (
              <form className="border rounded p-4 space-y-2 bg-slate-50" data-testid="term-create-form" onSubmit={(e) => { e.preventDefault(); onCreateNewTerm?.(); }}>
                <div className="font-medium">New Term</div>
                <input className="input w-full max-w-md" placeholder="Title" value={newTermDraft?.title || ''} onChange={(e) => onChangeNewTermDraft?.({ ...(newTermDraft||{ title:'', startDate:'', endDate:'' }), title: e.target.value })} />
                <div className="flex gap-3">
                  <input data-testid="term-start" type="date" className="input" value={newTermDraft?.startDate || ''} onChange={(e) => onChangeNewTermDraft?.({ ...(newTermDraft||{ title:'', startDate:'', endDate:'' }), startDate: e.target.value })} />
                  <input data-testid="term-end" type="date" className="input" value={newTermDraft?.endDate || ''} onChange={(e) => onChangeNewTermDraft?.({ ...(newTermDraft||{ title:'', startDate:'', endDate:'' }), endDate: e.target.value })} />
                  <button data-testid="term-submit" type="submit" className="btn btn-secondary" disabled={!newTermDraft?.title || !newTermDraft?.startDate || !newTermDraft?.endDate}>Create Term</button>
                </div>
                {termOverlaps.length > 0 && (
                  <div className="text-xs text-warning-600">Warning: Overlaps with {termOverlaps.map(o => o.title).join(', ')}</div>
                )}
              </form>
            )}
            <div>
              <button className="btn btn-primary" disabled={!selectedTermId} onClick={onPreview}>Continue to Preview</button>
            </div>
          </div>
        </section>
      )}

  {step === 4 && (
        <section className="space-y-3">
          <div className="card">
            <div className="card-header">
              <div className="text-sm font-semibold text-slate-700">Preview</div>
            </div>
            <div className="card-body space-y-3">
              <div className="text-sm text-slate-600">Valid rows: {result?.preview?.valid?.length ?? 0}, Errors: {result?.preview?.errors?.length ?? 0}</div>
              {missingModules.length > 0 && (
                <div className="text-sm">
                  Missing modules detected: {missingModules.join(', ')}
                  <div className="mt-3">
                    <div className="font-medium mb-1">Quick add:</div>
                    {renderAddModuleQuick?.()}
                  </div>
                </div>
              )}
              <div>
        <button data-testid="import-btn" className="btn btn-primary" disabled={!result?.preview?.valid?.length} aria-disabled={!result?.preview?.valid?.length} onClick={onImport}>Import</button>
              </div>
            </div>
          </div>
        </section>
      )}
      {step === 5 && (
        <section className="card">
          <div className="card-header">
            <div className="text-sm font-semibold text-slate-700">Summary</div>
          </div>
      <div className="card-body space-y-3" data-testid="import-success-summary">
    <div className="text-sm" data-testid="import-success-count">Successfully imported {result?.successCount ?? 0} of {result?.total ?? 0} rows.</div>
            {Array.isArray(result?.failures) && result.failures.length > 0 ? (
              <div className="text-sm text-danger-600">Failures:
                <ul className="list-disc ml-5">
                  {result.failures.map((f, i: number) => (
                    <li key={i}>{f.reason}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            <pre className="text-xs max-h-64 overflow-auto bg-slate-50 p-2 border" data-testid="import-debug-json">{JSON.stringify(result, null, 2)}</pre>
          </div>
        </section>
      )}
    </main>
  );
}


