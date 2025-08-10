// AcademicOS Flow Composition
import React from 'react';
import { useAcademicOS } from '../../context/AcademicOSContext';
import { WeekViewContainer as ExistingWeekViewContainer } from '@/app/week-view/WeekView.container';
import { useUserStore } from '@/lib/user-store';

/**
 * Weekly View Container - adapts existing WeekViewContainer for Academic OS.
 * This is the main landing view showing weekly missions, tasks, and modules.
 */
export function WeeklyViewContainer() {
  const { state, openModal } = useAcademicOS();
  const { currentWeekStart } = state;
  const currentUser = useUserStore((s) => s.currentUser);

  return (
    <div className="container mx-auto py-6" data-testid="academicos-weekly-root">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Weekly Mission Brief</h2>
          <p className="text-slate-600 mt-1">Your tactical overview for the week</p>
        </div>
        
        {/* Add Task button */}
        <button
          onClick={() => openModal('add-task')}
          className="btn btn-primary"
          data-testid="academicos-add-task-open"
        >
          + Add Task
        </button>
      </div>

      {/* Reuse existing WeekViewContainer with current week context */}
      <ExistingWeekViewContainer 
        userId={currentUser?.id}
        date={currentWeekStart || undefined}
      />
    </div>
  );
}
