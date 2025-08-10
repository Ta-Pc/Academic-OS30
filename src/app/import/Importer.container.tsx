"use client";
import React, { useState } from 'react';
import { useUserStore } from '@/lib/user-store';
import { ImporterShell } from 'packages/ui/import/ImporterShell.view';
import AddModuleForm from '@/components/AddModuleForm';

type ImportType = 'modules' | 'assignments';
const IGNORE = '__ignore__';

export function ImporterContainer() {
  const currentUser = useUserStore((s) => s.currentUser);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [importType, setImportType] = useState<ImportType>('assignments');
  const [raw, setRaw] = useState<string>('');
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [result, setResult] = useState<unknown>(null);
  const [missingModules, setMissingModules] = useState<string[]>([]);

  async function handleParse(file: File) {
    const text = await file.text();
    const res = await fetch('/api/import/parse', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ text }) });
    const data = await res.json();
    setHeaders(data.headers);
  // rows not needed beyond header inference currently
    setRaw(text);
    setStep(2);
  }

  function buildFieldMapping(): Record<string, string> {
    const fieldToHeader: Record<string, string> = {};
    for (const [header, field] of Object.entries(mapping)) {
      if (!field || field === IGNORE) continue;
      fieldToHeader[field] = header;
    }
    return fieldToHeader;
  }

  async function handlePreview() {
    const fieldMap = buildFieldMapping();
    const res = await fetch('/api/import/preview', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ importType, raw, mapping: fieldMap, userId: currentUser?.id }) });
    const data = await res.json();
    setResult(data);
    setMissingModules(data.preview?.missingModules ?? []);
    setStep(3);
  }

  async function handleImport() {
    const fieldMap = buildFieldMapping();
    const res = await fetch('/api/import/ingest', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ importType, raw, mapping: fieldMap, userId: currentUser?.id }) });
    const data = await res.json();
    setResult(data);
    setStep(4);
  }

  return (
    <ImporterShell
      step={step}
      importType={importType}
      onChangeImportType={setImportType}
      headers={headers}
      mapping={mapping}
      onChangeMapping={setMapping}
      onUploadFile={handleParse}
      onPreview={handlePreview}
      onImport={handleImport}
      result={result}
      missingModules={missingModules}
      renderAddModuleQuick={() => <AddModuleForm onCreated={() => handlePreview()} />}
    />
  );
}


