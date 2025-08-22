// Import the new Enhanced Settings Page
import { EnhancedSettingsPage } from '../../../components/settings/EnhancedSettingsPage';

/**
 * Settings View Container - Wrapper component that integrates the enhanced settings page
 * into the Academic OS shell. This provides a clean interface between the shell and the
 * comprehensive settings system.
 */
export function SettingsViewContainer() {
  return <EnhancedSettingsPage />;
}
