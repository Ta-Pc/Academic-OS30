import React from 'react';

export type ModuleQuickViewProps = {
  title: string;
  code: string;
  stats?: { average?: number | null; creditHours?: number | null };
};

export function ModuleQuickView({ title, code, stats }: ModuleQuickViewProps) {
  return (
    <div className="card">
      <div className="card-body">
        <div className="text-sm text-slate-600">{code}</div>
        <div className="text-lg font-semibold">{title}</div>
        {stats && (
          <div className="mt-2 text-sm text-slate-700">Avg: {stats.average ?? '—'}% · Credits: {stats.creditHours ?? '—'}</div>
        )}
      </div>
    </div>
  );
}


