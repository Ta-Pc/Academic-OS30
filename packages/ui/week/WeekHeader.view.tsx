import React from 'react';

export type WeekHeaderViewProps = {
  start: Date | string;
  end: Date | string;
  onPrev?: () => void;
  onNext?: () => void;
  onToday?: () => void;
};

export function WeekHeaderView({ start, end, onPrev, onNext, onToday }: WeekHeaderViewProps) {
  const s = new Date(start);
  const e = new Date(end);
  const label = `${s.toLocaleDateString()} – ${e.toLocaleDateString()}`;
  return (
    <header className="card">
      <div className="card-body flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">{label}</h2>
        <div className="flex items-center gap-2">
          <button className="btn btn-secondary" onClick={onPrev}>Prev</button>
          <button className="btn btn-secondary" onClick={onToday}>Today</button>
          <button className="btn btn-secondary" onClick={onNext}>Next</button>
        </div>
      </div>
    </header>
  );
}


