'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '../modals/Modal.view';
import { Card, CardBody } from '../layout/Card.view';
import { Button } from '../forms/Button.view';
import { Input, Select } from '../forms/Input.view';

export interface AssignmentEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignmentId: string | null;
  onSave?: () => void;
}

interface Assignment {
  id: string;
  title: string;
  score: number | null;
  weight: number;
  dueDate: string | null;
  status: 'PENDING' | 'DUE' | 'LATE' | 'GRADED';
  module: {
    code: string;
    title: string;
  };
}

export function AssignmentEditModal({ isOpen, onClose, assignmentId, onSave }: AssignmentEditModalProps) {
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [score, setScore] = useState<string>('');
  const [status, setStatus] = useState<string>('PENDING');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Load assignment data when modal opens
  useEffect(() => {
    if (isOpen && assignmentId) {
      loadAssignment();
    }
  }, [isOpen, assignmentId]);

  const loadAssignment = async () => {
    if (!assignmentId) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/assignments/${assignmentId}`);
      const data = await response.json();
      
      if (response.ok) {
        setAssignment(data.assignment);
        setScore(data.assignment.score?.toString() || '');
        setStatus(data.assignment.status || 'PENDING');
      } else {
        setError(data.error || 'Failed to load assignment');
      }
    } catch (error) {
      console.error('Failed to load assignment:', error);
      setError('Failed to load assignment');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!assignmentId) return;
    
    setLoading(true);
    setError('');
    
    try {
      const updateData: any = {};
      
      // Only include score if it's provided and valid
      if (score.trim()) {
        const scoreNum = parseFloat(score);
        if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 100) {
          setError('Score must be a number between 0 and 100');
          setLoading(false);
          return;
        }
        updateData.score = scoreNum;
      } else {
        updateData.score = null; // Clear score
      }
      
      const response = await fetch(`/api/assignments/${assignmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        onSave?.();
        onClose();
      } else {
        setError(data.error || 'Failed to update assignment');
      }
    } catch (error) {
      console.error('Failed to update assignment:', error);
      setError('Failed to update assignment');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setScore('');
    setStatus('PENDING');
    setError('');
    setAssignment(null);
    onClose();
  };

  if (!isOpen || !assignmentId) return null;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      title="Edit Assignment Grade" 
      size="md"
    >
      <div className="space-y-6">
        {loading && (
          <div className="text-center py-8">
            <div className="text-slate-600">Loading assignment...</div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-red-700 text-sm">{error}</div>
          </div>
        )}

        {assignment && !loading && (
          <Card>
            <CardBody>
              <div className="space-y-4">
                {/* Assignment Info */}
                <div className="border-b border-slate-200 pb-4">
                  <h3 className="font-semibold text-slate-900">{assignment.title}</h3>
                  <div className="text-sm text-slate-600 mt-1">
                    <span className="font-medium">{assignment.module.code}</span> - {assignment.module.title}
                  </div>
                  <div className="text-sm text-slate-500 mt-1">
                    Weight: {assignment.weight}% 
                    {assignment.dueDate && (
                      <span className="ml-4">
                        Due: {new Date(assignment.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Grade Input */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Grade (0-100%)
                  </label>
                  <Input
                    type="number"
                    value={score}
                    onChange={setScore}
                    placeholder="Enter grade (leave empty to clear)"
                  />
                  <div className="text-xs text-slate-500 mt-1">
                    Enter a grade to mark as completed, or leave empty to mark as pending
                  </div>
                </div>

                {/* Current Status */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Current Status
                  </label>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    assignment.status === 'GRADED' ? 'bg-green-100 text-green-800' :
                    assignment.status === 'LATE' ? 'bg-red-100 text-red-800' :
                    assignment.status === 'DUE' ? 'bg-orange-100 text-orange-800' :
                    'bg-slate-100 text-slate-800'
                  }`}>
                    {assignment.status.replace('_', ' ')}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Status will update automatically based on grade and due date
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          <Button
            variant="ghost"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            loading={loading}
            disabled={!assignment}
          >
            Save Grade
          </Button>
        </div>
      </div>
    </Modal>
  );
}
