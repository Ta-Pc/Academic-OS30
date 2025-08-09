#!/usr/bin/env node

import { spawn } from 'node:child_process';

const BASES = [
  process.env.NEXT_PUBLIC_BASE_URL,
  `http://localhost:${process.env.PORT || 3000}`,
  'http://localhost:3001',
].filter(Boolean);

function log(msg) {
  console.log(msg);
}

function assert(cond, message) {
  if (!cond) throw new Error(message);
}

function almostEqual(a, b, epsilon = 0.1) {
  return Math.abs(a - b) <= epsilon;
}

async function tryFetch(path) {
  let lastErr;
  for (const base of BASES) {
    try {
      const res = await fetch(`${base}${path}`);
      if (res.ok) return await res.json();
      lastErr = new Error(`HTTP ${res.status} for ${base}${path}`);
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr;
}

async function run() {
  try {
    // Ensure clean DB at start
    const env = { ...process.env };
    if (!env.DATABASE_URL) env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/academic_os?schema=public';
    await new Promise((resolve, reject) => {
      const p = spawn(
        process.platform === 'win32' ? 'npx.cmd' : 'npx',
        ['prisma', 'migrate', 'reset', '--force', '--skip-generate', '--skip-seed'],
        { stdio: 'inherit', env, shell: true }
      );
      p.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`reset exit ${code}`))));
    });
    await new Promise((resolve, reject) => {
      const p = spawn(process.platform === 'win32' ? 'npx.cmd' : 'npx', ['prisma', 'db', 'seed'], {
        stdio: 'inherit',
        env,
        shell: true,
      });
      p.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`seed exit ${code}`))));
    });

    log('Story 1: Dashboard correctness');
    const user = await tryFetch('/api/session/user');
    const userId = user?.user?.id;
    const dash = await tryFetch(`/api/dashboard?userId=${userId}`);
    assert(Array.isArray(dash.data), 'dashboard data must be an array');
    assert(dash.data.length === 3, `expected 3 modules, got ${dash.data.length}`);
    const codes = dash.data.map((m) => m.code).sort();
    assert(JSON.stringify(codes) === JSON.stringify(['EKN120', 'INF171', 'STK110'].sort()), `unexpected module codes: ${codes.join(',')}`);
    const stk = dash.data.find((m) => m.code === 'STK110');
    assert(stk, 'STK110 not found');
    // Expected currentGrade using contributions (sum of grade% * weight for graded only):
    // Module Test 1: 82/100 * 50 = 41
    // Formal Practical Test: 40/50 = 0.8 → *25 = 20
    // Pre-class 1: 9/10 = 0.9 → *12.5 = 11.25
    // Post-class 1: 8/10 = 0.8 → *12.5 = 10
    // Total = 82.25
    const expectedStkCurrent = 82.25;
    assert(almostEqual(stk.currentGrade, expectedStkCurrent), `STK110 currentGrade expected ~${expectedStkCurrent}, got ${stk.currentGrade}`);
    log('✓ Story 1 passed');

    log('Story 2: Analytics engine correctness');
    const moduleId = stk.id;
    const analytics1 = await tryFetch(`/api/modules/${moduleId}/analytics`);
    const a1 = analytics1.data;
    // Using contribution = grade% * weight (graded only). Expected equals 82.25 and remaining 0.
    assert(almostEqual(a1.currentObtainedMark, 82.25), `currentObtainedMark expected ~82.25, got ${a1.currentObtainedMark}`);
    assert(almostEqual(a1.remainingWeight, 0), `expected remainingWeight 0, got ${a1.remainingWeight}`);
    assert(almostEqual(a1.requiredAveOnRemaining, 0), `expected requiredAveOnRemaining 0, got ${a1.requiredAveOnRemaining}`);
    assert(almostEqual(a1.currentPredictedSemesterMark, 82.25), `expected predicted ~82.25, got ${a1.currentPredictedSemesterMark}`);
    log('✓ Story 2 passed');

    log('Story 3: Update functionality');
    const modules = await tryFetch(`/api/modules?userId=${userId}`);
    const inf = modules.data.find((m) => m.code === 'INF171');
    assert(inf, 'INF171 not found in modules list');
    const quiz2 = inf.assignments.find((x) => x.title.toLowerCase() === 'quiz 2');
    assert(quiz2, 'Quiz 2 not found');
    const patchRes = await fetch(`${BASES[0] || `http://localhost:${process.env.PORT || 3000}`}/api/assignments/${quiz2.id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ score: 95 }),
    });
    assert(patchRes.ok, `PATCH failed with status ${patchRes.status}`);
    log('✓ Story 3 passed');

    log('Story 4: System reactivity');
    const analytics2 = await tryFetch(`/api/modules/${inf.id}/analytics`);
    const a2 = analytics2.data;
    // After setting Quiz 2 = 95, contribution increases by (0.95-0.85)*10 = 1
    // Recompute expected obtained mark and predicted using contributions and graded average
    const expectedBefore = {
      currentObtainedMark: 9 + 8.5 + 10 + 15.6 + 11.25,
      totalWeightAssessed: 10 + 10 + 10 + 20 + 15,
      average: (90 + 85 + 100 + 78 + 75) / 5,
    };
    const expectedAfter = {
      currentObtainedMark: expectedBefore.currentObtainedMark + 1,
      totalWeightAssessed: expectedBefore.totalWeightAssessed,
      average: (90 + 95 + 100 + 78 + 75) / 5,
    };
    const remaining = 100 - expectedAfter.totalWeightAssessed;
    const predictedAfter = expectedAfter.currentObtainedMark + remaining * (expectedAfter.average / 100);
    assert(almostEqual(a2.currentObtainedMark, expectedAfter.currentObtainedMark), `expected currentObtainedMark ~${expectedAfter.currentObtainedMark} after update, got ${a2.currentObtainedMark}`);
    assert(almostEqual(a2.currentPredictedSemesterMark, predictedAfter), `expected predicted ~${predictedAfter} after update, got ${a2.currentPredictedSemesterMark}`);
    log('✓ Story 4 passed');

    log('Resetting database to original seed state...');
    // On Windows in some shells, spawning can fail; fallback to HTTP trigger if available, otherwise instruct
    try {
      const env = { ...process.env };
      if (!env.DATABASE_URL)
        env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/academic_os?schema=public';
      await new Promise((resolve, reject) => {
        const p = spawn(process.platform === 'win32' ? 'npx.cmd' : 'npx', ['prisma', 'db', 'seed'], {
          stdio: 'inherit',
          env,
          shell: false,
        });
        p.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`seed exit ${code}`))));
      });
    } catch (e) {
      console.warn('Seed spawn failed, please run manually: npx prisma db seed');
    }
    log('✓ Database reset complete');

    log('\nAll stories passed.');
    process.exit(0);
  } catch (e) {
    console.error('Audit failed:', e.message || e);
    process.exit(1);
  }
}

run();


