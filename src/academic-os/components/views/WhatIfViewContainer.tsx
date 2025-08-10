// AcademicOS Flow Composition
import React from 'react';
// import { useAcademicOS } from '../../context/AcademicOSContext';

/**
 * What-If Planner View - scenario planning and grade simulation.
 * Shows module projection blocks for remaining assignments.
 */
export function WhatIfViewContainer() {
  // Note: selectModule will be used when implementing scenario selection
  // const { selectModule } = useAcademicOS();

  return (
    <div className="container mx-auto py-6" data-testid="academicos-whatif-root">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-900">What-If Planner</h2>
        <p className="text-slate-600 mt-1">Explore scenarios and plan your semester strategy</p>
      </div>

      {/* Placeholder for What-If functionality */}
      <div className="card">
        <div className="card-body">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">What-If Scenario Planning</h3>
            <p className="text-slate-600 mb-6 max-w-md mx-auto">
              Select a module from Weekly or Strategic views to open the What-If simulator 
              and explore different grade scenarios.
            </p>
            <div className="text-sm text-slate-500">
              What-If simulations are available from module detail views
            </div>
          </div>
        </div>
      </div>

      {/* Future: Module projection blocks would go here */}
      <section className="mt-8">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Module Projections</h3>
        <div className="grid gap-4">
          {/* These would be populated with module projection data */}
          <div className="card opacity-50" data-testid="academicos-whatif-module">
            <div className="card-body">
              <div className="text-center py-8">
                <div className="text-slate-400 text-sm">
                  Module projection blocks will appear here
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
