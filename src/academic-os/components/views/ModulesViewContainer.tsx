'use client';
// AcademicOS Flow Composition
import React, { useEffect, useState } from 'react';
import { useAcademicOS } from '../../context/AcademicOSContext';
import { ModuleCardView } from '@ui/modules/ModuleCard.view';

/**
 * Modules List View - shows all modules in a grid layout.
 * Provides overview of all modules with navigation to module details.
 */
export function ModulesViewContainer() {
  const { selectModule } = useAcademicOS();
  const [modules, setModules] = useState<Array<{
    id: string;
    code: string;
    title: string;
    creditHours: number;
    currentGrade?: number;
    currentAverageMark?: number;
    priorityScore?: number;
  }>>([]);
  const [loading, setLoading] = useState(true);

  // Fetch modules data
  useEffect(() => {
    async function fetchModules() {
      try {
        // Fetch from existing dashboard API to get modules
        const dashResponse = await fetch(`/api/dashboard`);
        if (!dashResponse.ok) throw new Error('Failed to fetch dashboard data');
        
        const dashData = await dashResponse.json();
        
        // Extract modules from dashboard data
        const modulesList = dashData.data.map((m: {
          id: string;
          code: string;
          title: string;
          creditHours: number;
          currentGrade?: number;
          currentAverageMark?: number;
        }) => ({
          id: m.id,
          code: m.code,
          title: m.title,
          creditHours: m.creditHours,
          currentGrade: m.currentGrade,
          currentAverageMark: m.currentAverageMark,
          priorityScore: m.currentAverageMark ? Math.max(0, 75 - m.currentAverageMark) : 50, // Higher score for modules that need attention
        }));

        setModules(modulesList);
      } catch (error) {
        console.error('Failed to fetch modules:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchModules();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto py-12" data-testid="academicos-modules-root">
        <div className="text-center">
          <div className="text-lg text-slate-600">Loading modules...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6" data-testid="academicos-modules-root">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-900">All Modules</h2>
        <p className="text-slate-600 mt-1">Overview of your academic modules and performance</p>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => (
          <div 
            key={module.id}
            className="cursor-pointer transition-transform hover:scale-105"
            onClick={() => selectModule(module.id, 'modules')}
          >
            <ModuleCardView
              module={{
                id: module.id,
                code: module.code,
                title: module.title,
                creditHours: module.creditHours,
                createdAt: new Date(),
                currentGrade: module.currentGrade,
                currentAverageMark: module.currentAverageMark,
              }}
            />
          </div>
        ))}
      </div>

      {modules.length === 0 && (
        <div className="text-center py-12">
          <div className="text-slate-500">No modules found</div>
          <p className="text-sm text-slate-400 mt-2">
            Import your academic data to see your modules here
          </p>
        </div>
      )}
    </div>
  );
}
