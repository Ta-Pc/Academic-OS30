import React from 'react';

export interface ModuleDetailViewProps {
  header: { code: string; title: string; credits?: number | null };
  stats: { 
    currentObtained: number; 
    remainingWeight: number; 
    predictedSemesterMark: number;
    targetMark?: number | null;
  };
  assignmentsSection: React.ReactNode;
  onBackToWeek?: () => void;
  hasLastViewedWeek?: boolean;
}

function round1(n: number) { return (Math.round(n * 10) / 10).toFixed(1); }

function SparklineChart({ values, className = "h-10" }: { values: number[]; className?: string }) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1; // Avoid division by zero
  
  return (
    <div className={`${className} flex items-end gap-1`}>
      {values.map((value, i) => {
        const height = range > 0 ? ((value - min) / range) * 100 : 50;
        return (
          <div 
            key={i} 
            className="flex-1 bg-primary-200 rounded transition-all hover:bg-primary-300" 
            style={{ height: `${Math.max(height, 10)}%` }}
            title={`Value: ${value.toFixed(1)}%`}
          />
        );
      })}
    </div>
  );
}

function PredictionInsight({ stats }: { stats: ModuleDetailViewProps['stats'] }) {
  const { currentObtained, remainingWeight, predictedSemesterMark, targetMark } = stats;
  const target = targetMark || 75; // Default target
  const gap = target - predictedSemesterMark;
  
  if (remainingWeight <= 0) {
    return (
      <div className="text-xs text-slate-600 mt-1">
        <span className="font-medium">Final mark:</span> {round1(currentObtained)}%
        {currentObtained >= target ? (
          <span className="text-green-600 ml-1">✓ Target achieved</span>
        ) : (
          <span className="text-red-600 ml-1">⚠ Below target</span>
        )}
      </div>
    );
  }
  
  const requiredAverage = remainingWeight > 0 ? (gap / remainingWeight) * 100 : 0;
  
  return (
    <div className="text-xs text-slate-600 mt-1">
      {gap > 0 ? (
        <span>
          Need <span className="font-medium text-orange-600">{round1(requiredAverage)}%</span> average 
          on remaining work to reach target
        </span>
      ) : (
        <span className="text-green-600">
          ✓ On track to exceed target of {target}%
        </span>
      )}
    </div>
  );
}

export function ModuleDetailView({ header, stats, assignmentsSection, onBackToWeek, hasLastViewedWeek }: ModuleDetailViewProps) {
  // Generate sample sparkline data (in a real app, this would come from props)
  const sparklineData = Array.from({ length: 12 }, (_, i) => {
    const base = stats.currentObtained;
    const variation = Math.sin(i * 0.5) * 5 + Math.random() * 3 - 1.5;
    return Math.max(0, Math.min(100, base + variation));
  });

  return (
    <div className="space-y-8" data-testid="module-detail-root">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="text-sm text-slate-600">{header.code}</div>
          <h1 className="text-2xl font-semibold">{header.title}</h1>
          {header.credits != null && <div className="text-xs text-slate-500 mt-1">{header.credits} credits</div>}
        </div>
        <div className="flex gap-2">
          <button type="button" className="btn btn-secondary" onClick={onBackToWeek} data-testid="back-to-week">
            {hasLastViewedWeek ? 'Back to Week' : 'Week View'}
          </button>
        </div>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="card-body">
            <div className="text-xs text-slate-600">Current Obtained</div>
            <div className="text-xl font-semibold" data-testid="currentObtainedMark">{round1(stats.currentObtained)}%</div>
            <div className="text-xs text-slate-500">
              Weighted average from graded work
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-body">
            <div className="text-xs text-slate-600">Remaining Weight</div>
            <div className="text-xl font-semibold">{round1(stats.remainingWeight)}%</div>
            <div className="text-xs text-slate-500">
              {stats.remainingWeight > 0 ? 'Still to be assessed' : 'All work completed'}
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-body">
            <div className="text-xs text-slate-600">Predicted Final</div>
            <div className="text-xl font-semibold" data-testid="predictedSemesterMark">{round1(stats.predictedSemesterMark)}%</div>
            <PredictionInsight stats={stats} />
          </div>
        </div>
        
        <div className="card">
          <div className="card-body">
            <div className="text-xs text-slate-600 mb-1">Performance Trend</div>
            <SparklineChart values={sparklineData} className="h-8" />
            <div className="text-xs text-slate-500 mt-1">
              Last 12 assessments
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-3" data-testid="assignments-section">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Assignments</h2>
          <div className="text-sm text-slate-600">
            Click &quot;Edit&quot; to update scores
          </div>
        </div>
        <div className="card">
          <div className="card-body p-0">
            {assignmentsSection}
          </div>
        </div>
      </section>
    </div>
  );
}
