"use client";
import React, { useEffect, useState } from 'react';
// user store pruned
import { ImporterShell } from 'packages/ui/import/ImporterShell.view';
import AddModuleForm from '@/components/AddModuleForm';

type ImportType = 'modules' | 'assignments';
const IGNORE = '__ignore__';

export function ImporterContainer() {
  // user context removed
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  // Default to modules so test can immediately find the select / expected option order
  const [importType, setImportType] = useState<ImportType>('modules');
  const [raw, setRaw] = useState<string>('');
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ preview?: { valid?: unknown[]; errors?: unknown[]; missingModules?: string[] } } | null>(null);
  const [missingModules, setMissingModules] = useState<string[]>([]);
  // Term mapping state
  const [needsTermMapping, setNeedsTermMapping] = useState(false);
  const [modulesNeedingTerms, setModulesNeedingTerms] = useState<string[]>([]);
  const [terms, setTerms] = useState<Array<{ id: string; title: string; startDate: string; endDate: string }>>([]);
  const [selectedTermId, setSelectedTermId] = useState<string | null>(null);
  const [newTermDraft, setNewTermDraft] = useState<{ title: string; startDate: string; endDate: string }>({ title: '', startDate: '', endDate: '' });
  const [termOverlaps, setTermOverlaps] = useState<Array<{ id: string; title: string; startDate: string; endDate: string }>>([]);

  async function loadTerms() {
    const res = await fetch('/api/terms');
    const data = await res.json();
    setTerms(data.terms || []);
  }
  useEffect(() => {
    if (needsTermMapping) loadTerms();
  }, [needsTermMapping]);

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
    // If term mapping already needed and user selected a term, just advance
    if (needsTermMapping && selectedTermId) {
      setStep(4);
      return;
    }
    const fieldMap = buildFieldMapping();
  const res = await fetch('/api/import/preview', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ importType, raw, mapping: fieldMap }) });
    const data = await res.json();
    setResult(data);
    setMissingModules(data.preview?.missingModules ?? []);
  // Detect if modules import with missing dates: if start/end not mapped, require term mapping
    if (importType === 'modules') {
      // If mapping does not include startDate + endDate fields -> require term mapping
      const hasStart = Object.values(mapping).includes('startDate');
      const hasEnd = Object.values(mapping).includes('endDate');
      if (!hasStart || !hasEnd) {
        setNeedsTermMapping(true);
        // collect module codes from preview valid rows
  const mods = (data.preview?.valid || []).map((v: unknown) => (v as { code?: string }).code).filter((c: string | undefined): c is string => !!c);
        setModulesNeedingTerms(mods);
        setStep(3);
        return;
      }
    }
  setStep(4);
  }

  async function handleImport() {
    const fieldMap = buildFieldMapping();
    // If term mapping required and selectedTerm provided but start/end not mapped, inject them into mapping for ingest step (server expects startDate / endDate fields for module create)
    if (needsTermMapping && selectedTermId) {
      const term = terms.find(t => t.id === selectedTermId);
      if (term) {
        // add pseudo headers for start/end date values by mutating raw? Instead, extend mapping with constant tokens and send separately
      }
    }
  const res = await fetch('/api/import/ingest', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ importType, raw, mapping: fieldMap, termId: selectedTermId }) });
    const data = await res.json();
    setResult(data);
    setStep(5);
  }

  async function handleCreateTerm() {
    if (!newTermDraft.title || !newTermDraft.startDate || !newTermDraft.endDate) return;
    const res = await fetch('/api/terms', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(newTermDraft) });
    const data = await res.json();
    if (data.term) {
      setTerms([...terms, data.term]);
      setSelectedTermId(data.term.id);
      setTermOverlaps(data.overlaps || []);
    } else if (data.overlaps) {
      setTermOverlaps(data.overlaps);
    }
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
      needsTermMapping={needsTermMapping}
      modulesNeedingTerms={modulesNeedingTerms}
      existingTerms={terms}
      selectedTermId={selectedTermId}
      onSelectExistingTerm={setSelectedTermId}
      newTermDraft={newTermDraft}
      onChangeNewTermDraft={setNewTermDraft}
      onCreateNewTerm={handleCreateTerm}
      termOverlaps={termOverlaps}
    />
  );
}


