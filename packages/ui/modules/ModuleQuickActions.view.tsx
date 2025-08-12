import React from 'react';
import { Button } from '../forms/Button.view';
import { Calendar, Target, Download, BookOpen, TrendingUp } from 'lucide-react';

export interface ModuleQuickActionsProps {
  onScheduleStudy?: () => void;
  onSetGoals?: () => void;
  onExportReport?: () => void;
  onOpenWhatIf?: () => void;
  onViewAssignments?: () => void;
}

export function ModuleQuickActions({ 
  onScheduleStudy, 
  onSetGoals, 
  onExportReport, 
  onOpenWhatIf,
  onViewAssignments
}: ModuleQuickActionsProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <Button variant="secondary" size="sm" onClick={onScheduleStudy}>
        <Calendar className="w-4 h-4 mr-2" />
        Schedule Study
      </Button>
      <Button variant="secondary" size="sm" onClick={onSetGoals}>
        <Target className="w-4 h-4 mr-2" />
        Set Goals
      </Button>
      <Button variant="secondary" size="sm" onClick={onOpenWhatIf}>
        <TrendingUp className="w-4 h-4 mr-2" />
        What-If Analysis
      </Button>
      <Button variant="secondary" size="sm" onClick={onExportReport}>
        <Download className="w-4 h-4 mr-2" />
        Export Report
      </Button>
      <Button variant="ghost" size="sm" onClick={onViewAssignments}>
        <BookOpen className="w-4 h-4 mr-2" />
        All Assignments
      </Button>
    </div>
  );
}
