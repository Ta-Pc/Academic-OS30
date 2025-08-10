"use client";
import React, { useState } from 'react';

export interface RemediationAction {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  estimatedHours: number;
  moduleCode?: string;
  type: 'study' | 'assignment' | 'admin' | 'review';
}

export interface ProgressionDetailProps {
  isOpen: boolean;
  onClose: () => void;
  warnings: string[];
  progressData: {
    currentYear: number;
    creditsPassedThisYear: number;
    requiredCreditsForYear: number;
    percentPassed: number;
  };
  remediationActions: RemediationAction[];
  onAddToWeek?: (actionIds: string[]) => void;
}

/**
 * ProgressionDetail modal shows detailed progression analysis with remediation steps
 * and suggested weekly priorities that can be added to the current week.
 */
export function ProgressionDetailView({
  isOpen,
  onClose,
  warnings,
  progressData,
  remediationActions,
  onAddToWeek
}: ProgressionDetailProps) {
  const [selectedActions, setSelectedActions] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  const handleActionToggle = (actionId: string) => {
    const newSelected = new Set(selectedActions);
    if (newSelected.has(actionId)) {
      newSelected.delete(actionId);
    } else {
      newSelected.add(actionId);
    }
    setSelectedActions(newSelected);
  };

  const handleAddToWeek = () => {
    if (selectedActions.size > 0) {
      onAddToWeek?.(Array.from(selectedActions));
      setSelectedActions(new Set());
      onClose();
    }
  };

  const sortedActions = [...remediationActions].sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-slate-900/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Academic Progression</h2>
            <p className="text-sm text-slate-600 mt-1">
              Year {progressData.currentYear} • {Math.round(progressData.percentPassed)}% completed
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn btn-secondary"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Progress Summary */}
          <div className="bg-slate-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Progress Summary</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-slate-900">
                  {progressData.creditsPassedThisYear}
                </div>
                <div className="text-xs text-slate-600">Credits Passed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">
                  {progressData.requiredCreditsForYear}
                </div>
                <div className="text-xs text-slate-600">Required</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">
                  {Math.round(progressData.percentPassed)}%
                </div>
                <div className="text-xs text-slate-600">Complete</div>
              </div>
            </div>
            <div className="mt-3">
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    progressData.percentPassed >= 75 
                      ? 'bg-emerald-500' 
                      : progressData.percentPassed >= 50 
                        ? 'bg-blue-500' 
                        : 'bg-amber-500'
                  }`}
                  style={{ width: `${Math.min(progressData.percentPassed, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Warnings */}
          {warnings.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Areas of Concern</h3>
              <div className="space-y-2">
                {warnings.map((warning, index) => (
                  <div key={index} className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    </div>
                    <div className="text-sm text-red-800">{warning}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Remediation Actions */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">
              Recommended Actions
              {selectedActions.size > 0 && (
                <span className="ml-2 text-xs text-blue-600">
                  ({selectedActions.size} selected)
                </span>
              )}
            </h3>
            <div className="space-y-2">
              {sortedActions.map(action => {
                const isSelected = selectedActions.has(action.id);
                const priorityColors = {
                  high: 'border-red-200 bg-red-50',
                  medium: 'border-amber-200 bg-amber-50',
                  low: 'border-blue-200 bg-blue-50'
                };

                return (
                  <div
                    key={action.id}
                    className={`border rounded-lg p-3 transition-colors ${
                      isSelected 
                        ? 'border-blue-300 bg-blue-50 ring-2 ring-blue-200' 
                        : priorityColors[action.priority]
                    }`}
                  >
                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleActionToggle(action.id)}
                        className="mt-1 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <div className="text-sm font-medium text-slate-900">
                            {action.title}
                            {action.moduleCode && (
                              <span className="ml-2 text-xs text-slate-500">
                                {action.moduleCode}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 text-xs">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              action.priority === 'high' 
                                ? 'bg-red-100 text-red-700'
                                : action.priority === 'medium'
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-blue-100 text-blue-700'
                            }`}>
                              {action.priority}
                            </span>
                            <span className="text-slate-500">
                              {action.estimatedHours}h
                            </span>
                          </div>
                        </div>
                        <div className="text-xs text-slate-600">
                          {action.description}
                        </div>
                      </div>
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-600">
              Select actions to add to your weekly priorities
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="btn btn-secondary"
              >
                Close
              </button>
              <button
                onClick={handleAddToWeek}
                disabled={selectedActions.size === 0}
                className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add {selectedActions.size > 0 ? `${selectedActions.size} ` : ''}to Week
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
