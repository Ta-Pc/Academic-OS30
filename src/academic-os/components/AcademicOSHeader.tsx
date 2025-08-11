// AcademicOS Flow Composition
import React from 'react';
import { useAcademicOS } from '../context/AcademicOSContext';
import type { AcademicOSView } from '../context/AcademicOSContext';

/**
 * Main navigation header for Academic OS with tab-based navigation.
 * Provides access to all core views: Weekly, Strategic, What-If, Settings.
 */
export function AcademicOSHeader() {
  const { state, setView, goBack } = useAcademicOS();
  const { currentView, selectedModuleId } = state;

  const navItems: Array<{ view: AcademicOSView; label: string; testId: string }> = [
    { view: 'weekly', label: 'Weekly', testId: 'academicos-nav-weekly' },
    { view: 'strategic', label: 'Strategic', testId: 'academicos-nav-strategic' },
    { view: 'modules', label: 'Modules', testId: 'academicos-nav-modules' },
    { view: 'whatif', label: 'What-If', testId: 'academicos-nav-whatif' },
    { view: 'settings', label: 'Settings', testId: 'academicos-nav-settings' },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Title */}
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-slate-900">Academic OS</h1>
            
            {/* Back button for detail views */}
            {(currentView === 'module' || selectedModuleId) && (
              <button
                onClick={goBack}
                className="btn btn-secondary btn-sm"
                data-testid="academicos-back-btn"
                aria-label="Go back to previous view"
              >
                ← Back
              </button>
            )}
          </div>

          {/* Main navigation tabs */}
          <nav className="flex items-center gap-1" role="tablist">
            {navItems.map((item) => {
              const isActive = currentView === item.view;
              return (
                <button
                  key={item.view}
                  onClick={() => setView(item.view)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-100 text-primary-900'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  data-testid={item.testId}
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`Switch to ${item.label} view`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
