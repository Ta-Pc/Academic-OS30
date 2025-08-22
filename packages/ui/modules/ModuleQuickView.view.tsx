import React, { useState, useEffect } from 'react';

export type ModuleQuickViewProps = {
  title: string;
  code: string;
  moduleId: string;
  stats?: { average?: number | null; creditHours?: number | null };
};

type ModuleData = {
  id: string;
  code: string;
  title: string;
  creditHours: number;
  targetMark: number;
  status: string;
  currentGrade: number;
  assignmentStats: {
    total: number;
    graded: number;
    pending: number;
    due: number;
    late: number;
    totalWeight: number;
    gradedWeight: number;
    remainingWeight: number;
  };
  upcoming: {
    assignments: Array<{
      id: string;
      title: string;
      weight: number;
      dueDate: string | null;
      status: string;
      daysUntil: number;
    }>;
    tasks: Array<any>;
  };
};

function round1(n: number) { return (Math.round(n * 10) / 10).toFixed(1); }

export function ModuleQuickView({ title, code, moduleId, stats }: ModuleQuickViewProps) {
  const [moduleData, setModuleData] = useState<ModuleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchModuleData() {
      try {
        setLoading(true);
        const response = await fetch(`/api/modules/${moduleId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch module data');
        }
        const data = await response.json();
        setModuleData(data);
      } catch (err) {
        console.error('Failed to fetch module data:', err);
        setError('Failed to load module details');
      } finally {
        setLoading(false);
      }
    }

    if (moduleId) {
      fetchModuleData();
    }
  }, [moduleId]);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-3/4"></div>
        <div className="h-3 bg-slate-200 rounded w-1/2"></div>
        <div className="space-y-2">
          <div className="h-16 bg-slate-200 rounded"></div>
          <div className="h-16 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !moduleData) {
    return (
      <div className="text-center py-8">
        <div className="text-slate-400 mb-2">⚠️</div>
        <div className="text-sm text-slate-600">{error || 'Module data not available'}</div>
        <div className="text-xs text-slate-500 mt-1">Code: {code}</div>
      </div>
    );
  }

  const target = moduleData.targetMark || 75;
  const currentObtained = moduleData.currentGrade;
  const predictedSemesterMark = moduleData.currentGrade; // No predicted, use currentGrade
  const remainingWeight = moduleData.assignmentStats.remainingWeight;
  const gap = target - currentObtained;
  const requiredAverage = remainingWeight > 0 ? (gap / remainingWeight) * 100 : 0;

  const upcomingAssignments = moduleData.upcoming.assignments ?? [];
  const completedCount = moduleData.assignmentStats.graded;
  const totalCount = moduleData.assignmentStats.total;

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
  <p className="text-sm text-slate-600">{moduleData.creditHours} credits</p>
      </div>

      {/* Current Performance */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-50 rounded-lg p-4">
          <div className="text-xs text-slate-600 uppercase tracking-wide">Current Mark</div>
          <div className="text-2xl font-bold text-slate-900">{round1(currentObtained)}%</div>
          <div className="text-xs text-slate-500 mt-1">From graded work</div>
        </div>
        <div className="bg-slate-50 rounded-lg p-4">
          <div className="text-xs text-slate-600 uppercase tracking-wide">Predicted</div>
          <div className="text-2xl font-bold text-slate-900">{round1(predictedSemesterMark)}%</div>
          <div className="text-xs text-slate-500 mt-1">Final semester mark</div>
        </div>
      </div>

      {/* Progress Insight */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
        <div className="text-sm font-medium text-slate-900 mb-2">Progress Insight</div>
        {remainingWeight <= 0 ? (
          <div className="text-sm text-slate-600">
            <span className="font-medium">Module complete!</span> Final mark: {round1(currentObtained)}%
            {currentObtained >= target ? (
              <span className="text-green-600 ml-2">✓ Target achieved</span>
            ) : (
              <span className="text-red-600 ml-2">⚠ Below target</span>
            )}
          </div>
        ) : gap > 0 ? (
          <div className="text-sm text-slate-600">
            Need <span className="font-medium text-orange-600">{round1(requiredAverage)}%</span> average 
            on remaining work to reach {target}% target
          </div>
        ) : (
          <div className="text-sm text-green-600">
            ✓ On track to exceed target of {target}%
          </div>
        )}
      </div>

      {/* Assignment Progress */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-slate-900">Assignment Progress</h4>
          <span className="text-xs text-slate-500">{completedCount}/{totalCount} completed</span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-slate-200 rounded-full h-2 mb-4">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
          ></div>
        </div>

        {/* Upcoming Assignments */}
        {upcomingAssignments.length > 0 ? (
          <div className="space-y-2">
            <div className="text-xs text-slate-600 uppercase tracking-wide">Upcoming</div>
            {upcomingAssignments.map((assignment) => (
              <div key={assignment.id} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-slate-900 truncate">{assignment.title}</div>
                  <div className="text-xs text-slate-500">
                    {assignment.dueDate && new Date(assignment.dueDate).toLocaleDateString()} • {assignment.weight}% weight
                  </div>
                </div>
                <div className="ml-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    assignment.status === 'GRADED' ? 'bg-green-100 text-green-800' :
                    assignment.status === 'SUBMITTED' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {assignment.status.toLowerCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-slate-500">
            <div className="text-sm">No upcoming assignments</div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="pt-4 border-t border-slate-200">
        <button
          onClick={() => {
            // This will be handled by the parent component via navigation
            window.location.href = `/modules/${moduleId}`;
          }}
          className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded-lg font-medium transition-colors"
          data-testid="view-full-module-details"
        >
          View Full Module Details
        </button>
      </div>
    </div>
  );
}


