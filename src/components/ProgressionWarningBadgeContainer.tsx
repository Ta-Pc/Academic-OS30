'use client';
import React, { useEffect, useState } from 'react';
import { ProgressionWarningBadgeView } from '@ui/left/ProgressionWarningBadge.view';
import { ProgressionDetailView } from '@ui/left/ProgressionDetail.view';

export function ProgressionWarningBadgeContainer() {
  const [warnings, setWarnings] = useState<string[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProgressionData() {
      try {
        setLoading(true);
        // This would typically fetch from an API endpoint
        // For now, we'll use mock data since the API might not be implemented yet
        const mockWarnings = [
          'Behind schedule on Core Electives - need 4 more credits',
          'Technical Electives completion rate below 50%',
          'Free Electives completed ahead of schedule'
        ];
        
        setWarnings(mockWarnings);
      } catch (err) {
        console.error('Failed to fetch progression data:', err);
        setWarnings(['Unable to load progression data']);
      } finally {
        setLoading(false);
      }
    }

    fetchProgressionData();
  }, []);

  const handleOpenDetails = () => {
    setShowDetails(true);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
  };

  if (loading) {
    return (
      <div className="card border-slate-200 bg-slate-50">
        <div className="card-body py-2">
          <div className="flex items-center space-x-2">
            <div className="flex-shrink-0">
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
            </div>
            <div className="text-sm text-slate-600 font-medium">
              Loading progression data...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <ProgressionWarningBadgeView
        warnings={warnings}
        onOpenDetails={handleOpenDetails}
      />
      
      {showDetails && (
        <ProgressionDetailView
          isOpen={showDetails}
          onClose={handleCloseDetails}
          warnings={warnings}
          progressData={{
            currentYear: 2024,
            creditsPassedThisYear: 24,
            requiredCreditsForYear: 48,
            percentPassed: 50
          }}
          remediationActions={[
            {
              id: '1',
              title: 'Complete Core Elective Requirements',
              description: 'Focus on completing remaining core elective credits to stay on track',
              priority: 'high' as const,
              estimatedHours: 20,
              type: 'study' as const
            },
            {
              id: '2',
              title: 'Review Technical Elective Options',
              description: 'Research and plan for upcoming technical elective courses',
              priority: 'medium' as const,
              estimatedHours: 5,
              type: 'admin' as const
            }
          ]}
          onAddToWeek={(actionIds) => {
            console.log('Adding actions to week:', actionIds);
            // This would typically add the selected actions to the current week
          }}
        />
      )}
    </>
  );
}
