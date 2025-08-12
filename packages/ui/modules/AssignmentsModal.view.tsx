import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '../layout/Card.view';
import { Button } from '../forms/Button.view';
import { X, Edit3, Calendar, TrendingUp, Filter, Grid, List } from 'lucide-react';

export interface AssignmentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignments: any[];
  onAssignmentEdit: (assignmentId: string, newScore: number) => void;
  moduleTargetMark?: number;
}

function formatDateTime(dateString: string | null) {
  if (!dateString) return 'No due date';
  return new Date(dateString).toLocaleDateString();
}

function getStatusColor(status: string) {
  switch (status) {
    case 'GRADED': return 'bg-green-100 text-green-800 border-green-200';
    case 'LATE': return 'bg-red-100 text-red-800 border-red-200';
    case 'DUE': return 'bg-orange-100 text-orange-800 border-orange-200';
    default: return 'bg-blue-100 text-blue-800 border-blue-200';
  }
}

function AssignmentCard({ assignment, onEdit, moduleTargetMark }: { assignment: any; onEdit: (id: string) => void; moduleTargetMark?: number }) {
  return (
    <Card hover className="h-full">
      <CardBody>
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-medium text-sm line-clamp-2">{assignment.title}</h3>
          <Button variant="ghost" size="sm" onClick={() => onEdit(assignment.id)}>
            <Edit3 className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-600">Score</span>
            <span className="font-semibold text-sm">
              {assignment.score !== null ? `${assignment.score}%` : 'Not graded'}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-600">Weight</span>
            <span className="font-medium text-sm">{assignment.weight}%</span>
          </div>
          
          {assignment.dueDate && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Calendar className="w-3 h-3" />
              <span>{formatDateTime(assignment.dueDate)}</span>
            </div>
          )}
          
          <div className="pt-2">
            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(assignment.status)}`}>
              {assignment.status}
            </span>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

export function AssignmentsModal({ isOpen, onClose, assignments, onAssignmentEdit, moduleTargetMark }: AssignmentsModalProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'weight' | 'status'>('dueDate');

  if (!isOpen) return null;

  // Filter and sort assignments
  let filteredAssignments = assignments;
  
  if (filterStatus !== 'all') {
    filteredAssignments = assignments.filter(a => a.status === filterStatus);
  }
  
  filteredAssignments = [...filteredAssignments].sort((a, b) => {
    switch (sortBy) {
      case 'dueDate':
        return new Date(a.dueDate || '').getTime() - new Date(b.dueDate || '').getTime();
      case 'weight':
        return b.weight - a.weight;
      case 'status':
        return a.status.localeCompare(b.status);
      default:
        return 0;
    }
  });

  const statusCounts = {
    all: assignments.length,
    PENDING: assignments.filter(a => a.status === 'PENDING').length,
    DUE: assignments.filter(a => a.status === 'DUE').length,
    GRADED: assignments.filter(a => a.status === 'GRADED').length,
    LATE: assignments.filter(a => a.status === 'LATE').length,
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-semibold">All Assignments</h2>
            <p className="text-sm text-slate-600">{assignments.length} total assignments</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Filters and Controls */}
        <div className="p-6 border-b border-slate-100 bg-slate-50">
          <div className="flex flex-wrap items-center gap-4">
            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <div className="flex gap-1">
                {Object.entries(statusCounts).map(([status, count]) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      filterStatus === status
                        ? 'bg-primary-100 text-primary-700 border border-primary-200'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {status === 'all' ? 'All' : status} ({count})
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Options */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1 rounded-lg border border-slate-200 text-sm bg-white"
            >
              <option value="dueDate">Sort by Due Date</option>
              <option value="weight">Sort by Weight</option>
              <option value="status">Sort by Status</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex border border-slate-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-primary-50 text-primary-600' : 'bg-white text-slate-600'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-primary-50 text-primary-600' : 'bg-white text-slate-600'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {filteredAssignments.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-2">📝</div>
              <div className="text-lg font-medium text-slate-700 mb-1">No assignments found</div>
              <div className="text-sm text-slate-500">Try adjusting your filters</div>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredAssignments.map(assignment => (
                <AssignmentCard
                  key={assignment.id}
                  assignment={assignment}
                  onEdit={(id) => {
                    onAssignmentEdit(id, assignment.score || 0);
                    // Note: In real implementation, this would open an edit modal
                  }}
                  moduleTargetMark={moduleTargetMark}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredAssignments.map(assignment => (
                <div key={assignment.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{assignment.title}</div>
                    <div className="text-xs text-slate-500">
                      Due: {formatDateTime(assignment.dueDate)} • Weight: {assignment.weight}%
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(assignment.status)}`}>
                      {assignment.status}
                    </span>
                    <span className="font-semibold text-sm">
                      {assignment.score !== null ? `${assignment.score}%` : 'Not graded'}
                    </span>
                    <Button variant="ghost" size="sm" onClick={() => onAssignmentEdit(assignment.id, assignment.score || 0)}>
                      <Edit3 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 bg-slate-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-slate-600">
              Showing {filteredAssignments.length} of {assignments.length} assignments
            </div>
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
