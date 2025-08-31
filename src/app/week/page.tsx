'use client';
// DEPRECATED: This page is deprecated and will be removed in a future version.
// Please use the main AcademicOSShell and navigate to the 'weekly' view.
import { AcademicOSProvider } from '@/academic-os/context/AcademicOSContext';
import { WeeklyViewContainer } from '@/academic-os/components/views/WeeklyViewContainer';
import { AcademicOSHeader } from '@/academic-os/components/AcademicOSHeader';
import { useEffect } from 'react';

/**
 * Week Page - Shows the weekly view from Academic OS
 */
export default function WeekPage() {
  useEffect(() => {
    // Set the document title for this page
    document.title = 'Academic OS - Week View';
  }, []);

  return (
    <AcademicOSProvider>
      <div className="min-h-screen bg-slate-50" data-testid="academicos-shell">
        <AcademicOSHeader />
        <main className="container mx-auto px-4 py-6">
          <WeeklyViewContainer />
        </main>
      </div>
    </AcademicOSProvider>
  );
}