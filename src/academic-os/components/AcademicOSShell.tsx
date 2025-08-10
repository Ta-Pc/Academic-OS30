'use client';
// AcademicOS Flow Composition
import React from 'react';
import { AcademicOSProvider, useAcademicOS } from '../context/AcademicOSContext';
import { AcademicOSHeader } from './AcademicOSHeader';
import { WeeklyViewContainer } from '@/academic-os/components/views/WeeklyViewContainer';
import { ModuleViewContainer } from '@/academic-os/components/views/ModuleViewContainer';
import { StrategicViewContainer } from '@/academic-os/components/views/StrategicViewContainer';
import { WhatIfViewContainer } from '@/academic-os/components/views/WhatIfViewContainer';
import { SettingsViewContainer } from '@/academic-os/components/views/SettingsViewContainer';
import { AddTaskModal } from '@/academic-os/components/modals/AddTaskModal';
import { OnboardingModal } from '@/academic-os/components/modals/OnboardingModal';

/**
 * Main view router for Academic OS.
 * Renders the appropriate view container based on current state.
 */
function AcademicOSViews() {
  const { state } = useAcademicOS();
  
  switch (state.currentView) {
    case 'weekly':
      return <WeeklyViewContainer />;
    case 'module':
      return <ModuleViewContainer />;
    case 'strategic':
      return <StrategicViewContainer />;
    case 'whatif':
      return <WhatIfViewContainer />;
    case 'settings':
      return <SettingsViewContainer />;
    default:
      return <StrategicViewContainer />;
  }
}

/**
 * Modal router for Academic OS.
 * Renders the appropriate modal based on current state.
 */
function AcademicOSModals() {
  const { state } = useAcademicOS();
  
  switch (state.activeModal) {
    case 'add-task':
      return <AddTaskModal />;
    case 'onboarding':
      return <OnboardingModal />;
    default:
      return null;
  }
}

/**
 * Complete Academic OS experience shell.
 * Provides navigation, view routing, and modal management.
 */
function AcademicOSContent() {
  return (
    <div className="min-h-screen bg-slate-50" data-testid="academicos-shell">
      <AcademicOSHeader />
      <main className="container mx-auto px-4 py-6">
        <AcademicOSViews />
      </main>
      <AcademicOSModals />
    </div>
  );
}

/**
 * Root Academic OS Shell with context provider.
 * This is the main entry point that wraps the entire Academic OS experience.
 */
export function AcademicOSShell() {
  return (
    <AcademicOSProvider>
      <AcademicOSContent />
    </AcademicOSProvider>
  );
}

export default AcademicOSShell;
