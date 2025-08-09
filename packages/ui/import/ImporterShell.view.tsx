import React from 'react';

export type ImporterShellProps = {
  step: 1 | 2 | 3 | 4;
  importType: 'modules' | 'assignments';
  onChangeImportType: (t: 'modules' | 'assignments') => void;
  headers: string[];
  mapping: Record<string, string>;
  onChangeMapping: (m: Record<string, string>) => void;
  onUploadFile: (file: File) => void;
  onPreview: () => void;
  onImport: () => void;
  result: any;
  missingModules: string[];
  renderAddModuleQuick?: () => React.ReactNode;
};

export function ImporterShell({ step, importType, onChangeImportType, headers, mapping, onChangeMapping, onUploadFile, onPreview, onImport, result, missingModules, renderAddModuleQuick }: ImporterShellProps) {
  function stepTitle(s: 1 | 2 | 3 | 4): string {
    switch (s) {
      case 1: return 'Upload CSV';
      case 2: return 'Map Columns';
      case 3: return 'Preview & Validate';
      case 4: return 'Summary';
    }
  }
  return (
    <main className="container mx-auto py-8 space-y-6">
      <h1 className="text-3xl font-semibold">Smart CSV Importer</h1>
      <div className="card">
        <div className="card-header">
          <div className="text-sm font-semibold text-slate-700">Step {step} of 4: {stepTitle(step)}</div>
        </div>
      </div>

      {step === 1 && (
        <section className="card">
          <div className="card-body space-y-4">
            <div>
              <label className="mr-2 font-medium">Import type:</label>
              <select className="select w-60" value={importType} onChange={(e) => onChangeImportType(e.target.value as any)}>
                <option value="modules">Modules</option>
                <option value="assignments">Assignments</option>
              </select>
            </div>
            <label className="block">
              <span className="block mb-2">Upload CSV</span>
              <input className="file:mr-4 file:btn file:btn-secondary file:px-3 file:py-2" type="file" accept=".csv" onChange={(e) => e.target.files && onUploadFile(e.target.files[0])} />
            </label>
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="card">
          <div className="card-header">
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
                      <input className="input w-80" value={mapping[h] ?? ''} onChange={(e) => onChangeMapping({ ...mapping, [h]: e.target.value })} placeholder="Type target field or leave blank" />
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

      {step === 3 && (
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
                <button className="btn btn-primary" onClick={onImport}>Import</button>
              </div>
            </div>
          </div>
        </section>
      )}

      {step === 4 && (
        <section className="card">
          <div className="card-header">
            <div className="text-sm font-semibold text-slate-700">Summary</div>
          </div>
          <div className="card-body space-y-3">
            <div className="text-sm">Successfully imported {result?.successCount ?? 0} of {result?.total ?? 0} rows.</div>
            {Array.isArray(result?.failures) && result.failures.length > 0 ? (
              <div className="text-sm text-danger-600">Failures:
                <ul className="list-disc ml-5">
                  {result.failures.map((f: any, i: number) => (
                    <li key={i}>{f.reason}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </section>
      )}
    </main>
  );
}


