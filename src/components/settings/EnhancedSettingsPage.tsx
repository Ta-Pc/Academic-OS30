'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  Settings,
  Upload,
  Download,
  Database,
  Bell,
  Palette,
  Shield,
  Activity,
  FileText,
  CheckCircle,
  AlertTriangle,
  Info,
  RefreshCw,
  Save,
  History,
  Calendar,
  BookOpen,
  Target,
  Award,
  Zap,
  HardDrive,
  X
} from 'lucide-react';

// Types
interface SettingsState {
  general: {
    academicYear: string;
    institution: string;
    studentId: string;
    defaultView: string;
    language: string;
    timezone: string;
    dateFormat: string;
    weekStartsOn: string;
  };
  display: {
    theme: 'light' | 'dark' | 'auto';
    density: 'comfortable' | 'compact' | 'spacious';
    fontSize: 'small' | 'medium' | 'large';
    colorScheme: string;
    animations: boolean;
    reducedMotion: boolean;
    highContrast: boolean;
    showGridLines: boolean;
  };
  notifications: {
    enabled: boolean;
    email: boolean;
    push: boolean;
    sms: boolean;
    assignmentReminders: boolean;
    gradeUpdates: boolean;
    deadlineAlerts: boolean;
    weeklyDigest: boolean;
    reminderTime: number;
    quietHours: {
      enabled: boolean;
      start: string;
      end: string;
    };
  };
  import: {
    autoDetectColumns: boolean;
    createMissingModules: boolean;
    skipDuplicates: boolean;
    validateDates: boolean;
    defaultDateFormat: string;
    defaultStatus: string;
    preserveOriginalData: boolean;
    backupBeforeImport: boolean;
  };
  data: {
    autoBackup: boolean;
    backupFrequency: string;
    backupLocation: string;
    retentionDays: number;
    compressionEnabled: boolean;
    encryptionEnabled: boolean;
    lastBackup: string | null;
    lastImport: string | null;
    totalRecords: number;
    storageUsed: string;
  };
  advanced: {
    developerMode: boolean;
    debugLogging: boolean;
    performanceMode: boolean;
    experimentalFeatures: boolean;
    apiRateLimit: number;
    cacheEnabled: boolean;
    cacheDuration: number;
    telemetryEnabled: boolean;
  };
}

interface ImportHistory {
  id: string;
  timestamp: string;
  filename: string;
  type: string;
  recordsImported: number;
  recordsFailed: number;
  status: 'success' | 'partial' | 'failed';
  duration: number;
  user: string;
}

interface SystemStats {
  overview: {
    totalModules: number;
    totalAssignments: number;
    totalTasks: number;
    totalUsers: number;
    totalTerms: number;
    totalDegrees: number;
    totalStudyLogs: number;
  };
  academic: {
    totalCreditHours: number;
    averageCreditHours: number;
    averageTargetMark: number;
    totalAssignmentWeight: number;
    averageAssignmentScore: number;
  };
  progress: {
    assignmentCompletionRate: string;
    taskCompletionRate: string;
  };
  activity: {
    totalStudyTime: number;
    averageStudySession: number;
    recentStudyLogs: number;
    studyTimeHours: string;
  };
  performance: {
    activeModules: number;
    upcomingAssignments: number;
    overdueAssignments: number;
  };
}

// Import the UI package ImportModal
import { ImportModal } from '@ui';

