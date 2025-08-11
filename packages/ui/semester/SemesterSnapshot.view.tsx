import React from 'react';
import { TrendingUp, TrendingDown, Target, CheckCircle, Clock } from 'lucide-react';

export type SemesterSnapshotViewProps = {
  overallWeightedAverage: number;
  tasks: { completed: number; pending: number };
};

export function SemesterSnapshotView({ overallWeightedAverage, tasks }: SemesterSnapshotViewProps) {
  const total = tasks.completed + tasks.pending;
  const completionRate = total > 0 ? (tasks.completed / total) * 100 : 0;
  
  const getPerformanceLevel = (score: number) => {
    if (score >= 80) return { 
      label: 'Excellent', 
      bgClass: 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200',
      textClass: 'text-emerald-900',
      iconBgClass: 'bg-emerald-200',
      iconClass: 'text-emerald-700',
      descClass: 'text-emerald-700',
      barBgClass: 'bg-emerald-200',
      barClass: 'bg-emerald-600',
      progressClass: 'text-emerald-600',
      icon: TrendingUp 
    };
    if (score >= 70) return { 
      label: 'Good', 
      bgClass: 'bg-gradient-to-br from-green-50 to-green-100 border-green-200',
      textClass: 'text-green-900',
      iconBgClass: 'bg-green-200',
      iconClass: 'text-green-700',
      descClass: 'text-green-700',
      barBgClass: 'bg-green-200',
      barClass: 'bg-green-600',
      progressClass: 'text-green-600',
      icon: TrendingUp 
    };
    if (score >= 60) return { 
      label: 'Fair', 
      bgClass: 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200',
      textClass: 'text-yellow-900',
      iconBgClass: 'bg-yellow-200',
      iconClass: 'text-yellow-700',
      descClass: 'text-yellow-700',
      barBgClass: 'bg-yellow-200',
      barClass: 'bg-yellow-600',
      progressClass: 'text-yellow-600',
      icon: Target 
    };
    if (score >= 50) return { 
      label: 'Needs Work', 
      bgClass: 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200',
      textClass: 'text-orange-900',
      iconBgClass: 'bg-orange-200',
      iconClass: 'text-orange-700',
      descClass: 'text-orange-700',
      barBgClass: 'bg-orange-200',
      barClass: 'bg-orange-600',
      progressClass: 'text-orange-600',
      icon: TrendingDown 
    };
    return { 
      label: 'Critical', 
      bgClass: 'bg-gradient-to-br from-red-50 to-red-100 border-red-200',
      textClass: 'text-red-900',
      iconBgClass: 'bg-red-200',
      iconClass: 'text-red-700',
      descClass: 'text-red-700',
      barBgClass: 'bg-red-200',
      barClass: 'bg-red-600',
      progressClass: 'text-red-600',
      icon: TrendingDown 
    };
  };

  const performance = getPerformanceLevel(overallWeightedAverage);
  const PerformanceIcon = performance.icon;

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <div className={`${performance.bgClass} rounded-2xl shadow-sm border overflow-hidden`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`p-2 ${performance.iconBgClass} rounded-lg`}>
                <PerformanceIcon className={`h-6 w-6 ${performance.iconClass}`} />
              </div>
              <div>
                <h3 className={`text-lg font-bold ${performance.textClass}`}>Performance</h3>
                <p className={`text-sm ${performance.descClass}`}>{performance.label}</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex items-baseline space-x-2">
                <span className={`text-4xl font-bold ${performance.textClass}`}>
                  {Math.round(overallWeightedAverage * 10) / 10}
                </span>
                <span className={`text-xl font-medium ${performance.descClass}`}>%</span>
              </div>
              <p className={`text-sm ${performance.progressClass} font-medium`}>Overall Weighted Average</p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className={`${performance.descClass} font-medium`}>Progress to Excellence</span>
                <span className={`${performance.progressClass}`}>{Math.round(overallWeightedAverage)}%</span>
              </div>
              <div className={`w-full ${performance.barBgClass} rounded-full h-2.5`}>
                <div 
                  className={`${performance.barClass} h-2.5 rounded-full transition-all duration-500`}
                  style={{ width: `${Math.min(overallWeightedAverage, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Task Completion Stats */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-slate-200 rounded-lg">
              <span className="text-2xl">✅</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Task Progress</h3>
              <p className="text-sm text-slate-600">Weekly completion rate</p>
            </div>
          </div>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-3xl font-bold text-slate-900">{Math.round(completionRate)}%</span>
            <span className="text-sm text-slate-500">Complete</span>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">Completed</span>
              </div>
              <span className="text-sm font-bold text-green-700">{tasks.completed}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-700">Pending</span>
              </div>
              <span className="text-sm font-bold text-orange-700">{tasks.pending}</span>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Quick Action Card */}
      <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-2xl shadow-sm border border-primary-200 overflow-hidden">
        <div className="p-6 text-center">
          <div className="text-3xl mb-3">🚀</div>
          <h3 className="text-lg font-bold text-primary-900 mb-2">Keep it up!</h3>
          <p className="text-sm text-primary-700 mb-4">
            {tasks.pending > 0 
              ? `${tasks.pending} more tasks to complete this week`
              : "All tasks completed! You're ahead of the game."
            }
          </p>
          {tasks.pending > 0 && (
            <div className="text-xs text-primary-600 font-medium">
              Focus on high-priority items first
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


