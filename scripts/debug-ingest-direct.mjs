#!/usr/bin/env node
import { readFile } from 'node:fs/promises';

async function testIngestDirect() {
  const BASE = 'http://localhost:3000';
  
  try {
    // Start server in background first if not running
    const healthCheck = await fetch(`${BASE}/api/health`).catch(() => null);
    if (!healthCheck?.ok) {
      console.log('Server not running. Please start with: npm run dev');
      process.exit(1);
    }

    // Get user session
    const userResp = await fetch(`${BASE}/api/session/user`);
    const userData = await userResp.json();
    const userId = userData.user?.id;
    console.log('User ID:', userId);

    // Create term
    const termData = {
      title: 'Debug Term 2025',
      startDate: '2025-08-01', 
      endDate: '2025-11-30'
    };
    const termResp = await fetch(`${BASE}/api/terms`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(termData)
    });
    const termResult = await termResp.json();
    console.log('Term creation result:', termResult);
    const termId = termResult.term?.id;

    // Load CSV
    const raw = await readFile('tests/fixtures/modules-no-dates.csv', 'utf8');
    console.log('CSV content:');
    console.log(raw);

    // Create correct mapping (field -> header)
    const mapping = {
      code: 'Code',
      title: 'Title', 
      creditHours: 'Credit Hours'
    };

    console.log('Mapping:', mapping);

    // Call ingest
    const ingestResp = await fetch(`${BASE}/api/import/ingest`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        importType: 'modules',
        raw,
        mapping,
        userId,
        termId
      })
    });

    const ingestResult = await ingestResp.json();
    console.log('Ingest result:', JSON.stringify(ingestResult, null, 2));

    // Check modules
    const modulesResp = await fetch(`${BASE}/api/modules`);
    const modulesData = await modulesResp.json();
    const testModules = modulesData.modules?.filter(m => ['NODate1', 'NODate2'].includes(m.code)) || [];
    console.log('Test modules found:', testModules.length);
    testModules.forEach(m => console.log(`- ${m.code}: ${m.title} (${m.startDate ? 'has dates' : 'no dates'})`));

  } catch (error) {
    console.error('Error:', error);
  }
}

testIngestDirect();
