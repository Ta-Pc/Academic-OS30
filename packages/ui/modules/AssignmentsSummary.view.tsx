import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '../layout/Card.view';
import { Button } from '../forms/Button.view';
import { BookOpen, Eye, TrendingUp, Calendar, AlertCircle } from 'lucide-react';
import { AssignmentsModal } from './AssignmentsModal.view';

export interface Assignment {
  id: string;
  title: string;
  dueDate: string | null;
  status: string;
  weight: number;
  score: number | null;
}

export interface AssignmentsSummaryProps {
  assignments: Assignment[];
  onAssignmentEdit: (assignmentId: string, newScore: number) => void;
  moduleTargetMark?: number;
  isRefreshing?: boolean;
}

function getUrgentAssignments(assignments: Assignment[]) {
  const now = new Date();
  const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  return assignments.filter(assignment => {
    if (!assignment.dueDate) return false;
    const dueDate = new Date(assignment.dueDate);
    return (assignment.status === 'PENDING' || assignment.status === 'DUE') && dueDate <= oneWeekFromNow;
  });
}

function getRecentlyGraded(assignments: Assignment[]) {
  return assignments
    .filter(a => a.status === 'GRADED' && a.score !== null)
    .sort((a, b) => new Date(b.dueDate || '').getTime() - new Date(a.dueDate || '').getTime())
    .slice(0, 3);
}

export function AssignmentsSummary({ assignments, onAssignmentEdit, moduleTargetMark, isRefreshing }: AssignmentsSummaryProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const urgentAssignments = getUrgentAssignments(assignments);
  const recentlyGraded = getRecentlyGraded(assignments);
  
  const stats = {
    total: assignments.length,
    graded: assignments.filter(a => a.status === 'GRADED').length,
    pending: assignments.filter(a => a.status === 'PENDING').length,
    late: assignments.filter(a => a.status === 'LATE').length,
  };

  const completionRate = stats.total > 0 ? (stats.graded / stats.total) * 100 : 0;

  return (
    <>
      <section className={`space-y-4 ${isRefreshing ? 'opacity-60 pointer-events-none' : ''}`}>
        {/* Summary Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Assignments Overview</h2>
          <Button variant="secondary" size="sm" onClick={() => setIsModalOpen(true)}>
            <Eye className="w-4 h-4 mr-2" />
            View All ({stats.total})
          </Button>
        </div>

        <div className="space-y-6">
          {/* Top Row: Urgent and Recently Graded */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Urgent Assignments */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  <h3 className="font-medium">Urgent (Due Soon)</h3>
                </div>
              </CardHeader>
              <CardBody>
                {urgentAssignments.length === 0 ? (
                  <div className="text-center py-6">
                    <div className="text-3xl mb-2">✅</div>
                    <div className="text-sm text-slate-600">No urgent assignments</div>
                    <div className="text-xs text-slate-500 mt-1">You&apos;re all caught up!</div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {urgentAssignments.slice(0, 3).map(assignment => (
                      <div key={assignment.id} className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                        <div className="font-medium text-sm line-clamp-1 mb-1">{assignment.title}</div>
                        <div className="text-xs text-orange-700 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Due: {new Date(assignment.dueDate).toLocaleDateString()}
                        </div>
                        {assignment.weight && (
                          <div className="text-xs text-orange-600 mt-1">Weight: {assignment.weight}%</div>
                        )}
                      </div>
                    ))}
                    {urgentAssignments.length > 3 && (
                      <button 
                        onClick={() => setIsModalOpen(true)}
                        className="w-full text-sm text-orange-600 hover:text-orange-700 font-medium py-2 px-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
                      >
                        +{urgentAssignments.length - 3} more urgent
                      </button>
                    )}
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Recently Graded */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <h3 className="font-medium">Recently Graded</h3>
                </div>
              </CardHeader>
              <CardBody>
                {recentlyGraded.length === 0 ? (
                  <div className="text-center py-6">
                    <div className="text-3xl mb-2">📝</div>
                    <div className="text-sm text-slate-600">No graded assignments yet</div>
                    <div className="text-xs text-slate-500 mt-1">Grades will appear here</div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentlyGraded.map(assignment => (
                      <div key={assignment.id} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex justify-between items-start mb-1">
                          <div className="font-medium text-sm line-clamp-1 flex-1 mr-2">{assignment.title}</div>
                          <div className="font-semibold text-green-700 text-lg">{assignment.score}%</div>
                        </div>
                        <div className="text-xs text-green-600">Weight: {assignment.weight}%</div>
                        {assignment.dueDate && (
                          <div className="text-xs text-green-500 mt-1">
                            Completed: {new Date(assignment.dueDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          </div>

          {/* Bottom Row: Progress Summary (Full Width) */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary-600" />
                <h3 className="font-medium">Progress Summary</h3>
              </div>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Completion Rate */}
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary-600 mb-2">{Math.round(completionRate)}%</div>
                    <div className="text-sm text-slate-600">Completion Rate</div>
                  </div>
                  
                  <div className="w-full bg-slate-100 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${completionRate}%` }}
                    />
                  </div>
                </div>

                {/* Assignment Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-4 bg-green-50 rounded-lg border border-green-100">
                    <div className="font-bold text-green-700 text-2xl">{stats.graded}</div>
                    <div className="text-green-600 text-sm">Graded</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="font-bold text-blue-700 text-2xl">{stats.pending}</div>
                    <div className="text-blue-600 text-sm">Pending</div>
                  </div>
                </div>

                {/* Late Assignments or Summary */}
                <div className="flex items-center justify-center">
                  {stats.late > 0 ? (
                    <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200 w-full">
                      <div className="font-bold text-red-700 text-2xl">{stats.late}</div>
                      <div className="text-red-600 text-sm">Late</div>
                    </div>
                  ) : (
                    <div className="text-center p-4 bg-emerald-50 rounded-lg border border-emerald-200 w-full">
                      <div className="text-2xl mb-2">🎯</div>
                      <div className="text-sm text-emerald-700 font-medium">On Track</div>
                      <div className="text-xs text-emerald-600">No late assignments</div>
                    </div>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </section>

      {/* Assignments Modal */}
      <AssignmentsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        assignments={assignments}
        onAssignmentEdit={onAssignmentEdit}
        moduleTargetMark={moduleTargetMark}
      />
    </>
  );
}
