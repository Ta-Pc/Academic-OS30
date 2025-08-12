import React from 'react';
import { Card, CardHeader, CardBody } from '../layout/Card.view';
import { BarChart3 } from 'lucide-react';

export interface GradeDistributionChartProps {
  assignments: any[];
  targetMark?: number | null;
  compact?: boolean;
}

function calculateGradeDistribution(assignments: any[]) {
  const distribution = {
    excellent: 0,
    good: 0,
    satisfactory: 0,
    poor: 0
  };

  assignments.forEach(assignment => {
    if (assignment.score !== null && assignment.score !== undefined) {
      if (assignment.score >= 80) {
        distribution.excellent++;
      } else if (assignment.score >= 60) {
        distribution.good++;
      } else if (assignment.score >= 40) {
        distribution.satisfactory++;
      } else {
        distribution.poor++;
      }
    }
  });

  return distribution;
}

function getTargetAnalysis(distribution: any, targetMark: number) {
  const total = Object.values(distribution).reduce((sum: number, count: any) => sum + count, 0);
  if (total === 0) return 'No graded assignments yet';
  
  const excellentRate = (distribution.excellent / total) * 100;
  const goodOrBetterRate = ((distribution.excellent + distribution.good) / total) * 100;
  
  if (targetMark >= 80 && excellentRate >= 50) {
    return 'Strong performance toward target';
  } else if (targetMark >= 60 && goodOrBetterRate >= 70) {
    return 'Good progress toward target';
  } else {
    return 'Consider improvement strategies';
  }
}

export function GradeDistributionChart({ assignments, targetMark }: GradeDistributionChartProps) {
  const gradedAssignments = assignments.filter(a => a.score !== null && a.score !== undefined);
  
  if (gradedAssignments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary-600" />
            <h3 className="font-medium">Grade Distribution</h3>
          </div>
        </CardHeader>
        <CardBody>
          <div className="text-center py-8">
            <div className="text-4xl mb-2">📊</div>
            <div className="text-sm text-slate-600">No graded assignments yet</div>
            <div className="text-xs text-slate-500 mt-1">Distribution will appear as assignments are graded</div>
          </div>
        </CardBody>
      </Card>
    );
  }
  
  const distribution = calculateGradeDistribution(gradedAssignments);
  const maxCount = Math.max(...Object.values(distribution));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary-600" />
          <h3 className="font-medium">Grade Distribution</h3>
        </div>
      </CardHeader>
      <CardBody>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Excellent (80-100%)', key: 'excellent' as keyof typeof distribution, color: 'bg-green-500' },
            { label: 'Good (60-79%)', key: 'good' as keyof typeof distribution, color: 'bg-blue-500' },
            { label: 'Satisfactory (40-59%)', key: 'satisfactory' as keyof typeof distribution, color: 'bg-yellow-500' },
            { label: 'Poor (0-39%)', key: 'poor' as keyof typeof distribution, color: 'bg-red-500' }
          ].map(({ label, key, color }) => (
            <div key={key} className="text-center">
              <div className="text-2xl font-bold mb-1">{distribution[key]}</div>
              <div className="w-full bg-slate-100 rounded-full h-2 mb-2">
                <div 
                  className={`h-2 rounded-full ${color} transition-all duration-500`}
                  style={{ width: `${maxCount > 0 ? (distribution[key] / maxCount) * 100 : 0}%` }}
                />
              </div>
              <div className="text-xs text-slate-600">{label}</div>
            </div>
          ))}
        </div>
        {targetMark && (
          <div className="mt-4 p-3 bg-primary-50 rounded-lg text-center">
            <div className="text-sm text-primary-700">
              <strong>Target: {targetMark}%</strong> - {getTargetAnalysis(distribution, targetMark)}
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
