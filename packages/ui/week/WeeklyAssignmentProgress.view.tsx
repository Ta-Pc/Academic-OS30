import React from 'react';
import { Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export type WeeklyAssignmentProgressProps = {
  assignments: Array<{
    id: string;
    title: string;
    status: string;
    score: number | null;
    weight: number;
    dueDate?: string;
  }>;
};

export function WeeklyAssignmentProgressView({ assignments }: WeeklyAssignmentProgressProps) {
  const totalAssignments = assignments.length;
  const completedAssignments = assignments.filter(a => a.status === 'GRADED' && a.score !== null).length;
  const pendingAssignments = assignments.filter(a => ['PENDING', 'DUE'].includes(a.status)).length;
  const lateAssignments = assignments.filter(a => a.status === 'LATE').length;
  
  const completionRate = totalAssignments > 0 ? (completedAssignments / totalAssignments) * 100 : 0;
  const totalWeight = assignments.reduce((sum, a) => sum + a.weight, 0);
  const completedWeight = assignments
    .filter(a => a.status === 'GRADED' && a.score !== null)
    .reduce((sum, a) => sum + a.weight, 0);
  const weightProgress = totalWeight > 0 ? (completedWeight / totalWeight) * 100 : 0;

  const getStatusIcon = () => {
    if (completionRate >= 80) return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' };
    if (completionRate >= 50) return { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100' };
  };

  const statusConfig = getStatusIcon();
  const StatusIcon = statusConfig.icon;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-gradient-to-r from-purple-50 to-purple-100 px-6 py-4 border-b border-purple-200">
        <div className="flex items-center space-x-3">
          <div className={`p-2 ${statusConfig.bg} rounded-lg`}>
            <StatusIcon className={`h-5 w-5 ${statusConfig.color}`} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-purple-900">Assignment Progress</h3>
            <p className="text-sm text-purple-700">Weekly completion status</p>
          </div>
        </div>
      </div>
      
      <div className="p-6 space-y-4">
        {/* Main Progress */}
        <div className="flex justify-between items-center">
          <span className="text-3xl font-bold text-slate-900">{Math.round(completionRate)}%</span>
          <span className="text-sm text-slate-500">Completed</span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-slate-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${completionRate}%` }}
          ></div>
        </div>
        
        {/* Status Breakdown */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">Completed</span>
            </div>
            <span className="text-sm font-bold text-green-700">{completedAssignments}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-700">Pending</span>
            </div>
            <span className="text-sm font-bold text-yellow-700">{pendingAssignments}</span>
          </div>
          
          {lateAssignments > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium text-red-700">Late</span>
              </div>
              <span className="text-sm font-bold text-red-700">{lateAssignments}</span>
            </div>
          )}
        </div>
        
        {/* Weight Progress */}
        {totalWeight > 0 && (
          <div className="pt-3 border-t border-slate-200">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-600 font-medium">Weight Progress</span>
              <span className="text-purple-600 font-bold">{Math.round(weightProgress)}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-400 to-purple-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${weightProgress}%` }}
              ></div>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {completedWeight.toFixed(1)}% of {totalWeight.toFixed(1)}% total weight
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
