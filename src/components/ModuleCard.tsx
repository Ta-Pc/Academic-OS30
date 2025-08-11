import React from 'react';
import { formatDate } from '@/utils/date-format';
type Module = { id: string; code: string; title: string; creditHours: number; createdAt: string | Date };
import Link from 'next/link';

export type ModuleCardProps = {
  module: Pick<Module, 'id' | 'code' | 'title' | 'creditHours' | 'createdAt'> & {
    currentGrade?: number; // Σ (grade% * weight)
    currentAverageMark?: number; // avg of graded percents
  };
};

function TrendIcon({ value }: { value: number | undefined }) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  const isGood = value >= 50;
  return (
    <span className={`ml-2 inline-flex items-center text-xs font-medium ${isGood ? 'text-success-600' : 'text-danger-600'}`}>
      {isGood ? '▲' : '▼'}
    </span>
  );
}

function ProgressBar({ percent }: { percent: number }) {
  const clamped = Math.max(0, Math.min(100, Math.round(percent)));
  const color = clamped >= 70 ? 'bg-success-500' : clamped >= 50 ? 'bg-warning-500' : 'bg-danger-500';
  return (
    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
      <div className={`h-full ${color}`} style={{ width: `${clamped}%` }} />
    </div>
  );
}

export default function ModuleCard({ module }: ModuleCardProps) {
  const gradeContribution = typeof module.currentGrade === 'number' ? Math.round(module.currentGrade * 10) / 10 : null;
  const avgMark = typeof module.currentAverageMark === 'number' ? Math.round(module.currentAverageMark) : null;

  return (
    <Link href={`/modules/${module.id}`} className="block">
      <article className="card hover:shadow transition">
        <div className="card-body">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h3 className="truncate">
                <span className="text-slate-900 font-semibold">{module.code}</span>
                <span className="text-slate-500"> — {module.title}</span>
              </h3>
              <p className="text-sm text-slate-600 mt-0.5">{module.creditHours} credits</p>
            </div>
            <div className="text-xs text-slate-500 whitespace-nowrap">{formatDate(module.createdAt)}</div>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-700">Average</div>
              <div className="text-sm font-medium text-slate-900">
                {avgMark != null ? `${avgMark}%` : '—'}
                <TrendIcon value={avgMark ?? undefined} />
              </div>
            </div>
            <ProgressBar percent={avgMark ?? 0} />

            {gradeContribution != null && (
              <div className="text-xs text-slate-500">Contribution to final: {gradeContribution}%</div>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}

