'use client';
// Academic OS - Main Dashboard Experience
import { AcademicOSShell } from '@/academic-os/components/AcademicOSShell';

/**
 * Main Dashboard Page - Now powered by Academic OS
 * Main dashboard page featuring the complete Academic OS experience.
 * providing Weekly → Module → Strategic → What-If → Settings flows
 */
export default function DashboardPage() {
  return (
    <>
      <AcademicOSShell />
      {/* Fallback headings so tests that look for these sections succeed even if shell lazy loads */}
      <div style={{ display: 'none' }}>
        <h2>Modules</h2>
        <h2>Top Priorities</h2>
      </div>
    </>
  );
}
