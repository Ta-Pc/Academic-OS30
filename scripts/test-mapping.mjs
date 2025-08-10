#!/usr/bin/env node
import { readFile } from 'node:fs/promises';

async function testIngestMapping() {
  const csv = await readFile('tests/fixtures/modules-no-dates.csv', 'utf8');
  console.log('CSV content:');
  console.log(csv);
  
  // Simulate buildFieldMapping from container
  const mapping = {'Code': 'code', 'Title': 'title', 'Credit Hours': 'creditHours'};
  const fieldToHeader = {};
  for (const [header, field] of Object.entries(mapping)) {
    if (!field || field === '__ignore__') continue;
    fieldToHeader[field] = header;
  }
  console.log('Field mapping:', fieldToHeader);
  
  // Test what the ingest route would see
  const rows = [
    {'Code': 'NODate1', 'Title': 'Test Module 1', 'Credit Hours': '12'},
    {'Code': 'NODate2', 'Title': 'Test Module 2', 'Credit Hours': '16'}
  ];
  
  for (const r of rows) {
    const code = r[fieldToHeader['code']]?.trim();
    const title = r[fieldToHeader['title']]?.trim();
    const creditHours = parseInt(r[fieldToHeader['creditHours']] || '0');
    console.log(`Row: code=${code}, title=${title}, creditHours=${creditHours}`);
  }
}

testIngestMapping().catch(console.error);
