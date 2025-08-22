'use client';
import React, { useState, useEffect } from 'react';
import { AcademicOSProvider } from '../context/AcademicOSContext';

// Import the enhanced settings container
import { SettingsViewContainer } from './views/SettingsViewContainer';
import { WeeklyViewContainer } from './views/WeeklyViewContainer';

// Types for our simplified navigation
type ViewType = 'dashboard' | 'modules' | 'weekly' | 'settings';
type Module = {
  id: string;
  code: string;
  title: string;
  creditHours: number;
  currentGrade: number;
  targetGrade: number;
  assignments: Assignment[];
  color: string;
};

type Assignment = {
  id: string;
  title: string;
  dueDate: string;
  weight: number;
  score?: number;
  status: 'pending' | 'submitted' | 'graded';
};

type Task = {
  id: string;
  title: string;
  moduleCode: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  dueDate: string;
};

// Navigation Component
const Navigation: React.FC<{
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}> = ({ currentView, onViewChange }) => {
  const navItems: { view: ViewType; label: string; icon: string }[] = [
    { view: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { view: 'weekly', label: 'Weekly', icon: '📅' },
    { view: 'modules', label: 'Modules', icon: '📚' },
    { view: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg"></div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Academic OS
              </span>
            </div>
            
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <button
                  key={item.view}
                  onClick={() => onViewChange(item.view)}
                  className={`
                    relative px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200
                    ${currentView === item.view 
                      ? 'text-indigo-600 bg-indigo-100' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }
                  `}
                >
                  <span className="flex items-center space-x-2">
                    <span className="text-lg">{item.icon}</span>
                    <span>{item.label}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
              <span className="text-xl">🔔</span>
            </button>
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full"></div>
          </div>
        </div>
      </div>
    </nav>
  );
};

// Dashboard View
const DashboardView: React.FC<{
  modules: Module[];
  tasks: Task[];
  onModuleClick: (moduleId: string) => void;
}> = ({ modules, tasks, onModuleClick }) => {
  const overallGrade = modules.reduce((sum, m) => sum + m.currentGrade, 0) / modules.length || 0;
  const upcomingDeadlines = tasks.filter(t => !t.completed).slice(0, 5);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white transform hover:scale-105 transition-transform">
          <div className="text-sm opacity-90">Overall Grade</div>
          <div className="text-3xl font-bold mt-2">{overallGrade.toFixed(1)}%</div>
          <div className="text-xs opacity-75 mt-1">Across all modules</div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white transform hover:scale-105 transition-transform">
          <div className="text-sm opacity-90">Active Modules</div>
          <div className="text-3xl font-bold mt-2">{modules.length}</div>
          <div className="text-xs opacity-75 mt-1">Currently enrolled</div>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white transform hover:scale-105 transition-transform">
          <div className="text-sm opacity-90">Pending Tasks</div>
          <div className="text-3xl font-bold mt-2">{tasks.filter(t => !t.completed).length}</div>
          <div className="text-xs opacity-75 mt-1">To complete</div>
        </div>

        <div className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl p-6 text-white transform hover:scale-105 transition-transform">
          <div className="text-sm opacity-90">This Week</div>
          <div className="text-3xl font-bold mt-2">{upcomingDeadlines.length}</div>
          <div className="text-xs opacity-75 mt-1">Deadlines</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Modules Overview */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Your Modules</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {modules.map((module) => (
              <div
                key={module.id}
                onClick={() => onModuleClick(module.id)}
                className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg hover:border-indigo-300 transition-all duration-200 cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div 
                    className="px-3 py-1 rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: module.color }}
                  >
                    {module.code}
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-slate-900">{module.currentGrade}%</div>
                    <div className="text-xs text-slate-500">current</div>
                  </div>
                </div>
                
                <h3 className="font-semibold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                  {module.title}
                </h3>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">{module.creditHours} credits</span>
                  <span className="text-indigo-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    View →
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mt-3">
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                      style={{ width: `${module.currentGrade}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Priority Tasks</h2>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            {upcomingDeadlines.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {upcomingDeadlines.map((task) => (
                  <div key={task.id} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => {}}
                        className="mt-1 w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-slate-900">{task.title}</div>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs font-medium text-indigo-600">{task.moduleCode}</span>
                          <span className="text-xs text-slate-400">•</span>
                          <span className="text-xs text-slate-500">
                            {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <span className={`
                        px-2 py-1 rounded-full text-xs font-medium
                        ${task.priority === 'high' ? 'bg-red-100 text-red-700' :
                          task.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                          'bg-slate-100 text-slate-700'}
                      `}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="text-3xl mb-2">🎉</div>
                <div className="text-slate-600">All caught up!</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Module Detail View
const ModuleDetailView: React.FC<{
  module: Module;
  onBack: () => void;
}> = ({ module, onBack }) => {
  const completedAssignments = module.assignments.filter(a => a.status === 'graded').length;
  const averageScore = module.assignments
    .filter(a => a.score !== undefined)
    .reduce((sum, a) => sum + (a.score || 0), 0) / module.assignments.filter(a => a.score !== undefined).length || 0;

      // Fetch assignments when module is selected
      useEffect(() => {
        const fetchAssignments = async () => {
          try {
            const response = await fetch(`/api/modules/${module.id}/analytics`);
            if (response.ok) {
              // Update module assignments here if needed
            }
          } catch (error) {
            console.error('Failed to fetch assignments:', error);
          }
        };
        
        fetchAssignments();
      }, [module.id]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onBack}
          className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-slate-900">{module.code}</h1>
            <span 
              className="px-3 py-1 rounded-full text-xs font-bold text-white"
              style={{ backgroundColor: module.color }}
            >
              {module.creditHours} credits
            </span>
          </div>
          <p className="text-slate-600 mt-1">{module.title}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-4 border border-indigo-200">
          <div className="text-sm text-indigo-700">Current Grade</div>
          <div className="text-2xl font-bold text-indigo-900 mt-1">{module.currentGrade}%</div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-xl p-4 border border-purple-200">
          <div className="text-sm text-purple-700">Target Grade</div>
          <div className="text-2xl font-bold text-purple-900 mt-1">{module.targetGrade}%</div>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-green-100 rounded-xl p-4 border border-emerald-200">
          <div className="text-sm text-emerald-700">Average Score</div>
          <div className="text-2xl font-bold text-emerald-900 mt-1">{averageScore.toFixed(1)}%</div>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-orange-100 rounded-xl p-4 border border-amber-200">
          <div className="text-sm text-amber-700">Completed</div>
          <div className="text-2xl font-bold text-amber-900 mt-1">
            {completedAssignments}/{module.assignments.length}
          </div>
        </div>
      </div>

      {/* Assignments List */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900">Assignments</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {module.assignments.length > 0 ? (
            module.assignments.map((assignment) => (
              <div key={assignment.id} className="p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-slate-900">{assignment.title}</div>
                    <div className="flex items-center space-x-3 mt-1">
                      <span className="text-sm text-slate-500">
                        Due: {new Date(assignment.dueDate).toLocaleDateString()}
                      </span>
                      <span className="text-sm text-slate-500">Weight: {assignment.weight}%</span>
                    </div>
                  </div>
                  <div className="text-right">
                    {assignment.score !== undefined ? (
                      <div>
                        <div className="text-xl font-bold text-slate-900">{assignment.score}%</div>
                        <div className="text-xs text-emerald-600 font-medium">Graded</div>
                      </div>
                    ) : (
                      <span className={`
                        px-3 py-1 rounded-full text-xs font-medium
                        ${assignment.status === 'submitted' ? 'bg-blue-100 text-blue-700' :
                          'bg-slate-100 text-slate-700'}
                      `}>
                        {assignment.status}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-slate-500">
              Loading assignments...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


// Main Shell Component
export function CleanAcademicOSShell() {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch modules from dashboard API
      const dashResponse = await fetch('/api/dashboard');
      const dashData = await dashResponse.json();
      
      // Transform modules data
      const moduleColors = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];
      const transformedModules: Module[] = dashData.data.map((m: { id: string; code: string; title: string; creditHours: number; currentAverageMark: number }, index: number) => ({
        id: m.id,
        code: m.code,
        title: m.title,
        creditHours: m.creditHours,
        currentGrade: Math.round(m.currentAverageMark) || 0,
        targetGrade: 75,
        color: moduleColors[index % moduleColors.length],
        assignments: []
      }));

      // Fetch week view for tasks
      const weekResponse = await fetch('/api/week-view');
      const weekData = await weekResponse.json();
      
      // Transform tasks
      const transformedTasks: Task[] = weekData.weeklyPriorities.map((p: { id: string; title: string; moduleCode: string; priorityScore: number; status: string; dueDate: string }) => ({
        id: p.id,
        title: p.title,
        moduleCode: p.moduleCode,
        priority: p.priorityScore > 70 ? 'high' : p.priorityScore > 40 ? 'medium' : 'low',
        completed: p.status === 'COMPLETED' || p.status === 'GRADED',
        dueDate: p.dueDate || new Date().toISOString()
      }));

      setModules(transformedModules);
      setTasks(transformedTasks);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setLoading(false);
    }
  };

  const handleModuleClick = (moduleId: string) => {
    setSelectedModuleId(moduleId);
    setCurrentView('modules');
  };

  const handleBackFromModule = () => {
    setSelectedModuleId(null);
  };

  // Reset selected module when changing views
  const handleViewChange = (view: ViewType) => {
    setCurrentView(view);
    if (view !== 'modules') {
      setSelectedModuleId(null);
    }
  };


  const selectedModule = modules.find(m => m.id === selectedModuleId);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-lg font-medium text-slate-700">Loading Academic OS...</div>
        </div>
      </div>
    );
  }

  return (
    <AcademicOSProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Navigation currentView={currentView} onViewChange={handleViewChange} />
        
        <main className="pt-20 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          {currentView === 'dashboard' && !selectedModuleId && (
            <DashboardView 
              modules={modules} 
              tasks={tasks}
              onModuleClick={handleModuleClick}
            />
          )}
          
          {currentView === 'modules' && selectedModule && (
            <ModuleDetailView 
              module={selectedModule}
              onBack={handleBackFromModule}
            />
          )}
          
          {currentView === 'modules' && !selectedModule && (
            <DashboardView 
              modules={modules} 
              tasks={tasks}
              onModuleClick={handleModuleClick}
            />
          )}
          
          {currentView === 'weekly' && (
            <WeeklyViewContainer />
          )}
          
          {currentView === 'settings' && <SettingsViewContainer />}
        </main>
      </div>
    </AcademicOSProvider>
  );
}
