#!/usr/bin/env node
import { readFile } from 'node:fs/promises';

const BASE = process.env.NEXT_PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || 3000}`;

function assert(cond, msg) { if (!cond) throw new Error(msg); }

async function run() {
  // Import assignments
  const assignmentsCsv = await readFile('sample-data/test_assignments.csv', 'utf8');
  const user = await (await fetch(`${BASE}/api/session/user`)).json();
  const userId = user?.user?.id;

  const mapping = {
    moduleCode: 'moduleCode',
    title: 'title',
    weight: 'weight',
    dueDate: 'dueDate',
    type: 'type'
  };

  const resA = await (await fetch(`${BASE}/api/import/ingest`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      importType: 'assignments',
      raw: assignmentsCsv,
      mapping,
      userId
    })
  })).json();

  assert(resA.successCount === 5, `assignments import failed: ${JSON.stringify(resA)}`);

  // Fetch dashboard modules and find newly added assignments under TEST101
  const mods = await (await fetch(`${BASE}/api/modules?userId=${userId}`)).json();
  const test101 = mods.data.find((m) => m.code === 'TEST101');

  const expectedTypes = ['QUIZ', 'SEMESTER_TEST', 'HOMEWORK', 'PRACTICAL', 'EXAM'];
  const actualTypes = test101.assignments.map(a => a.type);

  expectedTypes.forEach(expectedType => {
    assert(actualTypes.includes(expectedType), `Expected to find assignment of type ${expectedType}`);
  });

  console.log('test:import passed');
}

run().catch((e) => { console.error(e); process.exit(1); });
