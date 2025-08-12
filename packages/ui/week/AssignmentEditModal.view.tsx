'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '../modals/Modal.view';
import { Card, CardBody } from '../layout/Card.view';
import { Button } from '../forms/Button.view';
import { Input } from '../forms/Input.view';

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
  status: 'PENDING' | 'DUE' | 'COMPLETE' | 'GRADED' | 'MISSED';
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
      if (!response.ok) throw new Error('Failed to fetch assignment');
      const data = await response.json();
      setAssignment(data.assignment);
      setScore(data.assignment.score?.toString() || '');
      setStatus(data.assignment.status || 'PENDING');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (updateData: { score?: number | null; status?: string }) => {
    if (!assignmentId) return;
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/assignments/${assignmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update assignment');
      }
      onSave?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGrade = () => {
    if (score.trim() === '') {
      handleUpdate({ score: null });
      return;
    }
    const scoreNum = parseFloat(score);
    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 100) {
      setError('Score must be a number between 0 and 100.');
      return;
    }
    handleUpdate({ score: scoreNum });
  };

  const handleMarkAsComplete = () => handleUpdate({ status: 'COMPLETE' });
  const handleMarkAsMissed = () => handleUpdate({ status: 'MISSED' });

  const handleClose = () => {
    setScore('');
    setStatus('PENDING');
    setError('');
    setAssignment(null);
    onClose();
  };

  if (!isOpen || !assignmentId) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Edit Assignment" size="md">
      <div className="space-y-6">
        {loading && <div className="text-center py-8 text-slate-600">Loading assignment...</div>}
        {error && <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">{error}</div>}
        {assignment && !loading && (
          <Card>
            <CardBody>
              <div className="space-y-4">
                <div className="border-b border-slate-200 pb-4">
                  <h3 className="font-semibold text-slate-900">{assignment.title}</h3>
                  <div className="text-sm text-slate-600 mt-1">
                    <span className="font-medium">{assignment.module.code}</span> - {assignment.module.title}
                  </div>
                  <div className="text-sm text-slate-500 mt-1">
                    Weight: {assignment.weight}%
                    {assignment.dueDate && <span className="ml-4">Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Grade (0-100%)</label>
                  <Input type="number" value={score} onChange={setScore} placeholder="Enter grade to mark as GRADED" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Current Status</label>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    assignment.status === 'GRADED' ? 'bg-green-100 text-green-800' :
                    assignment.status === 'COMPLETE' ? 'bg-blue-100 text-blue-800' :
                    assignment.status === 'MISSED' ? 'bg-red-100 text-red-800' :
                    assignment.status === 'DUE' ? 'bg-orange-100 text-orange-800' : 'bg-slate-100 text-slate-800'
                  }`}>
                    {assignment.status.replace('_', ' ')}
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        )}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={handleClose} disabled={loading}>Cancel</Button>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleMarkAsMissed} loading={loading} disabled={!assignment || !!score}>Mark as Missed</Button>
            <Button variant="secondary" onClick={handleMarkAsComplete} loading={loading} disabled={!assignment || assignment.status === 'COMPLETE' || !!score}>Mark as Complete</Button>
            <Button variant="primary" onClick={handleSaveGrade} loading={loading} disabled={!assignment || !score}>Save Grade</Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
