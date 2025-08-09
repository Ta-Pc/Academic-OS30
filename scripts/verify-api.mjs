#!/usr/bin/env node

// Simple API verification script for local dev
// Checks /api/dashboard and /api/week-view return 200 OK

const BASE = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

async function check(path) {
  const url = `${BASE}${path}`;
  const res = await fetch(url);
  const ok = res.ok;
  const status = res.status;
  let bodyText = '';
  try {
    bodyText = await res.text();
  } catch {}
  return { url, ok, status, bodyText };
}

(async () => {
  const results = [];
  results.push(await check('/api/dashboard'));
  results.push(await check('/api/week-view'));
  // try seeded STK110 analytics by discovering moduleId from /api/modules
  let moduleId = null;
  try {
    const base = process.env.NEXT_PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
    const modsRes = await fetch(`${base}/api/modules`);
    if (modsRes.ok) {
      const modsJson = await modsRes.json();
      const first = Array.isArray(modsJson?.data) ? modsJson.data[0] : null;
      moduleId = first?.id || null;
    }
  } catch {}
  if (moduleId) {
    results.push(await check(`/api/modules/${moduleId}/analytics`));
  }

  const failures = results.filter((r) => !r.ok);
  for (const r of results) {
    console.log(`[verify] ${r.url} -> ${r.status}${r.ok ? ' OK' : ' FAIL'}`);
  }

  if (failures.length > 0) {
    console.error('\n[verify] One or more API checks failed. Details:');
    for (const f of failures) {
      console.error(`- ${f.url} -> ${f.status}`);
      console.error(String(f.bodyText).slice(0, 300));
    }
    // Allow a brief delay for connections to settle on Windows before exiting
    setTimeout(() => process.exit(1), 50);
  } else {
    console.log('\n[verify] All API checks passed.');
    setTimeout(() => process.exit(0), 50);
  }
})();

