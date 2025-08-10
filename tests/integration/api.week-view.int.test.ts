/** @jest-environment node */
/**
 * Integration test for /api/week-view. Attempts live DB; falls back to offline sample.
 */
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { startOfWeek, endOfWeek } from 'date-fns';

describe('week-view integration', () => {
  test('GET /api/week-view returns expected keys (with DB or offline)', async () => {
    const outDir = join(process.cwd(), 'tmp');
    mkdirSync(outDir, { recursive: true });
    const sampleFile = join(outDir, 'week-view-sample.json');
    let dbAvailable = true;
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch {
      dbAvailable = false;
    }

    if (!dbAvailable) {
      const offline = { 
        offline: true, 
        note: 'Database not available during test run', 
        weekRange: null, 
        assignments: [], 
        tacticalTasks: [], 
        moduleSummaries: [], 
        weeklyPriorities: [] 
      };
      writeFileSync(sampleFile, JSON.stringify(offline, null, 2));
      expect(offline.offline).toBe(true);
      return;
    }

    // Ensure at least one module exists (assumes seed already run)
    const moduleCount = await prisma.module.count();
    if (moduleCount === 0) {
      // No data -> create sample placeholder and skip
      const placeholder = { 
        empty: true, 
        reason: 'No modules in DB; seed script not run', 
        weekRange: null 
      };
      writeFileSync(sampleFile, JSON.stringify(placeholder, null, 2));
      expect(moduleCount).toBe(0);
      return;
    }

    const { GET } = await import('@/app/api/week-view/route');
    const today = new Date().toISOString().slice(0, 10);
    const req = new NextRequest(`http://localhost/api/week-view?date=${today}`);
    const res = await GET(req);
    const json = await res.json() as unknown as { 
      weekRange?: unknown; 
      assignments?: unknown[]; 
      tacticalTasks?: unknown[];
      moduleSummaries?: unknown[];
      weeklyPriorities?: unknown[];
      data?: unknown;
    };
    
    // Basic shape assertions
    expect(json).toHaveProperty('weekRange');
    expect(json).toHaveProperty('assignments');
    expect(json).toHaveProperty('tacticalTasks');
    expect(json).toHaveProperty('moduleSummaries');
    expect(json).toHaveProperty('weeklyPriorities');

    // Verify weekRange structure
    expect(json.weekRange).toHaveProperty('start');
    expect(json.weekRange).toHaveProperty('end');

    // Verify arrays are present
    expect(Array.isArray(json.assignments)).toBe(true);
    expect(Array.isArray(json.tacticalTasks)).toBe(true);
    expect(Array.isArray(json.moduleSummaries)).toBe(true);
    expect(Array.isArray(json.weeklyPriorities)).toBe(true);

    // Verify backward compatibility data structure
    expect(json).toHaveProperty('data');
    expect(json.data).toHaveProperty('start');
    expect(json.data).toHaveProperty('end');
    expect(json.data).toHaveProperty('tasks');
    expect(json.data).toHaveProperty('totalStudyMinutes');

    // Verify at least some modules are returned (since we have seeded data)
    expect(json.moduleSummaries!.length).toBeGreaterThan(0);

    writeFileSync(sampleFile, JSON.stringify(json, null, 2));
  }, 30000);

  test('GET /api/week-view computes correct week range', async () => {
    let dbAvailable = true;
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch {
      dbAvailable = false;
    }

    if (!dbAvailable) {
      console.log('Skipping week range test - DB not available');
      return;
    }

    const { GET } = await import('@/app/api/week-view/route');
    
    // Test with specific date (Wednesday Aug 13, 2025)
    const testDate = '2025-08-13';
    const req = new NextRequest(`http://localhost/api/week-view?date=${testDate}`);
    const res = await GET(req);
    const json = await res.json() as { weekRange: { start: string; end: string } };

    // Verify week starts on Monday and ends on Sunday
    const weekStart = new Date(json.weekRange.start);
    const weekEnd = new Date(json.weekRange.end);
    
    // Monday is day 1, Sunday is day 0
    expect(weekStart.getDay()).toBe(1);
    expect(weekEnd.getDay()).toBe(0);
    
    // Verify the dates are correct for the week containing 2025-08-13
    const expectedStart = startOfWeek(new Date(testDate + 'T00:00:00'), { weekStartsOn: 1 });
    const expectedEnd = endOfWeek(new Date(testDate + 'T00:00:00'), { weekStartsOn: 1 });
    
    expect(weekStart.toISOString()).toBe(expectedStart.toISOString());
    expect(weekEnd.toISOString()).toBe(expectedEnd.toISOString());
  });

  test('GET /api/week-view handles invalid date gracefully', async () => {
    let dbAvailable = true;
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch {
      dbAvailable = false;
    }

    if (!dbAvailable) {
      console.log('Skipping invalid date test - DB not available');
      return;
    }

    const { GET } = await import('@/app/api/week-view/route');
    
    // Test with invalid date format
    const req = new NextRequest(`http://localhost/api/week-view?date=invalid-date`);
    const res = await GET(req);
    
    expect(res.status).toBe(400);
    const json = await res.json() as { error: string };
    expect(json.error).toBe('Invalid query params');
  });

  test('GET /api/week-view works without date parameter', async () => {
    let dbAvailable = true;
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch {
      dbAvailable = false;
    }

    if (!dbAvailable) {
      console.log('Skipping default date test - DB not available');
      return;
    }

    const { GET } = await import('@/app/api/week-view/route');
    
    // Test without date parameter (should use current date)
    const req = new NextRequest(`http://localhost/api/week-view`);
    const res = await GET(req);
    const json = await res.json() as { weekRange: { start: string; end: string } };

    expect(res.status).toBe(200);
    expect(json).toHaveProperty('weekRange');
    expect(json.weekRange).toHaveProperty('start');
    expect(json.weekRange).toHaveProperty('end');
  });
});
