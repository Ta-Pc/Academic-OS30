'use client';
import React, { useEffect, useState } from 'react';
import { ElectiveTrackerView } from '@ui/left/ElectiveTracker.view';

export interface ElectiveGroup {
  id: string;
  name: string;
  requiredCredits: number;
  completedCredits: number;
}

export function ElectiveTrackerContainer() {
  const [electiveGroups, setElectiveGroups] = useState<ElectiveGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchElectiveData() {
      try {
        setLoading(true);
        // This would typically fetch from an API endpoint
        // For now, we'll use mock data since the API might not be implemented yet
        const mockData: ElectiveGroup[] = [
          {
            id: '1',
            name: 'Core Electives',
            requiredCredits: 12,
            completedCredits: 8
          },
          {
            id: '2', 
            name: 'Technical Electives',
            requiredCredits: 6,
            completedCredits: 3
          },
          {
            id: '3',
            name: 'Free Electives',
            requiredCredits: 6,
            completedCredits: 6
          }
        ];
        
        setElectiveGroups(mockData);
      } catch (err) {
        console.error('Failed to fetch elective data:', err);
        setError('Failed to load elective progress');
      } finally {
        setLoading(false);
      }
    }

    fetchElectiveData();
  }, []);

  const handleViewModules = (groupId: string) => {
    console.log('View modules for elective group:', groupId);
    // This would typically open a modal or navigate to a dedicated page
    // For now, we'll just log the action
  };

  if (loading) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="text-sm font-semibold tracking-wide uppercase text-slate-700">
            Elective Progress
          </h3>
        </div>
        <div className="card-body">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-slate-200 rounded"></div>
            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="text-sm font-semibold tracking-wide uppercase text-slate-700">
            Elective Progress
          </h3>
        </div>
        <div className="card-body">
          <div className="text-sm text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <ElectiveTrackerView
      electiveGroups={electiveGroups}
      onViewModules={handleViewModules}
    />
  );
}
