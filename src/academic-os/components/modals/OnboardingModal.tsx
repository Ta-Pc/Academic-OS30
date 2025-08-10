'use client';
// AcademicOS Flow Composition
import React, { useRef, useEffect } from 'react';
import { useAcademicOS } from '../../context/AcademicOSContext';

/**
 * Onboarding Modal - shown on first visit to help users understand Academic OS.
 * Follows existing modal patterns with welcome tour.
 */
export function OnboardingModal() {
  const { closeModal } = useAcademicOS();
  const lastActive = useRef<HTMLElement | null>(null);
  
  // Focus management (copied from existing modal pattern)
  useEffect(() => {
    lastActive.current = document.activeElement as HTMLElement;
    
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeModal();
      }
    };
    
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      if (lastActive.current) {
        lastActive.current.focus();
      }
    };
  }, [closeModal]);

  const handleGetStarted = () => {
    // TODO: Could set user preference to not show this again
    closeModal();
  };

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="onboardingHeading">
      <div className="absolute inset-0 bg-slate-900/40" onClick={closeModal} />
      <div className="absolute inset-0 overflow-y-auto p-4 flex items-center justify-center">
        <div className="card w-full max-w-lg shadow-xl">
          <div className="card-header">
            <h2 id="onboardingHeading" className="text-lg font-semibold text-slate-800">
              Welcome to Academic OS
            </h2>
          </div>
          
          <div className="card-body space-y-4" data-testid="academicos-onboarding">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎓</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Academic OS brings together your weekly schedule, module details, strategic analytics, 
                and what-if planning into one integrated experience.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <span className="text-xl">📅</span>
                <div>
                  <div className="font-medium text-slate-800">Weekly View</div>
                  <div className="text-sm text-slate-600">See your assignments, tasks, and schedule by week</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <span className="text-xl">📚</span>
                <div>
                  <div className="font-medium text-slate-800">Module Details</div>
                  <div className="text-sm text-slate-600">Deep dive into specific modules and their requirements</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <span className="text-xl">📊</span>
                <div>
                  <div className="font-medium text-slate-800">Strategic Analytics</div>
                  <div className="text-sm text-slate-600">Track your GPA, identify at-risk modules, and monitor progress</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <span className="text-xl">🔮</span>
                <div>
                  <div className="font-medium text-slate-800">What-If Planning</div>
                  <div className="text-sm text-slate-600">Project different scenarios and plan your academic strategy</div>
                </div>
              </div>
            </div>

            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
              <div className="font-medium text-primary-800 mb-1">💡 Pro Tip</div>
              <div className="text-sm text-primary-700">
                Use the navigation at the top to switch between views. Your context is preserved 
                as you move between weekly planning and strategic analysis.
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-200">
              <button 
                className="btn btn-primary" 
                onClick={handleGetStarted}
                data-testid="academicos-onboarding-start"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
