"use client";
import React, { useState } from 'react';
import { WeekHeaderView } from './WeekHeader.view';
import { WeeklyMissionListView, WeeklyMission } from './WeeklyMissionList.view';
import { SemesterSnapshotView } from '../semester/SemesterSnapshot.view';
import { WeeklyAssignmentProgressView } from './WeeklyAssignmentProgress.view';
import { TacticalPaneView } from './TacticalPane.view';
import { ModuleQuickView } from '../modules/ModuleQuickView.view';
import { AssignmentEditModal } from './AssignmentEditModal.view';

export interface WeekViewPageProps {
  week: { start: string | Date; end: string | Date };
  priorities: Array<{ id: string; title: string; moduleCode: string; dueDate?: string; priorityScore: number; type: string; status?: string }>;
  moduleSummaries: Array<{ moduleId: string; code: string; title: string; creditHours: number; priorityScore: number }>;
  overallWeightedAverage: number;
  taskStats: { completed: number; pending: number };
  weeklyAssignments: Array<{ id: string; title: string; status: string; score: number | null; weight: number; dueDate?: string }>;
  tacticalTasks: Array<{ id: string; title: string; status: string; type: string; dueDate: string; module?: { id: string; code: string; title: string } }>;
  openModule?: { moduleId: string; code: string; title: string; creditHours: number } | undefined;
  onOpenModule?: (moduleId: string) => void;
  onCloseModule?: () => void;
  onPrevWeek?: () => void;
  onNextWeek?: () => void;
  onToday?: () => void;
  onRefresh?: () => void;
  onTaskCreate?: (task: { title: string; type: string; dueDate: string; moduleId: string }) => Promise<void>;
  onTaskToggle?: (taskId: string) => Promise<void>;
}

/**
 * Standalone WeekView page-level component for Storybook usage (no Next.js dependencies).
 */
