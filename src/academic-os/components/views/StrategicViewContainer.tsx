'use client';
// AcademicOS Flow Composition
import React, { useEffect, useState } from 'react';
import { useAcademicOS } from '../../context/AcademicOSContext';
import { useUserStore } from '@/lib/user-store';
import { computeAnalyticsSummary } from '../../selectors/analytics';
import type { ModuleForAnalytics, AssignmentForDeadlines, DeadlineItem } from '../../selectors/analytics';

/**
 * Strategic Analytics View - high-level KPIs and performance metrics.
 * Provides strategic overview across all modules.
 */
export function StrategicViewContainer() {
  const { selectModule } = useAcademicOS();
  const currentUser = useUserStore((s) => s.currentUser);
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
    if (!currentUser?.id) return;

    async function fetchStrategicData() {
      try {
        // Fetch from existing dashboard API
        const dashResponse = await fetch(`/api/dashboard?userId=${currentUser!.id}`);
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
  }, [currentUser]);

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
    <div className="container mx-auto py-6" data-testid="academicos-strategic-root">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-900">Strategic Analytics</h2>
        <p className="text-slate-600 mt-1">High-level performance metrics and insights</p>
      </div>

      {/* KPI Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card">
          <div className="card-body">
            <div className="text-sm text-slate-600">Weighted GPA</div>
            <div className="text-2xl font-semibold text-slate-900" data-testid="academicos-kpi-gpa">
              {analytics.weightedGPA}%
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {analytics.weightedGPA >= 70 ? '✓ On track' : '⚠ Needs attention'}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="text-sm text-slate-600">At-Risk Modules</div>
            <div className="text-2xl font-semibold text-slate-900" data-testid="academicos-kpi-atrisk">
              {analytics.atRiskCount}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {analytics.atRiskCount === 0 ? 'All modules healthy' : 'Modules below 50%'}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="text-sm text-slate-600">Upcoming Deadlines</div>
            <div className="text-2xl font-semibold text-slate-900" data-testid="academicos-kpi-deadlines">
              {analytics.upcomingDeadlineCount}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {analytics.overdueCount > 0 ? `${analytics.overdueCount} overdue` : 'All up to date'}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="text-sm text-slate-600">Performance Trend</div>
            <div className="text-2xl font-semibold text-slate-900">
              {analytics.weightedGPA >= 75 ? '📈' : analytics.weightedGPA >= 60 ? '📊' : '📉'}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {analytics.weightedGPA >= 75 ? 'Excellent' : analytics.weightedGPA >= 60 ? 'Good' : 'Improving'}
            </div>
          </div>
        </div>
      </section>

      {/* At-Risk Modules */}
      {analytics.atRiskModules.length > 0 && (
        <section className="mb-8">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Modules Requiring Attention</h3>
          <div className="grid gap-4">
            {analytics.atRiskModules.map((module) => (
              <div key={module.id} className="card border-l-4 border-l-danger-500">
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-slate-900">
                        {module.code} — {module.title}
                      </h4>
                      <div className="text-sm text-slate-600">
                        Current average: {module.currentAverageMark?.toFixed(1)}%
                      </div>
                    </div>
                    <button
                      onClick={() => selectModule(module.id, 'strategic')}
                      className="btn btn-primary btn-sm"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Upcoming Deadlines */}
      <section>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Upcoming Deadlines</h3>
        <div className="card">
          <div className="card-body p-0">
            {analytics.upcomingDeadlines.length === 0 ? (
              <div className="p-4 text-center text-slate-500">
                No upcoming deadlines
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {analytics.upcomingDeadlines.map((deadline) => (
                  <div key={deadline.id} className="p-4 hover:bg-slate-50" data-testid="academicos-deadline-item">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-slate-900">{deadline.title}</div>
                        <div className="text-sm text-slate-600">
                          {deadline.moduleCode} • Due {new Date(deadline.dueDate).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {deadline.isOverdue && (
                          <span className="badge badge-danger">Overdue</span>
                        )}
                        {deadline.daysUntilDue <= 3 && !deadline.isOverdue && (
                          <span className="badge badge-warning">Due Soon</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
