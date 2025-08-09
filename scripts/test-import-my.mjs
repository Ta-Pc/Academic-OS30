#!/usr/bin/env node
import { readFile } from 'node:fs/promises';

const BASE = process.env.NEXT_PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || 3000}`;

function assert(cond, msg) { if (!cond) throw new Error(msg); }

async function run() {
  const csv = await readFile('my_assesment_data.csv', 'utf8');

  // Field -> Header mapping expected by the API
  const mapping = {
    moduleCode: 'module_code',
    title: 'title',
    weight: 'weight',
    dueDate: 'due_date',
    status: 'status',
    type: 'type',
    score: 'grade',
    effortEstimateMinutes: 'effort_estimate',
  };

  const preview = await (await fetch(`${BASE}/api/import/preview`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ importType: 'assignments', raw: csv, mapping }),
  })).json();

  if (preview.error) throw new Error(`preview error: ${preview.error}`);
  console.log('preview: rows', preview.preview.valid.length, 'errors', preview.preview.errors.length);

  // create missing modules first
  const missing = preview.preview.missingModules || [];
  if (missing.length) {
    const createRes = await (await fetch(`${BASE}/api/import/create-missing-modules`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ codes: missing }),
    })).json();
    console.log('created modules:', createRes.created);
  }

  const ingest = await (await fetch(`${BASE}/api/import/ingest`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ importType: 'assignments', raw: csv, mapping }),
  })).json();

  if (ingest.error) throw new Error(`ingest error: ${ingest.error}`);
  console.log('ingest:', ingest.successCount, '/', ingest.total, 'failures:', ingest.failures?.length || 0);

  // Expect at least most rows to succeed
  assert(ingest.successCount > 0, 'no rows imported');
}

run().catch((e) => { console.error(e); process.exit(1); });



