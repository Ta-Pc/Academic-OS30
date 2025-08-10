// AcademicOS Flow Composition

/**
 * Module with analytics data for GPA calculation.
 */
export interface ModuleForAnalytics {
  id: string;
  code: string;
  title: string;
  creditHours: number;
  currentGrade?: number | null; // Σ (grade% * weight)
  currentAverageMark?: number | null; // avg of graded percents
}

/**
 * Assignment for deadline tracking.
 */
export interface AssignmentForDeadlines {
  id: string;
  title: string;
  dueDate: string | Date | null;
  score: number | null;
  module: {
    id: string;
    code: string;
    title: string;
  };
}

/**
 * Computed deadline item with urgency metadata.
 */
export interface DeadlineItem {
  id: string;
  title: string;
  dueDate: Date;
  moduleCode: string;
  moduleTitle: string;
  isOverdue: boolean;
  daysUntilDue: number;
  isCompleted: boolean;
}

/**
 * Computes weighted GPA across modules using credit hours as weights.
 * Uses currentGrade (contribution-based) if available, falls back to currentAverageMark.
 */
export function computeWeightedGPA(modules: ModuleForAnalytics[]): number {
  if (!modules.length) return 0;
  
  let totalWeightedScore = 0;
  let totalCredits = 0;
  
  for (const module of modules) {
    const score = module.currentGrade ?? module.currentAverageMark;
    if (typeof score === 'number' && score >= 0) {
      totalWeightedScore += score * module.creditHours;
      totalCredits += module.creditHours;
    }
  }
  
  return totalCredits > 0 ? totalWeightedScore / totalCredits : 0;
}

/**
 * Detects modules that are at risk based on average mark threshold.
 * Default threshold: 50% (configurable).
 */
export function detectAtRiskModules(
  modules: ModuleForAnalytics[],
  threshold: number = 50
): ModuleForAnalytics[] {
  return modules.filter((module) => {
    const mark = module.currentAverageMark;
    return typeof mark === 'number' && mark < threshold;
  });
}

/**
 * Gets upcoming deadlines sorted by due date (ascending).
 * Filters out completed assignments and includes overdue items.
 */
export function getUpcomingDeadlines(
  assignments: AssignmentForDeadlines[],
  now: Date | string = new Date()
): DeadlineItem[] {
  const currentTime = new Date(now);
  
  return assignments
    .filter((assignment) => assignment.dueDate !== null)
    .map((assignment) => {
      const dueDate = new Date(assignment.dueDate!);
      const timeDiff = dueDate.getTime() - currentTime.getTime();
      const daysUntilDue = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
      
      return {
        id: assignment.id,
        title: assignment.title,
        dueDate,
        moduleCode: assignment.module.code,
        moduleTitle: assignment.module.title,
        isOverdue: daysUntilDue < 0,
        daysUntilDue,
        isCompleted: assignment.score !== null,
      };
    })
    .filter((item) => !item.isCompleted) // Filter out completed assignments
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime()); // Sort by due date ascending
}

/**
 * Computes analytics summary for Strategic view.
 */
export function computeAnalyticsSummary(
  modules: ModuleForAnalytics[],
  assignments: AssignmentForDeadlines[],
  now?: Date | string
) {
  const weightedGPA = computeWeightedGPA(modules);
  const atRiskModules = detectAtRiskModules(modules);
  const upcomingDeadlines = getUpcomingDeadlines(assignments, now);
  const overdueDeadlines = upcomingDeadlines.filter(d => d.isOverdue);
  
  return {
    weightedGPA: Math.round(weightedGPA * 10) / 10,
    atRiskCount: atRiskModules.length,
    atRiskModules,
    upcomingDeadlineCount: upcomingDeadlines.length,
    upcomingDeadlines: upcomingDeadlines.slice(0, 10), // Limit to top 10
    overdueCount: overdueDeadlines.length,
    overdueDeadlines,
  };
}
