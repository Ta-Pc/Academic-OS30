// AcademicOS Flow Composition
import React, { useState, useEffect, useMemo } from 'react';
import { useAcademicOS } from '../../context/AcademicOSContext';
import { ModuleDetailContainer as ExistingModuleDetailContainer } from '@/app/modules/[moduleId]/ModuleDetail.container';

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

/**
 * Enhanced Module View Container - provides comprehensive module analytics with beautiful UI/UX.
 * Features advanced insights, predictive analytics, and actionable recommendations.
 */
export function ModuleViewContainer() {
  const { state, setView } = useAcademicOS();
  const { selectedModuleId } = state;
  const [moduleAnalytics, setModuleAnalytics] = useState<ModuleAnalytics | null>(null);
  const [loading, setLoading] = useState(false);

  // Load comprehensive module analytics
  useEffect(() => {
    if (!selectedModuleId) return;
    
    const loadAnalytics = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/modules/${selectedModuleId}/analytics`);
        if (response.ok) {
          const { data } = await response.json();
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
    const completionRate = (moduleAnalytics.assignmentsCompleted / moduleAnalytics.totalAssignments) * 100;

    // Risk assessment
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (gap > 15 || completionRate < 40) riskLevel = 'high';
    else if (gap > 5 || completionRate < 70) riskLevel = 'medium';

    // Study time calculation (hours needed per week)
    const baseStudyTime = moduleAnalytics.creditHours * 0.5; // Base study time per credit hour
    const riskMultiplier = riskLevel === 'high' ? 1.5 : riskLevel === 'medium' ? 1.25 : 1.0;
    const studyTimeNeeded = Math.ceil(baseStudyTime * riskMultiplier);

    // Strength and improvement areas
    const strengthAreas: string[] = [];
    const improvementAreas: string[] = [];

    if (currentMark >= targetMark) strengthAreas.push('Consistent Performance');
    if (completionRate >= 80) strengthAreas.push('Assignment Completion');
    if (gap <= 0) strengthAreas.push('Target Achievement');

    if (currentMark < targetMark) improvementAreas.push('Grade Performance');
    if (completionRate < 70) improvementAreas.push('Assignment Submission');
    if (remainingWeight > 50) improvementAreas.push('Workload Management');

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
    if (recommendedActions.length === 0) {
      recommendedActions.push('Maintain current study schedule');
    }

    return {
      riskLevel,
      studyTimeNeeded,
      nextDeadline: null, // Would be calculated from assignments
      strengthAreas: strengthAreas.length ? strengthAreas : ['Enrolled in Module'],
      improvementAreas: improvementAreas.length ? improvementAreas : ['No major concerns'],
      recommendedActions,
    };
  }, [moduleAnalytics]);

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
                    </div>
                    <p className="text-lg text-slate-600 mt-1">{moduleAnalytics.title}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-slate-500">
                      <span>Last updated: {new Date(moduleAnalytics.lastUpdated).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{moduleAnalytics.assignmentsCompleted}/{moduleAnalytics.totalAssignments} assignments completed</span>
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
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white border border-slate-200 rounded-lg p-4">
                        <h5 className="font-medium text-slate-900 mb-3 flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                          Strengths
                        </h5>
                        <ul className="space-y-2">
                          {insights.strengthAreas.map((strength, index) => (
                            <li key={index} className="text-sm text-slate-600 flex items-center">
                              <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              {strength}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-white border border-slate-200 rounded-lg p-4">
                        <h5 className="font-medium text-slate-900 mb-3 flex items-center">
                          <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                          Areas for Improvement
                        </h5>
                        <ul className="space-y-2">
                          {insights.improvementAreas.map((area, index) => (
                            <li key={index} className="text-sm text-slate-600 flex items-center">
                              <svg className="w-4 h-4 text-orange-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L4.348 15.5c-.77.833.192 2.5 1.732 2.5z" />
                              </svg>
                              {area}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Module View */}
              <div className="cohesive-section">
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-slate-900 mb-4">Detailed Analytics</h3>
                  <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                    <ExistingModuleDetailContainer 
                      moduleId={selectedModuleId} 
                      initial={{
                        module: { 
                          id: selectedModuleId, 
                          code: moduleAnalytics?.code || 'Loading...', 
                          title: moduleAnalytics?.title || 'Loading...', 
                          targetMark: moduleAnalytics?.targetMark || null,
                          creditHours: moduleAnalytics?.creditHours || undefined
                        },
                        assignments: [],
                        currentObtainedMark: moduleAnalytics?.currentMark || 0,
                        remainingWeight: moduleAnalytics?.remainingWeight || 100,
                        currentPredictedSemesterMark: moduleAnalytics?.predictedMark || 0,
                      }} 
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="sidebar">
              {/* AI Recommendations */}
              <div className="cohesive-section">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg mr-3">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    Smart Recommendations
                  </h3>
                  <div className="space-y-3">
                    {insights.recommendedActions.map((action, index) => (
                      <div key={index} className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg p-3 border border-purple-100">
                        <div className="flex items-start space-x-2">
                          <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2"></div>
                          <span className="text-sm text-slate-700">{action}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Study Time Recommendation */}
              <div className="cohesive-section">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                    <div className="p-2 bg-emerald-100 rounded-lg mr-3">
                      <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    Study Schedule
                  </h3>
                  <div className="bg-gradient-to-br from-emerald-50 to-green-100 rounded-lg p-4 border border-emerald-200">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-emerald-900">{insights.studyTimeNeeded}h</div>
                      <div className="text-sm text-emerald-700 mt-1">Recommended weekly study time</div>
                      <div className="text-xs text-emerald-600 mt-2">
                        Based on {moduleAnalytics.creditHours}h credit hours and current performance
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="cohesive-section">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button className="w-full btn-gradient-blue text-left justify-start">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Schedule Study Session
                    </button>
                    <button className="w-full btn-gradient-emerald text-left justify-start">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                      View All Assignments
                    </button>
                    <button className="w-full btn-gradient-purple text-left justify-start">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Get Study Tips
                    </button>
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
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
              <div className="text-lg text-slate-600">Loading comprehensive analytics...</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
