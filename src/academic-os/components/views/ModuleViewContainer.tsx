// AcademicOS Flow Composition
import React, { useState, useEffect, useMemo } from 'react';
import { useAcademicOS } from '../../context/AcademicOSContext';
import { AssignmentsSummary } from '@ui';

interface ModuleInsights {
  riskLevel: 'low' | 'medium' | 'high';
  studyTimeNeeded: number;
  nextDeadline: string | null;
  strengthAreas: string[];
  improvementAreas: string[];
  recommendedActions: string[];
}

interface ModuleAnalytics {
  id: string;
  code: string;
  title: string;
  creditHours: number;
  currentMark: number;
  predictedMark: number;
  targetMark: number;
  remainingWeight: number;
  assignmentsCompleted: number;
  totalAssignments: number;
  lastUpdated: string;
}

type AssignmentStatus = 'PENDING' | 'SUBMITTED' | 'GRADED' | 'IN_PROGRESS' | string;

interface AssignmentLite {
  id: string;
  title?: string;
  status: AssignmentStatus;
  weight?: number; // percentage of module mark
  dueDate?: string | null; // ISO string
  obtainedMark?: number | null;
  type?: string; // Assignment type from Prisma schema
}

/**
 * Enhanced Module View Container - provides comprehensive module analytics with beautiful UI/UX.
 * Features advanced insights, predictive analytics, and actionable recommendations.
 */
