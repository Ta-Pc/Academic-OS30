import React from 'react';
import { Card, CardBody } from '../layout/Card.view';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export interface PerformanceStatsGridProps {
  stats: {
    currentObtained: number;
    remainingWeight: number;
    predictedSemesterMark: number;
    targetMark?: number | null;
  };
  performanceInsights?: {
    trend: 'improving' | 'stable' | 'declining';
    recentScores: number[];
    averageImprovement: number;
    consistencyScore: number;
  };
  isRefreshing?: boolean;
}

function round1(n: number) { 
  return (Math.round(n * 10) / 10).toFixed(1); 
}

function PredictionInsight({ stats }: { stats: PerformanceStatsGridProps['stats'] }) {
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

function SparklineChart({ values, className = "h-8" }: { values: number[]; className?: string }) {
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

function getTrendIcon(trend: 'improving' | 'stable' | 'declining') {
  switch (trend) {
    case 'improving':
      return <TrendingUp className="w-4 h-4 text-green-600" />;
    case 'declining':
      return <TrendingDown className="w-4 h-4 text-red-600" />;
    default:
      return <Minus className="w-4 h-4 text-slate-500" />;
  }
}

function generateSparklineData(stats: PerformanceStatsGridProps['stats']) {
  // Generate sample sparkline data (in a real app, this would come from props)
  return Array.from({ length: 12 }, (_, i) => {
    const base = stats.currentObtained;
    const variation = Math.sin(i * 0.5) * 5 + Math.random() * 3 - 1.5;
    return Math.max(0, Math.min(100, base + variation));
  });
}

export function PerformanceStatsGrid({ stats, performanceInsights, isRefreshing }: PerformanceStatsGridProps) {
  return (
    <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
      {/* Current Grade Card */}
      <Card className={isRefreshing ? 'opacity-60' : ''}>
        <CardBody>
          <div className="text-xs text-slate-600">Current Grade</div>
          <div className="text-xl lg:text-2xl font-semibold text-primary-700" data-testid="currentObtainedMark">
            {round1(stats.currentObtained)}%
          </div>
          <div className="text-xs text-slate-500">From completed work</div>
        </CardBody>
      </Card>

      {/* Remaining Weight Card */}
      <Card className={isRefreshing ? 'opacity-60' : ''}>
        <CardBody>
          <div className="text-xs text-slate-600">Remaining Weight</div>
          <div className="text-xl lg:text-2xl font-semibold">
            {round1(stats.remainingWeight)}%
          </div>
          <div className="text-xs text-slate-500">
            {stats.remainingWeight > 0 ? 'Still to assess' : 'All completed'}
          </div>
        </CardBody>
      </Card>

      {/* Predicted Final Card */}
      <Card className={isRefreshing ? 'opacity-60' : ''}>
        <CardBody>
          <div className="text-xs text-slate-600">Predicted Final</div>
          <div className="text-xl lg:text-2xl font-semibold text-green-700" data-testid="predictedSemesterMark">
            {round1(stats.predictedSemesterMark)}%
          </div>
          <PredictionInsight stats={stats} />
        </CardBody>
      </Card>

      {/* Performance Trend Card */}
      <Card className={isRefreshing ? 'opacity-60' : ''}>
        <CardBody>
          <div className="text-xs text-slate-600 mb-1">Performance Trend</div>
          {performanceInsights ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {getTrendIcon(performanceInsights.trend)}
                <span className="text-sm font-medium capitalize">
                  {performanceInsights.trend}
                </span>
              </div>
              <div className="text-xs text-slate-500">
                Avg improvement: {performanceInsights.averageImprovement > 0 ? '+' : ''}{performanceInsights.averageImprovement.toFixed(1)}%
              </div>
            </div>
          ) : (
            <SparklineChart values={generateSparklineData(stats)} className="h-8" />
          )}
        </CardBody>
      </Card>
    </section>
  );
}
