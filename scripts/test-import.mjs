#!/usr/bin/env node
import { readFile } from 'node:fs/promises';

const BASE = process.env.NEXT_PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || 3000}`;

function assert(cond, msg) { if (!cond) throw new Error(msg); }

async function run() {
  // Import modules
  const modulesCsv = await readFile('sample-data/modules.csv', 'utf8');
  const user = await (await fetch(`${BASE}/api/session/user`)).json();
  const userId = user?.user?.id;
  const previewMods = await (await fetch(`${BASE}/api/import/preview`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ importType: 'modules', raw: modulesCsv, mapping: { code: 'Code', title: 'Title', creditHours: 'Credit Hours', targetMark: 'Target Mark' }, userId }) })).json();
  assert(previewMods.preview.valid.length === 2, 'expected 2 valid modules');
  const resMods = await (await fetch(`${BASE}/api/import/ingest`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ importType: 'modules', raw: modulesCsv, mapping: { code: 'Code', title: 'Title', creditHours: 'Credit Hours', targetMark: 'Target Mark' }, userId }) })).json();
  assert(resMods.successCount === 2, `modules import failed: ${JSON.stringify(resMods)}`);

  // Import assignments with one bad row
  const assignmentsCsv = await readFile('sample-data/assignments.csv', 'utf8');
  const previewA = await (await fetch(`${BASE}/api/import/preview`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ importType: 'assignments', raw: assignmentsCsv, mapping: { moduleCode: 'Module Code', title: 'Assignment Title', weight: 'Weight', dueDate: 'Due Date', status: 'Status', type: 'Type', score: 'Score', maxScore: 'Max Score', description: 'Description', effortEstimateMinutes: 'Effort Minutes', component: 'Component' }, userId }) })).json();
  assert(previewA.preview.valid.length === 3, 'expected 3 assignment rows in preview');
  const resA = await (await fetch(`${BASE}/api/import/ingest`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ importType: 'assignments', raw: assignmentsCsv, mapping: { moduleCode: 'Module Code', title: 'Assignment Title', weight: 'Weight', dueDate: 'Due Date', status: 'Status', type: 'Type', score: 'Score', maxScore: 'Max Score', description: 'Description', effortEstimateMinutes: 'Effort Minutes', component: 'Component' }, userId }) })).json();
  assert(resA.total === 3, 'total rows mismatch');
  assert(resA.successCount === 2, 'expected 2 successes');
  assert(resA.failures?.length === 1, `expected 1 failure: ${JSON.stringify(resA)}`);
  // Spot-check that status and type saved for one imported row
  // Fetch dashboard modules and find newly added assignment under STK110 by title
  const mods = await (await fetch(`${BASE}/api/modules?userId=${userId}`)).json();
  const stk = mods.data.find((m) => m.code === 'STK110');
  const added = stk.assignments.find((a) => a.title === 'Mini Quiz');
  if (added) {
    console.log('Imported assignment fields:', { status: added.status, type: added.type, weight: added.weight });
    if (!(added.status && added.type && added.weight)) throw new Error('V2 fields not saved');
  }

  console.log('test:import passed');
}

run().catch((e) => { console.error(e); process.exit(1); });

