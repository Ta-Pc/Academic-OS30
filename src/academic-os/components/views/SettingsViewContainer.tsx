// AcademicOS Flow Composition
import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  BarChart3, 
  User, 
  Save,
  AlertTriangle,
  CheckCircle,
  Info,
  Moon,
  Sun,
  Monitor,
  Bell,
  Database,
  Palette,
  Zap,
  TrendingUp,
  FileText,
  Target,
  Upload,
  Download
} from 'lucide-react';
import { useAcademicOS } from '../../context/AcademicOSContext';
import { ImportModal } from '@ui/import/ImportModal.view';

// Enhanced settings with more sophisticated structure
type SettingsData = {
  preferences: {
    academicYear: string;
    defaultView: string;
    theme: string;
    notificationsEnabled: boolean;
    emailDigest: boolean;
    reminderThreshold: number;
    priorityThreshold: number;
    compactMode: boolean;
    showCompleted: boolean;
    itemsPerPage: number;
    language: string;
    timezone: string;
    autoSave: boolean;
  };
  statistics: {
    totalModules: number;
    totalAssignments: number;
    completedAssignments: number;
    averageGrade: number;
    totalStudyHours: number;
    streakDays: number;
  };
  systemInfo: {
    lastBackup: string;
    dataSize: string;
    lastSync: string;
    version: string;
  };
};

/**
 * Enhanced Settings Dashboard - sophisticated configuration hub with creative UI/UX.
 * Provides comprehensive academic system management with statistics, preferences, and tools.
 */
