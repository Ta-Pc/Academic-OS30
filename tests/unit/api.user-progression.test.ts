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

import { GET } from '@/app/api/user/progression/route';

describe('GET /api/user/progression', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 404 when no user found', async () => {
    mockPrisma.user.findFirst.mockResolvedValue(null);

    const response = await GET();
    const data = await response.json();

    expect(data).toEqual({ error: 'No user found' });
  });

  it('should calculate progression for year 1 student', async () => {
    mockPrisma.user.findFirst.mockResolvedValue({ id: 'user-1' });
    mockPrisma.module.findMany.mockResolvedValue([
      {
        id: 'mod-1',
        code: 'STK110',
        title: 'Statistics 110',
        creditHours: 12,
        electiveGroup: null,
        isCore: true,
        assignments: [
          { score: 82, maxScore: 100, weight: 50, status: 'GRADED' },
          { score: 40, maxScore: 50, weight: 25, status: 'GRADED' }
        ]
      },
      {
        id: 'mod-2', 
        code: 'COS132',
        title: 'Programming',
        creditHours: 16,
        electiveGroup: null,
        isCore: true,
        assignments: [
          { score: 75, maxScore: 100, weight: 60, status: 'GRADED' }
        ]
      }
    ]);

    const response = await GET();
    const data = await response.json();

    expect(data.currentYear).toBe(1);
    expect(data.creditsPassedThisYear).toBe(28); // Both modules passed (82% and 75% average)
    expect(data.requiredCreditsForYear).toBe(28);
    expect(data.percentPassed).toBe(100);
    expect(data.electiveGroups).toEqual([]);
    expect(data.warnings).toEqual([]);
  });

  it('should identify at-risk modules and generate warnings', async () => {
    mockPrisma.user.findFirst.mockResolvedValue({ id: 'user-1' });
    mockPrisma.module.findMany.mockResolvedValue([
      {
        id: 'mod-1',
        code: 'STK110',
        title: 'Statistics 110',
        creditHours: 12,
        electiveGroup: null,
        isCore: true,
        assignments: [
          { score: 30, maxScore: 100, weight: 50, status: 'GRADED' },
          { score: 25, maxScore: 50, weight: 25, status: 'GRADED' }
        ]
      },
      {
        id: 'mod-2',
        code: 'COS132', 
        title: 'Programming',
        creditHours: 16,
        electiveGroup: null,
        isCore: true,
        assignments: [
          { score: null, maxScore: 100, weight: 60, status: 'PENDING', dueDate: new Date('2024-01-01') }
        ]
      }
    ]);

    const response = await GET();
    const data = await response.json();

    expect(data.currentYear).toBe(1);
    expect(data.creditsPassedThisYear).toBe(0); // No modules passed (40% average for STK110)
    expect(data.requiredCreditsForYear).toBe(28);
    expect(data.percentPassed).toBe(0);
    expect(data.warnings).toContain('1 modules are at risk: STK110');
    expect(data.warnings).toContain('1 overdue assignments require immediate attention');
  });

  it('should calculate elective group progress', async () => {
    mockPrisma.user.findFirst.mockResolvedValue({ id: 'user-1' });
    mockPrisma.module.findMany.mockResolvedValue([
      {
        id: 'mod-1',
        code: 'COS330',
        title: 'AI',
        creditHours: 18,
        electiveGroup: 'DSM',
        isCore: false,
        assignments: [
          { score: 80, maxScore: 100, weight: 100, status: 'GRADED' }
        ]
      },
      {
        id: 'mod-2',
        code: 'COS344',
        title: 'Graphics',
        creditHours: 18,
        electiveGroup: 'DSM',
        isCore: false,
        assignments: [
          { score: 60, maxScore: 100, weight: 100, status: 'GRADED' }
        ]
      }
    ]);

    const response = await GET();
    const data = await response.json();

    expect(data.electiveGroups).toHaveLength(1);
    expect(data.electiveGroups[0]).toEqual({
      id: 'DSM',
      name: 'Data Science & Machine Learning',
      requiredCredits: 36,
      completedCredits: 36 // Both modules passed
    });
  });

  it('should generate year progress warning for low completion', async () => {
    mockPrisma.user.findFirst.mockResolvedValue({ id: 'user-1' });
    mockPrisma.module.findMany.mockResolvedValue([
      {
        id: 'mod-1',
        code: 'STK110', 
        title: 'Statistics',
        creditHours: 12,
        electiveGroup: null,
        isCore: true,
        assignments: [
          { score: 30, maxScore: 100, weight: 100, status: 'GRADED' }
        ]
      },
      {
        id: 'mod-2',
        code: 'COS132',
        title: 'Programming', 
        creditHours: 16,
        electiveGroup: null,
        isCore: true,
        assignments: []
      }
    ]);

    const response = await GET();
    const data = await response.json();

    expect(data.percentPassed).toBe(0);
    expect(data.warnings).toContainEqual(expect.stringContaining('Year 1 progress is concerning'));
  });

  it('should handle modules with no assignments', async () => {
    mockPrisma.user.findFirst.mockResolvedValue({ id: 'user-1' });
    mockPrisma.module.findMany.mockResolvedValue([
      {
        id: 'mod-1',
        code: 'STK110',
        title: 'Statistics',
        creditHours: 12,
        electiveGroup: null,
        isCore: true,
        assignments: []
      }
    ]);

    const response = await GET();
    const data = await response.json();

    expect(data.currentYear).toBe(1);
    expect(data.creditsPassedThisYear).toBe(0);
    expect(data.requiredCreditsForYear).toBe(12);
    expect(data.percentPassed).toBe(0);
    expect(data.warnings).toContainEqual(expect.stringContaining('Year 1 progress is concerning'));
  });

  it('should handle error cases gracefully', async () => {
    mockPrisma.user.findFirst.mockRejectedValue(new Error('Database error'));

    const response = await GET();
    const data = await response.json();

    expect(data).toEqual({ error: 'Database error' });
  });
});
