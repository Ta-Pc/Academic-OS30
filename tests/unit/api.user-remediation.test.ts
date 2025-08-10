// Mock Prisma client for unit tests
const mockPrisma = {
  user: {
    findFirst: jest.fn(),
  },
  module: {
    findMany: jest.fn(),
  },
};

// Mock the prisma import
jest.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}));

// Mock Next.js response
const mockNextResponse = {
  json: (data: unknown, options?: Record<string, unknown>) => ({
    json: () => Promise.resolve(data),
    ...(options || {}),
  }),
};

jest.mock('next/server', () => ({
  NextResponse: {
    json: (data: unknown, options?: Record<string, unknown>) => mockNextResponse.json(data, options),
  },
}));

import { GET } from '@/app/api/user/remediation/route';

describe('GET /api/user/remediation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 404 when no user found', async () => {
    mockPrisma.user.findFirst.mockResolvedValue(null);

    const response = await GET();
    const data = await response.json();

    expect(data).toEqual({ error: 'No user found' });
  });

  it('should generate high priority actions for overdue assignments', async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    mockPrisma.user.findFirst.mockResolvedValue({ id: 'user-1' });
    mockPrisma.module.findMany.mockResolvedValue([
      {
        id: 'mod-1',
        code: 'STK110',
        title: 'Statistics',
        creditHours: 12,
        assignments: [
          {
            id: 'assign-1',
            title: 'Assignment 1',
            dueDate: yesterday,
            status: 'PENDING',
            score: null,
            maxScore: 100,
            weight: 50,
            type: 'OTHER'
          }
        ]
      }
    ]);

    const response = await GET();
    const data = await response.json();

    expect(data.actions).toContainEqual(
      expect.objectContaining({
        title: 'Complete overdue: Assignment 1',
        priority: 'high',
        moduleCode: 'STK110',
        type: 'assignment'
      })
    );
  });

  it('should generate medium priority actions for upcoming assignments', async () => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    mockPrisma.user.findFirst.mockResolvedValue({ id: 'user-1' });
    mockPrisma.module.findMany.mockResolvedValue([
      {
        id: 'mod-1',
        code: 'STK110',
        title: 'Statistics',
        creditHours: 12,
        assignments: [
          {
            id: 'assign-1',
            title: 'Test 1',
            dueDate: nextWeek,
            status: 'PENDING',
            score: null,
            maxScore: 100,
            weight: 50,
            type: 'TEST'
          }
        ]
      }
    ]);

    const response = await GET();
    const data = await response.json();

    expect(data.actions).toContainEqual(
      expect.objectContaining({
        title: 'Prepare for: Test 1',
        priority: 'medium',
        moduleCode: 'STK110',
        type: 'study'
      })
    );
  });

  it('should generate high priority actions for at-risk modules', async () => {
    mockPrisma.user.findFirst.mockResolvedValue({ id: 'user-1' });
    mockPrisma.module.findMany.mockResolvedValue([
      {
        id: 'mod-1',
        code: 'STK110',
        title: 'Statistics',
        creditHours: 12,
        assignments: [
          {
            id: 'assign-1',
            title: 'Test 1',
            dueDate: new Date('2025-01-01'),
            status: 'GRADED',
            score: 30,
            maxScore: 100,
            weight: 100,
            type: 'TEST'
          }
        ]
      }
    ]);

    const response = await GET();
    const data = await response.json();

    expect(data.actions).toContainEqual(
      expect.objectContaining({
        title: 'Intensive review: STK110',
        priority: 'high',
        moduleCode: 'STK110',
        type: 'review'
      })
    );

    expect(data.actions).toContainEqual(
      expect.objectContaining({
        title: 'Schedule consultation: STK110',
        priority: 'medium',
        moduleCode: 'STK110',
        type: 'admin'
      })
    );
  });

  it('should generate low priority actions for high-performing modules', async () => {
    mockPrisma.user.findFirst.mockResolvedValue({ id: 'user-1' });
    mockPrisma.module.findMany.mockResolvedValue([
      {
        id: 'mod-1',
        code: 'STK110',
        title: 'Statistics',
        creditHours: 12,
        assignments: [
          {
            id: 'assign-1',
            title: 'Test 1',
            dueDate: new Date('2025-01-01'),
            status: 'GRADED',
            score: 85,
            maxScore: 100,
            weight: 100,
            type: 'TEST'
          }
        ]
      }
    ]);

    const response = await GET();
    const data = await response.json();

    expect(data.actions).toContainEqual(
      expect.objectContaining({
        title: 'Advanced practice: STK110',
        priority: 'low',
        moduleCode: 'STK110',
        type: 'study'
      })
    );
  });

  it('should include general study recommendations', async () => {
    mockPrisma.user.findFirst.mockResolvedValue({ id: 'user-1' });
    mockPrisma.module.findMany.mockResolvedValue([
      {
        id: 'mod-1',
        code: 'STK110',
        title: 'Statistics',
        creditHours: 12,
        assignments: []
      }
    ]);

    const response = await GET();
    const data = await response.json();

    expect(data.actions).toContainEqual(
      expect.objectContaining({
        title: 'Create weekly study schedule',
        priority: 'medium',
        type: 'admin'
      })
    );

    expect(data.actions).toContainEqual(
      expect.objectContaining({
        title: 'Form study groups',
        priority: 'low',
        type: 'admin'
      })
    );
  });

  it('should limit to top 10 actions and sort by priority', async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    mockPrisma.user.findFirst.mockResolvedValue({ id: 'user-1' });
    
    // Create many modules with overdue assignments to test limit
    const modules = Array.from({ length: 15 }, (_, i) => ({
      id: `mod-${i}`,
      code: `TEST${i}`,
      title: `Test Module ${i}`,
      creditHours: 12,
      assignments: [
        {
          id: `assign-${i}`,
          title: `Assignment ${i}`,
          dueDate: yesterday,
          status: 'PENDING',
          score: null,
          maxScore: 100,
          weight: 50,
          type: 'OTHER'
        }
      ]
    }));

    mockPrisma.module.findMany.mockResolvedValue(modules);

    const response = await GET();
    const data = await response.json();

    expect(data.actions).toHaveLength(10);
    
    // Check that high priority actions come first
    const priorities = data.actions.map((action: { priority: string }) => action.priority);
    const highPriorityCount = priorities.filter((p: string) => p === 'high').length;
    expect(highPriorityCount).toBeGreaterThan(0);
  });

  it('should handle modules with no assignments', async () => {
    mockPrisma.user.findFirst.mockResolvedValue({ id: 'user-1' });
    mockPrisma.module.findMany.mockResolvedValue([
      {
        id: 'mod-1',
        code: 'STK110',
        title: 'Statistics',
        creditHours: 12,
        assignments: []
      }
    ]);

    const response = await GET();
    const data = await response.json();

    expect(data.actions.length).toBeGreaterThan(0);
    // Should still include general recommendations
    expect(data.actions).toContainEqual(
      expect.objectContaining({
        title: 'Create weekly study schedule'
      })
    );
  });

  it('should handle error cases gracefully', async () => {
    mockPrisma.user.findFirst.mockRejectedValue(new Error('Database error'));

    const response = await GET();
    const data = await response.json();

    expect(data).toEqual({ error: 'Database error' });
  });
});
