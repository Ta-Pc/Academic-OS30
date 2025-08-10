"use client";
import React from 'react';

export interface ElectiveTrackerProps {
  electiveGroups: Array<{
    id: string;
    name: string;
    requiredCredits: number;
    completedCredits: number;
  }>;
  onViewModules?: (groupId: string) => void;
}

/**
 * ElectiveTracker shows DSM elective group progress with clickable progress bars
 * that open module lists for the selected elective group.
 */
export function ElectiveTrackerView({ electiveGroups, onViewModules }: ElectiveTrackerProps) {
  if (electiveGroups.length === 0) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="text-sm font-semibold tracking-wide uppercase text-slate-700">
            Elective Progress
          </h3>
        </div>
        <div className="card-body">
          <p className="text-sm text-slate-500">No elective groups found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-sm font-semibold tracking-wide uppercase text-slate-700">
          Elective Progress
        </h3>
        <div className="text-xs text-slate-500">{electiveGroups.length} groups</div>
      </div>
      <div className="card-body space-y-4">
        {electiveGroups.map(group => {
          const progressPercent = Math.min((group.completedCredits / group.requiredCredits) * 100, 100);
          const isComplete = group.completedCredits >= group.requiredCredits;
          const isOnTrack = progressPercent >= 50;
          
          return (
            <div key={group.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-slate-900">{group.name}</div>
                <div className="text-xs text-slate-500">
                  {group.completedCredits}/{group.requiredCredits} credits
                </div>
              </div>
              
              <button
                type="button"
                onClick={() => onViewModules?.(group.id)}
                className="w-full group focus:outline-none"
              >
                <div className="relative">
                  <div className="w-full bg-slate-200 rounded-full h-2 group-hover:bg-slate-300 transition-colors">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        isComplete 
                          ? 'bg-emerald-500' 
                          : isOnTrack 
                            ? 'bg-blue-500' 
                            : 'bg-amber-500'
                      }`}
                      style={{ width: `${Math.max(progressPercent, 4)}%` }}
                    />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-medium text-slate-700 group-hover:text-slate-900">
                      {Math.round(progressPercent)}%
                    </span>
                  </div>
                </div>
              </button>
              
              {progressPercent < 25 && (
                <div className="text-xs text-amber-600 font-medium">
                  ⚠️ Behind schedule - consider enrolling in more electives
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
