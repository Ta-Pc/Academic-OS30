'use client';
import React, { useState, useEffect } from 'react';
import { useAcademicOS } from '../../context/AcademicOSContext';
import { Button } from '@ui/forms/Button.view';
import { ModuleQuickView } from '@ui/modules/ModuleQuickView.view';
import { Card, CardHeader, CardBody } from '@ui/layout/Card.view';
import { PageHeaderView } from '@ui/layout/PageHeader.view';

interface WeeklyData {
  weekRange: { start: string; end: string };
  moduleSummaries: Array<{
    id: string;
    code: string;
    title: string;
    currentAverageMark: number;
    targetMark: number;
    creditHours: number;
    assignmentsDueThisWeek: number;
    color: string;
    isCore: boolean;
    electiveGroup: string | null;
    nextDueDate: string | null;
    daysUntilNextDue: number | null;
    assignmentCount: number;
    taskCount: number;
    priorityScore: number;
  }>;
  weeklyPriorities: Array<{
    id: string;
    title: string;
    moduleCode: string;
    priorityScore: number;
    dueDate: string;
    status: 'PENDING' | 'COMPLETED' | 'GRADED';
    type: 'ASSIGNMENT' | 'TACTICAL_TASK';
    weight?: number;
  }>;
  tacticalTasks: Array<{
    id: string;
    title: string;
    moduleCode: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    completed: boolean;
    dueDate: string;
    status: string;
  }>;
  assignments: Array<{
    id: string;
    title: string;
    dueDate: string | null;
    weight: number | null;
    score: number | null;
    status: string;
    module: {
      id: string;
      code: string;
      title: string;
      isCore: boolean;
    };
  }>;
  totalStudyMinutes: number;
}

/**
 * Weekly View Container - Main dashboard view showing weekly missions, tasks, and modules.
 * This is the primary view under /dashboard with full Academic OS integration.
 */
