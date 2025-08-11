import React from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

/**
 * Format date for week ranges consistently
 */
function formatWeekDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    timeZone: 'UTC',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Get a more descriptive week label
 */
function getWeekLabel(start: Date, end: Date): string {
  const today = new Date();
  const weekStart = new Date(start);
  const weekEnd = new Date(end);
  
  // Check if this week contains today
  if (today >= weekStart && today <= weekEnd) {
    return 'This Week';
  }
  
  // Check if it's next week
  const nextWeekStart = new Date(today);
  nextWeekStart.setDate(today.getDate() + (7 - today.getDay()));
  if (Math.abs(weekStart.getTime() - nextWeekStart.getTime()) < 7 * 24 * 60 * 60 * 1000) {
    return 'Next Week';
  }
  
  // Check if it's last week
  const lastWeekStart = new Date(today);
  lastWeekStart.setDate(today.getDate() - (today.getDay() + 7));
  if (Math.abs(weekStart.getTime() - lastWeekStart.getTime()) < 7 * 24 * 60 * 60 * 1000) {
    return 'Last Week';
  }
  
  return `${formatWeekDate(start)} – ${formatWeekDate(end)}`;
}

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
  const weekLabel = getWeekLabel(s, e);
  const dateRange = `${formatWeekDate(s)} – ${formatWeekDate(e)}`;
  
  // Keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent, action: () => void) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action();
    }
  };
  
  return (
    <header className="bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 rounded-xl shadow-sm">
      <div className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="p-2 bg-primary-100 rounded-lg" aria-hidden="true">
            <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-primary-600" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900" id="week-title">{weekLabel}</h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium" aria-describedby="week-title">{dateRange}</p>
          </div>
        </div>
        
        <nav className="flex items-center space-x-2 w-full sm:w-auto" role="navigation" aria-label="Week navigation">
          <button 
            className="flex items-center justify-center px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 flex-1 sm:flex-none" 
            onClick={onPrev}
            onKeyDown={(e) => handleKeyDown(e, onPrev || (() => {}))}
            title="Previous week"
            aria-label="Go to previous week"
          >
            <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" aria-hidden="true" />
            <span className="hidden sm:inline">Prev</span>
          </button>
          
          <button 
            className="flex items-center justify-center px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white bg-primary-600 border border-primary-600 rounded-lg hover:bg-primary-700 hover:border-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 shadow-sm flex-1 sm:flex-none" 
            onClick={onToday}
            onKeyDown={(e) => handleKeyDown(e, onToday || (() => {}))}
            title="Go to current week"
            aria-label="Go to current week"
          >
            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" aria-hidden="true" />
            Today
          </button>
          
          <button 
            className="flex items-center justify-center px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 flex-1 sm:flex-none" 
            onClick={onNext}
            onKeyDown={(e) => handleKeyDown(e, onNext || (() => {}))}
            title="Next week"
            aria-label="Go to next week"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 sm:ml-1" aria-hidden="true" />
          </button>
        </nav>
      </div>
    </header>
  );
}


