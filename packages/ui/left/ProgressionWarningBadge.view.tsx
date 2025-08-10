"use client";
import React from 'react';

export interface ProgressionWarningBadgeProps {
  warnings: string[];
  onOpenDetails?: () => void;
}

/**
 * ProgressionWarningBadge shows a warning indicator when progression issues exist.
 * Clicking opens the ProgressionDetail modal with remediation steps.
 */
export function ProgressionWarningBadgeView({ warnings, onOpenDetails }: ProgressionWarningBadgeProps) {
  if (warnings.length === 0) {
    return (
      <div className="card border-emerald-200 bg-emerald-50">
        <div className="card-body py-2">
          <div className="flex items-center space-x-2">
            <div className="flex-shrink-0">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            </div>
            <div className="text-sm text-emerald-700 font-medium">
              On Track
            </div>
          </div>
        </div>
      </div>
    );
  }

  const severityLevel = getSeverityLevel(warnings);
  const { bgColor, borderColor, textColor, iconColor, icon } = getSeverityStyles(severityLevel);

  return (
    <button
      type="button"
      onClick={onOpenDetails}
      className={`w-full card ${borderColor} ${bgColor} hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500`}
    >
      <div className="card-body py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex-shrink-0">
              <div className={`w-2 h-2 ${iconColor} rounded-full`}></div>
            </div>
            <div className={`text-sm font-medium ${textColor}`}>
              {warnings.length} Warning{warnings.length !== 1 ? 's' : ''}
            </div>
          </div>
          <div className={`text-xs ${textColor} opacity-75`}>
            {icon} Click for details
          </div>
        </div>
        
        {/* Preview of first warning */}
        <div className={`mt-1 text-xs ${textColor} opacity-90 truncate`}>
          {warnings[0]}
        </div>
      </div>
    </button>
  );
}

function getSeverityLevel(warnings: string[]): 'low' | 'medium' | 'high' {
  const highSeverityKeywords = ['at risk', 'overdue', 'concerning'];
  const mediumSeverityKeywords = ['behind schedule'];
  
  const hasHighSeverity = warnings.some(warning => 
    highSeverityKeywords.some(keyword => warning.toLowerCase().includes(keyword))
  );
  
  if (hasHighSeverity) return 'high';
  
  const hasMediumSeverity = warnings.some(warning =>
    mediumSeverityKeywords.some(keyword => warning.toLowerCase().includes(keyword))
  );
  
  if (hasMediumSeverity) return 'medium';
  
  return 'low';
}

function getSeverityStyles(severity: 'low' | 'medium' | 'high') {
  switch (severity) {
    case 'high':
      return {
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-800',
        iconColor: 'bg-red-500',
        icon: '🚨'
      };
    case 'medium':
      return {
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        textColor: 'text-amber-800',
        iconColor: 'bg-amber-500',
        icon: '⚠️'
      };
    case 'low':
    default:
      return {
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-800',
        iconColor: 'bg-blue-500',
        icon: 'ℹ️'
      };
  }
}
