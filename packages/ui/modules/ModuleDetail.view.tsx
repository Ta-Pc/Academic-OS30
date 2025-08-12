import React from 'react';
import { ModuleDetailHeader } from './ModuleDetailHeader.view';
import { ModuleQuickActions } from './ModuleQuickActions.view';
import { PerformanceStatsGrid } from './PerformanceStatsGrid.view';
import { GradeDistributionChart } from './GradeDistributionChart.view';
import { AssignmentTimeline } from './AssignmentTimeline.view';
import { ModuleDetailError } from './ModuleDetailError.view';

export interface ModuleDetailViewProps {
  header: { 
    id?: string;
    code: string; 
    title: string; 
    credits?: number | null;
    description?: string;
    instructor?: string;
  };
  stats: { 
    currentObtained: number; 
    remainingWeight: number; 
    predictedSemesterMark: number;
    targetMark?: number | null;
  };
  performanceInsights?: {
    trend: 'improving' | 'stable' | 'declining';
    recentScores: number[];
    averageImprovement: number;
    consistencyScore: number;
  };
  gradeDistribution?: {
    excellent: number;
    good: number;
    satisfactory: number;
    poor: number;
  };
  upcomingDeadlines?: Array<{
    id: string;
    title: string;
    dueDate: string;
    weight: number;
    estimatedHours: number;
  }>;
  assignments?: any[];
  isRefreshing?: boolean;
  error?: string | null;
  onBackToWeek?: () => void;
  hasLastViewedWeek?: boolean;
  onQuickActions?: {
    onScheduleStudy?: () => void;
    onSetGoals?: () => void;
    onExportReport?: () => void;
    onOpenWhatIf?: () => void;
    onViewAssignments?: () => void;
  };
  onAssignmentEdit?: (assignmentId: string, newScore: number) => void;
  onRefresh?: () => void;
}

export function ModuleDetailView({ 
  header, 
  stats, 
  performanceInsights,
  gradeDistribution,
  upcomingDeadlines,
  assignments = [],
  isRefreshing = false,
  error,
  onBackToWeek, 
  hasLastViewedWeek,
  onQuickActions = {},
  onAssignmentEdit,
  onRefresh
}: ModuleDetailViewProps) {
  
  // Handle error state
  if (error) {
    return (
      <ModuleDetailError 
        error={error} 
        onRetry={onRefresh} 
        onGoBack={onBackToWeek} 
      />
    );
  }

  return (
    <div className="space-y-6" data-testid="module-detail-root">
      {/* 1. HEADER SECTION */}
      <ModuleDetailHeader 
        header={header}
        onBackToWeek={onBackToWeek}
        hasLastViewedWeek={hasLastViewedWeek}
        isRefreshing={isRefreshing}
        onRefresh={onRefresh}
      />

      {/* 2. MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* LEFT MAIN CONTENT (3 columns) */}
        <div className="lg:col-span-3 space-y-6">
          {/* 4a. PERFORMANCE STATS GRID (4 columns) */}
          <PerformanceStatsGrid 
            stats={stats}
            performanceInsights={performanceInsights}
            isRefreshing={isRefreshing}
          />

          {/* 4b. GRADE DISTRIBUTION (Full Width) */}
          <GradeDistributionChart 
            assignments={assignments}
            targetMark={stats.targetMark}
          />

          {/* 4c. ASSIGNMENT TIMELINE (Full Width) */}
          <AssignmentTimeline 
            assignments={assignments}
            currentDate={new Date()}
          />
        </div>

        {/* RIGHT SIDEBAR (1 column) */}
        <div className="lg:col-span-1 space-y-6">
          {/* 4d. UPCOMING DEADLINES */}
          {upcomingDeadlines && upcomingDeadlines.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-4">Upcoming Deadlines</h2>
              <div className="space-y-3">
                {upcomingDeadlines.map(deadline => (
                  <div key={deadline.id} className="card">
                    <div className="card-body p-4">
                      <h3 className="font-medium text-sm mb-2">{deadline.title}</h3>
                      <div className="text-xs text-slate-600 space-y-1">
                        <div>Due: {deadline.dueDate}</div>
                        <div>Weight: {deadline.weight}%</div>
                        <div>Est. {deadline.estimatedHours}h</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Live region for accessibility */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {isRefreshing ? 'Refreshing module data' : 'Module data updated'}
      </div>
    </div>
  );
}
