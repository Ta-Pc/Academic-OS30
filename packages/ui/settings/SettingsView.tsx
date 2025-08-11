'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Download, 
  Upload, 
  RotateCcw, 
  BarChart3, 
  User, 
  Bell, 
  Eye, 
  Save,
  AlertTriangle,
  CheckCircle,
  Info,
  FileText
} from 'lucide-react';
import { PageHeaderView } from '../layout/PageHeader.view';
import { Card, CardHeader, CardBody } from '../layout/Card.view';
import { Button } from '../forms/Button.view';
import { Input, Select, SelectOption } from '../forms/Input.view';
import { ImportModal } from '../import/ImportModal.view';

interface Preferences {
  academicYear: string;
  timezone: string;
  dateFormat: string;
  defaultView: string;
  notificationsEnabled: boolean;
  emailDigest: boolean;
  reminderThreshold: number;
  priorityThreshold: number;
  theme: string;
  compactMode: boolean;
  showCompleted: boolean;
  itemsPerPage: number;
  defaultSemester: string;
  gradeScale: string;
  passingGrade: number;
}

interface DatabaseStats {
  overview: {
    totalModules: number;
    totalAssignments: number;
    totalTasks: number;
    totalUsers: number;
  };
  academic: {
    totalCreditHours: number;
    averageTargetMark: number;
  };
  progress: {
    assignmentCompletionRate: string;
    taskCompletionRate: string;
  };
  activity: {
    studyTimeHours: string;
    recentStudyLogs: number;
  };
}

