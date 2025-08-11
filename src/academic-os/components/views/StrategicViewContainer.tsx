'use client';
// AcademicOS Flow Composition
import React, { useEffect, useState } from 'react';
import { useAcademicOS } from '../../context/AcademicOSContext';
// user store pruned
import { computeAnalyticsSummary } from '../../selectors/analytics';
import type { ModuleForAnalytics, AssignmentForDeadlines, DeadlineItem } from '../../selectors/analytics';
import { formatDate } from '@/utils/date-format';

/**
 * Strategic Analytics View - high-level KPIs and performance metrics.
 * Provides strategic overview across all modules.
 */
export function StrategicViewContainer() {
  const { selectModule } = useAcademicOS();
  // user context removed
  const [analytics, setAnalytics] = useState<{
    weightedGPA: number;
    atRiskCount: number;
    atRiskModules: ModuleForAnalytics[];
    upcomingDeadlineCount: number;
    upcomingDeadlines: DeadlineItem[];
    overdueCount: number;
    overdueDeadlines: DeadlineItem[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch dashboard data and compute analytics
  useEffect(() => {
  // user gating removed

    async function fetchStrategicData() {
      try {
        // Fetch from existing dashboard API
  const dashResponse = await fetch(`/api/dashboard`);
        if (!dashResponse.ok) throw new Error('Failed to fetch dashboard data');
        
        const dashData = await dashResponse.json();
        
        // Convert dashboard data to our analytics format
        const modules: ModuleForAnalytics[] = dashData.data.map((m: {
          id: string;
          code: string;
          title: string;
          creditHours: number;
          currentGrade?: number;
          currentAverageMark?: number;
        }) => ({
          id: m.id,
          code: m.code,
          title: m.title,
          creditHours: m.creditHours,
          currentGrade: m.currentGrade,
          currentAverageMark: m.currentAverageMark,
        }));

        const assignments: AssignmentForDeadlines[] = [
          ...dashData.widgets.urgent.lateAssignments,
          ...dashData.widgets.urgent.upcomingAssignments,
        ].map((a: {
          id: string;
          title: string;
          dueDate: string;
          module: { id: string; code: string; title: string };
        }) => ({
          id: a.id,
          title: a.title,
          dueDate: a.dueDate,
          score: null, // Assume incomplete for urgent assignments
          module: a.module,
        }));

        const summary = computeAnalyticsSummary(modules, assignments);
        setAnalytics(summary);
      } catch (error) {
        console.error('Failed to fetch strategic data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStrategicData();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto py-12" data-testid="academicos-strategic-root">
        <div className="text-center">
          <div className="text-lg text-slate-600">Loading strategic overview...</div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="container mx-auto py-12" data-testid="academicos-strategic-root">
        <div className="text-center">
          <div className="text-lg text-slate-600">Unable to load strategic data</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 px-4 sm:px-6 py-6 border-b border-purple-200">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-purple-200 rounded-lg">
                <span className="text-2xl">📊</span>
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-purple-900">Strategic Analytics</h2>
                <p className="text-sm sm:text-base text-purple-700">High-level performance metrics and insights</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-5 gap-6 lg:gap-8 items-start">
          <div className="lg:col-span-2 xl:col-span-3 space-y-6 lg:space-y-8">
            {/* KPI Cards Section */}
            <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
              <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 px-4 sm:px-6 py-4 border-b border-emerald-200">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-emerald-200 rounded-lg">
                    <span className="text-xl sm:text-2xl">⚡</span>
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-emerald-900">Performance Overview</h3>
                    <p className="text-xs sm:text-sm text-emerald-700">Key performance indicators</p>
                  </div>
                </div>
              </div>
              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Weighted GPA Card */}
                  <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-xl p-5 hover:shadow-lg hover:border-emerald-300 transition-all duration-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-xs font-semibold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">
                        WEIGHTED GPA
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-slate-900" data-testid="academicos-kpi-gpa">
                          {analytics.weightedGPA}%
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <span className={`w-2 h-2 rounded-full ${analytics.weightedGPA >= 70 ? 'bg-green-400' : 'bg-orange-400'}`}></span>
                        {analytics.weightedGPA >= 70 ? 'On track' : 'Needs attention'}
                      </span>
                      <span className="text-emerald-600 font-medium">
                        Academic progress →
                      </span>
                    </div>
                  </div>

                  {/* At-Risk Modules Card */}
                  <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-xl p-5 hover:shadow-lg hover:border-red-300 transition-all duration-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-xs font-semibold text-red-600 bg-red-100 px-2 py-1 rounded-full">
                        AT-RISK MODULES
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-slate-900" data-testid="academicos-kpi-atrisk">
                          {analytics.atRiskCount}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <span className={`w-2 h-2 rounded-full ${analytics.atRiskCount === 0 ? 'bg-green-400' : 'bg-red-400'}`}></span>
                        {analytics.atRiskCount === 0 ? 'All healthy' : 'Modules below 50%'}
                      </span>
                      <span className="text-red-600 font-medium">
                        View details →
                      </span>
                    </div>
                  </div>

                  {/* Upcoming Deadlines Card */}
                  <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-xl p-5 hover:shadow-lg hover:border-blue-300 transition-all duration-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                        DEADLINES
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-slate-900" data-testid="academicos-kpi-deadlines">
                          {analytics.upcomingDeadlineCount}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <span className={`w-2 h-2 rounded-full ${analytics.overdueCount > 0 ? 'bg-red-400' : 'bg-green-400'}`}></span>
                        {analytics.overdueCount > 0 ? `${analytics.overdueCount} overdue` : 'All up to date'}
                      </span>
                      <span className="text-blue-600 font-medium">
                        Schedule →
                      </span>
                    </div>
                  </div>

                  {/* Performance Trend Card */}
                  <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-xl p-5 hover:shadow-lg hover:border-purple-300 transition-all duration-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-xs font-semibold text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                        TREND
                      </div>
                      <div className="text-right">
                        <div className="text-2xl">
                          {analytics.weightedGPA >= 75 ? '📈' : analytics.weightedGPA >= 60 ? '📊' : '📉'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <span className={`w-2 h-2 rounded-full ${analytics.weightedGPA >= 75 ? 'bg-green-400' : analytics.weightedGPA >= 60 ? 'bg-yellow-400' : 'bg-red-400'}`}></span>
                        {analytics.weightedGPA >= 75 ? 'Excellent' : analytics.weightedGPA >= 60 ? 'Good' : 'Improving'}
                      </span>
                      <span className="text-purple-600 font-medium">
                        Analytics →
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* At-Risk Modules Section */}
            {analytics.atRiskModules.length > 0 && (
              <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
                <div className="bg-gradient-to-r from-red-50 to-red-100 px-4 sm:px-6 py-4 border-b border-red-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-red-200 rounded-lg">
                        <span className="text-xl sm:text-2xl">⚠️</span>
                      </div>
                      <div>
                        <h3 className="text-base sm:text-lg font-bold text-red-900">Modules Requiring Attention</h3>
                        <p className="text-xs sm:text-sm text-red-700">Focus on improving these modules</p>
                      </div>
                    </div>
                    <div className="bg-red-200 text-red-800 px-3 py-1 rounded-full text-sm font-medium self-start">
                      {analytics.atRiskModules.length} modules
                    </div>
                  </div>
                </div>
                <div className="p-4 sm:p-6">
                  <div className="space-y-4">
                    {analytics.atRiskModules.map((module) => (
                      <div key={module.id} className="bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-xl p-5 hover:shadow-lg hover:border-red-300 transition-all duration-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <div className="text-xs font-semibold text-red-600 bg-red-100 px-2 py-1 rounded-full">
                                {module.code}
                              </div>
                              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                            </div>
                            <h4 className="font-semibold text-slate-900 mb-2 line-clamp-2">
                              {module.title}
                            </h4>
                            <div className="text-sm text-slate-600">
                              Current average: {module.currentAverageMark?.toFixed(1)}%
                            </div>
                          </div>
                          <button
                            onClick={() => selectModule(module.id, 'strategic')}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* All Modules Section */}
            <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-4 sm:px-6 py-4 border-b border-blue-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-200 rounded-lg">
                      <span className="text-xl sm:text-2xl">📚</span>
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-blue-900">All Modules</h3>
                      <p className="text-xs sm:text-sm text-blue-700">Your complete academic portfolio</p>
                    </div>
                  </div>
                  <div className="bg-blue-200 text-blue-800 px-3 py-1 rounded-full text-sm font-medium self-start">
                    2 active
                  </div>
                </div>
              </div>
              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-xl p-5 hover:shadow-lg hover:border-blue-300 transition-all duration-200 group">
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                        STK110
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-slate-900">82.3%</div>
                      </div>
                    </div>
                    <h4 className="text-sm font-semibold text-slate-900 mb-2 line-clamp-2 group-hover:text-blue-700 transition-colors">
                      Statistics 110
                    </h4>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                        Excellent performance
                      </span>
                      <a href="/modules/STK110" className="text-blue-600 font-medium group-hover:text-blue-700">
                        View details →
                      </a>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-xl p-5 hover:shadow-lg hover:border-blue-300 transition-all duration-200 group">
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                        STK120
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-slate-900">85.0%</div>
                      </div>
                    </div>
                    <h4 className="text-sm font-semibold text-slate-900 mb-2 line-clamp-2 group-hover:text-blue-700 transition-colors">
                      Statistics 120
                    </h4>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                        Outstanding progress
                      </span>
                      <a href="/modules/STK120" className="text-blue-600 font-medium group-hover:text-blue-700">
                        View details →
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Right Sidebar */}
          <aside className="lg:col-span-1 xl:col-span-2 space-y-6">
            {/* Quick Actions */}
            <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
              <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 px-4 sm:px-6 py-4 border-b border-indigo-200">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-indigo-200 rounded-lg">
                    <span className="text-xl">⚡</span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-indigo-900">Quick Actions</h3>
                    <p className="text-xs text-indigo-700">Strategic tools</p>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  <button className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2">
                    <span>📊</span>
                    Generate Report
                  </button>
                  <button className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2">
                    <span>🎯</span>
                    Set Goals
                  </button>
                  <button className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2">
                    <span>📈</span>
                    View Trends
                  </button>
                </div>
              </div>
            </section>

            {/* Upcoming Deadlines */}
            <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
              <div className="bg-gradient-to-r from-orange-50 to-orange-100 px-4 sm:px-6 py-4 border-b border-orange-200">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-200 rounded-lg">
                    <span className="text-xl">📅</span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-orange-900">Upcoming Deadlines</h3>
                    <p className="text-xs text-orange-700">Next 7 days</p>
                  </div>
                </div>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {analytics.upcomingDeadlines.length === 0 ? (
                  <div className="p-6 text-center">
                    <div className="text-4xl mb-2">🎉</div>
                    <div className="text-sm font-medium text-slate-700 mb-1">All caught up!</div>
                    <div className="text-xs text-slate-500">No upcoming deadlines</div>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {analytics.upcomingDeadlines.map((deadline) => (
                      <div key={deadline.id} className="p-4 hover:bg-slate-50 transition-colors duration-200" data-testid="academicos-deadline-item">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-medium text-slate-900 text-sm line-clamp-2">{deadline.title}</div>
                              <div className="text-xs text-slate-600 mt-1">
                                {deadline.moduleCode} • Due {formatDate(deadline.dueDate)}
                              </div>
                            </div>
                            <div className="flex flex-col gap-1 ml-2">
                              {deadline.isOverdue && (
                                <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">Overdue</span>
                              )}
                              {deadline.daysUntilDue <= 3 && !deadline.isOverdue && (
                                <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium">Due Soon</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