export function WeeklyViewContainer() {
  const { state, selectModule, openModal } = useAcademicOS();
  const { currentWeekStart } = state;
  const [weeklyData, setWeeklyData] = useState<WeeklyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(currentWeekStart || new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchWeeklyData();
  }, [selectedDate]);

  const fetchWeeklyData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/week-view?date=${selectedDate}`);
      if (response.ok) {
        const data = await response.json();
        setWeeklyData(data);
      } else {
        const errorText = await response.text();
        throw new Error(`Failed to fetch weekly data: ${response.status} ${errorText}`);
      }
    } catch (error) {
      console.error('Error fetching weekly data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load weekly data');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskToggle = async (taskId: string, completed: boolean) => {
    try {
      const response = await fetch('/api/tasks/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ taskId, completed }),
      });

      if (response.ok) {
        // Refresh data after toggle
        fetchWeeklyData();
      } else {
        throw new Error('Failed to update task');
      }
    } catch (error) {
      console.error('Error toggling task:', error);
      setError('Failed to update task status');
    }
  };

  const handleWeekNavigation = (direction: 'prev' | 'next') => {
    const currentDate = new Date(selectedDate);
    const newDate = new Date(currentDate);
    
    if (direction === 'prev') {
      newDate.setDate(currentDate.getDate() - 7);
    } else {
      newDate.setDate(currentDate.getDate() + 7);
    }
    
    setSelectedDate(newDate.toISOString().split('T')[0]);
  };

  const handleModuleClick = (moduleId: string) => {
    selectModule(moduleId, 'weekly');
  };

  const handleViewFullModule = (moduleId: string) => {
    window.location.href = `/modules/${moduleId}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <div className="text-slate-600">Loading weekly data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-2xl text-slate-600 mb-4">Failed to load weekly data</div>
        <div className="text-red-600 mb-4">{error}</div>
        <Button 
          onClick={fetchWeeklyData}
          className="mt-4"
          variant="primary"
        >
          Retry
        </Button>
      </div>
    );
  }

  if (!weeklyData) {
    return (
      <div className="text-center py-12">
        <div className="text-2xl text-slate-600">No weekly data available</div>
        <Button 
          onClick={fetchWeeklyData}
          className="mt-4"
          variant="primary"
        >
          Load Data
        </Button>
      </div>
    );
  }

  // Sort all priorities by score (highest first)
  const allPriorities = [...weeklyData.weeklyPriorities]
    .sort((a, b) => b.priorityScore - a.priorityScore);

  const completedTasks = weeklyData.tacticalTasks.filter(task => task.completed).length;
  const totalTasks = weeklyData.tacticalTasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const totalAssignments = weeklyData.assignments.length;
  const completedAssignments = weeklyData.assignments.filter(a => a.status === 'GRADED').length;
  const assignmentCompletionRate = totalAssignments > 0 ? Math.round((completedAssignments / totalAssignments) * 100) : 0;

  return (
    <div className="container mx-auto py-6" data-testid="academicos-weekly-root">
      {/* Header */}
      <PageHeaderView
        title="Weekly Mission Brief"
        subtitle={`${new Date(weeklyData.weekRange.start).toLocaleDateString()} - ${new Date(weeklyData.weekRange.end).toLocaleDateString()}`}
        icon="🎯"
        actions={
          <div className="flex items-center space-x-4">
            {/* Week Navigation */}
            <div className="flex items-center space-x-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleWeekNavigation('prev')}
              >
                &larr; Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleWeekNavigation('next')}
              >
                Next &rarr;
              </Button>
            </div>

            {/* Add Task button */}
            <Button
              onClick={() => openModal('add-task')}
              variant="primary"
              data-testid="academicos-add-task-open"
            >
              + Add Task
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* All Priorities Section - Show ALL priorities ranked by score */}
          <Card hover>
            <CardHeader gradient="primary">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary-200 rounded-lg">
                    <span className="text-xl">🎯</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-primary-900">Weekly Priorities</h3>
                    <p className="text-sm text-primary-700">Focus on these critical items</p>
                  </div>
                </div>
                <span className="bg-primary-200 text-primary-800 px-3 py-1 rounded-full text-sm font-medium">
                  {allPriorities.length} items
                </span>
              </div>
            </CardHeader>
            <CardBody>
              {allPriorities.length > 0 ? (
                <div className="space-y-3">
                  {allPriorities.map((priority) => (
                    <div
                      key={priority.id}
                      className="flex items-center space-x-4 p-4 bg-slate-50 rounded-lg border border-slate-200 hover:shadow-md transition-shadow"
                    >
                      <div className="flex-shrink-0">
                        <div className={`w-3 h-3 rounded-full ${
                          priority.priorityScore > 70 ? 'bg-red-500' :
                          priority.priorityScore > 40 ? 'bg-amber-500' :
                          'bg-blue-500'
                        }`}></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-slate-900 truncate">{priority.title}</div>
                        <div className="text-sm text-slate-600">
                          {priority.moduleCode} - {priority.type.toLowerCase()} - Due {new Date(priority.dueDate).toLocaleDateString()}
                          {priority.weight && ` - ${priority.weight}% weight`}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <div className="text-sm font-semibold text-slate-900">
                            {priority.priorityScore}
                          </div>
                          <div className={`text-xs font-medium ${
                            priority.priorityScore > 70 ? 'text-red-700' :
                            priority.priorityScore > 40 ? 'text-amber-700' :
                            'text-blue-700'
                          }`}>
                            {priority.priorityScore > 70 ? 'HIGH' : priority.priorityScore > 40 ? 'MEDIUM' : 'LOW'}
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          priority.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                          priority.status === 'GRADED' ? 'bg-blue-100 text-blue-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {priority.status.toLowerCase()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <div className="text-3xl mb-2">🎯</div>
                  <p>No priority items this week</p>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Modules Section */}
          <Card hover>
            <CardHeader gradient="blue">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-200 rounded-lg">
                    <span className="text-xl">📚</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-blue-900">Active Modules</h3>
                    <p className="text-sm text-blue-700">Your current courses and progress</p>
                  </div>
                </div>
                <span className="bg-blue-200 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {weeklyData.moduleSummaries.length} active
                </span>
              </div>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {weeklyData.moduleSummaries.map((module) => (
                  <Card
                    key={module.id}
                    hover
                    clickable
                    onClick={() => handleModuleClick(module.id)}
                    className="group"
                  >
                    <CardBody padding="md">
                      <div className="flex items-center justify-between mb-3">
                        <span 
                          className="px-2 py-1 rounded text-xs font-medium text-white"
                          style={{ backgroundColor: module.color }}
                        >
                          {module.code}
                        </span>
                        <div className="text-right">
                          <div className="text-lg font-bold text-slate-900">{module.currentAverageMark}%</div>
                          <div className="text-xs text-slate-500">current</div>
                        </div>
                      </div>
                      <h4 className="font-medium text-slate-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                        {module.title}
                      </h4>
                      
                      <div className="space-y-2 text-sm text-slate-600">
                        <div className="flex justify-between">
                          <span>Priority Score:</span>
                          <span className="font-medium">{module.priorityScore}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Assignments due:</span>
                          <span className="font-medium">{module.assignmentCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tasks:</span>
                          <span className="font-medium">{module.taskCount}</span>
                        </div>
                        {module.daysUntilNextDue !== null && (
                          <div className="flex justify-between">
                            <span>Next due:</span>
                            <span className={`font-medium ${
                              module.daysUntilNextDue <= 3 ? 'text-red-600' :
                              module.daysUntilNextDue <= 7 ? 'text-amber-600' :
                              'text-green-600'
                            }`}>
                              {module.daysUntilNextDue === 0 ? 'Today' : 
                               module.daysUntilNextDue === 1 ? 'Tomorrow' :
                               `${module.daysUntilNextDue} days`}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-200">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewFullModule(module.id);
                          }}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                        >
                          View full details &rarr;
                        </button>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Tactical Tasks Section */}
          <Card hover>
            <CardHeader gradient="green">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-200 rounded-lg">
                    <span className="text-xl">✅</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-green-900">Tactical Tasks</h3>
                    <p className="text-sm text-green-700">Manage your weekly tasks</p>
                  </div>
                </div>
                <span className="bg-green-200 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  {completedTasks}/{totalTasks} completed
                </span>
              </div>
            </CardHeader>
            <CardBody>
              {weeklyData.tacticalTasks.length > 0 ? (
                <div className="space-y-2">
                  {weeklyData.tacticalTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center space-x-3 p-3 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={(e) => handleTaskToggle(task.id, e.target.checked)}
                        className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                      />
                      <div className="flex-1 min-w-0">
                        <div className={`font-medium ${task.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                          {task.title}
                        </div>
                        <div className="text-sm text-slate-600 truncate">
                          {task.moduleCode} - {new Date(task.dueDate).toLocaleDateString()}
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        task.priority === 'HIGH' ? 'bg-red-100 text-red-700' :
                        task.priority === 'MEDIUM' ? 'bg-amber-100 text-amber-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {(task.priority ? task.priority.toLowerCase() : 'low')}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <div className="text-3xl mb-2">✅</div>
                  <p>No tactical tasks this week</p>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Progress Stats */}
          <Card>
            <CardHeader gradient="purple">
              <h3 className="text-lg font-bold text-purple-900">Weekly Progress</h3>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-900">{completionRate}%</div>
                  <div className="text-sm text-purple-700">Tasks</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-900">{assignmentCompletionRate}%</div>
                  <div className="text-sm text-purple-700">Assignments</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm text-slate-600 mb-1">
                    <span>Tasks Completed</span>
                    <span>{completedTasks}/{totalTasks}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-500 transition-all duration-500"
                      style={{ width: `${completionRate}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm text-slate-600 mb-1">
                    <span>Assignments Graded</span>
                    <span>{completedAssignments}/{totalAssignments}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-500 transition-all duration-500"
                      style={{ width: `${assignmentCompletionRate}%` }}
                    />
                  </div>
                </div>
              </div>

              {weeklyData.totalStudyMinutes > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <div className="text-center">
                    <div className="text-sm font-medium text-slate-900">Study Time</div>
                    <div className="text-lg font-bold text-purple-900">
                      {Math.floor(weeklyData.totalStudyMinutes / 60)}h {weeklyData.totalStudyMinutes % 60}m
                    </div>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader gradient="blue">
              <h3 className="text-lg font-bold text-slate-900">Quick Stats</h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Total Priorities</span>
                  <span className="font-medium text-slate-900">{allPriorities.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">High Priority Items</span>
                  <span className="font-medium text-red-600">
                    {allPriorities.filter(p => p.priorityScore > 70).length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Assignments Due</span>
                  <span className="font-medium text-slate-900">{totalAssignments}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Tactical Tasks</span>
                  <span className="font-medium text-slate-900">{totalTasks}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Active Modules</span>
                  <span className="font-medium text-slate-900">{weeklyData.moduleSummaries.length}</span>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Study Focus */}
          <Card>
            <CardHeader gradient="orange">
              <h3 className="text-lg font-bold text-orange-900">Focus Areas</h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                {allPriorities
                  .filter(p => p.priorityScore > 70)
                  .slice(0, 3)
                  .map((priority, index) => (
                    <div key={priority.id} className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        index === 0 ? 'bg-red-500' :
                        index === 1 ? 'bg-amber-500' :
                        'bg-blue-500'
                      }`}></div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-slate-900 truncate">{priority.title}</div>
                        <div className="text-xs text-slate-500">{priority.moduleCode}</div>
                      </div>
                    </div>
                  ))}
                {allPriorities.filter(p => p.priorityScore > 70).length === 0 && (
                  <div className="text-center text-slate-500 text-sm">
                    No high priority items this week
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Module Quick View Modal */}
      {selectedModule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Module Details</h3>
              <button
                onClick={() => setSelectedModule(null)}
                className="text-slate-500 hover:text-slate-700 text-2xl"
              >
                &times;
              </button>
            </div>
            <ModuleQuickView
              moduleId={selectedModule}
              title=""
              code=""
            />
            <div className="mt-4 pt-4 border-t border-slate-200">
              <Button
                onClick={() => handleViewFullModule(selectedModule)}
                variant="primary"
                className="w-full"
              >
                View Full Module Details
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
