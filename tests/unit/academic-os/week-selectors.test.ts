// AcademicOS Flow Composition
import { deriveWeekRange, getAssignmentsForWeek, getTasksForWeek, getWeeklyItems } from '@/academic-os/selectors/week';

describe('Academic OS Week Selectors', () => {
  
  describe('deriveWeekRange', () => {
    it('should derive Monday-to-Sunday week range from date string', () => {
      // Wednesday August 6, 2025
      const result = deriveWeekRange('2025-08-06');
      
      // Should start on Monday August 4, 2025
      expect(result.startDate.getDay()).toBe(1); // Monday
      expect(result.startDate.toDateString()).toBe('Mon Aug 04 2025');
      
      // Should end on Sunday August 10, 2025  
      expect(result.endDate.getDay()).toBe(0); // Sunday
      expect(result.endDate.toDateString()).toBe('Sun Aug 10 2025');
      
      expect(result.start).toBe(result.startDate.toISOString());
      expect(result.end).toBe(result.endDate.toISOString());
    });

    it('should handle Date object input', () => {
      const date = new Date('2025-08-06T15:30:00'); // Wednesday
      const result = deriveWeekRange(date);
      
      expect(result.startDate.getDay()).toBe(1); // Monday
      expect(result.endDate.getDay()).toBe(0); // Sunday
    });

    it('should be consistent with existing week-view API (Monday start)', () => {
      // This matches the existing API: startOfWeek(baseDate, { weekStartsOn: 1 })
      const result = deriveWeekRange('2025-08-10'); // Sunday
      
      // Even for Sunday input, should start on Monday of that week
      expect(result.startDate.getDay()).toBe(1);
      expect(result.startDate.toDateString()).toBe('Mon Aug 04 2025');
    });
  });

  describe('getAssignmentsForWeek', () => {
    const assignments = [
      { id: '1', title: 'Assignment 1', dueDate: '2025-08-05T10:00:00Z' }, // Tuesday
      { id: '2', title: 'Assignment 2', dueDate: '2025-08-09T23:59:59Z' }, // Saturday (clearly within week)
      { id: '3', title: 'Assignment 3', dueDate: '2025-08-11T09:00:00Z' }, // Next Monday
      { id: '4', title: 'Assignment 4', dueDate: null }, // No due date
    ];

    it('should filter assignments within the week range', () => {
      const result = getAssignmentsForWeek(assignments, '2025-08-06'); // Wednesday
      
      expect(result).toHaveLength(2);
      expect(result.map(a => a.id)).toEqual(['1', '2']);
    });

    it('should exclude assignments with null due dates', () => {
      const result = getAssignmentsForWeek(assignments, '2025-08-06');
      
      expect(result.find(a => a.id === '4')).toBeUndefined();
    });

    it('should handle assignments outside the week range', () => {
      const result = getAssignmentsForWeek(assignments, '2025-08-06');
      
      expect(result.find(a => a.id === '3')).toBeUndefined(); // Next week
    });

    it('should handle Date objects in dueDate', () => {
      const assignmentsWithDates = [
        { id: '1', title: 'Test', dueDate: new Date('2025-08-05T10:00:00Z') },
      ];
      
      const result = getAssignmentsForWeek(assignmentsWithDates, '2025-08-06');
      expect(result).toHaveLength(1);
    });
  });

  describe('getTasksForWeek', () => {
    const tasks = [
      { id: '1', title: 'Task 1', dueDate: '2025-08-04T09:00:00Z' }, // Monday
      { id: '2', title: 'Task 2', dueDate: '2025-08-12T10:00:00Z' }, // Next Tuesday
      { id: '3', title: 'Task 3', dueDate: null }, // No due date
    ];

    it('should filter tasks within the week range', () => {
      const result = getTasksForWeek(tasks, '2025-08-06'); // Wednesday
      
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('should exclude tasks with null due dates', () => {
      const result = getTasksForWeek(tasks, '2025-08-06');
      
      expect(result.find(t => t.id === '3')).toBeUndefined();
    });
  });

  describe('getWeeklyItems', () => {
    const assignments = [
      { id: 'a1', title: 'Assignment 1', dueDate: '2025-08-05T10:00:00Z' },
      { id: 'a2', title: 'Assignment 2', dueDate: '2025-08-15T10:00:00Z' }, // Next week
    ];
    
    const tasks = [
      { id: 't1', title: 'Task 1', dueDate: '2025-08-06T10:00:00Z' },
      { id: 't2', title: 'Task 2', dueDate: '2025-08-07T10:00:00Z' },
    ];

    it('should combine and filter assignments and tasks for the week', () => {
      const result = getWeeklyItems(assignments, tasks, '2025-08-06');
      
      expect(result.assignments).toHaveLength(1);
      expect(result.tasks).toHaveLength(2);
      expect(result.total).toBe(3);
      expect(result.assignments[0].id).toBe('a1');
      expect(result.tasks.map(t => t.id)).toEqual(['t1', 't2']);
    });

    it('should handle empty arrays', () => {
      const result = getWeeklyItems([], [], '2025-08-06');
      
      expect(result.assignments).toHaveLength(0);
      expect(result.tasks).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

});
