export default function PerformanceGauge({ minutes }: { minutes: number }) {
  const hours = Math.round((minutes / 60) * 10) / 10;
  return (
    <div className="card">
      <div className="card-body">
        <div className="text-sm text-slate-600">Study this week</div>
        <div className="mt-1 text-2xl font-semibold text-slate-900">{hours} hrs</div>
        <div className="mt-2 h-2 w-full bg-slate-200 rounded-full overflow-hidden">
          <div className="h-full bg-primary-500" style={{ width: `${Math.min(100, (minutes / (7 * 60 * 2)) * 100)}%` }} />
        </div>
      </div>
    </div>
  );
}


