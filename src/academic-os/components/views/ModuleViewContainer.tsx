// AcademicOS Flow Composition
import React from 'react';
import { useAcademicOS } from '../../context/AcademicOSContext';
import { ModuleDetailContainer as ExistingModuleDetailContainer } from '@/app/modules/[moduleId]/ModuleDetail.container';

/**
 * Module View Container - adapts existing ModuleDetailContainer for Academic OS.
 * Shows detailed module analytics and assignments.
 */
export function ModuleViewContainer() {
  const { state } = useAcademicOS();
  const { selectedModuleId } = state;

  // If no module selected, show selection prompt
  if (!selectedModuleId) {
    return (
      <div className="container mx-auto py-12" data-testid="academicos-module-root">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">Module Details</h2>
          <p className="text-slate-600">Select a module from the Weekly view to see its details.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6" data-testid="academicos-module-root">
      {/* Reuse existing ModuleDetailContainer */}
      <ExistingModuleDetailContainer moduleId={selectedModuleId} initial={{
        module: { id: selectedModuleId, code: 'Loading...', title: 'Loading...', targetMark: null },
        assignments: [],
        currentObtainedMark: 0,
        remainingWeight: 100,
        currentPredictedSemesterMark: 0,
      }} />
    </div>
  );
}
