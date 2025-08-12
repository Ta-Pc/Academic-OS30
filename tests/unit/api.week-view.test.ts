import { startOfWeek, endOfWeek } from 'date-fns';
import { getPriorityScore } from '@/utils/priorityScore';
import { z } from 'zod';

// Mock Prisma client for unit tests
const mockPrisma = {
  user: {
    findFirst: jest.fn(),
  },
  assignment: {
    findMany: jest.fn(),
  },
  tacticalTask: {
    findMany: jest.fn(),
  },
  studyLog: {
    findMany: jest.fn(),
  },
  module: {
    findMany: jest.fn(),
  },
};

// Mock the prisma import
jest.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}));

// Mock Next.js request/response
const mockNextRequest = (url: string) => ({
  url,
  headers: {
    get: () => null,
  },
});

const mockNextResponse = {
  json: (data: unknown, options?: Record<string, unknown>) => ({
    json: () => Promise.resolve(data),
    ...(options || {}),
  }),
};

jest.mock('next/server', () => ({
  NextRequest: jest.fn().mockImplementation((url: string) => mockNextRequest(url)),
  NextResponse: {
    json: (data: unknown, options?: Record<string, unknown>) => mockNextResponse.json(data, options),
  },
}));

describe('week-view unit tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('priority scoring heuristic ordering', () => {
    function score(days: number, weight: number) {
      let s = weight;
      if (days <= 1) s += 20; else if (days <= 3) s += 10; else if (days <= 7) s += 5;
      s += Math.max(0, 15 - days);
      return s;
    }
    const items = [
      { id: 'a', days: 10, weight: 10 },
      { id: 'b', days: 2, weight: 5 },
      { id: 'c', days: 0, weight: 2 },
    ].map(i => ({ ...i, score: score(i.days, i.weight) }));
    const sorted = [...items].sort((x, y) => y.score - x.score);
    expect(sorted[0].id).toBe('c');
    expect(sorted[1].id).toBe('b');
  });

  test('week boundaries Monday-Sunday', () => {
    const base = new Date('2025-08-13');
    const s = startOfWeek(base, { weekStartsOn: 1 });
    const e = endOfWeek(base, { weekStartsOn: 1 });
    expect(s.getDay()).toBe(1);
    expect(e.getDay()).toBe(0);
  });

  test('getPriorityScore util integration', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const result = getPriorityScore({
      weightPercent: 25,
      moduleCredits: 16,
      dueDate: tomorrow,
      targetMark: 75,
      currentPredicted: 65,
    });

    expect(result).toHaveProperty('score');
    expect(result).toHaveProperty('band');
    expect(result).toHaveProperty('components');
    expect(result.score).toBeGreaterThan(0);
    expect(['HIGH', 'MEDIUM', 'LOW']).toContain(result.band);
  });

  test('query validation', () => {
    const querySchema = z.object({
      date: z.string().regex(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/).optional(),
    });

    // Valid date
    expect(querySchema.safeParse({ date: '2025-08-18' }).success).toBe(true);
    
    // Invalid date format
    expect(querySchema.safeParse({ date: '2025-8-18' }).success).toBe(false);
    expect(querySchema.safeParse({ date: 'invalid' }).success).toBe(false);
    
    // Optional date
    expect(querySchema.safeParse({}).success).toBe(true);
    expect(querySchema.safeParse({ date: undefined }).success).toBe(true);
  });

  test('API response shape validation', async () => {
    // Mock database responses
    mockPrisma.user.findFirst.mockResolvedValue({ id: 'seed-user-1' });
    mockPrisma.assignment.findMany.mockResolvedValue([
      {
        id: 'assign1',
        title: 'Test Assignment',
        dueDate: new Date('2025-08-18'),
        weight: 25,
        status: 'PENDING',
        module: { id: 'mod1', code: 'TEST101', title: 'Test Module', isCore: true, creditHours: 12 }
      }
    ]);
    mockPrisma.tacticalTask.findMany.mockResolvedValue([
      {
        id: 'task1',
        title: 'Test Task',
        dueDate: new Date('2025-08-19'),
        status: 'PENDING',
        type: 'STUDY',
        module: { id: 'mod1', code: 'TEST101', title: 'Test Module', isCore: true, creditHours: 12 }
      }
    ]);
    mockPrisma.studyLog.findMany.mockResolvedValue([
      { durationMin: 60 },
      { durationMin: 45 }
    ]);
    mockPrisma.module.findMany.mockResolvedValue([
      {
        id: 'mod1',
        code: 'TEST101',
        title: 'Test Module',
        isCore: true,
        electiveGroup: null,
        creditHours: 12,
        startDate: new Date('2025-08-01'),
        endDate: new Date('2025-12-01'),
        assignments: []
      }
    ]);

    const { GET } = await import('@/app/api/week-view/route');
    const { NextRequest } = await import('next/server');
    const req = new NextRequest('http://localhost/api/week-view?date=2025-08-18');
    const res = await GET(req);
    const data = await res.json();

    // Verify response structure
    expect(data).toHaveProperty('weekRange');
    expect(data.weekRange).toHaveProperty('start');
    expect(data.weekRange).toHaveProperty('end');
    
    expect(data).toHaveProperty('assignments');
    expect(Array.isArray(data.assignments)).toBe(true);
    
    expect(data).toHaveProperty('tacticalTasks');
    expect(Array.isArray(data.tacticalTasks)).toBe(true);
    
    expect(data).toHaveProperty('moduleSummaries');
    expect(Array.isArray(data.moduleSummaries)).toBe(true);
    
    expect(data).toHaveProperty('weeklyPriorities');
    expect(Array.isArray(data.weeklyPriorities)).toBe(true);

    // Verify backward compatibility
    expect(data).toHaveProperty('data');
    expect(data.data).toHaveProperty('start');
    expect(data.data).toHaveProperty('end');
    expect(data.data).toHaveProperty('tasks');
    expect(data.data).toHaveProperty('totalStudyMinutes');
    expect(data.data.totalStudyMinutes).toBe(105);
  });
});
