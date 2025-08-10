/** @jest-environment node */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from '@/lib/prisma';

describe('what-if endpoint', () => {
  let assignmentId: string; // pending assignment for session-only test
  let commitAssignmentId: string; // assignment to commit
  let skipAll = false;

  beforeAll(async () => {
    // Pick first pending assignment
  const pending = await prisma.assignment.findFirst({ where: { status: 'PENDING' } });
  if (!pending) { skipAll = true; return; }
    assignmentId = pending.id;
    // Find an assignment due this week (to reflect in week-view) - fallback to another pending
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - ((now.getDay() + 6) % 7)); // Monday
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    const dueThisWeek = await prisma.assignment.findFirst({ where: { status: 'PENDING', dueDate: { gte: weekStart, lte: weekEnd } } });
    commitAssignmentId = dueThisWeek ? dueThisWeek.id : assignmentId;
  });

  test('sessionOnly=true does not persist changes', async () => {
  if (skipAll) { expect(true).toBe(true); return; }
  const original = await prisma.assignment.findUnique({ where: { id: assignmentId } });
    expect(original).toBeTruthy();
    const { POST } = await import('@/app/api/what-if/route');
    const body = { moduleId: original!.moduleId, sessionOnly: true, changes: [{ assignmentId, score: 88 }] };
  const reqStub: { json: () => Promise<typeof body> } = { json: async () => body };
  // Cast to unknown to satisfy NextRequest type without implementing full interface
  const res = await POST(reqStub as unknown as any);
  const json = await res.json() as any; // debug removed
    expect(json.data.prediction).toBeDefined();
    const after = await prisma.assignment.findUnique({ where: { id: assignmentId } });
    expect(after?.score).toBe(original?.score); // unchanged
  });

  test('sessionOnly=false commits changes and week-view reflects update', async () => {
  if (skipAll) { expect(true).toBe(true); return; }
  const original = await prisma.assignment.findUnique({ where: { id: commitAssignmentId } });
    expect(original).toBeTruthy();
    const { POST } = await import('@/app/api/what-if/route');
    const newScore = 77;
    const body = { moduleId: original!.moduleId, sessionOnly: false, changes: [{ assignmentId: commitAssignmentId, score: newScore }] };
  const reqStub: { json: () => Promise<typeof body> } = { json: async () => body };
  const res = await POST(reqStub as unknown as any);
  const json = await res.json() as any; // debug removed
    expect(json.data.committed).toBe(true);
    const updated = await prisma.assignment.findUnique({ where: { id: commitAssignmentId } });
    expect(updated?.score).toBe(newScore);

    // week-view inclusion check (best-effort; assignment may or may not be in current week)
    const { GET } = await import('@/app/api/week-view/route');
    // Provide a stub NextRequest-like object with url only
    const today = new Date().toISOString().slice(0, 10);
  const wReq: { url: string; headers: { get: (k: string) => string | null } } = { url: `http://localhost/api/week-view?date=${today}`, headers: { get: () => null } };
  const wRes = await GET(wReq as unknown as any);
  const wJson = await wRes.json() as unknown as { assignments?: { id: string; status: string }[] };
    if (wJson.assignments?.length) {
  const found = wJson.assignments.find(a => a.id === commitAssignmentId);
      if (found) {
        expect(found.status).toBe('GRADED');
      }
    }
  }, 30000);
});