export function ModuleViewContainer() {
  const { state, setView } = useAcademicOS();
  const { selectedModuleId } = state;
  const [moduleAnalytics, setModuleAnalytics] = useState<ModuleAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [assignments, setAssignments] = useState<AssignmentLite[]>([]);

  // Load comprehensive module analytics
  useEffect(() => {
    if (!selectedModuleId) return;
    
    const loadAnalytics = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/modules/${selectedModuleId}/analytics`);
        if (response.ok) {
          const { data } = await response.json();
          const normalizedAssignments: AssignmentLite[] = Array.isArray(data?.assignments)
            ? data.assignments.map((a: Record<string, unknown>) => ({
                id: String(a.id ?? crypto?.randomUUID?.() ?? Math.random()),
                title: a.title as string ?? a.name as string ?? 'Assignment',
                status: a.status as AssignmentStatus,
                weight: typeof a.weight === 'number' ? a.weight : Number(a.weight ?? 0),
                dueDate: a.dueDate as string ?? a.deadline as string ?? null,
                obtainedMark: typeof a.obtainedMark === 'number' ? a.obtainedMark : Number(a.obtainedMark ?? NaN),
                type: a.type as string ?? 'OTHER',
              }))
            : [];
          setAssignments(normalizedAssignments);
          setModuleAnalytics({
            id: data.module.id,
            code: data.module.code,
            title: data.module.title,
            creditHours: data.module.creditHours || 15,
            currentMark: data.currentObtainedMark,
            predictedMark: data.currentPredictedSemesterMark,
            targetMark: data.module.targetMark || 75,
            remainingWeight: data.remainingWeight,
            assignmentsCompleted: data.assignments.filter((a: { status: string }) => a.status === 'GRADED').length,
            totalAssignments: data.assignments.length,
            lastUpdated: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.error('Failed to load module analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [selectedModuleId]);

  // Generate intelligent insights
  const insights = useMemo((): ModuleInsights | null => {
    if (!moduleAnalytics) return null;

    const { currentMark, predictedMark, targetMark, remainingWeight } = moduleAnalytics;
    const gap = targetMark - predictedMark;
    const completionRate = moduleAnalytics.totalAssignments
      ? (moduleAnalytics.assignmentsCompleted / moduleAnalytics.totalAssignments) * 100
      : 0;

    // Identify the next upcoming deadline from non-graded assignments
    const now = new Date();
    const upcoming = assignments
      .filter((a) => a.status !== 'GRADED' && a.dueDate)
      .map((a) => ({
        ...a,
        due: new Date(a.dueDate as string),
      }))
      .filter((a) => !isNaN(a.due.getTime()) && a.due >= now)
      .sort((a, b) => a.due.getTime() - b.due.getTime());
    const nextDeadline = upcoming[0]?.due?.toISOString() ?? null;

    // Risk assessment
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (gap > 15 || completionRate < 40) riskLevel = 'high';
    else if (gap > 5 || completionRate < 70) riskLevel = 'medium';

    // Study time calculation (hours needed per week)
    const baseStudyTime = moduleAnalytics.creditHours * 0.5; // Base study time per credit hour
    const riskMultiplier = riskLevel === 'high' ? 1.6 : riskLevel === 'medium' ? 1.25 : 1.0;
    const studyTimeNeeded = Math.max(2, Math.ceil(baseStudyTime * riskMultiplier));

    // Strength and improvement areas
    const strengthAreas: string[] = [];
    const improvementAreas: string[] = [];

    if (currentMark >= targetMark) strengthAreas.push('Consistent Performance');
    if (completionRate >= 80) strengthAreas.push('Assignment Completion');
    if (gap <= 0) strengthAreas.push('Target Achievement');

    if (currentMark < targetMark) improvementAreas.push('Grade Performance');
    if (completionRate < 70) improvementAreas.push('Assignment Submission');
    if (remainingWeight > 50) improvementAreas.push('Workload Management');
    if (nextDeadline) improvementAreas.push('Deadline Readiness');

    // Recommended actions
    const recommendedActions: string[] = [];
    if (riskLevel === 'high') {
      recommendedActions.push('Schedule immediate study session');
      recommendedActions.push('Meet with instructor for guidance');
    }
    if (completionRate < 70) {
      recommendedActions.push('Focus on upcoming assignments');
    }
    if (gap > 10) {
      recommendedActions.push('Increase study time allocation');
    }
    if (nextDeadline) {
      const daysLeft = Math.ceil((new Date(nextDeadline).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      recommendedActions.push(`Prioritize work due in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`);
    }
    if (recommendedActions.length === 0) {
      recommendedActions.push('Maintain current study schedule');
    }

    return {
      riskLevel,
      studyTimeNeeded,
      nextDeadline,
      strengthAreas: strengthAreas.length ? strengthAreas : ['Enrolled in Module'],
      improvementAreas: improvementAreas.length ? improvementAreas : ['No major concerns'],
      recommendedActions,
    };
  }, [moduleAnalytics, assignments]);

  // Helpers
  const formatDate = (iso?: string | null) => {
    if (!iso) return '—';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString();
  };

  const calcCompletionRate = () => {
    if (!moduleAnalytics || moduleAnalytics.totalAssignments === 0) return 0;
    return Math.round((moduleAnalytics.assignmentsCompleted / moduleAnalytics.totalAssignments) * 100);
  };

  const downloadReport = () => {
    if (!moduleAnalytics) return;
    const payload = {
      module: moduleAnalytics,
      assignments,
      insights,
      generatedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${moduleAnalytics.code}-analytics.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // No module selected state
  if (!selectedModuleId) {
    return (
      <div className="page-container">
        <div className="container mx-auto py-12" data-testid="academicos-module-root">
          <div className="cohesive-section max-w-2xl mx-auto">
            <div className="p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Module Analytics</h2>
              <p className="text-slate-600 mb-8">Select a module to explore comprehensive insights, performance analytics, and personalized recommendations.</p>
              <button 
                onClick={() => setView('modules')}
                className="btn-gradient-blue"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                Browse Modules
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="container mx-auto py-6 space-y-6" data-testid="academicos-module-root">
        {/* Enhanced Header with Module Context */}
        {moduleAnalytics && (
          <div className="cohesive-section">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={() => setView('modules')}
                    className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
                    title="Back to modules"
                  >
                    <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                  </button>
                  <div>
                    <div className="flex items-center space-x-3">
                      <h1 className="text-3xl font-bold text-slate-900">{moduleAnalytics.code}</h1>
                      <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
                        {moduleAnalytics.creditHours}h
                      </span>
                      <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-sm font-medium">
                        {calcCompletionRate()}% complete
                      </span>
                    </div>
                    <p className="text-lg text-slate-600 mt-1">{moduleAnalytics.title}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-slate-500">
                      <span>Last updated: {new Date(moduleAnalytics.lastUpdated).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{moduleAnalytics.assignmentsCompleted}/{moduleAnalytics.totalAssignments} assignments completed</span>
                      {insights?.nextDeadline && (
                        <>
                          <span>•</span>
                          <span>Next due: {formatDate(insights.nextDeadline)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                {insights && (
                  <div className="text-right">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      insights.riskLevel === 'high' ? 'bg-red-100 text-red-700' :
                      insights.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        insights.riskLevel === 'high' ? 'bg-red-500' :
                        insights.riskLevel === 'medium' ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}></div>
                      {insights.riskLevel.charAt(0).toUpperCase() + insights.riskLevel.slice(1)} Risk
                    </div>
                    <div className="mt-2 flex items-center justify-end space-x-2">
                      <button onClick={downloadReport} className="px-3 py-1.5 rounded-lg text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors">
                        Export report
                      </button>
                      <button onClick={() => location.reload()} className="px-3 py-1.5 rounded-lg text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors">
                        Refresh
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-4 border border-blue-200">
                  <div className="text-sm font-medium text-blue-700">Current Grade</div>
                  <div className="text-2xl font-bold text-blue-900 mt-1">{Math.round(moduleAnalytics.currentMark)}%</div>
                  <div className="text-xs text-blue-600 mt-1">From completed work</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-xl p-4 border border-purple-200">
                  <div className="text-sm font-medium text-purple-700">Predicted Final</div>
                  <div className="text-2xl font-bold text-purple-900 mt-1">{Math.round(moduleAnalytics.predictedMark)}%</div>
                  <div className="text-xs text-purple-600 mt-1">Projected outcome</div>
                </div>
                <div className="bg-gradient-to-br from-emerald-50 to-green-100 rounded-xl p-4 border border-emerald-200">
                  <div className="text-sm font-medium text-emerald-700">Target Goal</div>
                  <div className="text-2xl font-bold text-emerald-900 mt-1">{moduleAnalytics.targetMark}%</div>
                  <div className="text-xs text-emerald-600 mt-1">Your objective</div>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-orange-100 rounded-xl p-4 border border-amber-200">
                  <div className="text-sm font-medium text-amber-700">Remaining Work</div>
                  <div className="text-2xl font-bold text-amber-900 mt-1">{Math.round(moduleAnalytics.remainingWeight)}%</div>
                  <div className="text-xs text-amber-600 mt-1">Still to complete</div>
                </div>
              </div>
              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                  <span>Completion progress</span>
                  <span>{calcCompletionRate()}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-500" style={{ width: `${calcCompletionRate()}%` }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI-Powered Insights */}
        {insights && moduleAnalytics && (
          <div className="main-grid">
            <div className="main-content">
              {/* Performance Analysis */}
              <div className="cohesive-section">
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-slate-900 mb-4">Performance Analysis</h3>
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900">Grade Gap Analysis</h4>
                          <p className="text-sm text-slate-600 mt-1">
                            {moduleAnalytics.predictedMark >= moduleAnalytics.targetMark 
                              ? `You're on track to exceed your target by ${Math.round(moduleAnalytics.predictedMark - moduleAnalytics.targetMark)}%.`
                              : `You need to improve by ${Math.round(moduleAnalytics.targetMark - moduleAnalytics.predictedMark)}% to reach your target.`
                            }
                          </p>
                          <div className="mt-3">
                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-2 bg-emerald-500" style={{ width: `${Math.min(100, Math.max(0, moduleAnalytics.predictedMark))}%` }} />
                            </div>
                            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                              <span>0%</span>
                              <span>Predicted: {Math.round(moduleAnalytics.predictedMark)}%</span>
                              <span>100%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white border border-slate-200 rounded-lg p-4">
                        <h5 className="font-medium text-slate-900 mb-3 flex items-center">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                          Assignment Types
                        </h5>
                        <div className="space-y-2">
                          {(() => {
                            const typeBreakdown = assignments.reduce((acc: Record<string, number>, assignment) => {
                              const type = assignment.type || 'OTHER';
                              acc[type] = (acc[type] || 0) + 1;
                              return acc;
                            }, {});
                            
                            const typeColors: Record<string, string> = {
                              'QUIZ': 'bg-blue-100 text-blue-700',
                              'TEST': 'bg-red-100 text-red-700',
                              'PRACTICAL': 'bg-green-100 text-green-700',
                              'GROUP': 'bg-purple-100 text-purple-700',
                              'CLASS_TEST': 'bg-orange-100 text-orange-700',
                              'OTHER': 'bg-slate-100 text-slate-700'
                            };

                            return Object.entries(typeBreakdown).map(([type, count]) => (
                              <div key={type} className="flex items-center justify-between">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${typeColors[type] || typeColors.OTHER}`}>
                                  {type.replace('_', ' ')}
                                </span>
                                <span className="text-sm font-semibold">{count}</span>
                              </div>
                            ));
                          })()}
                        </div>
                      </div>

                      <div className="bg-white border border-slate-200 rounded-lg p-4">
                        <h5 className="font-medium text-slate-900 mb-3 flex items-center">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                          Assignment Status
                        </h5>
                        <div className="space-y-2">
                          {(() => {
                            const statusBreakdown = assignments.reduce((acc: Record<string, number>, assignment) => {
                              const status = assignment.status || 'PENDING';
                              acc[status] = (acc[status] || 0) + 1;
                              return acc;
                            }, {});
                            
                            const statusColors: Record<string, string> = {
                              'GRADED': 'bg-green-100 text-green-700',
                              'PENDING': 'bg-yellow-100 text-yellow-700',
                              'DUE': 'bg-orange-100 text-orange-700',
                              'LATE': 'bg-red-100 text-red-700'
                            };

                            return Object.entries(statusBreakdown).map(([status, count]) => (
                              <div key={status} className="flex items-center justify-between">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[status] || statusColors.PENDING}`}>
                                  {status}
                                </span>
                                <span className="text-sm font-semibold">{count}</span>
                              </div>
                            ));
                          })()}
                        </div>
                      </div>
                    </div>

                    {/* Assignment Weight Distribution */}
                    <div className="bg-white border border-slate-200 rounded-lg p-4">
                      <h5 className="font-medium text-slate-900 mb-3 flex items-center">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></div>
                        Weight Distribution
                      </h5>
                      <div className="space-y-3">
                        {(() => {
                          const totalWeight = assignments.reduce((sum, a) => sum + (a.weight || 0), 0);
                          const gradedWeight = assignments
                            .filter(a => a.status === 'GRADED')
                            .reduce((sum, a) => sum + (a.weight || 0), 0);
                          const pendingWeight = totalWeight - gradedWeight;

                          return (
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Completed Work</span>
                                <span className="font-semibold">{gradedWeight.toFixed(1)}%</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Remaining Work</span>
                                <span className="font-semibold">{pendingWeight.toFixed(1)}%</span>
                              </div>
                              <div className="w-full bg-slate-100 rounded-full h-2">
                                <div 
                                  className="bg-gradient-to-r from-emerald-500 to-blue-500 h-2 rounded-full"
                                  style={{ width: `${(gradedWeight / totalWeight) * 100}%` }}
                                />
                              </div>
                              <div className="text-xs text-slate-500 text-center">
                                {((gradedWeight / totalWeight) * 100).toFixed(1)}% of total module weight completed
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                    {/* Top remaining assessments by weight */}
                    <div className="bg-white border border-slate-200 rounded-lg p-4">
                      <h5 className="font-medium text-slate-900 mb-3">High-impact upcoming assessments</h5>
                      <ul className="divide-y divide-slate-100">
                        {assignments
                          .filter((a) => a.status !== 'GRADED')
                          .sort((a, b) => (b.weight ?? 0) - (a.weight ?? 0))
                          .slice(0, 5)
                          .map((a) => (
                            <li key={a.id} className="py-2 flex items-center justify-between">
                              <div>
                                <div className="text-sm font-medium text-slate-800">{a.title ?? 'Assessment'}</div>
                                <div className="text-xs text-slate-500">Due {formatDate(a.dueDate)} • Status: {a.status}</div>
                              </div>
                              <div className="text-sm font-semibold text-slate-700">{a.weight ?? 0}%</div>
                            </li>
                          ))}
                        {assignments.filter((a) => a.status !== 'GRADED').length === 0 && (
                          <li className="py-4 text-sm text-slate-500">No upcoming assessments</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Assignments Summary */}
              <div className="cohesive-section">
                <div className="p-8">
                  <AssignmentsSummary
                    assignments={assignments.map(a => ({
                      id: a.id,
                      title: a.title || 'Assignment',
                      dueDate: a.dueDate || null,
                      score: a.obtainedMark || null,
                      weight: a.weight || 0,
                      status: a.status || 'PENDING'
                    }))}
                    onAssignmentEdit={(id, score) => {
                      // Handle assignment edit if needed
                      console.log('Edit assignment:', id, score);
                    }}
                    moduleTargetMark={moduleAnalytics?.targetMark}
                    isRefreshing={loading}
                  />
                </div>
              </div>

            </div>

            <div className="sidebar">
              {/* Performance Over Time Chart */}
              <div className="cohesive-section">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg mr-3">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    Performance Trend
                  </h3>
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                    {(() => {
                      const gradedAssignments = assignments
                        .filter(a => a.status === 'GRADED' && a.obtainedMark != null && a.dueDate)
                        .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
                        .slice(-5); // Last 5 graded assignments

                      if (gradedAssignments.length === 0) {
                        return (
                          <div className="text-center py-6">
                            <div className="text-2xl mb-2">📈</div>
                            <div className="text-sm text-slate-600">No graded assignments yet</div>
                            <div className="text-xs text-slate-500 mt-1">Trend will appear as assignments are graded</div>
                          </div>
                        );
                      }

                      const avgScore = gradedAssignments.reduce((sum, a) => sum + (a.obtainedMark || 0), 0) / gradedAssignments.length;
                      
                      return (
                        <div className="space-y-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-900">{avgScore.toFixed(1)}%</div>
                            <div className="text-sm text-blue-700">Average Score</div>
                          </div>
                          
                          {/* Simple trend visualization */}
                          <div className="space-y-2">
                            {gradedAssignments.map((assignment) => (
                              <div key={assignment.id} className="flex items-center space-x-2">
                                <div className="w-16 text-xs text-slate-600 truncate">
                                  {assignment.title?.substring(0, 8)}...
                                </div>
                                <div className="flex-1 bg-slate-100 rounded-full h-2">
                                  <div 
                                    className={`h-2 rounded-full ${
                                      (assignment.obtainedMark || 0) >= (moduleAnalytics?.targetMark || 75) 
                                        ? 'bg-green-500' 
                                        : (assignment.obtainedMark || 0) >= 60 
                                          ? 'bg-yellow-500' 
                                          : 'bg-red-500'
                                    }`}
                                    style={{ width: `${Math.min(100, (assignment.obtainedMark || 0))}%` }}
                                  />
                                </div>
                                <div className="w-10 text-xs font-medium text-slate-700">
                                  {assignment.obtainedMark}%
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          <div className="text-xs text-blue-600 text-center">
                            {gradedAssignments.length > 1 && (
                              <span>
                                {gradedAssignments[gradedAssignments.length - 1].obtainedMark! > gradedAssignments[gradedAssignments.length - 2].obtainedMark! 
                                  ? '📈 Improving' 
                                  : gradedAssignments[gradedAssignments.length - 1].obtainedMark! < gradedAssignments[gradedAssignments.length - 2].obtainedMark!
                                    ? '📉 Declining'
                                    : '➡️ Stable'
                                }
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Real Upcoming Deadlines */}
              {(() => {
                const now = new Date();
                const upcomingAssignments = assignments
                  .filter(a => a.status !== 'GRADED' && a.dueDate)
                  .map(a => ({
                    ...a,
                    dueDateTime: new Date(a.dueDate!)
                  }))
                  .filter(a => a.dueDateTime >= now)
                  .sort((a, b) => a.dueDateTime.getTime() - b.dueDateTime.getTime())
                  .slice(0, 3);

                return upcomingAssignments.length > 0 ? (
                  <div className="cohesive-section">
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                        <div className="p-2 bg-amber-100 rounded-lg mr-3">
                          <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        Upcoming Deadlines
                      </h3>
                      <div className="space-y-3">
                        {upcomingAssignments.map(assignment => {
                          const daysUntilDue = Math.ceil((assignment.dueDateTime.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                          const isUrgent = daysUntilDue <= 3;
                          
                          return (
                            <div 
                              key={assignment.id} 
                              className={`p-3 rounded-lg border ${
                                isUrgent 
                                  ? 'bg-red-50 border-red-200' 
                                  : daysUntilDue <= 7 
                                    ? 'bg-orange-50 border-orange-200'
                                    : 'bg-slate-50 border-slate-200'
                              }`}
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="font-medium text-sm line-clamp-1">{assignment.title}</div>
                                  <div className="text-xs text-slate-600 mt-1">
                                    Weight: {assignment.weight}% • {assignment.status}
                                  </div>
                                </div>
                                <div className={`text-right ${isUrgent ? 'text-red-700' : daysUntilDue <= 7 ? 'text-orange-700' : 'text-slate-700'}`}>
                                  <div className="text-sm font-bold">{daysUntilDue} days</div>
                                  <div className="text-xs">{assignment.dueDateTime.toLocaleDateString()}</div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : null;
              })()}

              {/* Grade Distribution Over Time */}
              <div className="cohesive-section">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                    <div className="p-2 bg-emerald-100 rounded-lg mr-3">
                      <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                      </svg>
                    </div>
                    Grade Distribution Over Time
                  </h3>
                  <div className="bg-gradient-to-br from-emerald-50 to-green-100 rounded-lg p-4 border border-emerald-200">
                    {(() => {
                      const gradedAssignments = assignments
                        .filter(a => a.status === 'GRADED' && a.obtainedMark != null && a.dueDate)
                        .map(a => ({
                          ...a,
                          dueDateTime: new Date(a.dueDate!)
                        }))
                        .sort((a, b) => a.dueDateTime.getTime() - b.dueDateTime.getTime());

                      if (gradedAssignments.length === 0) {
                        return (
                          <div className="text-center py-6">
                            <div className="text-2xl mb-2">�</div>
                            <div className="text-sm text-slate-600">No grades to display yet</div>
                            <div className="text-xs text-slate-500 mt-1">Chart will appear as assignments are graded</div>
                          </div>
                        );
                      }

                      // Removed unused maxScore
                      const avgScore = gradedAssignments.reduce((sum, a) => sum + (a.obtainedMark || 0), 0) / gradedAssignments.length;
                      const targetMark = moduleAnalytics?.targetMark || 75;
                      
                      return (
                        <div className="space-y-4">
                          {/* Chart Header */}
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="text-lg font-bold text-emerald-900">{avgScore.toFixed(1)}%</div>
                              <div className="text-sm text-emerald-700">Average Score</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium text-slate-700">{gradedAssignments.length} assignments</div>
                              <div className="text-xs text-slate-500">Target: {targetMark}%</div>
                            </div>
                          </div>
                          
                          {/* Time-based Chart */}
                          <div className="relative bg-white rounded-lg p-4 border border-emerald-200">
                            {/* Y-axis labels */}
                            <div className="absolute left-0 top-4 bottom-4 flex flex-col justify-between text-xs text-slate-500 w-8">
                              <span>100%</span>
                              <span>75%</span>
                              <span>50%</span>
                              <span>25%</span>
                              <span>0%</span>
                            </div>
                            
                            {/* Chart area */}
                            <div className="ml-10 relative h-32">
                              {/* Grid lines */}
                              <div className="absolute inset-0 flex flex-col justify-between">
                                {[100, 75, 50, 25, 0].map(value => (
                                  <div key={value} className={`border-t ${value === targetMark ? 'border-emerald-400 border-dashed' : 'border-slate-100'}`}></div>
                                ))}
                              </div>
                              
                              {/* Target line */}
                              <div 
                                className="absolute w-full border-t-2 border-emerald-400 border-dashed opacity-60"
                                style={{ bottom: `${(targetMark / 100) * 100}%` }}
                              >
                                <span className="absolute right-0 -top-2 text-xs text-emerald-600 bg-white px-1">Target</span>
                              </div>
                              
                              {/* Data points and line */}
                              <div className="absolute inset-0">
                                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                  {/* Connect the dots with a line */}
                                  {gradedAssignments.length > 1 && (
                                    <polyline
                                      fill="none"
                                      stroke="#10b981"
                                      strokeWidth="2"
                                      points={gradedAssignments.map((assignment, index) => {
                                        const x = (index / (gradedAssignments.length - 1)) * 100;
                                        const y = 100 - ((assignment.obtainedMark! / 100) * 100);
                                        return `${x},${y}`;
                                      }).join(' ')}
                                    />
                                  )}
                                </svg>
                                
                                {/* Data points */}
                                {gradedAssignments.map((assignment, index) => {
                                  const x = (index / Math.max(1, gradedAssignments.length - 1)) * 100;
                                  const y = ((assignment.obtainedMark! / 100) * 100);
                                  const isAboveTarget = assignment.obtainedMark! >= targetMark;
                                  
                                  return (
                                    <div
                                      key={assignment.id}
                                      className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                                      style={{ 
                                        left: `${x}%`, 
                                        bottom: `${y}%` 
                                      }}
                                    >
                                      <div 
                                        className={`w-3 h-3 rounded-full border-2 border-white shadow-sm ${
                                          isAboveTarget ? 'bg-green-500' : assignment.obtainedMark! >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                        }`}
                                      />
                                      
                                      {/* Tooltip */}
                                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                        <div className="bg-slate-800 text-white text-xs rounded-lg px-2 py-1 whitespace-nowrap">
                                          <div className="font-medium">{assignment.title}</div>
                                          <div>{assignment.obtainedMark}% • {assignment.dueDateTime.toLocaleDateString()}</div>
                                          <div className="text-slate-300">Weight: {assignment.weight}%</div>
                                        </div>
                                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                            
                            {/* X-axis timeline */}
                            <div className="ml-10 mt-2 flex justify-between text-xs text-slate-500">
                              {gradedAssignments.length <= 4 ? (
                                gradedAssignments.map(assignment => (
                                  <div key={assignment.id} className="text-center">
                                    <div>{assignment.dueDateTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                                  </div>
                                ))
                              ) : (
                                <>
                                  <div>{gradedAssignments[0].dueDateTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                                  <div className="text-center">...</div>
                                  <div>{gradedAssignments[gradedAssignments.length - 1].dueDateTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                                </>
                              )}
                            </div>
                          </div>
                          
                          {/* Chart Legend */}
                          <div className="flex items-center justify-center space-x-4 text-xs">
                            <div className="flex items-center space-x-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span>Above target</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                              <span>Passing</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                              <span>Below 60%</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <div className="w-4 h-0.5 bg-emerald-400 border-dashed"></div>
                              <span>Target ({targetMark}%)</span>
                            </div>
                          </div>

                          {/* Quick Stats */}
                          <div className="grid grid-cols-3 gap-2 text-center text-xs">
                            <div className="bg-white rounded-lg p-2 border border-emerald-200">
                              <div className="font-semibold text-emerald-900">
                                {Math.max(...gradedAssignments.map(a => a.obtainedMark!))}%
                              </div>
                              <div className="text-slate-600">Highest</div>
                            </div>
                            <div className="bg-white rounded-lg p-2 border border-emerald-200">
                              <div className="font-semibold text-emerald-900">
                                {Math.min(...gradedAssignments.map(a => a.obtainedMark!))}%
                              </div>
                              <div className="text-slate-600">Lowest</div>
                            </div>
                            <div className="bg-white rounded-lg p-2 border border-emerald-200">
                              <div className="font-semibold text-emerald-900">
                                {gradedAssignments.filter(a => a.obtainedMark! >= targetMark).length}
                              </div>
                              <div className="text-slate-600">Above target</div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="cohesive-section">
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4" aria-label="Loading"></div>
              <div className="text-lg text-slate-600">Loading comprehensive analytics...</div>
              {/* Subtle skeleton for metrics */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                {[1,2,3,4].map((i) => (
                  <div key={i} className="rounded-xl p-4 border border-slate-200 bg-white">
                    <div className="h-3 w-24 bg-slate-200 rounded mb-3 animate-pulse"></div>
                    <div className="h-6 w-16 bg-slate-200 rounded mb-2 animate-pulse"></div>
                    <div className="h-2 w-20 bg-slate-100 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
