// AcademicOS Flow Composition
import { 
  computeWeightedGPA, 
  detectAtRiskModules, 
  getUpcomingDeadlines, 
  computeAnalyticsSummary,
  type ModuleForAnalytics,
  type AssignmentForDeadlines
} from '@/academic-os/selectors/analytics';

describe('Academic OS Analytics Selectors', () => {
  
  describe('computeWeightedGPA', () => {
    const modules: ModuleForAnalytics[] = [
      { id: '1', code: 'CS101', title: 'Intro CS', creditHours: 3, currentGrade: 85 },
      { id: '2', code: 'MATH201', title: 'Calculus', creditHours: 4, currentGrade: 90 },
      { id: '3', code: 'PHYS101', title: 'Physics', creditHours: 3, currentAverageMark: 75 }, // No currentGrade
      { id: '4', code: 'ENG101', title: 'English', creditHours: 2, currentGrade: null }, // No grade yet
    ];

    it('should calculate weighted GPA using credit hours as weights', () => {
      const result = computeWeightedGPA(modules);
      
      // Expected: (85*3 + 90*4 + 75*3) / (3+4+3) = (255 + 360 + 225) / 10 = 84
      expect(result).toBe(84);
    });

    it('should prefer currentGrade over currentAverageMark when available', () => {
      const modulesWithBoth: ModuleForAnalytics[] = [
        { id: '1', code: 'CS101', title: 'Test', creditHours: 2, currentGrade: 80, currentAverageMark: 70 },
      ];
      
      const result = computeWeightedGPA(modulesWithBoth);
      expect(result).toBe(80); // Should use currentGrade (80), not currentAverageMark (70)
    });

    it('should handle empty modules array', () => {
      const result = computeWeightedGPA([]);
      expect(result).toBe(0);
    });

    it('should handle modules with no grades', () => {
      const modulesWithoutGrades: ModuleForAnalytics[] = [
        { id: '1', code: 'CS101', title: 'Test', creditHours: 3, currentGrade: null, currentAverageMark: null },
      ];
      
      const result = computeWeightedGPA(modulesWithoutGrades);
      expect(result).toBe(0);
    });

    it('should exclude modules with invalid grades', () => {
      const modulesWithInvalid: ModuleForAnalytics[] = [
        { id: '1', code: 'CS101', title: 'Valid', creditHours: 3, currentGrade: 85 },
        { id: '2', code: 'CS102', title: 'Invalid', creditHours: 3, currentGrade: -5 }, // Negative grade
      ];
      
      const result = computeWeightedGPA(modulesWithInvalid);
      expect(result).toBe(85); // Only valid module counted
    });
  });

  describe('detectAtRiskModules', () => {
    const modules: ModuleForAnalytics[] = [
      { id: '1', code: 'CS101', title: 'Passing', creditHours: 3, currentAverageMark: 75 },
      { id: '2', code: 'MATH201', title: 'At Risk', creditHours: 4, currentAverageMark: 45 },
      { id: '3', code: 'PHYS101', title: 'Failing', creditHours: 3, currentAverageMark: 30 },
      { id: '4', code: 'ENG101', title: 'No Grade', creditHours: 2, currentAverageMark: null },
    ];

    it('should detect modules below default threshold (50%)', () => {
      const result = detectAtRiskModules(modules);
      
      expect(result).toHaveLength(2);
      expect(result.map(m => m.code)).toEqual(['MATH201', 'PHYS101']);
    });

    it('should use custom threshold', () => {
      const result = detectAtRiskModules(modules, 70);
      
      expect(result).toHaveLength(2); // MATH201 (45) and PHYS101 (30), CS101 (75) passes
      expect(result.map(m => m.code)).toEqual(['MATH201', 'PHYS101']);
    });

    it('should exclude modules without currentAverageMark', () => {
      const result = detectAtRiskModules(modules);
      
      expect(result.find(m => m.code === 'ENG101')).toBeUndefined();
    });

    it('should handle empty modules array', () => {
      const result = detectAtRiskModules([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('getUpcomingDeadlines', () => {
    const now = new Date('2025-08-10T12:00:00Z');
    const assignments: AssignmentForDeadlines[] = [
      {
        id: '1',
        title: 'Assignment Due Soon',
        dueDate: '2025-08-12T23:59:59Z', // 2 days from now
        score: null,
        module: { id: 'm1', code: 'CS101', title: 'Computer Science' }
      },
      {
        id: '2',
        title: 'Overdue Assignment',
        dueDate: '2025-08-08T23:59:59Z', // 2 days ago
        score: null,
        module: { id: 'm2', code: 'MATH201', title: 'Mathematics' }
      },
      {
        id: '3',
        title: 'Completed Assignment',
        dueDate: '2025-08-11T23:59:59Z', // 1 day from now
        score: 85, // Completed
        module: { id: 'm1', code: 'CS101', title: 'Computer Science' }
      },
      {
        id: '4',
        title: 'No Due Date',
        dueDate: null,
        score: null,
        module: { id: 'm3', code: 'ENG101', title: 'English' }
      },
      {
        id: '5',
        title: 'Far Future',
        dueDate: '2025-08-20T23:59:59Z', // 10 days from now
        score: null,
        module: { id: 'm1', code: 'CS101', title: 'Computer Science' }
      }
    ];

    it('should return incomplete assignments sorted by due date', () => {
      const result = getUpcomingDeadlines(assignments, now);
      
      expect(result).toHaveLength(3); // Excludes completed and null due date
      expect(result.map(d => d.id)).toEqual(['2', '1', '5']); // Sorted by due date ascending
    });

    it('should correctly identify overdue assignments', () => {
      const result = getUpcomingDeadlines(assignments, now);
      
      const overdueItem = result.find(d => d.id === '2');
      expect(overdueItem?.isOverdue).toBe(true);
      expect(overdueItem?.daysUntilDue).toBe(-1); // Fixed: Math.ceil makes this -1, not -2
    });

    it('should correctly calculate days until due', () => {
      const result = getUpcomingDeadlines(assignments, now);
      
      const upcomingItem = result.find(d => d.id === '1');
      expect(upcomingItem?.isOverdue).toBe(false);
      expect(upcomingItem?.daysUntilDue).toBe(3); // Ceiling of days difference
    });

    it('should exclude completed assignments', () => {
      const result = getUpcomingDeadlines(assignments, now);
      
      expect(result.find(d => d.id === '3')).toBeUndefined(); // Has score
    });

    it('should exclude assignments with null due dates', () => {
      const result = getUpcomingDeadlines(assignments, now);
      
      expect(result.find(d => d.id === '4')).toBeUndefined();
    });

    it('should handle string date input for now parameter', () => {
      const result = getUpcomingDeadlines(assignments, '2025-08-10T12:00:00Z');
      
      expect(result).toHaveLength(3);
    });

    it('should use current date when now parameter not provided', () => {
      // This test just verifies the function doesn't crash with default parameter
      const result = getUpcomingDeadlines(assignments.slice(0, 1)); // Just one item
      
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('computeAnalyticsSummary', () => {
    const modules: ModuleForAnalytics[] = [
      { id: '1', code: 'CS101', title: 'Computer Science', creditHours: 3, currentGrade: 85, currentAverageMark: 85 },
      { id: '2', code: 'MATH201', title: 'Mathematics', creditHours: 4, currentGrade: 45, currentAverageMark: 45 },
    ];

    const assignments: AssignmentForDeadlines[] = [
      {
        id: '1',
        title: 'Upcoming Assignment',
        dueDate: '2025-08-12T23:59:59Z',
        score: null,
        module: { id: 'm1', code: 'CS101', title: 'Computer Science' }
      },
      {
        id: '2',
        title: 'Overdue Assignment',
        dueDate: '2025-08-08T23:59:59Z',
        score: null,
        module: { id: 'm2', code: 'MATH201', title: 'Mathematics' }
      }
    ];

    const now = new Date('2025-08-10T12:00:00Z');

    it('should compute comprehensive analytics summary', () => {
      const result = computeAnalyticsSummary(modules, assignments, now);
      
      // Calculate expected: (85*3 + 45*4) / (3+4) = (255 + 180) / 7 = 435 / 7 = 62.14... rounded to 62.1
      expect(result.weightedGPA).toBe(62.1);
      expect(result.atRiskCount).toBe(1);
      expect(result.atRiskModules[0].code).toBe('MATH201');
      expect(result.upcomingDeadlineCount).toBe(2);
      expect(result.overdueCount).toBe(1);
      expect(result.overdueDeadlines[0].id).toBe('2');
    });

    it('should limit upcoming deadlines to top 10', () => {
      // Create 15 assignments
      const manyAssignments = Array.from({ length: 15 }, (_, i) => ({
        id: `${i + 1}`,
        title: `Assignment ${i + 1}`,
        dueDate: `2025-08-${12 + i}T23:59:59Z`, // All future dates
        score: null,
        module: { id: 'm1', code: 'CS101', title: 'Computer Science' }
      }));

      const result = computeAnalyticsSummary(modules, manyAssignments, now);
      
      expect(result.upcomingDeadlineCount).toBe(15);
      expect(result.upcomingDeadlines).toHaveLength(10); // Limited to 10
    });
  });

});
