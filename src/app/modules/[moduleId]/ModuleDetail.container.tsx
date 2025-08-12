"use client";
import React, { useCallback, useState } from 'react';
import type { AssignmentForTable } from '@/components/AssignmentsTable';
import { useWeekStore } from '@/lib/week-store';
import { ModuleDetailView, ModuleDetailSkeleton } from '@ui';

interface AnalyticsData {
  module: { 
    id: string; 
    code: string; 
    title: string; 
    creditHours?: number; 
    targetMark?: number | null;
    description?: string;
    instructor?: string;
  };
  assignments: AssignmentForTable[];
  currentObtainedMark: number;
  remainingWeight: number;
  currentPredictedSemesterMark: number;
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
}

export function ModuleDetailContainer({ moduleId, initial }: { moduleId: string; initial: AnalyticsData }) {
  const [analytics, setAnalytics] = useState<AnalyticsData>(initial);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(false);
  const lastViewedWeek = useWeekStore(s => s.lastViewedWeek);

  // Enhanced refresh function with proper error handling
  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    setError(null);
    try {
      const res = await fetch(`/api/modules/${moduleId}/analytics`, { cache: 'no-store' });
      if (!res.ok) {
        throw new Error(`Failed to fetch analytics: ${res.status} ${res.statusText}`);
      }
      const j: { data: AnalyticsData } = await res.json();
      setAnalytics(j.data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to refresh analytics';
      setError(message);
      console.error('Failed to refresh analytics:', error);
    } finally {
      setIsRefreshing(false);
      setIsInitialLoad(false);
    }
  }, [moduleId]);

  // Optimistic assignment update handler
  const handleAssignmentUpdate = useCallback(async (assignmentId: string, newScore: number) => {
    // Optimistic update
    const previousAnalytics = analytics;
    setAnalytics(prev => ({
      ...prev,
      assignments: prev.assignments.map(a => 
        a.id === assignmentId ? { ...a, score: newScore } : a
      )
    }));
    
    try {
      // Refresh to get updated calculations
      await refresh();
    } catch (error) {
      // Rollback optimistic update on error
      setAnalytics(previousAnalytics);
      console.error('Failed to update assignment:', error);
    }
  }, [analytics, refresh]);

  function goBackToWeek() {
    if (typeof window === 'undefined') return;
    const url = new URL('/week-view', window.location.origin);
    if (lastViewedWeek) {
      url.searchParams.set('date', lastViewedWeek);
    }
    window.location.href = url.toString();
  }

  // Quick actions handlers
  const handleQuickActions = {
    onScheduleStudy: () => {
      // TODO: Implement schedule study functionality
      console.log('Schedule study for module:', analytics.module.code);
    },
    onSetGoals: () => {
      // TODO: Implement set goals functionality
      console.log('Set goals for module:', analytics.module.code);
    },
    onExportReport: () => {
      // TODO: Implement export report functionality
      console.log('Export report for module:', analytics.module.code);
    },
    onOpenWhatIf: () => {
      // TODO: Implement what-if analysis
      console.log('Open what-if analysis for module:', analytics.module.code);
    },
    onViewAssignments: () => {
      // TODO: Implement view all assignments
      console.log('View all assignments for module:', analytics.module.code);
    }
  };

  // Generate sample performance insights if not provided
  const enhancedAnalytics = {
    ...analytics,
    performanceInsights: analytics.performanceInsights || {
      trend: 'improving' as const,
      recentScores: [72, 76, 81, 85, 78],
      averageImprovement: 2.3,
      consistencyScore: 85
    },
    gradeDistribution: analytics.gradeDistribution || (() => {
      const gradedAssignments = analytics.assignments.filter(a => a.score !== null);
      const distribution = { excellent: 0, good: 0, satisfactory: 0, poor: 0 };
      
      gradedAssignments.forEach(assignment => {
        if (assignment.score! >= 80) distribution.excellent++;
        else if (assignment.score! >= 60) distribution.good++;
        else if (assignment.score! >= 40) distribution.satisfactory++;
        else distribution.poor++;
      });
      
      return distribution;
    })()
  };

  const a = enhancedAnalytics;
  
  // Show skeleton during initial load
  if (isInitialLoad) {
    return <ModuleDetailSkeleton />;
  }
  
  return (
    <ModuleDetailView
      header={{ 
        id: a.module.id,
        code: a.module.code, 
        title: a.module.title, 
        credits: a.module.creditHours ?? 0,
        description: a.module.description,
        instructor: a.module.instructor
      }}
      stats={{
        currentObtained: a.currentObtainedMark,
        remainingWeight: a.remainingWeight,
        predictedSemesterMark: a.currentPredictedSemesterMark,
        targetMark: a.module.targetMark,
      }}
      performanceInsights={a.performanceInsights}
      gradeDistribution={a.gradeDistribution}
      upcomingDeadlines={a.upcomingDeadlines}
      assignments={a.assignments}
      isRefreshing={isRefreshing}
      error={error}
      onBackToWeek={goBackToWeek}
      hasLastViewedWeek={!!lastViewedWeek}
      onQuickActions={handleQuickActions}
      onAssignmentEdit={handleAssignmentUpdate}
      onRefresh={refresh}
    />
  );
}


