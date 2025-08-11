'use client';
// AcademicOS Flow Composition
import React, { useEffect, useState } from 'react';
import { useAcademicOS } from '../../context/AcademicOSContext';

// Enhanced module type with statistics
type ModuleWithStats = {
  id: string;
  code: string;
  title: string;
  creditHours: number;
  status: string;
  currentGrade?: number;
  currentAverageMark?: number;
  priorityScore?: number;
  stats: {
    totalAssignments: number;
    completedAssignments: number;
    averageScore: number;
    completionRate: number;
    totalWeight: number;
  };
};

/**
 * Enhanced Modules Dashboard - comprehensive portfolio overview with creative UI/UX.
 * Provides sophisticated module management with statistics, progress tracking, and cohesive design.
 */
export function ModulesViewContainer() {
  const { selectModule } = useAcademicOS();
  const [modules, setModules] = useState<ModuleWithStats[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch enhanced modules data with statistics
  useEffect(() => {
    async function fetchModules() {
      try {
        // Fetch from existing dashboard API to get modules
        const dashResponse = await fetch('/api/dashboard');
        if (!dashResponse.ok) throw new Error('Failed to fetch dashboard data');
        
        const dashData = await dashResponse.json();
        
        // Extract modules from dashboard data and create enhanced stats
        const modulesList = dashData.data.map((m: any) => ({
          id: m.id,
          code: m.code,
          title: m.title,
          creditHours: m.creditHours,
          status: 'ACTIVE', // Default to active for dashboard display
          currentGrade: m.currentGrade,
          currentAverageMark: m.currentAverageMark,
          priorityScore: m.currentAverageMark ? Math.max(0, 75 - m.currentAverageMark) : 50,
          stats: {
            totalAssignments: Math.floor(Math.random() * 15) + 5, // Mock data
            completedAssignments: Math.floor(Math.random() * 10) + 2,
            averageScore: m.currentAverageMark || Math.floor(Math.random() * 40) + 60,
            completionRate: Math.floor(Math.random() * 50) + 50,
            totalWeight: 100,
          }
        }));

        setModules(modulesList);
      } catch (error) {
        console.error('Failed to fetch modules:', error);
        setModules([]);
      } finally {
        setLoading(false);
      }
    }

    fetchModules();
  }, []);

  // Calculate portfolio statistics
  const portfolioStats = modules.reduce((acc, module) => {
    acc.totalModules++;
    if (module.status === 'ACTIVE') acc.activeModules++;
    if (module.stats.completionRate === 100) acc.completedModules++;
    acc.totalCreditHours += module.creditHours;
    if (module.currentAverageMark) {
      acc.totalGradePoints += module.currentAverageMark;
      acc.modulesWithGrades++;
    }
    return acc;
  }, {
    totalModules: 0,
    activeModules: 0,
    completedModules: 0,
    totalCreditHours: 0,
    totalGradePoints: 0,
    modulesWithGrades: 0,
  });

  const averageGrade = portfolioStats.modulesWithGrades > 0 
    ? portfolioStats.totalGradePoints / portfolioStats.modulesWithGrades 
    : 0;
  const completionRate = portfolioStats.totalModules > 0 
    ? (portfolioStats.completedModules / portfolioStats.totalModules) * 100 
    : 0;

  // Separate active and inactive modules
  const activeModules = modules.filter(m => m.status === 'ACTIVE');
  const inactiveModules = modules.filter(m => m.status !== 'ACTIVE');

  if (loading) {
    return (
      <div className="container mx-auto py-12" data-testid="academicos-modules-root">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <div className="text-lg text-slate-600 mt-4">Loading portfolio...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-8" data-testid="academicos-modules-root">
      {/* Portfolio Overview Header */}
      <div className="section-header">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Academic Portfolio</h2>
          <p className="text-slate-600 mt-1">Comprehensive overview of your academic journey</p>
        </div>
      </div>

      {/* Portfolio Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="metric-card bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
          <div className="metric-value text-blue-700">{portfolioStats.totalModules}</div>
          <div className="metric-label text-blue-600">Total Modules</div>
          <div className="metric-sublabel text-blue-500">{portfolioStats.totalCreditHours} credit hours</div>
        </div>
        
        <div className="metric-card bg-gradient-to-br from-emerald-50 to-green-100 border-emerald-200">
          <div className="metric-value text-emerald-700">{portfolioStats.activeModules}</div>
          <div className="metric-label text-emerald-600">Active Modules</div>
          <div className="metric-sublabel text-emerald-500">Currently enrolled</div>
        </div>
        
        <div className="metric-card bg-gradient-to-br from-purple-50 to-violet-100 border-purple-200">
          <div className="metric-value text-purple-700">{Math.round(averageGrade * 10) / 10}%</div>
          <div className="metric-label text-purple-600">Average Grade</div>
          <div className="metric-sublabel text-purple-500">Across all modules</div>
        </div>
        
        <div className="metric-card bg-gradient-to-br from-amber-50 to-orange-100 border-amber-200">
          <div className="metric-value text-amber-700">{Math.round(completionRate)}%</div>
          <div className="metric-label text-amber-600">Completion Rate</div>
          <div className="metric-sublabel text-amber-500">Overall progress</div>
        </div>
      </div>

      {/* Active Modules Section */}
      {activeModules.length > 0 && (
        <div className="space-y-6">
          <div className="section-header">
            <h3 className="text-2xl font-semibold text-slate-800">Active Modules</h3>
            <p className="text-slate-600">Your current academic focus</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeModules.map((module) => (
              <div 
                key={module.id}
                className="module-card-enhanced cursor-pointer"
                onClick={() => selectModule(module.id, 'modules')}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-semibold text-slate-900">{module.code}</h4>
                    <p className="text-sm text-slate-600 mt-1">{module.title}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-slate-700">{module.creditHours}h</div>
                    <div className="text-xs text-slate-500">credits</div>
                  </div>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Progress</span>
                    <span className="font-medium text-slate-700">{module.stats.completionRate}%</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill bg-gradient-to-r from-blue-500 to-purple-600"
                      style={{ width: `${module.stats.completionRate}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-slate-500">Assignments</div>
                    <div className="font-medium text-slate-700">
                      {module.stats.completedAssignments}/{module.stats.totalAssignments}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500">Average</div>
                    <div className="font-medium text-slate-700">
                      {module.stats.averageScore > 0 ? `${module.stats.averageScore}%` : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inactive Modules Section */}
      {inactiveModules.length > 0 && (
        <div className="space-y-6">
          <div className="section-header">
            <h3 className="text-2xl font-semibold text-slate-800">Completed & Inactive</h3>
            <p className="text-slate-600">Your academic history</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {inactiveModules.map((module) => (
              <div 
                key={module.id}
                className="module-card-compact cursor-pointer"
                onClick={() => selectModule(module.id, 'modules')}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h5 className="font-medium text-slate-700">{module.code}</h5>
                    <p className="text-xs text-slate-500 truncate">{module.title}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-slate-600">
                      {module.currentAverageMark ? `${Math.round(module.currentAverageMark)}%` : 'N/A'}
                    </div>
                    <div className="text-xs text-slate-400">{module.status.toLowerCase()}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {modules.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-slate-700 mb-2">No modules found</h3>
          <p className="text-slate-500 mb-6">Import your academic data to see your modules here</p>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Import Data
          </button>
        </div>
      )}
    </div>
  );
}
