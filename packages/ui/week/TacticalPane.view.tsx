import React, { useState, useEffect } from 'react';
import { Plus, Target, Calendar, BookOpen, Zap } from 'lucide-react';

export type TacticalTask = {
  id: string;
  title: string;
  type: 'READ' | 'STUDY' | 'PRACTICE' | 'REVIEW' | 'ADMIN';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  dueDate: string;
  module: {
    id: string;
    code: string;
    title: string;
  };
};

export type TacticalPaneProps = {
  tasks: TacticalTask[];
  modules: Array<{ id: string; code: string; title: string }>;
  onTaskCreate?: (task: { title: string; type: string; dueDate: string; moduleId: string }) => Promise<void>;
  onTaskToggle?: (taskId: string) => Promise<void>;
  onRefresh?: () => void;
};

const TASK_TYPES = [
  { value: 'READ', label: 'Reading', icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
  { value: 'STUDY', label: 'Study', icon: Target, color: 'text-green-600', bg: 'bg-green-50' },
  { value: 'PRACTICE', label: 'Practice', icon: Zap, color: 'text-yellow-600', bg: 'bg-yellow-50' },
  { value: 'REVIEW', label: 'Review', icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-50' },
  { value: 'ADMIN', label: 'Admin', icon: Target, color: 'text-gray-600', bg: 'bg-gray-50' },
];

export function TacticalPaneView({ tasks, modules, onTaskCreate, onTaskToggle, onRefresh }: TacticalPaneProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    type: 'STUDY',
    dueDate: '',
    moduleId: '',
  });
  const [creating, setCreating] = useState(false);

  // Set default due date to tomorrow
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(18, 0, 0, 0); // Default to 6 PM
    setNewTask(prev => ({ 
      ...prev, 
      dueDate: tomorrow.toISOString().slice(0, 16),
      moduleId: modules[0]?.id || ''
    }));
  }, [modules]);

  const handleCreateTask = async () => {
    if (!newTask.title.trim() || !newTask.moduleId || !newTask.dueDate) return;
    
    setCreating(true);
    try {
      await onTaskCreate?.(newTask);
      setNewTask({ title: '', type: 'STUDY', dueDate: '', moduleId: modules[0]?.id || '' });
      setShowAddForm(false);
      onRefresh?.();
    } catch (error) {
      console.error('Failed to create task:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleToggleTask = async (taskId: string) => {
    try {
      await onTaskToggle?.(taskId);
      onRefresh?.();
    } catch (error) {
      console.error('Failed to toggle task:', error);
    }
  };

  const getTaskTypeConfig = (type: string) => {
    return TASK_TYPES.find(t => t.value === type) || TASK_TYPES[0];
  };

  const groupedTasks = TASK_TYPES.reduce((acc, type) => {
    acc[type.value] = tasks.filter(task => task.type === type.value);
    return acc;
  }, {} as Record<string, TacticalTask[]>);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 px-6 py-4 border-b border-indigo-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-200 rounded-lg">
              <Target className="h-5 w-5 text-indigo-700" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-indigo-900">Tactical Tasks</h3>
              <p className="text-sm text-indigo-700">Study and learning activities</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-indigo-200 hover:bg-indigo-300 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium transition-colors flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            Add Task
          </button>
        </div>
      </div>
      
      <div className="p-6 space-y-4">
        {/* Add Task Form */}
        {showAddForm && (
          <div className="bg-slate-50 rounded-lg p-4 space-y-3 border border-slate-200">
            <h4 className="font-medium text-slate-900">Create New Task</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Task Title</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter task description"
                  className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Module</label>
                <select
                  value={newTask.moduleId}
                  onChange={(e) => setNewTask(prev => ({ ...prev, moduleId: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {modules.map(module => (
                    <option key={module.id} value={module.id}>{module.code}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Task Type</label>
                <select
                  value={newTask.type}
                  onChange={(e) => setNewTask(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {TASK_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Due Date</label>
                <input
                  type="datetime-local"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1 text-sm text-slate-600 hover:text-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTask}
                disabled={creating || !newTask.title.trim() || !newTask.moduleId}
                className="px-4 py-1 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {creating ? 'Creating...' : 'Create Task'}
              </button>
            </div>
          </div>
        )}

        {/* Task Groups */}
        <div className="space-y-4">
          {TASK_TYPES.map(typeConfig => {
            const tasksOfType = groupedTasks[typeConfig.value] || [];
            const TypeIcon = typeConfig.icon;
            
            return (
              <div key={typeConfig.value} className="border border-slate-200 rounded-lg overflow-hidden">
                <div className={`${typeConfig.bg} px-3 py-2 border-b border-slate-200`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <TypeIcon className={`h-4 w-4 ${typeConfig.color}`} />
                      <span className="text-sm font-medium text-slate-700">{typeConfig.label}</span>
                    </div>
                    <span className="text-xs text-slate-500">{tasksOfType.length} task{tasksOfType.length !== 1 ? 's' : ''}</span>
                  </div>
                </div>
                
                <div className="divide-y divide-slate-200">
                  {tasksOfType.length === 0 ? (
                    <div className="px-3 py-4 text-sm text-slate-500 text-center">
                      No {typeConfig.label.toLowerCase()} tasks
                    </div>
                  ) : (
                    tasksOfType.map(task => (
                      <div key={task.id} className="px-3 py-3 hover:bg-slate-50 transition-colors">
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={task.status === 'COMPLETED'}
                            onChange={() => handleToggleTask(task.id)}
                            className="mt-0.5 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <div className={`text-sm font-medium ${task.status === 'COMPLETED' ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                              {task.title}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-slate-500">{task.module.code}</span>
                              <span className="text-xs text-slate-400">•</span>
                              <span className="text-xs text-slate-500">
                                {new Date(task.dueDate).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {tasks.length === 0 && !showAddForm && (
          <div className="text-center py-8">
            <Target className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <div className="text-sm font-medium text-slate-700 mb-1">No tactical tasks yet</div>
            <div className="text-xs text-slate-500 mb-4">Create your first study task to get started</div>
            <button
              onClick={() => setShowAddForm(true)}
              className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
            >
              Add your first task
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
