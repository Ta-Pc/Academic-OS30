// AcademicOS Flow Composition
import React from 'react';
import { useAcademicOS } from '../../context/AcademicOSContext';

/**
 * Settings View Container - academic configuration and tools.
 * Provides access to import functionality and onboarding.
 */
export function SettingsViewContainer() {
  const { openModal } = useAcademicOS();

  return (
    <div className="container mx-auto py-6" data-testid="academicos-settings-root">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-900">Settings & Tools</h2>
        <p className="text-slate-600 mt-1">Configure your academic data and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <section className="lg:col-span-1">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button
              onClick={() => openModal('onboarding')}
              className="btn btn-primary btn-sm w-full"
            >
              📋 Setup Wizard
            </button>
            
            <button
              onClick={() => window.location.href = '/import'}
              className="btn btn-secondary btn-sm w-full"
            >
              📁 Import Data
            </button>
            
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="btn btn-secondary btn-sm w-full"
            >
              📊 Dashboard Overview
            </button>
          </div>
        </section>

        {/* Academic Year Summary */}
        <section className="lg:col-span-2">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Academic Year Summary</h3>
          <div className="card">
            <div className="card-body">
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🎓</div>
                <div className="text-lg font-medium text-slate-900 mb-2">Academic Year 2025</div>
                <div className="text-slate-600 text-sm">
                  Academic year configuration and summary statistics will appear here
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Data Management */}
      <section className="mt-8">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Data Management</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card">
            <div className="card-body">
              <h4 className="font-medium text-slate-900 mb-2">Export Data</h4>
              <p className="text-sm text-slate-600 mb-4">
                Download your academic data for backup or analysis
              </p>
              <button className="btn btn-secondary btn-sm">
                Export to CSV
              </button>
            </div>
          </div>
          
          <div className="card">
            <div className="card-body">
              <h4 className="font-medium text-slate-900 mb-2">Reset Data</h4>
              <p className="text-sm text-slate-600 mb-4">
                Clear all data and start fresh (cannot be undone)
              </p>
              <button className="btn btn-danger btn-sm">
                Reset All Data
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
