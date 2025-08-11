// AcademicOS Flow Composition
import React, { useState } from 'react';
import { 
  Settings, 
  Download, 
  Upload, 
  RotateCcw, 
  BarChart3, 
  User, 
  Save,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';
import { useAcademicOS } from '../../context/AcademicOSContext';

/**
 * Settings View Container - academic                           } catch {
                            setMessage({ type: 'error', text: 'Invalid file format' });
                          } finally {figuration and tools.
 * Provides access to import functionality and onboarding.
 */
export function SettingsViewContainer() {
  const { openModal } = useAcademicOS();
  const [activeTab, setActiveTab] = useState('preferences');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [preferences, setPreferences] = useState({
    academicYear: '2024-2025',
    defaultView: 'week-view',
    theme: 'light',
    notificationsEnabled: true,
    emailDigest: true,
    reminderThreshold: 24,
    priorityThreshold: 7,
    compactMode: false,
    showCompleted: true,
    itemsPerPage: 25
  });

  const savePreferences = async () => {
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

  const resetData = async () => {
    if (!window.confirm('Are you sure you want to reset all academic data? This action cannot be undone.')) {
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch('/api/settings/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmReset: true })
      });
      
      const result = await response.json();
      if (result.success) {
        setMessage({ type: 'success', text: 'All academic data has been reset successfully!' });
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to reset data' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to reset data' });
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'preferences', label: 'Preferences', icon: Settings },
    { id: 'data', label: 'Data Management', icon: BarChart3 },
    { id: 'tools', label: 'Tools', icon: User }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50" data-testid="academicos-settings-root">
      {/* Page Header */}
      <header className="bg-gradient-to-r from-white to-slate-50 border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-100 rounded-xl">
              <Settings className="h-8 w-8 text-primary-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Settings & Tools</h1>
              <p className="text-slate-600 mt-1">Configure your academic data and preferences</p>
            </div>
          </div>
        </div>
      </header>

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
        {activeTab === 'preferences' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-slate-700" />
                  <h3 className="text-lg font-semibold text-slate-900">General Preferences</h3>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Academic Year</label>
                    <input
                      type="text"
                      value={preferences.academicYear}
                      onChange={(e) => setPreferences({...preferences, academicYear: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="2024-2025"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Default View</label>
                    <select
                      value={preferences.defaultView}
                      onChange={(e) => setPreferences({...preferences, defaultView: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="week-view">Weekly View</option>
                      <option value="calendar">Calendar View</option>
                      <option value="dashboard">Dashboard View</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Theme</label>
                    <select
                      value={preferences.theme}
                      onChange={(e) => setPreferences({...preferences, theme: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="light">Light Theme</option>
                      <option value="dark">Dark Theme</option>
                      <option value="auto">Auto (System)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Items per page</label>
                    <input
                      type="number"
                      value={preferences.itemsPerPage}
                      onChange={(e) => setPreferences({...preferences, itemsPerPage: parseInt(e.target.value) || 25})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      min="10"
                      max="100"
                    />
                  </div>
                </div>
                
                <div className="mt-6 space-y-4">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={preferences.notificationsEnabled}
                      onChange={(e) => setPreferences({...preferences, notificationsEnabled: e.target.checked})}
                      className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-slate-700">Enable notifications</span>
                  </label>
                  
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={preferences.compactMode}
                      onChange={(e) => setPreferences({...preferences, compactMode: e.target.checked})}
                      className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-slate-700">Compact mode</span>
                  </label>
                  
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={preferences.showCompleted}
                      onChange={(e) => setPreferences({...preferences, showCompleted: e.target.checked})}
                      className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-slate-700">Show completed items</span>
                  </label>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={savePreferences}
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 disabled:opacity-50 transition-colors"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save Preferences
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'data' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Download className="h-5 w-5 text-slate-700" />
                  <h3 className="text-lg font-semibold text-slate-900">Export Data</h3>
                </div>
              </div>
              <div className="p-6">
                <p className="text-slate-600 mb-6">
                  Export all your academic data for backup or transfer to another system.
                </p>
                <button
                  onClick={exportData}
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-slate-600 text-white font-medium rounded-lg hover:bg-slate-700 focus:ring-2 focus:ring-slate-500 disabled:opacity-50 transition-colors"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  Export All Data
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-slate-700" />
                  <h3 className="text-lg font-semibold text-slate-900">Import Data</h3>
                </div>
              </div>
              <div className="p-6">
                <p className="text-slate-600 mb-6">
                  Import academic data from a previously exported file or compatible format.
                </p>
                <input
                  type="file"
                  accept=".json"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      // Handle file import
                      const reader = new FileReader();
                      reader.onload = async (event) => {
                        try {
                          const data = JSON.parse(event.target?.result as string);
                          setLoading(true);
                          const response = await fetch('/api/settings/export', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(data)
                          });
                          const result = await response.json();
                          if (result.success) {
                            setMessage({ type: 'success', text: 'Data imported successfully!' });
                          } else {
                            setMessage({ type: 'error', text: 'Failed to import data' });
                          }
                        } catch {
                          setMessage({ type: 'error', text: 'Invalid file format' });
                        } finally {
                          setLoading(false);
                        }
                      };
                      reader.readAsText(file);
                    }
                  }}
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                />
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-red-200">
                <div className="flex items-center gap-2 text-red-700">
                  <RotateCcw className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">Reset All Data</h3>
                </div>
              </div>
              <div className="p-6">
                <p className="text-red-600 mb-6">
                  This will permanently delete all academic data including modules, assignments, and tasks. This action cannot be undone.
                </p>
                <button
                  onClick={resetData}
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 disabled:opacity-50 transition-colors"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <RotateCcw className="h-4 w-4" />
                  )}
                  Reset All Data
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tools' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900">Quick Actions</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <button
                    onClick={() => openModal('onboarding')}
                    className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 text-left"
                  >
                    <div className="text-2xl mb-2">📋</div>
                    <div className="font-medium text-slate-900">Setup Wizard</div>
                    <div className="text-sm text-slate-600">Configure your academic setup</div>
                  </button>
                  
                  <button
                    onClick={() => window.location.href = '/import'}
                    className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg hover:from-green-100 hover:to-emerald-100 transition-all duration-200 text-left"
                  >
                    <div className="text-2xl mb-2">📁</div>
                    <div className="font-medium text-slate-900">Import Data</div>
                    <div className="text-sm text-slate-600">Import modules and assignments</div>
                  </button>
                  
                  <button
                    onClick={() => window.location.href = '/dashboard'}
                    className="p-4 bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 rounded-lg hover:from-purple-100 hover:to-violet-100 transition-all duration-200 text-left"
                  >
                    <div className="text-2xl mb-2">📊</div>
                    <div className="font-medium text-slate-900">Dashboard</div>
                    <div className="text-sm text-slate-600">View academic overview</div>
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900">Academic Year Summary</h3>
              </div>
              <div className="p-6">
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🎓</div>
                  <div className="text-lg font-medium text-slate-900 mb-2">Academic Year 2025</div>
                  <div className="text-slate-600 text-sm">
                    Academic year configuration and summary statistics will appear here
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