// Enhanced Settings Page Component
export function EnhancedSettingsPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [settings, setSettings] = useState<SettingsState>({
    general: {
      academicYear: '2024-2025',
      institution: '',
      studentId: '',
      defaultView: 'dashboard',
      language: 'en',
      timezone: 'UTC',
      dateFormat: 'YYYY-MM-DD',
      weekStartsOn: 'monday',
    },
    display: {
      theme: 'auto',
      density: 'comfortable',
      fontSize: 'medium',
      colorScheme: 'default',
      animations: true,
      reducedMotion: false,
      highContrast: false,
      showGridLines: true,
    },
    notifications: {
      enabled: true,
      email: true,
      push: false,
      sms: false,
      assignmentReminders: true,
      gradeUpdates: true,
      deadlineAlerts: true,
      weeklyDigest: true,
      reminderTime: 24,
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00',
      },
    },
    import: {
      autoDetectColumns: true,
      createMissingModules: true,
      skipDuplicates: false,
      validateDates: true,
      defaultDateFormat: 'YYYY-MM-DD',
      defaultStatus: 'upcoming',
      preserveOriginalData: true,
      backupBeforeImport: true,
    },
    data: {
      autoBackup: true,
      backupFrequency: 'daily',
      backupLocation: 'local',
      retentionDays: 30,
      compressionEnabled: true,
      encryptionEnabled: false,
      lastBackup: null,
      lastImport: null,
      totalRecords: 0,
      storageUsed: '0 MB',
    },
    advanced: {
      developerMode: false,
      debugLogging: false,
      performanceMode: false,
      experimentalFeatures: false,
      apiRateLimit: 100,
      cacheEnabled: true,
      cacheDuration: 3600,
      telemetryEnabled: false,
    },
  });

  const [stats, setStats] = useState<SystemStats>({
    overview: {
      totalModules: 0,
      totalAssignments: 0,
      totalTasks: 0,
      totalUsers: 1,
      totalTerms: 0,
      totalDegrees: 0,
      totalStudyLogs: 0
    },
    academic: {
      totalCreditHours: 0,
      averageCreditHours: 0,
      averageTargetMark: 0,
      totalAssignmentWeight: 0,
      averageAssignmentScore: 0
    },
    progress: {
      assignmentCompletionRate: '0',
      taskCompletionRate: '0'
    },
    activity: {
      totalStudyTime: 0,
      averageStudySession: 0,
      recentStudyLogs: 0,
      studyTimeHours: '0'
    },
    performance: {
      activeModules: 0,
      upcomingAssignments: 0,
      overdueAssignments: 0
    }
  });

  const [importHistory, setImportHistory] = useState<ImportHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error' | 'warning' | 'info';
    text: string;
  } | null>(null);
  const [showImportWizard, setShowImportWizard] = useState(false);

  // Tabs configuration
  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'general', label: 'General', icon: Settings },
    { id: 'display', label: 'Display', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'import', label: 'Import & Export', icon: Upload },
    { id: 'data', label: 'Data & Backup', icon: Database },
    { id: 'advanced', label: 'Advanced', icon: Shield },
  ];

  // Load settings and stats on mount
  useEffect(() => {
    loadSettings();
    loadStats();
    loadImportHistory();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/settings/preferences');
      if (response.ok) {
        const data = await response.json();
        setSettings(prev => ({ ...prev, ...data }));
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/settings/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const loadImportHistory = async () => {
    try {
      const response = await fetch('/api/import/history');
      if (response.ok) {
        const data = await response.json();
        setImportHistory(data.history || []);
      }
    } catch (error) {
      console.error('Failed to load import history:', error);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/settings/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Settings saved successfully!' });
        applyTheme(settings.display.theme);
      } else {
        throw new Error('Failed to save settings');
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to save settings. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const applyTheme = (theme: 'light' | 'dark' | 'auto') => {
    if (theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', prefersDark);
    } else {
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }
  };


  const exportData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format: 'csv' }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `academic-data-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        setMessage({ type: 'success', text: 'Data exported successfully!' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to export data.' });
    } finally {
      setLoading(false);
    }
  };


  const createBackup = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/data/backup', {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(prev => ({
          ...prev,
          data: {
            ...prev.data,
            lastBackup: new Date().toISOString(),
          },
        }));
        setMessage({ type: 'success', text: `Backup created successfully: ${data.filename}` });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to create backup.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">Settings</h1>
              <p className="text-lg text-slate-600">Configure your Academic OS experience</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={saveSettings}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                {saving ? (
                  <RefreshCw className="h-5 w-5 animate-spin" />
                ) : (
                  <Save className="h-5 w-5" />
                )}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
            message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' :
            message.type === 'error' ? 'bg-red-50 border border-red-200 text-red-800' :
            message.type === 'warning' ? 'bg-yellow-50 border border-yellow-200 text-yellow-800' :
            'bg-blue-50 border border-blue-200 text-blue-800'
          }`}>
            {message.type === 'success' ? <CheckCircle className="h-5 w-5" /> :
             message.type === 'error' ? <AlertTriangle className="h-5 w-5" /> :
             <Info className="h-5 w-5" />}
            <span className="flex-1">{message.text}</span>
            <button onClick={() => setMessage(null)} className="text-current hover:opacity-75">
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-2 mb-8">
          <div className="flex overflow-x-auto gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <BookOpen className="h-8 w-8 text-blue-600" />
                    <span className="text-3xl font-bold text-slate-900">{stats?.overview?.totalModules ?? 0}</span>
                  </div>
                  <div className="text-sm font-medium text-slate-600">Total Modules</div>
                  <div className="text-xs text-slate-500 mt-1">All modules in system</div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <Target className="h-8 w-8 text-green-600" />
                    <span className="text-3xl font-bold text-slate-900">
                      {stats?.overview?.totalAssignments ?? 0}
                    </span>
                  </div>
                  <div className="text-sm font-medium text-slate-600">Total Assignments</div>
                  <div className="text-xs text-slate-500 mt-1">
                    {stats?.progress?.assignmentCompletionRate ?? '0'}% completed
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <Award className="h-8 w-8 text-purple-600" />
                    <span className="text-3xl font-bold text-slate-900">
                      {stats?.academic?.averageAssignmentScore?.toFixed(1) || '0.0'}%
                    </span>
                  </div>
                  <div className="text-sm font-medium text-slate-600">Average Score</div>
                  <div className="text-xs text-slate-500 mt-1">Overall performance</div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <Calendar className="h-8 w-8 text-orange-600" />
                    <span className="text-3xl font-bold text-slate-900">{stats?.performance?.upcomingAssignments ?? 0}</span>
                  </div>
                  <div className="text-sm font-medium text-slate-600">Upcoming</div>
                  <div className="text-xs text-slate-500 mt-1">Next 7 days</div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
                <div className="p-6 border-b border-slate-200">
                  <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-600" />
                    Quick Actions
                  </h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <button
                      onClick={() => setShowImportWizard(true)}
                      className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-all duration-200 text-left group"
                    >
                      <Upload className="h-8 w-8 text-blue-600 mb-3" />
                      <div className="font-semibold text-slate-900 mb-1">Import Data</div>
                      <div className="text-sm text-slate-600">Import from CSV file</div>
                    </button>

                    <button
                      onClick={exportData}
                      disabled={loading}
                      className="p-6 bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl hover:from-green-100 hover:to-green-200 transition-all duration-200 text-left group disabled:opacity-50"
                    >
                      <Download className="h-8 w-8 text-green-600 mb-3" />
                      <div className="font-semibold text-slate-900 mb-1">Export Data</div>
                      <div className="text-sm text-slate-600">Download as CSV</div>
                    </button>

                    <button
                      onClick={createBackup}
                      disabled={loading}
                      className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl hover:from-purple-100 hover:to-purple-200 transition-all duration-200 text-left group disabled:opacity-50"
                    >
                      <HardDrive className="h-8 w-8 text-purple-600 mb-3" />
                      <div className="font-semibold text-slate-900 mb-1">Create Backup</div>
                      <div className="text-sm text-slate-600">Save current state</div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Recent Import History */}
              {importHistory.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
                  <div className="p-6 border-b border-slate-200">
                    <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                      <History className="h-5 w-5 text-slate-600" />
                      Recent Imports
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-3">
                      {importHistory.slice(0, 5).map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-4 bg-slate-50 rounded-xl"
                        >
                          <div className="flex items-center gap-4">
                            <FileText className="h-5 w-5 text-slate-600" />
                            <div>
                              <div className="font-medium text-slate-900">{item.filename}</div>
                              <div className="text-sm text-slate-600">
                                {new Date(item.timestamp).toLocaleDateString()} • {item.recordsImported} records
                              </div>
                            </div>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                            item.status === 'success' ? 'bg-green-100 text-green-700' :
                            item.status === 'partial' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {item.status}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Other tabs content would go here - keeping it simple for now */}
          {activeTab !== 'overview' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-xl font-semibold text-slate-900 mb-4">
                {tabs.find(t => t.id === activeTab)?.label} Settings
              </h3>
              <p className="text-slate-600">
                Settings for {activeTab} will be displayed here.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Import Modal */}
      {showImportWizard && (
        <ImportModal
          isOpen={showImportWizard}
          onClose={() => setShowImportWizard(false)}
          onComplete={() => {
            setShowImportWizard(false);
            loadStats();
            loadImportHistory();
            setMessage({ type: 'success', text: 'Data imported successfully!' });
          }}
        />
      )}
    </div>
  );
}
