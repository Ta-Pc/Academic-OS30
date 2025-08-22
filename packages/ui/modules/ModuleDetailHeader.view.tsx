import React from 'react';
import { Button } from '../forms/Button.view';
import { ArrowLeft, RefreshCw, Info } from 'lucide-react';

export interface ModuleDetailHeaderProps {
  header: { 
    code: string; 
    title: string; 
    credits?: number | null; 
    description?: string; 
    instructor?: string; 
  };
  onBackToWeek?: () => void;
  hasLastViewedWeek?: boolean;
  isRefreshing?: boolean;
  onRefresh?: () => void;
}

export function ModuleDetailHeader({ 
  header, 
  onBackToWeek, 
  hasLastViewedWeek, 
  isRefreshing, 
  onRefresh 
}: ModuleDetailHeaderProps) {
  return (
    <div className="sticky top-0 bg-white/80 backdrop-blur-sm z-10 pb-4 mb-2 border-b border-slate-100">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-primary-600">{header.code}</span>
            {header.credits && (
              <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                {header.credits} credits
              </span>
            )}
          </div>
          <h1 className="text-xl lg:text-2xl font-semibold text-slate-900 leading-tight">
            {header.title}
          </h1>
          {header.description && (
            <p className="text-sm text-slate-600 mt-1 line-clamp-2">
              {header.description}
            </p>
          )}
          {header.instructor && (
            <div className="flex items-center gap-1 mt-2 text-sm text-slate-500">
              <Info className="w-4 h-4" />
              <span>Instructor: {header.instructor}</span>
            </div>
          )}
        </div>
        
        <div className="flex gap-2 flex-shrink-0">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button variant="secondary" size="sm" onClick={onBackToWeek} testId="back-to-week">
            <ArrowLeft className="w-4 h-4 mr-1" />
            {hasLastViewedWeek ? 'Back to Week' : 'Week View'}
          </Button>
        </div>
      </div>
    </div>
  );
}
