'use client';
// Academic OS - Main Dashboard Experience with Clean Navigation
import { CleanAcademicOSShell } from '@/academic-os/components/CleanAcademicOSShell';
import { useEffect } from 'react';

/**
 * Main Dashboard Page - Redesigned with Clean Navigation
 * Features a simplified, unified navigation system with:
 * - Single module detail view
 * - Interactive weekly priority list
 * - Clean, modern UI without redundancy
 */
export default function DashboardPage() {
  useEffect(() => {
    // Set the document title for this page
    document.title = 'Academic OS - Dashboard';
  }, []);

  return <CleanAcademicOSShell />;
}