export function SettingsViewContainer() {
  const { openModal } = useAcademicOS();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [settings, setSettings] = useState<SettingsData>({
    preferences: {
      academicYear: '2024-2025',
      defaultView: 'week-view',
      theme: 'light',
      notificationsEnabled: true,
      emailDigest: true,
      reminderThreshold: 24,
      priorityThreshold: 7,
      compactMode: false,
      showCompleted: true,
      itemsPerPage: 25,
      language: 'en',
      timezone: 'UTC',
      autoSave: true,
    },
    statistics: {
      totalModules: 0,
      totalAssignments: 0,
      completedAssignments: 0,
      averageGrade: 0,
      totalStudyHours: 0,
      streakDays: 0,
    },
    systemInfo: {
      lastBackup: 'Never',
      dataSize: '0 MB',
      lastSync: 'Never',
      version: '1.0.0',
    }
  });

  // Enhanced tabs with more comprehensive sections
  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'preferences', label: 'Preferences', icon: User },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'data', label: 'Data & Backup', icon: Database },
    { id: 'advanced', label: 'Advanced', icon: Settings },
  ];

  // Fetch comprehensive settings data
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const [preferencesRes, statsRes] = await Promise.all([
          fetch('/api/settings/preferences'),
          fetch('/api/settings/stats')
        ]);

        if (preferencesRes.ok) {
          const prefs = await preferencesRes.json();
          setSettings(prev => ({ ...prev, preferences: { ...prev.preferences, ...prefs } }));
        }

        if (statsRes.ok) {
          const stats = await statsRes.json();
          setSettings(prev => ({ ...prev, statistics: stats }));
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const updatePreference = (key: string, value: string | number | boolean) => {
    setSettings(prev => ({
      ...prev,
      preferences: { ...prev.preferences, [key]: value }
    }));
  };

  const savePreferences = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/settings/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings.preferences)
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

  if (loading && activeTab === 'overview') {
    return (
      <div className="container mx-auto py-12" data-testid="academicos-settings-root">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <div className="text-lg text-slate-600 mt-4">Loading settings...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-8" data-testid="academicos-settings-root">
      {/* Settings Header */}
      <div className="section-header">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">System Settings</h2>
          <p className="text-slate-600 mt-1">Configure your Academic OS experience</p>
        </div>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 ${
          message.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
          message.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
          'bg-blue-50 border-blue-200 text-blue-800'
        }`}>
          {message.type === 'success' ? <CheckCircle className="h-5 w-5" /> :
           message.type === 'error' ? <AlertTriangle className="h-5 w-5" /> :
           <Info className="h-5 w-5" />}
          <span className="flex-1">{message.text}</span>
          <button
            onClick={() => setMessage(null)}
            className="ml-auto text-current hover:opacity-75"
          >
            ×
          </button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl p-2 shadow-sm border border-slate-200">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-200'
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
            {/* System Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="metric-card bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
                <div className="flex items-center justify-between mb-4">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div className="text-right">
                    <div className="metric-value text-blue-700">{settings.statistics.totalModules}</div>
                    <div className="metric-label text-blue-600">Modules</div>
                  </div>
                </div>
                <div className="metric-sublabel text-blue-500">Active academic modules</div>
              </div>

              <div className="metric-card bg-gradient-to-br from-emerald-50 to-green-100 border-emerald-200">
                <div className="flex items-center justify-between mb-4">
                  <Target className="h-8 w-8 text-emerald-600" />
                  <div className="text-right">
                    <div className="metric-value text-emerald-700">{settings.statistics.completedAssignments}/{settings.statistics.totalAssignments}</div>
                    <div className="metric-label text-emerald-600">Assignments</div>
                  </div>
                </div>
                <div className="metric-sublabel text-emerald-500">Completion progress</div>
              </div>

              <div className="metric-card bg-gradient-to-br from-purple-50 to-violet-100 border-purple-200">
                <div className="flex items-center justify-between mb-4">
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                  <div className="text-right">
                    <div className="metric-value text-purple-700">{Math.round(settings.statistics.averageGrade * 10) / 10}%</div>
                    <div className="metric-label text-purple-600">Average</div>
                  </div>
                </div>
                <div className="metric-sublabel text-purple-500">Overall performance</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="cohesive-section">
              <div className="p-6 border-b border-slate-200">
                <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                  <Zap className="h-5 w-5 text-purple-600" />
                  Quick Actions
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <button
                    onClick={() => openModal('onboarding')}
                    className="p-6 bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200 rounded-2xl hover:from-blue-100 hover:to-indigo-200 transition-all duration-200 text-left group"
                  >
                    <div className="text-3xl mb-3">🚀</div>
                    <div className="font-semibold text-slate-900 mb-2">Setup Wizard</div>
                    <div className="text-sm text-slate-600">Configure your academic setup</div>
                  </button>
                  
                  <button
                    onClick={() => setShowImportModal(true)}
                    className="p-6 bg-gradient-to-br from-emerald-50 to-green-100 border border-emerald-200 rounded-2xl hover:from-emerald-100 hover:to-green-200 transition-all duration-200 text-left group"
                  >
                    <div className="text-3xl mb-3">📊</div>
                    <div className="font-semibold text-slate-900 mb-2">Import Data</div>
                    <div className="text-sm text-slate-600">Import modules and assignments</div>
                  </button>
                  
                  <button
                    onClick={savePreferences}
                    disabled={loading}
                    className="p-6 bg-gradient-to-br from-purple-50 to-violet-100 border border-purple-200 rounded-2xl hover:from-purple-100 hover:to-violet-200 transition-all duration-200 text-left group disabled:opacity-50"
                  >
                    <div className="text-3xl mb-3">💾</div>
                    <div className="font-semibold text-slate-900 mb-2">Quick Save</div>
                    <div className="text-sm text-slate-600">Save current settings</div>
                  </button>
                </div>
              </div>
            </div>

            {/* System Information */}
            <div className="cohesive-section">
              <div className="p-6 border-b border-slate-200">
                <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                  <Monitor className="h-5 w-5 text-slate-600" />
                  System Information
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex justify-between py-3 border-b border-slate-100">
                      <span className="text-slate-600">Version</span>
                      <span className="font-medium text-slate-900">{settings.systemInfo.version}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-slate-100">
                      <span className="text-slate-600">Data Size</span>
                      <span className="font-medium text-slate-900">{settings.systemInfo.dataSize}</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between py-3 border-b border-slate-100">
                      <span className="text-slate-600">Last Backup</span>
                      <span className="font-medium text-slate-900">{settings.systemInfo.lastBackup}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-slate-100">
                      <span className="text-slate-600">Last Sync</span>
                      <span className="font-medium text-slate-900">{settings.systemInfo.lastSync}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <div className="space-y-6">
            <div className="cohesive-section">
              <div className="p-6 border-b border-slate-200">
                <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  General Preferences
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Academic Year</label>
                    <input
                      type="text"
                      value={settings.preferences.academicYear}
                      onChange={(e) => updatePreference('academicYear', e.target.value)}
                      className="input"
                      placeholder="2024-2025"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Default View</label>
                    <select
                      value={settings.preferences.defaultView}
                      onChange={(e) => updatePreference('defaultView', e.target.value)}
                      className="select"
                    >
                      <option value="week-view">Week View</option>
                      <option value="dashboard">Dashboard</option>
                      <option value="modules">Modules</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Language</label>
                    <select
                      value={settings.preferences.language}
                      onChange={(e) => updatePreference('language', e.target.value)}
                      className="select"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Items Per Page</label>
                    <input
                      type="number"
                      value={settings.preferences.itemsPerPage}
                      onChange={(e) => updatePreference('itemsPerPage', parseInt(e.target.value) || 25)}
                      className="input"
                      min="10"
                      max="100"
                    />
                  </div>
                </div>
                
                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-slate-900">Auto Save</div>
                      <div className="text-sm text-slate-600">Automatically save changes</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.preferences.autoSave}
                      onChange={(e) => updatePreference('autoSave', e.target.checked)}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-slate-900">Compact Mode</div>
                      <div className="text-sm text-slate-600">Use condensed layout</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.preferences.compactMode}
                      onChange={(e) => updatePreference('compactMode', e.target.checked)}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-slate-900">Show Completed</div>
                      <div className="text-sm text-slate-600">Display completed assignments</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.preferences.showCompleted}
                      onChange={(e) => updatePreference('showCompleted', e.target.checked)}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                  </div>
                </div>
                
                <div className="mt-8 flex gap-4">
                  <button
                    onClick={savePreferences}
                    disabled={loading}
                    className="btn-gradient btn-gradient-blue disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                    {loading ? 'Saving...' : 'Save Preferences'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Appearance Tab */}
        {activeTab === 'appearance' && (
          <div className="space-y-6">
            <div className="cohesive-section">
              <div className="p-6 border-b border-slate-200">
                <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                  <Palette className="h-5 w-5 text-purple-600" />
                  Theme & Appearance
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-4">Theme</label>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { value: 'light', label: 'Light', icon: Sun },
                        { value: 'dark', label: 'Dark', icon: Moon },
                        { value: 'auto', label: 'Auto', icon: Monitor }
                      ].map(({ value, label, icon: Icon }) => (
                        <button
                          key={value}
                          onClick={() => updatePreference('theme', value)}
                          className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                            settings.preferences.theme === value
                              ? 'border-purple-600 bg-purple-50'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <Icon className="h-6 w-6 mx-auto mb-2 text-slate-600" />
                          <div className="text-sm font-medium text-slate-900">{label}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div className="cohesive-section">
              <div className="p-6 border-b border-slate-200">
                <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                  <Bell className="h-5 w-5 text-emerald-600" />
                  Notification Settings
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-slate-900">Enable Notifications</div>
                      <div className="text-sm text-slate-600">Receive assignment and deadline alerts</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.preferences.notificationsEnabled}
                      onChange={(e) => updatePreference('notificationsEnabled', e.target.checked)}
                      className="h-4 w-4 text-emerald-600 rounded"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-slate-900">Email Digest</div>
                      <div className="text-sm text-slate-600">Weekly summary via email</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.preferences.emailDigest}
                      onChange={(e) => updatePreference('emailDigest', e.target.checked)}
                      className="h-4 w-4 text-emerald-600 rounded"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Reminder Threshold (hours before due date)
                    </label>
                    <input
                      type="number"
                      value={settings.preferences.reminderThreshold}
                      onChange={(e) => updatePreference('reminderThreshold', parseInt(e.target.value) || 24)}
                      className="input"
                      min="1"
                      max="168"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Data & Backup Tab */}
        {activeTab === 'data' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Import Data Card */}
              <div className="cohesive-section">
                <div className="p-6 border-b border-slate-200">
                  <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                    <Upload className="h-5 w-5 text-blue-600" />
                    Import Data
                  </h3>
                </div>
                <div className="p-6">
                  <p className="text-slate-600 mb-6">
                    Import modules, assignments, and academic data from CSV files with our guided import wizard.
                  </p>
                  <button
                    onClick={() => setShowImportModal(true)}
                    className="w-full btn-gradient btn-gradient-blue"
                  >
                    <FileText className="h-4 w-4" />
                    Import from CSV
                  </button>
                </div>
              </div>

              {/* Export Data Card */}
              <div className="cohesive-section">
                <div className="p-6 border-b border-slate-200">
                  <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                    <Download className="h-5 w-5 text-emerald-600" />
                    Export Data
                  </h3>
                </div>
                <div className="p-6">
                  <p className="text-slate-600 mb-6">
                    Export all your academic data for backup or transfer to another system.
                  </p>
                  <button
                    onClick={exportData}
                    disabled={loading}
                    className="w-full btn-gradient btn-gradient-emerald"
                  >
                    <Download className="h-4 w-4" />
                    {loading ? 'Exporting...' : 'Export All Data'}
                  </button>
                </div>
              </div>
            </div>

            {/* Danger Zone - Reset Data Card */}
            <div className="cohesive-section border-red-300 bg-red-50 shadow-lg">
              <div className="p-6 border-b border-red-200 bg-red-100">
                <h3 className="text-xl font-bold text-red-800 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  ⚠️ Danger Zone - Reset All Data
                </h3>
              </div>
              <div className="p-6">
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
                    <button
                      onClick={resetData}
                      disabled={loading}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <AlertTriangle className="h-5 w-5" />
                      {loading ? 'Resetting...' : '🗑️ RESET ALL ACADEMIC DATA'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* System Information */}
            <div className="cohesive-section">
              <div className="p-6 border-b border-slate-200">
                <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                  <Database className="h-5 w-5 text-purple-600" />
                  System Information
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-900 mb-1">{settings.systemInfo.dataSize}</div>
                    <div className="text-sm text-slate-600">Data Size</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-900 mb-1">{settings.systemInfo.version}</div>
                    <div className="text-sm text-slate-600">Version</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-900 mb-1">{settings.systemInfo.lastBackup}</div>
                    <div className="text-sm text-slate-600">Last Backup</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-900 mb-1">{settings.systemInfo.lastSync}</div>
                    <div className="text-sm text-slate-600">Last Sync</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <ImportModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          onComplete={() => {
            setShowImportModal(false);
            setMessage({ type: 'success', text: 'Data imported successfully!' });
            // Refresh statistics after import
            window.location.reload();
          }}
        />
      )}
    </div>
  );

  // Reset all data function
  async function resetData() {
    if (!window.confirm('⚠️ Are you sure you want to COMPLETELY RESET ALL academic data?\n\nThis will permanently delete:\n• All modules and courses\n• All assignments and tasks\n• All study logs and progress\n• All terms and academic years\n• All degrees and assessment data\n\nUser accounts will be preserved. This action CANNOT be undone!')) {
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
        // Refresh settings and statistics after reset
        window.location.reload();
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to reset data' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to reset data' });
    } finally {
      setLoading(false);
    }
  }

  // Export data function
  async function exportData() {
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
  }
}