export function WeekViewPageView(props: WeekViewPageProps) {
  const {
    week,
    priorities,
    moduleSummaries,
    overallWeightedAverage,
    taskStats,
    weeklyAssignments,
    tacticalTasks,
    openModule,
    onOpenModule,
    onCloseModule,
    onPrevWeek,
    onNextWeek,
    onToday,
    onRefresh,
    onTaskCreate,
    onTaskToggle
  } = props;

  // Assignment edit modal state
  const [editingAssignmentId, setEditingAssignmentId] = useState<string | null>(null);

  const handleAssignmentClick = (assignmentId: string) => {
    setEditingAssignmentId(assignmentId);
  };

  const handleAssignmentSave = () => {
    console.log('💾 Assignment saved - refreshing Performance metrics...');
    setEditingAssignmentId(null);
    onRefresh?.(); // Refresh the week data
  };

  const handleTaskToggle = async (taskId: string) => {
    if (onTaskToggle) {
      await onTaskToggle(taskId);
    }
    onRefresh?.();
  };

  const handlePriorityItemToggle = (item: WeeklyMission) => {
    if (item.type === 'ASSIGNMENT') {
      handleAssignmentClick(item.id);
    } else {
      handleTaskToggle(item.id);
    }
  };

  // Dynamically determine status for assignments/tasks in priorities
  // Only return allowed AssignmentStatus values for backend
  const getDynamicPriorityStatus = (item: {
    status?: string;
    dueDate?: string;
    type: string;
  }): 'PENDING' | 'DUE' | 'COMPLETE' | 'GRADED' | 'MISSED' => {
    if (item.status === 'GRADED') return 'GRADED';
    if (item.status === 'COMPLETE') return 'COMPLETE';
    if (item.status === 'MISSED') return 'MISSED';
    if (item.type !== 'ASSIGNMENT' || !item.dueDate) return 'PENDING';
    const now = new Date();
    const due = new Date(item.dueDate);
    // If due date is today, treat as DUE
    if (
      due.getFullYear() === now.getFullYear() &&
      due.getMonth() === now.getMonth() &&
      due.getDate() === now.getDate()
    ) {
      return 'DUE';
    }
    // If overdue, treat as MISSED
    if (due < now) {
      return 'MISSED';
    }
    // Otherwise, pending
    return 'PENDING';
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500">
        {/* Page Title */}
        <div className="px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-slate-900">Weekly Mission Brief</h1>
          <p className="text-slate-600 mt-1">Your tactical overview for the week</p>
        </div>
        
        <WeekHeaderView
          start={week.start}
          end={week.end}
          onPrev={onPrevWeek}
          onNext={onNextWeek}
          onToday={onToday}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-5 gap-6 lg:gap-8 items-start">
          <div className="lg:col-span-2 xl:col-span-3 space-y-6 lg:space-y-8">
            {/* Priority Section */}
            <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
              <div className="bg-gradient-to-r from-primary-50 to-primary-100 px-4 sm:px-6 py-4 border-b border-primary-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary-200 rounded-lg">
                      <span className="text-xl sm:text-2xl">🎯</span>
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-primary-900">Top Priorities</h3>
                      <p className="text-xs sm:text-sm text-primary-700">Focus on these critical items</p>
                    </div>
                  </div>
                  <div className="bg-primary-200 text-primary-800 px-3 py-1 rounded-full text-sm font-medium self-start">
                    {priorities.length} items
                  </div>
                </div>
              </div>
              <div className="p-4 sm:p-6">
                <WeeklyMissionListView
                  items={priorities.map(p => ({
                    id: p.id,
                    title: p.title,
                    moduleCode: p.moduleCode,
                    dueDate: p.dueDate,
                    priorityScore: p.priorityScore,
                    type: p.type,
                    status: getDynamicPriorityStatus(p)
                  }))}
                  onToggle={handlePriorityItemToggle}
                  emptyLabel="No high-priority items this week. Great job!"
                  maxItems={8}
                />
              </div>
            </section>

            {/* Modules Section */}
            <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-4 sm:px-6 py-4 border-b border-blue-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-200 rounded-lg">
                      <span className="text-xl sm:text-2xl">📚</span>
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-blue-900">Active Modules</h3>
                      <p className="text-xs sm:text-sm text-blue-700">Your current courses and progress</p>
                    </div>
                  </div>
                  <div className="bg-blue-200 text-blue-800 px-3 py-1 rounded-full text-sm font-medium self-start">
                    {moduleSummaries.length} active
                  </div>
                </div>
              </div>
              <div className="p-4 sm:p-6">
                {moduleSummaries.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {moduleSummaries.map(m => (
                      <button
                        key={m.moduleId}
                        type="button"
                        onClick={() => onOpenModule?.(m.moduleId)}
                        className="text-left group"
                      >
                        <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-xl p-5 hover:shadow-lg hover:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200 group-hover:scale-[1.02]">
                          <div className="flex items-start justify-between mb-3">
                            <div className="text-xs font-semibold text-primary-600 bg-primary-100 px-2 py-1 rounded-full">
                              {m.code}
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-slate-500">Priority Score</div>
                              <div className="text-lg font-bold text-slate-900">{Math.round(m.priorityScore)}</div>
                            </div>
                          </div>
                          <h4 className="text-sm font-semibold text-slate-900 mb-2 line-clamp-2 group-hover:text-primary-700 transition-colors">
                            {m.title}
                          </h4>
                          <div className="flex items-center justify-between text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                              {m.creditHours} credits
                            </span>
                            <span className="text-primary-600 font-medium group-hover:text-primary-700">
                              View details →
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="text-6xl mb-4">📚</div>
                    <div className="text-lg font-medium text-slate-700 mb-2">No modules found</div>
                    <div className="text-sm text-slate-500">Add some modules to get started with your academic journey!</div>
                  </div>
                )}
              </div>
            </section>
          </div>

          <aside className="lg:col-span-1 xl:col-span-2 space-y-6">
            <SemesterSnapshotView overallWeightedAverage={overallWeightedAverage} tasks={taskStats} />
            <WeeklyAssignmentProgressView assignments={weeklyAssignments} />
            <TacticalPaneView
              tasks={tacticalTasks.map(t => ({
                id: t.id,
                title: t.title,
                type: t.type as 'READ' | 'STUDY' | 'PRACTICE' | 'REVIEW' | 'ADMIN',
                status: t.status as 'PENDING' | 'IN_PROGRESS' | 'COMPLETED',
                dueDate: t.dueDate,
                module: t.module || { id: '', code: 'Unknown', title: 'Unknown Module' }
              }))}
              modules={moduleSummaries.map(m => ({ id: m.moduleId, code: m.code, title: m.title }))}
              onTaskCreate={onTaskCreate}
              onTaskToggle={onTaskToggle}
              onRefresh={onRefresh}
            />
          </aside>
        </div>
      </div>

      {openModule && (
        <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onCloseModule} />
          <div className="relative ml-auto h-full w-full max-w-lg bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
              <div>
                <div className="text-lg font-bold text-slate-900">Module Quick View</div>
                <div className="text-sm text-slate-600">{openModule.code}</div>
              </div>
              <button
                onClick={onCloseModule}
                className="flex items-center justify-center w-8 h-8 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                title="Close"
                aria-label="Close module details"
              >
                ✕
              </button>
            </div>
            <div className="overflow-y-auto p-6 flex-1 bg-gradient-to-b from-white to-slate-50 scroll-smooth">
              <ModuleQuickView
                title={openModule.title}
                code={openModule.code}
                stats={{ creditHours: openModule.creditHours }}
                moduleId={openModule.moduleId}
              />
            </div>
          </div>
        </div>
      )}

      {/* Assignment Edit Modal */}
      {editingAssignmentId && (
        <AssignmentEditModal
          isOpen={true}
          assignmentId={editingAssignmentId}
          onClose={() => setEditingAssignmentId(null)}
          onSave={handleAssignmentSave}
        />
      )}
    </div>
  );
}