export function SettingsView() {
  const [activeTab, setActiveTab] = useState('preferences');
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);

  // Load preferences and stats on component mount
  useEffect(() => {
    loadPreferences();
    loadStats();
  }, []);

  const loadPreferences = async () => {
    try {
      const response = await fetch('/api/settings/preferences');
      const result = await response.json();
      if (result.success) {
        setPreferences(result.data);
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/settings/stats');
      const result = await response.json();
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const savePreferences = async () => {
    if (!preferences) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/settings/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences)
      });
      
      const result = await response.json();
      if (result.success) {
        setMessage({ type: 'success', text: 'Preferences saved successfully!' });
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to save preferences' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to save preferences' });
    } finally {
      setLoading(false);
    }
  };

  const exportData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/settings/export');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `academic-os-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        setMessage({ type: 'success', text: 'Data exported successfully!' });
      } else {
        setMessage({ type: 'error', text: 'Failed to export data' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to export data' });
    } finally {
      setLoading(false);
    }
  };

  const importData = async (file: File) => {
    setLoading(true);
    try {
      const fileContent = await file.text();
      const importData = JSON.parse(fileContent);
      
      const response = await fetch('/api/settings/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(importData)
      });
      
      const result = await response.json();
      if (result.success) {
        setMessage({ 
          type: 'success', 
          text: `Import completed! Imported ${Object.values(result.imported).reduce((a, b) => (a as number) + (b as number), 0)} records.` 
        });
        loadStats(); // Refresh stats
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to import data' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to parse or import data file' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenImportModal = () => {
    setShowImportModal(true);
  };

  const handleCloseImportModal = () => {
    setShowImportModal(false);
  };

  const resetData = async () => {
    if (!window.confirm('Are you sure you want to COMPLETELY RESET ALL academic data? This will delete modules, assignments, tasks, study logs, terms, academic years, degrees, and all assessment components. User accounts will be preserved. This action CANNOT be undone.')) {
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch('/api/data/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmReset: true })
      });
      
      const result = await response.json();
      if (result.success) {
        setMessage({ type: 'success', text: result.message || 'All academic data has been reset successfully!' });
        loadStats(); // Refresh stats
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to reset data' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to reset data' });
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = (key: keyof Preferences, value: unknown) => {
    if (!preferences) return;
    setPreferences({ ...preferences, [key]: value });
  };

  const tabs = [
    { id: 'preferences', label: 'Preferences', icon: Settings },
    { id: 'data', label: 'Data Management', icon: BarChart3 },
    { id: 'stats', label: 'Statistics', icon: Info }
  ];

  const themeOptions: SelectOption[] = [
    { value: 'light', label: 'Light Theme' },
    { value: 'dark', label: 'Dark Theme' },
    { value: 'auto', label: 'Auto (System)' }
  ];

  const viewOptions: SelectOption[] = [
    { value: 'week-view', label: 'Weekly View' },
    { value: 'calendar', label: 'Calendar View' },
    { value: 'dashboard', label: 'Dashboard View' }
  ];

  const dateFormatOptions: SelectOption[] = [
    { value: 'dd/MM/yyyy', label: 'DD/MM/YYYY' },
    { value: 'MM/dd/yyyy', label: 'MM/DD/YYYY' },
    { value: 'yyyy-MM-dd', label: 'YYYY-MM-DD' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <PageHeaderView
        title="Settings"
        subtitle="Manage your preferences, data, and system configuration"
        icon={<Settings className="h-6 w-6" />}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Message Display */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
            message.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
            'bg-blue-50 text-blue-800 border border-blue-200'
          }`}>
            {message.type === 'success' && <CheckCircle className="h-5 w-5" />}
            {message.type === 'error' && <AlertTriangle className="h-5 w-5" />}
            {message.type === 'info' && <Info className="h-5 w-5" />}
            <span>{message.text}</span>
            <button 
              onClick={() => setMessage(null)}
              className="ml-auto text-current hover:opacity-75"
            >
              ×
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm mb-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-primary-100 text-primary-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === 'preferences' && preferences && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">General Preferences</h3>
                </div>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Academic Year"
                    value={preferences.academicYear}
                    onChange={(value: string) => updatePreference('academicYear', value)}
                    placeholder="2024-2025"
                    fullWidth
                  />
                  
                  <Select
                    label="Default View"
                    value={preferences.defaultView}
                    onChange={(value: string) => updatePreference('defaultView', value)}
                    options={viewOptions}
                    fullWidth
                  />
                  
                  <Select
                    label="Date Format"
                    value={preferences.dateFormat}
                    onChange={(value: string) => updatePreference('dateFormat', value)}
                    options={dateFormatOptions}
                    fullWidth
                  />
                  
                  <Select
                    label="Theme"
                    value={preferences.theme}
                    onChange={(value: string) => updatePreference('theme', value)}
                    options={themeOptions}
                    fullWidth
                  />
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">Notifications</h3>
                </div>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={preferences.notificationsEnabled}
                      onChange={(e) => updatePreference('notificationsEnabled', e.target.checked)}
                      className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-slate-700">Enable notifications</span>
                  </label>
                  
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={preferences.emailDigest}
                      onChange={(e) => updatePreference('emailDigest', e.target.checked)}
                      className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-slate-700">Email digest</span>
                  </label>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Reminder Threshold (hours)"
                      type="number"
                      value={preferences.reminderThreshold.toString()}
                      onChange={(value: string) => updatePreference('reminderThreshold', parseInt(value) || 24)}
                      fullWidth
                    />
                    
                    <Input
                      label="Priority Threshold (days)"
                      type="number"
                      value={preferences.priorityThreshold.toString()}
                      onChange={(value: string) => updatePreference('priorityThreshold', parseInt(value) || 7)}
                      fullWidth
                    />
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">Display Options</h3>
                </div>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={preferences.compactMode}
                      onChange={(e) => updatePreference('compactMode', e.target.checked)}
                      className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-slate-700">Compact mode</span>
                  </label>
                  
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={preferences.showCompleted}
                      onChange={(e) => updatePreference('showCompleted', e.target.checked)}
                      className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-slate-700">Show completed items</span>
                  </label>
                  
                  <Input
                    label="Items per page"
                    type="number"
                    value={preferences.itemsPerPage.toString()}
                    onChange={(value: string) => updatePreference('itemsPerPage', parseInt(value) || 25)}
                    fullWidth
                  />
                </div>
              </CardBody>
            </Card>

            <div className="flex justify-end">
              <Button
                onClick={savePreferences}
                loading={loading}
                variant="primary"
                size="lg"
              >
                <Save className="h-4 w-4" />
                Save Preferences
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'data' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">Export Data</h3>
                </div>
              </CardHeader>
              <CardBody>
                <p className="text-slate-600 mb-6">
                  Export all your academic data for backup or transfer to another system.
                </p>
                <Button
                  onClick={exportData}
                  loading={loading}
                  variant="secondary"
                  size="lg"
                >
                  <Download className="h-4 w-4" />
                  Export All Data
                </Button>
              </CardBody>
            </Card>

            <Card>
              <CardHeader gradient="blue">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-blue-900">CSV Import</h3>
                </div>
              </CardHeader>
              <CardBody>
                <p className="text-slate-600 mb-6">
                  Import academic data from CSV files including modules, assignments, and student data with our guided import wizard.
                </p>
                <Button
                  onClick={handleOpenImportModal}
                  variant="primary"
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                >
                  <FileText className="h-4 w-4" />
                  Import from CSV
                </Button>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">Import Data</h3>
                </div>
              </CardHeader>
              <CardBody>
                <p className="text-slate-600 mb-6">
                  Import academic data from a previously exported file or compatible format.
                </p>
                <input
                  type="file"
                  accept=".json"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) importData(file);
                  }}
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                />
              </CardBody>
            </Card>

            <Card className="border-red-300 bg-red-50 shadow-lg">
              <CardHeader className="bg-red-100 border-b border-red-200">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertTriangle className="h-5 w-5" />
                  <h3 className="text-lg font-bold">⚠️ Danger Zone - Reset All Data</h3>
                </div>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <p className="text-red-700 font-medium">
                    ⚠️ WARNING: This will permanently delete ALL academic data including:
                  </p>
                  <ul className="text-red-600 text-sm space-y-1 ml-4">
                    <li>• All assignments, quizzes, and tests</li>
                    <li>• All modules and courses</li>
                    <li>• All study logs and tasks</li>
                    <li>• All terms and academic years</li>
                    <li>• All degrees and assessment components</li>
                  </ul>
                  <p className="text-red-700 font-medium">
                    User accounts and settings will be preserved. This action CANNOT be undone!
                  </p>
                  <div className="pt-2">
                    <Button
                      onClick={resetData}
                      loading={loading}
                      variant="danger"
                      size="lg"
                      className="font-bold shadow-lg hover:shadow-xl"
                    >
                      <AlertTriangle className="h-5 w-5" />
                      🗑️ RESET ALL ACADEMIC DATA
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        )}

        {activeTab === 'stats' && stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardBody>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary-600">{stats.overview.totalModules}</div>
                    <div className="text-sm text-slate-600">Total Modules</div>
                  </div>
                </CardBody>
              </Card>
              
              <Card>
                <CardBody>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{stats.overview.totalAssignments}</div>
                    <div className="text-sm text-slate-600">Total Assignments</div>
                  </div>
                </CardBody>
              </Card>
              
              <Card>
                <CardBody>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{stats.overview.totalTasks}</div>
                    <div className="text-sm text-slate-600">Total Tasks</div>
                  </div>
                </CardBody>
              </Card>
              
              <Card>
                <CardBody>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600">{stats.activity.studyTimeHours}h</div>
                    <div className="text-sm text-slate-600">Study Time</div>
                  </div>
                </CardBody>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Academic Progress</h3>
                </CardHeader>
                <CardBody>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Assignment Completion</span>
                        <span>{stats.progress.assignmentCompletionRate}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${stats.progress.assignmentCompletionRate}%` }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Task Completion</span>
                        <span>{stats.progress.taskCompletionRate}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${stats.progress.taskCompletionRate}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
              
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Academic Details</h3>
                </CardHeader>
                <CardBody>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Total Credit Hours</span>
                      <span className="font-semibold">{stats.academic.totalCreditHours}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Average Target Mark</span>
                      <span className="font-semibold">{stats.academic.averageTargetMark?.toFixed(1) || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Recent Study Sessions</span>
                      <span className="font-semibold">{stats.activity.recentStudyLogs}</span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* CSV Import Modal */}
      {showImportModal && (
        <ImportModal
          isOpen={showImportModal}
          onClose={handleCloseImportModal}
        />
      )}
    </div>
  );
}
