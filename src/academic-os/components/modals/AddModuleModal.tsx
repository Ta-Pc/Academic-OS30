'use client';
// AcademicOS Flow Composition
import React, { useState, useRef, useEffect } from 'react';
import { useAcademicOS } from '../../context/AcademicOSContext';

/**
 * Add Module Modal - creates new modules with enhanced UX.
 * Follows existing modal patterns from Academic OS.
 */
export function AddModuleModal() {
  const { closeModal } = useAcademicOS();
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [creditHours, setCreditHours] = useState(12);
  const [targetMark, setTargetMark] = useState<number | null>(75);
  const [department, setDepartment] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError('Module code is required');
      return;
    }

    setSaving(true);
    setError(null);
    
    try {
      const response = await fetch('/api/modules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.trim(),
          title: (title.trim() || code.trim()),
          creditHours: Number(creditHours) || 12,
          targetMark: targetMark || null,
          department: department.trim() || null,
          status: 'ACTIVE'
        })
      });
      
      const result = await response.json();
      if (response.ok) {
        setSuccess(true);
        // Show success briefly, then close
        setTimeout(() => {
          closeModal();
          // Refresh page to show new module
          window.location.reload();
        }, 1000);
      } else {
        setError(result.error || 'Failed to create module');
      }
    } catch {
      setError('Failed to create module');
    } finally {
      setSaving(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
          <div className="text-4xl mb-4">✅</div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Module Created!</h3>
          <p className="text-slate-600">Your new module has been added successfully.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-100 px-6 py-4 border-b border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-200 rounded-lg">
                <span className="text-xl">📚</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-blue-900">Add New Module</h3>
                <p className="text-sm text-blue-700">Create a new academic module</p>
              </div>
            </div>
            <button
              onClick={closeModal}
              className="text-blue-600 hover:text-blue-800 text-xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Module Code */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Module Code *
              </label>
              <input
                ref={inputRef}
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. INF 164, STK 110"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Module Title */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Module Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Optional - leave blank to use code"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Credit Hours and Target Mark */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Credit Hours
                </label>
                <input
                  type="number"
                  value={creditHours}
                  onChange={(e) => setCreditHours(parseInt(e.target.value) || 12)}
                  min="1"
                  max="50"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Target Mark (%)
                </label>
                <input
                  type="number"
                  value={targetMark || ''}
                  onChange={(e) => setTargetMark(e.target.value ? parseInt(e.target.value) : null)}
                  min="0"
                  max="100"
                  placeholder="Optional"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Department
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Computer Science, Statistics"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Error Display */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={closeModal}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || !code.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <span>📚</span>
                    Create Module
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
