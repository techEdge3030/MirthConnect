import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { addDirtyField, setDirty } from '../../../../states/settingsReducer';
import type { AppDispatch } from '../../../../states';
import { useAdministratorBackground } from '../../../../providers';
import {
  getUserPreferences,
  saveUserPreferences,
  getSystemPreferences,
  saveSystemPreferences,
  restoreAdministratorDefaults,
  DEFAULT_ADMIN_PREFERENCES,
  type UserPreferences,
  type SystemPreferences
} from '../../../../services/adminService';
import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';

/**
 * AdministratorTab component matching the Java GUI design
 * Integrates with API for User Preferences and localStorage for System Preferences
 */
const AdministratorTab: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { updateBackgroundColor, refreshBackgroundColor } = useAdministratorBackground();

  // React Strict Mode protection
  const isLoadingRef = useRef(false);
  const hasLoadedRef = useRef(false);

  // State for form values - split into system and user preferences
  const [systemPrefs, setSystemPrefs] = useState<SystemPreferences>(DEFAULT_ADMIN_PREFERENCES.systemPrefs);
  const [userPrefs, setUserPrefs] = useState<UserPreferences>(DEFAULT_ADMIN_PREFERENCES.userPrefs);

  // Code editor preferences (static for now)
  const [codeEditorPrefs, setCodeEditorPrefs] = useState({
    autoCompleteCharacters: '.',
    includeLetters: false,
    activationDelay: '300'
  });

  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  const loadData = useCallback(async () => {
    if (isLoadingRef.current || hasLoadedRef.current) return;

    try {
      isLoadingRef.current = true;
      setLoading(true);
      setError(null);

      console.log('Loading Administrator tab data...');

      // Load system preferences from localStorage
      const systemPreferences = getSystemPreferences();
      setSystemPrefs(systemPreferences);

      // Load user preferences from API
      const userPreferences = await getUserPreferences();
      setUserPrefs(userPreferences);

      // Update the global background color context based on loaded preferences
      if (userPreferences.administratorBackgroundColor === 'custom') {
        updateBackgroundColor(userPreferences.customBackgroundColor, false);
      } else {
        updateBackgroundColor('#1976d2', true); // Server default
      }

      hasLoadedRef.current = true;
      console.log('Administrator tab data loaded successfully');

    } catch (err: any) {
      console.error('Failed to load Administrator tab data:', err);
      setError(err.message || 'Failed to load preferences');
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, [updateBackgroundColor]);

  // Handle system preferences changes (trigger dirty state for unified save)
  const handleSystemPrefChange = (field: keyof SystemPreferences, value: string) => {
    setSystemPrefs(prev => ({ ...prev, [field]: value }));
    // Mark as dirty instead of saving immediately
    dispatch(addDirtyField(`system.${field}`));
  };

  // Handle user preferences changes (API integration)
  const handleUserPrefChange = (field: keyof UserPreferences, value: string) => {
    setUserPrefs(prev => ({ ...prev, [field]: value }));
    dispatch(addDirtyField(`user.${field}`));
  };

  // Handle color picker change
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserPrefs(prev => ({ ...prev, customBackgroundColor: e.target.value }));
    dispatch(addDirtyField('user.customBackgroundColor'));
  };

  // Handle code editor preferences changes (local only for now)
  const handleCodeEditorChange = (field: string, value: string | boolean) => {
    setCodeEditorPrefs(prev => ({ ...prev, [field]: value }));
  };

  // Save both system and user preferences
  const handleSave = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Saving Administrator tab preferences...');

      // Save system preferences to localStorage
      console.log('Saving system preferences to localStorage:', systemPrefs);
      saveSystemPreferences(systemPrefs);

      // Save user preferences to API
      console.log('Saving user preferences to API:', userPrefs);
      await saveUserPreferences(userPrefs);

      // Update the global background color context
      if (userPrefs.administratorBackgroundColor === 'custom') {
        updateBackgroundColor(userPrefs.customBackgroundColor, false);
      } else {
        updateBackgroundColor('#1976d2', true); // Server default
      }

      // Clear dirty state after successful save
      dispatch(setDirty(false));

      console.log('Administrator tab preferences saved successfully');
    } catch (err: any) {
      console.error('Failed to save Administrator tab preferences:', err);
      setError(err.message || 'Failed to save preferences');
    } finally {
      setLoading(false);
    }
  }, [systemPrefs, userPrefs, dispatch, updateBackgroundColor]);

  // Refresh data from API and localStorage
  const handleRefresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Refreshing Administrator tab data...');

      // Reset loading flags to allow reload
      isLoadingRef.current = false;
      hasLoadedRef.current = false;

      // Reload data
      await loadData();

      // Clear dirty state after refresh
      dispatch(setDirty(false));

      console.log('Administrator tab data refreshed successfully');
    } catch (err: any) {
      console.error('Failed to refresh Administrator tab data:', err);
      setError(err.message || 'Failed to refresh data');
    } finally {
      setLoading(false);
    }
  }, [loadData, dispatch]);

  // Restore defaults function - resets both system and user preferences
  const handleRestoreDefaults = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Restoring Administrator preferences to defaults...');

      // Call the restore defaults API function
      const { systemPrefs: defaultSystemPrefs, userPrefs: defaultUserPrefs } = await restoreAdministratorDefaults();

      // Update local state with the restored values
      setSystemPrefs(defaultSystemPrefs);
      setUserPrefs(defaultUserPrefs);

      // Update the global background color context to server default
      updateBackgroundColor('#1976d2', true);

      // Clear dirty state after restore
      dispatch(setDirty(false));

      console.log('Administrator preferences restored to defaults successfully');
    } catch (err: any) {
      console.error('Failed to restore Administrator defaults:', err);
      setError(err.message || 'Failed to restore defaults');
    } finally {
      setLoading(false);
    }
  }, [dispatch, updateBackgroundColor]);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Event listeners for sidebar actions
  useEffect(() => {
    const handleSaveEvent = async () => {
      console.log('Administrator tab: Save event received');
      await handleSave();
    };

    const handleRefreshEvent = async () => {
      console.log('Administrator tab: Refresh event received');
      await handleRefresh();
    };

    const handleRestoreDefaultsEvent = async () => {
      console.log('Administrator tab: Restore defaults event received');
      await handleRestoreDefaults();
    };

    // Listen for administrator-specific events only
    window.addEventListener('administrator-save-requested', handleSaveEvent);
    window.addEventListener('administrator-refresh-requested', handleRefreshEvent);
    window.addEventListener('administrator-restore-defaults-requested', handleRestoreDefaultsEvent);

    return () => {
      window.removeEventListener('administrator-save-requested', handleSaveEvent);
      window.removeEventListener('administrator-refresh-requested', handleRefreshEvent);
      window.removeEventListener('administrator-restore-defaults-requested', handleRestoreDefaultsEvent);
    };
  }, [handleSave, handleRefresh, handleRestoreDefaults]);

  // Responsive label width - larger on bigger screens
  const labelWidth = { xs: '180px', md: '220px', lg: '280px' };

  // Section title component with divider line
  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <Box sx={{ position: 'relative', mb: 3, mt: 2 }}>
      <Divider sx={{ position: 'absolute', top: '50%', left: 0, right: 0, zIndex: 1 }} />
      <Typography 
        variant="h6" 
        sx={{ 
          fontWeight: 'bold',
          backgroundColor: 'background.default',
          display: 'inline-block',
          pr: 2,
          position: 'relative',
          zIndex: 2
        }}
      >
        {children}
      </Typography>
    </Box>
  );

  // Helper component for consistent label styling
  const FieldLabel = ({ children }: { children: React.ReactNode }) => (
    <Typography 
      variant="body2" 
      sx={{ textAlign: 'right' }}
    >
      {children}
    </Typography>
  );

  // Shortcut key mappings data
  const shortcutMappings = [
    { name: 'Undo', description: 'Takes back the last action.', shortcut: '⌘-Z' },
    { name: 'Redo', description: 'Re-applies the last action undone.', shortcut: '⌘-⇧-Z' },
    { name: 'Cut', description: 'Removes current selection and places it on the clipboard.', shortcut: '⌘-X' },
    { name: 'Copy', description: 'Copies current selection to the clipboard.', shortcut: '⌘-C' },
    { name: 'Paste', description: 'Places text on clipboard at current location in text file.', shortcut: '⌘-V' },
    { name: 'Delete', description: 'Removes current selection.', shortcut: '⌫' },
    { name: 'Delete Rest Of Line', description: 'Removes everything from the current caret position to the end of the line.', shortcut: '⌘-⌦' },
    { name: 'Delete Line', description: 'Removes the current line entirely.', shortcut: '⌘-D' }
  ];

  // Show loading state
  if (loading && !hasLoadedRef.current) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
        <Typography>Loading Administrator preferences...</Typography>
      </Box>
    );
  }

  // Show error state
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error" sx={{ mb: 2 }}>
          Error loading Administrator preferences: {error}
        </Typography>
        <Button variant="outlined" onClick={handleRefresh}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: '1200px' }}>
      <Stack spacing={4}>
        {/* System Preferences Section */}
        <Box>
          <SectionTitle>System Preferences</SectionTitle>
          <Stack spacing={2}>
            <Grid container alignItems="center" spacing={2}>
              <Grid item sx={{ width: labelWidth }}>
                <FieldLabel>Dashboard refresh interval (seconds):</FieldLabel>
              </Grid>
              <Grid item xs>
                <TextField
                  size="small"
                  type="number"
                  inputProps={{ min: 1, step: 1 }}
                  value={systemPrefs.dashboardRefreshInterval}
                  onChange={(e) => handleSystemPrefChange('dashboardRefreshInterval', e.target.value)}
                  sx={{ width: '80px' }}
                />
              </Grid>
            </Grid>

            <Grid container alignItems="center" spacing={2}>
              <Grid item sx={{ width: labelWidth }}>
                <FieldLabel>Message browser page size:</FieldLabel>
              </Grid>
              <Grid item xs>
                <TextField
                  size="small"
                  type="number"
                  inputProps={{ min: 1, step: 1 }}
                  value={systemPrefs.messageBrowserPageSize}
                  onChange={(e) => handleSystemPrefChange('messageBrowserPageSize', e.target.value)}
                  sx={{ width: '80px' }}
                />
              </Grid>
            </Grid>

            <Grid container alignItems="center" spacing={2}>
              <Grid item sx={{ width: labelWidth }}>
                <FieldLabel>Event browser page size:</FieldLabel>
              </Grid>
              <Grid item xs>
                <TextField
                  size="small"
                  type="number"
                  inputProps={{ min: 1, step: 1 }}
                  value={systemPrefs.eventBrowserPageSize}
                  onChange={(e) => handleSystemPrefChange('eventBrowserPageSize', e.target.value)}
                  sx={{ width: '80px' }}
                />
              </Grid>
            </Grid>

            <Grid container alignItems="center" spacing={2}>
              <Grid item sx={{ width: labelWidth }}>
                <FieldLabel>Format text in message browser:</FieldLabel>
              </Grid>
              <Grid item xs>
                <RadioGroup
                  row
                  value={systemPrefs.formatTextInMessageBrowser}
                  onChange={(e) => handleSystemPrefChange('formatTextInMessageBrowser', e.target.value)}
                >
                  <FormControlLabel value="yes" control={<Radio size="small" />} label="Yes" />
                  <FormControlLabel value="no" control={<Radio size="small" />} label="No" />
                </RadioGroup>
              </Grid>
            </Grid>

            <Grid container alignItems="center" spacing={2}>
              <Grid item sx={{ width: labelWidth }}>
                <FieldLabel>Message browser text search confirmation:</FieldLabel>
              </Grid>
              <Grid item xs>
                <RadioGroup
                  row
                  value={systemPrefs.messageBrowserTextSearchConfirmation}
                  onChange={(e) => handleSystemPrefChange('messageBrowserTextSearchConfirmation', e.target.value)}
                >
                  <FormControlLabel value="yes" control={<Radio size="small" />} label="Yes" />
                  <FormControlLabel value="no" control={<Radio size="small" />} label="No" />
                </RadioGroup>
              </Grid>
            </Grid>

            <Grid container alignItems="center" spacing={2}>
              <Grid item sx={{ width: labelWidth }}>
                <FieldLabel>Filter/Transformer iterator dialog:</FieldLabel>
              </Grid>
              <Grid item xs>
                <RadioGroup
                  row
                  value={systemPrefs.filterTransformerIteratorDialog}
                  onChange={(e) => handleSystemPrefChange('filterTransformerIteratorDialog', e.target.value)}
                >
                  <FormControlLabel value="yes" control={<Radio size="small" />} label="Yes" />
                  <FormControlLabel value="no" control={<Radio size="small" />} label="No" />
                </RadioGroup>
              </Grid>
            </Grid>

            <Grid container alignItems="center" spacing={2}>
              <Grid item sx={{ width: labelWidth }}>
                <FieldLabel>Message browser attachment type dialog:</FieldLabel>
              </Grid>
              <Grid item xs>
                <RadioGroup
                  row
                  value={systemPrefs.messageBrowserAttachmentTypeDialog}
                  onChange={(e) => handleSystemPrefChange('messageBrowserAttachmentTypeDialog', e.target.value)}
                >
                  <FormControlLabel value="yes" control={<Radio size="small" />} label="Yes" />
                  <FormControlLabel value="no" control={<Radio size="small" />} label="No" />
                </RadioGroup>
              </Grid>
            </Grid>

            <Grid container alignItems="center" spacing={2}>
              <Grid item sx={{ width: labelWidth }}>
                <FieldLabel>Reprocess/remove messages confirmation:</FieldLabel>
              </Grid>
              <Grid item xs>
                <RadioGroup
                  row
                  value={systemPrefs.reprocessRemoveMessagesConfirmation}
                  onChange={(e) => handleSystemPrefChange('reprocessRemoveMessagesConfirmation', e.target.value)}
                >
                  <FormControlLabel value="yes" control={<Radio size="small" />} label="Yes" />
                  <FormControlLabel value="no" control={<Radio size="small" />} label="No" />
                </RadioGroup>
              </Grid>
            </Grid>

            <Grid container alignItems="center" spacing={2}>
              <Grid item sx={{ width: labelWidth }}>
                <FieldLabel>Import code template libraries with channels:</FieldLabel>
              </Grid>
              <Grid item xs>
                <RadioGroup
                  row
                  value={systemPrefs.importCodeTemplateLibrariesWithChannels}
                  onChange={(e) => handleSystemPrefChange('importCodeTemplateLibrariesWithChannels', e.target.value)}
                >
                  <FormControlLabel value="yes" control={<Radio size="small" />} label="Yes" />
                  <FormControlLabel value="no" control={<Radio size="small" />} label="No" />
                  <FormControlLabel value="ask" control={<Radio size="small" />} label="Ask" />
                </RadioGroup>
              </Grid>
            </Grid>

            <Grid container alignItems="center" spacing={2}>
              <Grid item sx={{ width: labelWidth }}>
                <FieldLabel>Export code template libraries with channels:</FieldLabel>
              </Grid>
              <Grid item xs>
                <RadioGroup
                  row
                  value={systemPrefs.exportCodeTemplateLibrariesWithChannels}
                  onChange={(e) => handleSystemPrefChange('exportCodeTemplateLibrariesWithChannels', e.target.value)}
                >
                  <FormControlLabel value="yes" control={<Radio size="small" />} label="Yes" />
                  <FormControlLabel value="no" control={<Radio size="small" />} label="No" />
                  <FormControlLabel value="ask" control={<Radio size="small" />} label="Ask" />
                </RadioGroup>
              </Grid>
            </Grid>
          </Stack>
        </Box>

        {/* User Preferences Section */}
        <Box>
          <SectionTitle>User Preferences</SectionTitle>
          <Stack spacing={2}>
            <Grid container alignItems="center" spacing={2}>
              <Grid item sx={{ width: labelWidth }}>
                <FieldLabel>Check for new notifications on login:</FieldLabel>
              </Grid>
              <Grid item xs>
                <RadioGroup
                  row
                  value={userPrefs.checkForNewNotificationsOnLogin}
                  onChange={(e) => handleUserPrefChange('checkForNewNotificationsOnLogin', e.target.value)}
                >
                  <FormControlLabel value="yes" control={<Radio size="small" />} label="Yes" />
                  <FormControlLabel value="no" control={<Radio size="small" />} label="No" />
                </RadioGroup>
              </Grid>
            </Grid>

            <Grid container alignItems="center" spacing={2}>
              <Grid item sx={{ width: labelWidth }}>
                <FieldLabel>Administrator Background Color:</FieldLabel>
              </Grid>
              <Grid item xs>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                  <RadioGroup
                    row
                    value={userPrefs.administratorBackgroundColor}
                    onChange={(e) => handleUserPrefChange('administratorBackgroundColor', e.target.value)}
                  >
                    <FormControlLabel value="server-default" control={<Radio size="small" />} label="Server Default" />
                    <FormControlLabel value="custom" control={<Radio size="small" />} label="Custom:" />
                  </RadioGroup>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <input
                      type="color"
                      value={userPrefs.customBackgroundColor}
                      onChange={handleColorChange}
                      disabled={userPrefs.administratorBackgroundColor !== 'custom'}
                      style={{
                        width: '30px',
                        height: '25px',
                        border: '1px solid #ccc',
                        cursor: userPrefs.administratorBackgroundColor === 'custom' ? 'pointer' : 'not-allowed',
                        borderRadius: '4px',
                        opacity: userPrefs.administratorBackgroundColor === 'custom' ? 1 : 0.5
                      }}
                    />
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
};

export default AdministratorTab; 
