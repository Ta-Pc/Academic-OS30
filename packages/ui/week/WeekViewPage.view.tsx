import React from 'react';
import { WeekHeaderView } from './WeekHeader.view';
import { WeeklyMissionListView } from './WeeklyMissionList.view';
import { SemesterSnapshotView } from '../semester/SemesterSnapshot.view';
import { ModuleQuickView } from '../modules/ModuleQuickView.view';

export interface WeekViewPageProps {
  week: { start: string | Date; end: string | Date };
  priorities: Array<{ id: string; title: string; moduleCode: string; dueDate?: string; priorityScore: number; type: string }>;
  moduleSummaries: Array<{ moduleId: string; code: string; title: string; creditHours: number; priorityScore: number }>;
  overallWeightedAverage: number;
  taskStats: { completed: number; pending: number };
  openModule?: { moduleId: string; code: string; title: string; creditHours: number } | undefined;
  onOpenModule?: (moduleId: string) => void;
  onCloseModule?: () => void;
}

/**
 * Standalone WeekView page-level component for Storybook usage (no Next.js dependencies).
 */
export function WeekViewPageView(props: WeekViewPageProps) {
  const { week, priorities, moduleSummaries, overallWeightedAverage, taskStats, openModule, onOpenModule, onCloseModule } = props;
  return (
    <div className="relative">
      <div className="space-y-6">
        <WeekHeaderView start={week.start} end={week.end} />
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
          <div className="xl:col-span-3 space-y-6">
            <section className="card">
              <div className="card-header">
                <h3 className="text-sm font-semibold tracking-wide uppercase text-slate-700">Top Priorities</h3>
                <div className="text-xs text-slate-500">{priorities.length} items</div>
              </div>
              <div className="card-body p-0">
                <WeeklyMissionListView items={priorities.map(p => ({ id: p.id, title: p.title, moduleCode: p.moduleCode, dueDate: p.dueDate }))} emptyLabel="No high-priority items this week." />
              </div>
            </section>
            <section className="card">
              <div className="card-header">
                <h3 className="text-sm font-semibold tracking-wide uppercase text-slate-700">Modules</h3>
                <div className="text-xs text-slate-500">{moduleSummaries.length} active</div>
              </div>
              <div className="card-body">
                <div className="grid md:grid-cols-2 2xl:grid-cols-3 gap-4">
                  {moduleSummaries.map(m => (
                    <button
                      key={m.moduleId}
                      type="button"
                      onClick={() => onOpenModule?.(m.moduleId)}
                      className="text-left"
                    >
                      <div className="card ring-1 ring-slate-200 hover:ring-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-500">
                        <div className="card-body">
                          <div className="text-xs text-slate-500">{m.code}</div>
                          <div className="text-sm font-medium text-slate-900 truncate">{m.title}</div>
                          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                            <span>{m.creditHours} credits</span>
                            <span className="font-medium">PS {Math.round(m.priorityScore)}</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </section>
          </div>
          <aside className="space-y-4">
            <SemesterSnapshotView overallWeightedAverage={overallWeightedAverage} tasks={taskStats} />
          </aside>
        </div>
      </div>
      {openModule && (
        <div className="fixed inset-0 z-40 flex" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-slate-900/40" onClick={onCloseModule} />
          <div className="relative ml-auto h-full w-full max-w-md bg-white shadow-xl flex flex-col">
            <div className="p-4 flex items-center justify-between border-b border-slate-200">
              <div className="text-sm font-medium">Module Quick View</div>
              <button onClick={onCloseModule} className="btn btn-secondary btn-sm">Close</button>
            </div>
            <div className="overflow-y-auto p-4 flex-1">
              <ModuleQuickView title={openModule.title} code={openModule.code} stats={{ creditHours: openModule.creditHours }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
