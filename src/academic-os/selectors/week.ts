// AcademicOS Flow Composition
import { startOfWeek, addDays, endOfDay } from 'date-fns';

/**
 * Derives a normalized week range for Academic OS week view.
 * Uses Monday as week start (consistent with existing week-view API).
 */
export function deriveWeekRange(weekStart: Date | string) {
  const baseDate = typeof weekStart === 'string' ? new Date(weekStart) : weekStart;
  const start = startOfWeek(baseDate, { weekStartsOn: 1 }); // Monday = 1
  
  // Get the Sunday of this week (6 days after Monday start)
  const sunday = addDays(start, 6);
  const end = endOfDay(sunday); // End of Sunday (23:59:59.999)
  
  return {
    start: start.toISOString(),
    end: end.toISOString(),
    startDate: start,
    endDate: end,
  };
}

/**
 * Filters assignments to those due within the specified week range.
 */
export function getAssignmentsForWeek<T extends { dueDate: string | Date | null }>(
  assignments: T[],
  weekStart: Date | string
): T[] {
  const { startDate, endDate } = deriveWeekRange(weekStart);
  
  return assignments.filter((assignment) => {
    if (!assignment.dueDate) return false;
    const dueDate = new Date(assignment.dueDate);
    // Use <= for end date to include items due exactly at end of week
    return dueDate >= startDate && dueDate <= endDate;
  });
}

/**
 * Filters tasks to those due within the specified week range.
 */
export function getTasksForWeek<T extends { dueDate: string | Date | null }>(
  tasks: T[],
  weekStart: Date | string
): T[] {
  const { startDate, endDate } = deriveWeekRange(weekStart);
  
  return tasks.filter((task) => {
    if (!task.dueDate) return false;
    const dueDate = new Date(task.dueDate);
    // Use <= for end date to include items due exactly at end of week
    return dueDate >= startDate && dueDate <= endDate;
  });
}

/**
 * Gets all items (assignments + tasks) for a week with unified interface.
 */
export function getWeeklyItems<
  A extends { dueDate: string | Date | null },
  T extends { dueDate: string | Date | null }
>(
  assignments: A[],
  tasks: T[],
  weekStart: Date | string
): {
  assignments: A[];
  tasks: T[];
  total: number;
} {
  const weekAssignments = getAssignmentsForWeek(assignments, weekStart);
  const weekTasks = getTasksForWeek(tasks, weekStart);
  
  return {
    assignments: weekAssignments,
    tasks: weekTasks,
    total: weekAssignments.length + weekTasks.length,
  };
}
