'use client';
import React, { useEffect, useState } from 'react';
import { ModuleDetailView } from '@ui/modules/ModuleDetail.view';
import { useWeekStore } from '@/lib/week-store';

interface ModuleData {
  id: string;
  code: string;
  title: string;
  creditHours: number;
  currentGrade: number;
  targetMark: number;
  assignments?: Array<{
    id: string;
    title: string;
    dueDate: string | null;
    weight: number | null;
    score: number | null;
    status: string;
  }>;
  assignmentStats?: {
    remainingWeight: number;
  };
}

async function fetchModuleData(moduleId: string): Promise<ModuleData> {
  const res = await fetch(`/api/modules/${moduleId}`, {
    cache: 'no-store'
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch module data');
  }
  
  return res.json();
}

export default function ModuleDetailPage({ params }: { params: { moduleId: string } }) {
  const moduleId = params.moduleId;
  const [moduleData, setModuleData] = useState<ModuleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastViewedWeek = useWeekStore(state => state.lastViewedWeek);

  useEffect(() => {
    async function loadModuleData() {
      try {
        setLoading(true);
        const data = await fetchModuleData(moduleId);
        setModuleData(data);
      } catch (err) {
        console.error('Failed to load module data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load module');
      } finally {
        setLoading(false);
      }
    }

    loadModuleData();
  }, [moduleId]);

  const handleBackToWeek = () => {
    window.location.href = lastViewedWeek ? `/dashboard?date=${lastViewedWeek}` : '/dashboard';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <div className="text-lg font-medium text-slate-700">Loading module details...</div>
        </div>
      </div>
    );
  }

  if (error || !moduleData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="text-6xl mb-4">⚠️</div>
          <div className="text-lg font-medium text-slate-700 mb-2">Module Not Found</div>
          <div className="text-sm text-slate-500 mb-4">
            {error || `The module with ID ${moduleId} could not be found.`}
          </div>
          <button 
            onClick={handleBackToWeek}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Back to Week View
          </button>
        </div>
      </div>
    );
  }

  // Transform the API data to match ModuleDetailView props
  const header = {
    id: moduleData.id,
    code: moduleData.code,
    title: moduleData.title,
    credits: moduleData.creditHours,
  };

  const stats = {
    currentObtained: moduleData.currentGrade,
    remainingWeight: moduleData.assignmentStats?.remainingWeight || 0,
    predictedSemesterMark: moduleData.currentGrade, // Using current grade as predicted for now
    targetMark: moduleData.targetMark,
  };

  // Transform assignments to ensure weight is always a number (default to 0 if null)
  const transformedAssignments = (moduleData.assignments || []).map(assignment => ({
    ...assignment,
    weight: assignment.weight || 0,
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      <ModuleDetailView 
        header={header}
        stats={stats}
        assignments={transformedAssignments}
        onBackToWeek={handleBackToWeek}
        hasLastViewedWeek={!!lastViewedWeek}
      />
    </div>
  );
}
