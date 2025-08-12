import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '../layout/Card.view';
import { Button } from '../forms/Button.view';
import { Clock, CheckCircle, AlertCircle, Calendar, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

export interface AssignmentTimelineProps {
  assignments: any[];
  currentDate: Date;
  maxVisible?: number;
}

function formatDateTime(dateString: string | null) {
  if (!dateString) return 'No due date';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getStatusColor(assignment: any) {
  switch (assignment.status) {
    case 'GRADED':
      return 'bg-green-500';
    case 'LATE':
      return 'bg-red-500';
    case 'DUE':
      return 'bg-orange-500';
    default:
      return 'bg-blue-500';
  }
}

function getStatusIcon(assignment: any) {
  switch (assignment.status) {
    case 'GRADED':
      return <CheckCircle className="w-3 h-3 text-green-600" />;
    case 'LATE':
      return <AlertCircle className="w-3 h-3 text-red-600" />;
    case 'DUE':
      return <Clock className="w-3 h-3 text-orange-600" />;
    default:
      return <Clock className="w-3 h-3 text-blue-600" />;
  }
}

export function AssignmentTimeline({ assignments, currentDate, maxVisible = 6 }: AssignmentTimelineProps) {
  const [startIndex, setStartIndex] = useState(0);

  const sortedAssignments = [...assignments].sort((a, b) => {
    const dateA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
    const dateB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
    return dateA - dateB;
  });

  if (assignments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary-600" />
            <h3 className="font-medium">Assignment Timeline</h3>
          </div>
        </CardHeader>
        <CardBody>
          <div className="text-center py-6">
            <div className="text-3xl mb-2">📅</div>
            <div className="text-sm text-slate-600">No assignments scheduled</div>
          </div>
        </CardBody>
      </Card>
    );
  }

  const visibleAssignments = sortedAssignments.slice(startIndex, startIndex + maxVisible);
  const canGoPrev = startIndex > 0;
  const canGoNext = startIndex + maxVisible < sortedAssignments.length;

  const handlePrev = () => {
    if (canGoPrev) {
      setStartIndex(Math.max(0, startIndex - maxVisible));
    }
  };

  const handleNext = () => {
    if (canGoNext) {
      setStartIndex(startIndex + maxVisible);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary-600" />
            <h3 className="font-medium">Assignment Timeline</h3>
            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
              {assignments.length} total
            </span>
          </div>
          
          {assignments.length > maxVisible && (
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handlePrev}
                disabled={!canGoPrev}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-xs text-slate-500 px-2">
                {startIndex + 1}-{Math.min(startIndex + maxVisible, assignments.length)} of {assignments.length}
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleNext}
                disabled={!canGoNext}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardBody>
        {/* Horizontal Timeline */}
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute top-6 left-6 right-6 h-0.5 bg-slate-200"></div>
          
          {/* Timeline Items */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {visibleAssignments.map((assignment, index) => (
              <div key={assignment.id} className="relative">
                {/* Timeline Dot */}
                <div className="absolute top-5 left-1/2 transform -translate-x-1/2 z-10">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(assignment)} border-2 border-white shadow-sm`}></div>
                </div>
                
                {/* Assignment Card */}
                <div className="bg-white border border-slate-200 rounded-lg p-3 mt-8 shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-center">
                    <div className="text-xs text-slate-500 mb-1">
                      {formatDateTime(assignment.dueDate)}
                    </div>
                    <h4 className="font-medium text-xs leading-tight mb-2 line-clamp-2">
                      {assignment.title}
                    </h4>
                    <div className="flex items-center justify-center gap-1 mb-1">
                      {getStatusIcon(assignment)}
                      <span className="text-xs text-slate-600">
                        {assignment.weight}%
                      </span>
                    </div>
                    <div className="text-xs">
                      {assignment.score !== null && assignment.score !== undefined 
                        ? <span className="font-medium text-green-600">{assignment.score}%</span>
                        : <span className="text-slate-500">Not graded</span>
                      }
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Show More Indicator */}
          {canGoNext && (
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
              <div className="bg-slate-100 rounded-full p-2">
                <MoreHorizontal className="w-4 h-4 text-slate-500" />
              </div>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
