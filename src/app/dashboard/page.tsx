'use client';
// Academic OS - Main Dashboard Experience
import { AcademicOSShell } from '@/academic-os/components/AcademicOSShell';
import { useEffect } from 'react';

/**
 * Main Dashboard Page - Now powered by Academic OS
 * Main dashboard page featuring the complete Academic OS experience.
 * providing Weekly → Module → Strategic → What-If → Settings flows
 */
export default function DashboardPage() {
  useEffect(() => {
    // Set the document title for this page
    document.title = 'Academic OS - Dashboard';
  }, []);

  return <AcademicOSShell />;
}
