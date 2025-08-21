import { Alert, Box, CircularProgress, Paper, Tab, Tabs } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import { useAlert } from '../../providers/AlertProvider';
import { setCurrentTab } from '../../states/settingsReducer';
import type { AppDispatch } from '../../states';
import {
  type CodeEditorPreferences,
  DEFAULT_SETTINGS,
  getServerSettings,
  getUserPreferences,
  saveServerSettings,
  saveUserPreferences,
  type SystemPreferences,
  type UserPreferences
} from '../../services/settingsService';
import { DEFAULT_SERVER_TAB, TABS } from './SettingsView.types';
import {
  AdministratorTab,
  ConfigurationMapTab,
  DatabaseTasksTab,
  DataPrunerTab,
  ResourcesTab,
  ServerTab,
  TagsTab
} from './tabs';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

/**
 * TabPanel component for managing tab content visibility
 * Follows accessibility best practices with proper ARIA attributes
 */
const TabPanel: React.FC<TabPanelProps> = ({
  children,
  value,
  index,
  ...other
}) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

/**
 * Main Settings View Component
 * Componentized implementation of all 7 settings tabs
 */
const SettingsView: React.FC = () => {
  // State management with proper TypeScript typing
  const [tabValue, setTabValue] = useState(DEFAULT_SERVER_TAB);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<boolean>(false);

  const { setOpen, setSeverity, setMessage } = useAlert();
  const dispatch = useDispatch<AppDispatch>();

  // Settings state with proper default values
  const [systemPrefs, setSystemPrefs] = useState<SystemPreferences>(
    DEFAULT_SETTINGS.systemPrefs
  );
  const [userPrefs, setUserPrefs] = useState<UserPreferences>(
    DEFAULT_SETTINGS.userPrefs
  );
  const [codeEditorPrefs, setCodeEditorPrefs] = useState<CodeEditorPreferences>(
    DEFAULT_SETTINGS.codeEditorPrefs
  );

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    dispatch(setCurrentTab(newValue));
  };
  const loadTabSpecificData = async () => {};

  /**
   * Load settings from server with proper error handling
   * Handles authentication failures gracefully
   */
  useCallback(async (): Promise<void> => {
    setLoading(true);
    setAuthError(false);
    try {
      // Load system preferences from server config map
      const settings = await getServerSettings();
      setSystemPrefs(settings.systemPrefs);
      // Load user preferences from user preferences API
      const userPrefsData = await getUserPreferences();
      setUserPrefs({
        checkForNewNotificationsOnLogin:
          userPrefsData.checkForNewNotificationsOnLogin ??
          DEFAULT_SETTINGS.userPrefs.checkForNewNotificationsOnLogin,
        administratorBackgroundColor:
          userPrefsData.administratorBackgroundColor ??
          DEFAULT_SETTINGS.userPrefs.administratorBackgroundColor,
        customBackgroundColor:
          userPrefsData.customBackgroundColor ??
          DEFAULT_SETTINGS.userPrefs.customBackgroundColor
      });
      setCodeEditorPrefs({
        theme: userPrefsData.theme ?? DEFAULT_SETTINGS.codeEditorPrefs.theme,
        fontSize:
          userPrefsData.fontSize ?? DEFAULT_SETTINGS.codeEditorPrefs.fontSize,
        wordWrap:
          userPrefsData.wordWrap === 'true' || userPrefsData.wordWrap === true,
        autoComplete:
          userPrefsData.autoComplete === 'true' ||
          userPrefsData.autoComplete === true,
        showLineNumbers:
          userPrefsData.showLineNumbers === 'true' ||
          userPrefsData.showLineNumbers === true,
        showGutter:
          userPrefsData.showGutter === 'true' ||
          userPrefsData.showGutter === true,
        highlightActiveLine:
          userPrefsData.highlightActiveLine === 'true' ||
          userPrefsData.highlightActiveLine === true,
        showInvisibles:
          userPrefsData.showInvisibles === 'true' ||
          userPrefsData.showInvisibles === true
      });
    } catch (error: any) {
      console.error('Failed to load settings:', error);
      if (error.response?.status === 401) {
        setAuthError(true);
        setSeverity('warning');
        setMessage(
          'Session expired. Please log out and log back in to access settings.'
        );
      } else {
        setSeverity('warning');
        setMessage(
          'Failed to load settings from server. Using default values.'
        );
      }
    }
  }, [setOpen, setSeverity, setMessage]);

  // Load data on component mount
  useEffect(() => {
    // Set initial tab in Redux
    dispatch(setCurrentTab(DEFAULT_SERVER_TAB));
    
    const loadData = async () => {
      try {
        console.log('SettingsView: loading data...');
        setLoading(true);
        setAuthError(false);

        // Load settings
        const settings = await getServerSettings();
        setSystemPrefs(settings.systemPrefs);
        setUserPrefs(settings.userPrefs);
        setCodeEditorPrefs(settings.codeEditorPrefs);

        // Load additional data
        await loadTabSpecificData();
        console.log('SettingsView: data loaded');
      } catch (error: any) {
        console.error('SettingsView: failed to load settings:', error);
        if (error.response?.status === 401 || error.response?.status === 403) {
          setAuthError(true);
          setSeverity('error');
          setMessage('Authentication failed. Please log in again.');
          setOpen(true);
        } else {
          setSeverity('error');
          setMessage('Failed to load settings. Please try again.');
          setOpen(true);
        }
      } finally {
        setLoading(false);
        console.log('SettingsView: setLoading(false) called');
      }
    };
    loadData();
  }, []);

  /**
   * Save settings with comprehensive error handling
   * Provides clear feedback to users about save status
   */
  const handleSave = useCallback(async (): Promise<void> => {
    try {
      // Save system preferences to config map
      await saveServerSettings({
        systemPrefs,
        userPrefs: DEFAULT_SETTINGS.userPrefs, // Not used for saving here
        codeEditorPrefs: DEFAULT_SETTINGS.codeEditorPrefs // Not used for saving here
      });
      // Save user and code editor preferences to user preferences API
      await saveUserPreferences({
        ...userPrefs,
        ...Object.fromEntries(
          Object.entries(codeEditorPrefs).map(([k, v]) => [k, v.toString()])
        )
      });
      setSeverity('success');
      setMessage('Settings saved successfully!');
      setOpen(true);
    } catch (error: any) {
      console.error('Failed to save settings:', error);
      if (error.response?.status === 401) {
        setAuthError(true);
        setSeverity('error');
        setMessage(
          'Session expired. Please log out and log back in to save settings.'
        );
      } else {
        setSeverity('error');
        setMessage('Failed to save settings. Please try again.');
      }
      setOpen(true);
    } finally {
      // setSaving(false); // Removed as per edit hint
    }
  }, [
    systemPrefs,
    userPrefs,
    codeEditorPrefs,
    setSeverity,
    setMessage,
    setOpen
  ]);
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: 400
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Paper elevation={2}>
        {/* Authentication error alert */}
        {authError && (
          <Alert severity="warning" sx={{ m: 2 }}>
            Authentication required. Please log out and log back in to access
            settings.
          </Alert>
        )}

        {/* Main tab navigation */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="settings tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            {TABS.map((tab, index) => (
              <Tab key={tab} label={tab} id={`settings-tab-${index}`} />
            ))}
          </Tabs>
        </Box>

        {/* Server Tab */}
        <TabPanel value={tabValue} index={0}>
          <ServerTab />
        </TabPanel>

        {/* Administrator Tab */}
        <TabPanel value={tabValue} index={1}>
          <AdministratorTab />
        </TabPanel>

        {/* Tags Tab */}
        <TabPanel value={tabValue} index={2}>
          <TagsTab />
        </TabPanel>

        {/* Configuration Map Tab */}
        <TabPanel value={tabValue} index={3}>
          <ConfigurationMapTab />
        </TabPanel>

        {/* Database Tasks Tab */}
        <TabPanel value={tabValue} index={4}>
          <DatabaseTasksTab />
        </TabPanel>

        {/* Resources Tab */}
        <TabPanel value={tabValue} index={5}>
          <ResourcesTab />
        </TabPanel>

        {/* Data Pruner Tab */}
        <TabPanel value={tabValue} index={6}>
          <DataPrunerTab />
        </TabPanel>
      </Paper>
    </Box>
  );
};
export default SettingsView;
