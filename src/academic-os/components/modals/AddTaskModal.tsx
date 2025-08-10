'use client';
// AcademicOS Flow Composition
import React, { useState, useRef, useEffect } from 'react';
import { useAcademicOS } from '../../context/AcademicOSContext';

/**
 * Add Task Modal - creates new tactical tasks.
 * Follows existing modal patterns from EditAssignmentModal.
 */
export function AddTaskModal() {
  const { closeModal } = useAcademicOS();
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'READ' | 'STUDY' | 'PRACTICE' | 'REVIEW' | 'ADMIN'>('STUDY');
  const [dueDate, setDueDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const inputRef = useRef<HTMLInputElement | null>(null);
  const lastActive = useRef<HTMLElement | null>(null);

  // Focus management (copied from existing modal pattern)
  useEffect(() => {
    lastActive.current = document.activeElement as HTMLElement;
    setTimeout(() => inputRef.current?.focus(), 20);
    
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeModal();
      }
    };
    
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      if (lastActive.current) {
        lastActive.current.focus();
      }
    };
  }, [closeModal]);

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }
    
    if (!dueDate) {
      setError('Due date is required');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // This would call an API to create the task
      // For now, we'll just simulate the API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // TODO: Implement actual task creation API call
      console.log('Creating task:', { title, type, dueDate });
      
      closeModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="addTaskHeading">
      <div className="absolute inset-0 bg-slate-900/40" onClick={() => !saving && closeModal()} />
      <div className="absolute inset-0 overflow-y-auto p-4 flex items-center justify-center">
        <div className="card w-full max-w-md shadow-xl">
          <div className="card-header flex items-center justify-between">
            <h2 id="addTaskHeading" className="text-sm font-semibold text-slate-700">Add New Task</h2>
            <button 
              className="btn btn-secondary btn-sm" 
              onClick={closeModal}
              disabled={saving}
              aria-label="Close add task modal"
            >
              ×
            </button>
          </div>
          
          <div className="card-body space-y-4" data-testid="academicos-task-modal">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Task Title
              </label>
              <input
                ref={inputRef}
                type="text"
                className="input w-full"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter task description"
                disabled={saving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Task Type
              </label>
              <select
                className="select w-full"
                value={type}
                onChange={(e) => setType(e.target.value as 'READ' | 'STUDY' | 'PRACTICE' | 'REVIEW' | 'ADMIN')}
                disabled={saving}
              >
                <option value="READ">Reading</option>
                <option value="STUDY">Study Session</option>
                <option value="PRACTICE">Practice/Homework</option>
                <option value="REVIEW">Review Material</option>
                <option value="ADMIN">Administrative</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Due Date
              </label>
              <input
                type="datetime-local"
                className="input w-full"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                disabled={saving}
              />
            </div>

            {error && (
              <div className="text-danger-600 text-sm" role="alert">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button 
                className="btn btn-ghost" 
                onClick={closeModal}
                disabled={saving}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleSave}
                disabled={saving}
                data-testid="academicos-task-save"
              >
                {saving ? 'Creating...' : 'Create Task'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
