import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { AppDispatch } from '../../../../states';
import { setDirty } from '../../../../states/settingsReducer';
import {
  Box,
  Button,
  Divider,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  TextField
} from '@mui/material';

import { getDataPrunerProperties, getDataPrunerStatus, transformPropertiesToMap, transformStatusToMap, saveDataPrunerProperties } from '../../../../services/dataPrunerService';

// Import utility functions
import { transformScheduleToPollingProperties, transformArchiveToArchiverOptions, toBool } from './utils/transformations';
import { parseArchiverOptions, parsePollingProperties, parseScheduleSettings, parseArchiveSettings } from './utils/parsers';
import { validatePruneSettings, validateArchiveSettings, validateScheduleSettings } from './utils/validation';

// Import extracted components
import ValidationModals from './components/ValidationModals';
import StatusSection from './components/StatusSection';
import PruneSection from './components/PruneSection';
import ScheduleSection from './components/ScheduleSection';
import ArchiveSection from './components/ArchiveSection';
import AdvancedSettingsDialog from './components/AdvancedSettingsDialog';

// Import constants
import {
  DEFAULT_VALUES,
  DRAGGABLE_TOKENS
} from './constants';

interface PrunerStatus {
  currentState: string;
  currentProcess: string;
  lastProcess: string;
  nextProcess: string;
}

interface CronJob {
  expression: string;
  description: string;
  selected?: boolean;
  editingExpression?: boolean;
  editingDescription?: boolean;
}

interface AdvancedSettings {
  activeDaysType: 'Weekly' | 'Monthly';
  weeklyDays: {
    sunday: boolean;
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
  };
  monthlyDay: string;
  activeTimeType: 'All Day' | 'Range';
  timeRangeStart: string;
  timeRangeEnd: string;
}

interface ScheduleSettings {
  enabled: boolean;
  scheduleType: string;
  interval: string;
  intervalUnit: string;
  time: string;
  cronJobs: CronJob[];
  advancedSettings: AdvancedSettings;
}

interface PruneSettings {
  blockSize: string;
  pruneEvents: boolean;
  pruneEventAge: number;
}

interface ArchiveSettings {
  enableArchiving: boolean;
  archiveBlockSize: string;
  content: string;
  encrypt: boolean;
  includeAttachments: boolean;
  compression: string;
  passwordProtect: boolean;
  encryptionType: string;
  password: string;
  rootPath: string;
  filePattern: string;
}





const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <Box sx={{ position: 'relative', mb: 3, mt: 3 }}>
    <Divider sx={{ position: 'absolute', top: '50%', left: 0, right: 0, zIndex: 1 }} />
    <Typography 
      variant="h6" 
      sx={{ 
        fontWeight: 'bold',
        backgroundColor: 'background.default',
        display: 'inline-block',
        pr: 2,
        position: 'relative',
        zIndex: 2,
        color: 'primary.main'
      }}
    >
      {children}
    </Typography>
  </Box>
);

const TokensPanel = ({ focusedField, onTokenClick }: { focusedField: string | null; onTokenClick: (tokenValue: string) => void }) => {
  const handleTokenClick = (tokenValue: string) => {
    if (focusedField) {
      onTokenClick(tokenValue);
    }
  };

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 2, 
        backgroundColor: 'grey.50',
        height: 'fit-content',
        minHeight: '300px'
      }}
    >
      <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
        Available Fields
      </Typography>
      <Typography variant="caption" sx={{ mb: 2, display: 'block', color: 'text.secondary' }}>
        Click a field to insert into the focused input
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {DRAGGABLE_TOKENS.map((token) => (
          <Button
            key={token.id}
            variant="outlined"
            size="small"
            onClick={() => handleTokenClick(token.value)}
            sx={{
              justifyContent: 'flex-start',
              textAlign: 'left',
              borderColor: 'grey.300',
              color: 'text.primary',
              backgroundColor: 'background.paper',
              '&:hover': {
                backgroundColor: 'primary.light',
                borderColor: 'primary.main'
              },
              '&:disabled': {
                backgroundColor: 'grey.100',
                color: 'text.disabled'
              }
            }}
            disabled={!focusedField}
          >
            {token.label}
          </Button>
        ))}
      </Box>
      {!focusedField && (
        <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'warning.main' }}>
          Focus an input field to enable token insertion
        </Typography>
      )}
    </Paper>
  );
};

// Enhanced TextField that accepts token insertion and tracks focus
const ClickableTextField = ({
  value,
  onChange,
  disabled,
  fieldId,
  onFocus,
  onBlur,
  ...props
}: any) => {
  const handleFocus = (e: React.FocusEvent) => {
    onFocus?.(fieldId);
    props.onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent) => {
    onBlur?.();
    props.onBlur?.(e);
  };

  return (
    <TextField
      {...props}
      value={value}
      onChange={onChange}
      disabled={disabled}
      onFocus={handleFocus}
      onBlur={handleBlur}
      sx={{
        ...props.sx,
        '& .MuiOutlinedInput-root': {
          ...props.sx?.['& .MuiOutlinedInput-root'],
          '&.Mui-focused': {
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'primary.main',
              borderWidth: 2
            }
          }
        }
      }}
    />
  );
};

/**
 * DataPrunerTab component displaying data pruning configuration
 */

const DataPrunerTab: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // Focus tracking state for token insertion
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // React Strict Mode protection refs
  const hasLoadedRef = useRef(false);
  const isLoadingRef = useRef(false);

  // Status data (read-only)
  const [status, setStatus] = useState<PrunerStatus>({
    currentState: 'Not running',
    currentProcess: '-',
    lastProcess: '-',
    nextProcess: 'Not scheduled'
  });

  // Advanced Settings Dialog state
  const [advancedDialogOpen, setAdvancedDialogOpen] = useState(false);
  const [advancedDialogMode, setAdvancedDialogMode] = useState<'Interval' | 'Time'>('Interval');
  const [selectedCronJobs, setSelectedCronJobs] = useState<number[]>([]);

  // Cron Tip Modal state (read-only, no dirty state)
  const [cronTipModalOpen, setCronTipModalOpen] = useState(false);

  // Interval validation error modal state
  const [intervalErrorModalOpen, setIntervalErrorModalOpen] = useState(false);
  const [intervalErrorMessage, setIntervalErrorMessage] = useState('');

  // Save operation state
  const [saveInProgress, setSaveInProgress] = useState(false);
  const [saveErrorModalOpen, setSaveErrorModalOpen] = useState(false);
  const [saveErrorMessage, setSaveErrorMessage] = useState('');

  // Archive Settings validation error state
  const [archiveValidationErrors, setArchiveValidationErrors] = useState<{
    archiveBlockSize: string;
    rootPath: string;
    filePattern: string;
    password: string;
  }>({
    archiveBlockSize: '',
    rootPath: '',
    filePattern: '',
    password: ''
  });

  // Schedule settings
  const [schedule, setSchedule] = useState<ScheduleSettings>({
    enabled: false,
    scheduleType: 'Interval',
    interval: '1',
    intervalUnit: 'hours',
    time: '09:01',
    cronJobs: [
      { expression: '0 0 */1 * * ?', description: 'Run hourly.', selected: false, editingExpression: false, editingDescription: false }
    ],
    advancedSettings: {
      activeDaysType: 'Weekly',
      weeklyDays: {
        sunday: true,
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: true
      },
      monthlyDay: '1',
      activeTimeType: 'Range',
      timeRangeStart: '08:00',
      timeRangeEnd: '17:00'
    }
  });

  // Prune settings
  const [pruneSettings, setPruneSettings] = useState<PruneSettings>({
    blockSize: DEFAULT_VALUES.PRUNE_BLOCK_SIZE,
    pruneEvents: true,
    pruneEventAge: parseInt(DEFAULT_VALUES.PRUNE_EVENT_AGE)
  });

  // Archive settings
  const [archiveSettings, setArchiveSettings] = useState<ArchiveSettings>({
    enableArchiving: false,
    archiveBlockSize: '50',
    content: 'XML serialized message',
    encrypt: false,
    includeAttachments: false,
    compression: 'none',
    passwordProtect: false,
    encryptionType: 'AES-256',
    password: '',
    rootPath: '',
    filePattern: ''
  });

















  // Load data from server
  const loadData = useCallback(async (isRefresh = false) => {
    // Prevent duplicate calls in React Strict Mode
    if (!isRefresh && (hasLoadedRef.current || isLoadingRef.current)) {
      return;
    }

    if (isRefresh && isLoadingRef.current) {
      return;
    }

    try {
      isLoadingRef.current = true;
      setLoading(true);
      setError(null);


      // Load both properties and status in parallel
      const [propertiesResponse, statusResponse] = await Promise.all([
        getDataPrunerProperties(),
        getDataPrunerStatus()
      ]);

      // Transform API responses to usable data
      const properties = transformPropertiesToMap(propertiesResponse);
      const statusData = transformStatusToMap(statusResponse);


      // Update status data
      setStatus({
        currentState: (statusData.currentState as string) || 'Not running',
        currentProcess: (statusData.currentProcess as string) || '-',
        lastProcess: (statusData.lastProcess as string) || '-',
        nextProcess: (statusData.nextProcess as string) || 'Not scheduled'
      });

      // Transform properties to component state

      // Map to PruneSettings
      const newPruneSettings = {
        blockSize: properties.pruningBlockSize || DEFAULT_VALUES.PRUNE_BLOCK_SIZE,
        pruneEvents: toBool(properties.pruneEvents),
        pruneEventAge: parseInt(properties.maxEventAge || DEFAULT_VALUES.PRUNE_EVENT_AGE)
      };
      setPruneSettings(newPruneSettings);

      // Parse archiverOptions XML if available
      let archiverConfig = {};
      if (properties.archiverOptions) {
        try {
          archiverConfig = parseArchiverOptions(properties.archiverOptions);
        } catch (err) {
          console.warn('Failed to parse archiverOptions XML:', err);
        }
      }

      // Parse archive settings using utility function
      const newArchiveSettings = parseArchiveSettings(archiverConfig, properties);
      setArchiveSettings(newArchiveSettings);

      // Parse pollingProperties XML if available
      let pollingConfig = {};
      if (properties.pollingProperties) {
        try {
          pollingConfig = parsePollingProperties(properties.pollingProperties);
        } catch (err) {
          console.warn('Failed to parse pollingProperties XML:', err);
        }
      }

      // Parse schedule settings using utility function
      const newScheduleSettings = parseScheduleSettings(pollingConfig, properties);
      setSchedule(newScheduleSettings as ScheduleSettings);



      // Mark as loaded on successful completion
      hasLoadedRef.current = true;

    } catch (err: any) {
      console.error('Failed to load Data Pruner data:', err);
      setError(err.message || 'Failed to load Data Pruner configuration');
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, []);

  const handleScheduleChange = (field: string, value: any) => {
    const newSchedule = { ...schedule, [field]: value };
    setSchedule(newSchedule);
    dispatch(setDirty(true));
  };

  // Event handlers for sidebar actions
  const handleRefresh = useCallback(async () => {

    // Clear any validation errors
    setArchiveValidationErrors({
      archiveBlockSize: '',
      rootPath: '',
      filePattern: '',
      password: ''
    });

    // Reset load protection for refresh
    hasLoadedRef.current = false;

    // Reload data from API
    await loadData(true);

    // Clear dirty state
    dispatch(setDirty(false));

  }, [loadData, dispatch]);

  const handleViewEvents = () => {
    // Navigate to Events page
    navigate('/events');
  };

  const handlePruneNow = () => {
    // Start pruning process
    // Add your prune now logic here
  };

  const handleSave = async () => {
    // Prevent multiple simultaneous save operations
    if (saveInProgress) return;

    setSaveInProgress(true);

    // Validate all settings using imported validation functions
    const pruneErrors = validatePruneSettings(pruneSettings);
    const scheduleErrors = validateScheduleSettings(schedule);
    const archiveErrors = validateArchiveSettings(archiveSettings);

    // Check for prune settings errors
    if (pruneErrors.blockSize) {
      setIntervalErrorMessage(pruneErrors.blockSize);
      setIntervalErrorModalOpen(true);
      setSaveInProgress(false);
      return;
    }

    // Check for schedule errors
    if (scheduleErrors.interval) {
      setIntervalErrorMessage(scheduleErrors.interval);
      setIntervalErrorModalOpen(true);
      setSaveInProgress(false);
      return;
    }

    // Check for archive errors
    if (Object.values(archiveErrors).some(error => error && typeof error === 'string' && error.trim() !== '')) {
      setArchiveValidationErrors({
        archiveBlockSize: archiveErrors.archiveBlockSize || '',
        rootPath: archiveErrors.rootPath || '',
        filePattern: archiveErrors.filePattern || '',
        password: archiveErrors.password || ''
      });
      setSaveInProgress(false);
      return;
    }

    // Clear any existing validation errors on successful validation
    setArchiveValidationErrors({
      archiveBlockSize: '',
      rootPath: '',
      filePattern: '',
      password: ''
    });

    try {

      // Transform UI state back to server format
      const pollingPropertiesXML = transformScheduleToPollingProperties(schedule);
      const archiverOptionsXML = transformArchiveToArchiverOptions(archiveSettings);

      // Build properties array for API - EXACT MATCH TO JAVA GUI FORMAT
      const properties = [
        { '@name': 'enabled', '$': schedule.enabled.toString() },
        { '@name': 'pollingProperties', '$': pollingPropertiesXML },
        { '@name': 'archiveEnabled', '$': archiveSettings.enableArchiving.toString() },
        { '@name': 'archiverBlockSize', '$': archiveSettings.archiveBlockSize.toString() },
        { '@name': 'archiverOptions', '$': archiverOptionsXML },
        { '@name': 'pruningBlockSize', '$': pruneSettings.blockSize.toString() },
        { '@name': 'pruneEvents', '$': pruneSettings.pruneEvents.toString() },
        { '@name': 'maxEventAge', '$': pruneSettings.pruneEventAge.toString() }
      ];


      // Call save API
      await saveDataPrunerProperties(properties);

      // Refresh status after save
      await loadData(false);

      // Clear dirty state after successful save
      dispatch(setDirty(false));


    } catch (error) {
      console.error('Failed to save Data Pruner settings:', error);
      setSaveErrorMessage(error instanceof Error ? error.message : 'An unknown error occurred while saving settings');
      setSaveErrorModalOpen(true);
    } finally {
      setSaveInProgress(false);
    }
  };

  const handlePruneChange = (field: keyof PruneSettings, value: string | boolean) => {

    setPruneSettings(prev => ({ ...prev, [field]: value }));
    dispatch(setDirty(true));
  };

  const handleAdvancedSettingsChange = (field: string, value: any) => {
    setSchedule(prev => ({
      ...prev,
      advancedSettings: {
        ...prev.advancedSettings,
        [field]: value
      }
    }));
    dispatch(setDirty(true));
  };

  const handleSpannerClick = (mode: string) => {
    setAdvancedDialogMode(mode as 'Interval' | 'Time');
    setAdvancedDialogOpen(true);
  };

  const handleAdvancedDialogClose = () => {
    setAdvancedDialogOpen(false);
  };

  const handleAdvancedDialogOk = () => {
    setAdvancedDialogOpen(false);
    // Settings are already saved via handleAdvancedSettingsChange
  };

  const handleCronJobSelect = (index: number) => {
    setSelectedCronJobs(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index);
      } else {
        return [...prev, index];
      }
    });
  };

  const handleAddCronJob = () => {
    const newJob: CronJob = {
      expression: '',
      description: '',
      selected: false,
      editingExpression: true,
      editingDescription: false
    };
    setSchedule(prev => ({
      ...prev,
      cronJobs: [...prev.cronJobs, newJob]
    }));
    dispatch(setDirty(true));
  };

  const handleRemoveCronJobs = () => {
    setSchedule(prev => ({
      ...prev,
      cronJobs: prev.cronJobs.filter((_, index) => !selectedCronJobs.includes(index))
    }));
    setSelectedCronJobs([]);
    dispatch(setDirty(true));
  };

  const handleCronJobEdit = (index: number, field: string, value: string) => {
    setSchedule(prev => ({
      ...prev,
      cronJobs: prev.cronJobs.map((job, i) =>
        i === index ? { ...job, [field]: value } : job
      )
    }));
    dispatch(setDirty(true));
  };

  const handleCronJobEditToggle = (index: number, field: string, editing: boolean) => {
    setSchedule(prev => ({
      ...prev,
      cronJobs: prev.cronJobs.map((job, i) =>
        i === index ? {
          ...job,
          editingExpression: field === 'expression' ? editing : job.editingExpression,
          editingDescription: field === 'description' ? editing : job.editingDescription
        } : job
      )
    }));
  };

  const handleSelectAllCronJobs = () => {
    if (selectedCronJobs.length === schedule.cronJobs.length) {
      // Deselect all
      setSelectedCronJobs([]);
    } else {
      // Select all
      setSelectedCronJobs(schedule.cronJobs.map((_, index) => index));
    }
  };



  const handleCronTipOpen = () => {
    setCronTipModalOpen(true);
    // Note: This is read-only, so no dirty state is triggered
  };



  // Load initial data on component mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Listen for sidebar events
  useEffect(() => {
    const handleRefreshEvent = () => handleRefresh();
    const handleViewEventsEvent = () => handleViewEvents();
    const handlePruneNowEvent = () => handlePruneNow();
    const handleSaveEvent = () => handleSave();

    window.addEventListener('data-pruner-refresh-requested', handleRefreshEvent);
    window.addEventListener('data-pruner-view-events-requested', handleViewEventsEvent);
    window.addEventListener('data-pruner-prune-now-requested', handlePruneNowEvent);
    window.addEventListener('settings-save-requested', handleSaveEvent);

    return () => {
      window.removeEventListener('data-pruner-refresh-requested', handleRefreshEvent);
      window.removeEventListener('data-pruner-view-events-requested', handleViewEventsEvent);
      window.removeEventListener('data-pruner-prune-now-requested', handlePruneNowEvent);
      window.removeEventListener('settings-save-requested', handleSaveEvent);
    };
  }, [handleSave, handleRefresh]);

  const handleArchiveChange = (field: keyof ArchiveSettings, value: string | boolean) => {
    setArchiveSettings(prev => {
      const newSettings = { ...prev, [field]: value };

      // If compression is not "zip", disable password protection
      if (field === 'compression' && value !== 'zip') {
        newSettings.passwordProtect = false;
        newSettings.password = '';
      }

      // If password protect is disabled, clear password
      if (field === 'passwordProtect' && value === false) {
        newSettings.password = '';
      }

      // If content type changes away from "XML serialized message", clear includeAttachments
      if (field === 'content' && value !== 'XML serialized message') {
        newSettings.includeAttachments = false;
      }

      return newSettings;
    });

    // Clear validation error for the field being changed
    if (archiveValidationErrors[field as keyof typeof archiveValidationErrors]) {
      setArchiveValidationErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }

    dispatch(setDirty(true));
  };

  // Handle field focus for token insertion
  const handleFieldFocus = (fieldId: string) => {
    setFocusedField(fieldId);
  };

  // Handle field blur for token insertion
  const handleFieldBlur = () => {
    // Small delay to allow click events to register
    setTimeout(() => setFocusedField(null), 150);
  };

  // Handle token insertion into focused field
  const handleTokenInsert = (fieldId: string, tokenValue: string) => {
    switch (fieldId) {
      case 'archiveBlockSize':
        setArchiveSettings(prev => ({ 
          ...prev, 
          archiveBlockSize: prev.archiveBlockSize + tokenValue 
        }));
        dispatch(setDirty(true));
        break;
      case 'password':
        setArchiveSettings(prev => ({ 
          ...prev, 
          password: prev.password + tokenValue 
        }));
        dispatch(setDirty(true));
        break;
      case 'rootPath':
        setArchiveSettings(prev => ({ 
          ...prev, 
          rootPath: prev.rootPath + tokenValue 
        }));
        dispatch(setDirty(true));
        break;
      case 'filePattern':
        setArchiveSettings(prev => ({ 
          ...prev, 
          filePattern: prev.filePattern + tokenValue 
        }));
        dispatch(setDirty(true));
        break;
      case 'blockSize':
        setPruneSettings(prev => ({ 
          ...prev, 
          blockSize: prev.blockSize + tokenValue 
        }));
        dispatch(setDirty(true));
        break;
      case 'pruneEventAge':
        setPruneSettings(prev => ({
          ...prev,
          pruneEventAge: parseInt(prev.pruneEventAge.toString() + tokenValue) || prev.pruneEventAge
        }));
        dispatch(setDirty(true));
        break;
      case 'interval':
        setSchedule(prev => ({
          ...prev,
          interval: prev.interval + tokenValue
        }));
        dispatch(setDirty(true));
        break;
      case 'time':
        setSchedule(prev => ({
          ...prev,
          time: prev.time + tokenValue
        }));
        dispatch(setDirty(true));
        break;
      default:
        console.warn('Token insertion not supported for field:', fieldId);
        break;
    }
  };

  // Helper functions for conditional disabling
  const isPasswordProtectDisabled = () => {
    return !archiveSettings.enableArchiving || archiveSettings.compression !== 'zip';
  };

  const isPasswordFieldDisabled = () => {
    return !archiveSettings.enableArchiving ||
           archiveSettings.compression !== 'zip' ||
           !archiveSettings.passwordProtect;
  };

  const isEncryptionTypeDisabled = () => {
    return !archiveSettings.enableArchiving ||
           archiveSettings.compression !== 'zip' ||
           !archiveSettings.passwordProtect;
  };

  // Label styles for consistent alignment
  const labelWidth = { xs: '180px', md: '220px', lg: '250px' };
  const FieldLabel = ({ children, disabled = false }: { children: React.ReactNode; disabled?: boolean }) => (
    <Typography 
      variant="body2" 
      sx={{ 
        fontWeight: 'medium',
        width: labelWidth,
        flexShrink: 0,
        textAlign: 'right',
        pr: 2,
        color: disabled ? 'text.disabled' : 'text.primary'
      }}
    >
      {children}
    </Typography>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Main Content */}
      {!loading && (
        <>
          {/* Status Section */}
          <StatusSection
            status={status}
            SectionTitle={SectionTitle}
          />

      {/* Schedule Section */}
      <ScheduleSection
        schedule={schedule}
        onScheduleChange={handleScheduleChange}
        onFieldFocus={handleFieldFocus}
        onFieldBlur={handleFieldBlur}
        onSpannerClick={handleSpannerClick}
        onCronTipOpen={handleCronTipOpen}
        selectedCronJobs={selectedCronJobs}
        onCronJobSelect={handleCronJobSelect}
        onSelectAllCronJobs={handleSelectAllCronJobs}
        onCronJobEditToggle={handleCronJobEditToggle}
        onCronJobEdit={handleCronJobEdit}
        onAddCronJob={handleAddCronJob}
        onRemoveCronJobs={handleRemoveCronJobs}
        SectionTitle={SectionTitle}
        FieldLabel={FieldLabel}
        ClickableTextField={ClickableTextField}
      />

      {/* Prune Settings Section */}
      <PruneSection
        pruneSettings={pruneSettings}
        onPruneChange={handlePruneChange}
        onFieldFocus={handleFieldFocus}
        onFieldBlur={handleFieldBlur}
        SectionTitle={SectionTitle}
        FieldLabel={FieldLabel}
        ClickableTextField={ClickableTextField}
      />

      {/* Archive Settings Section with side-by-side layout */}
      <ArchiveSection
        archiveSettings={archiveSettings}
        archiveValidationErrors={archiveValidationErrors}
        focusedField={focusedField}
        onArchiveChange={handleArchiveChange}
        onFieldFocus={handleFieldFocus}
        onFieldBlur={handleFieldBlur}
        onTokenInsert={handleTokenInsert}
        isPasswordProtectDisabled={isPasswordProtectDisabled}
        isEncryptionTypeDisabled={isEncryptionTypeDisabled}
        isPasswordFieldDisabled={isPasswordFieldDisabled}
        SectionTitle={SectionTitle}
        FieldLabel={FieldLabel}
        ClickableTextField={ClickableTextField}
        TokensPanel={TokensPanel}
      />

      {/* Advanced Settings Dialog */}
      <AdvancedSettingsDialog
        open={advancedDialogOpen}
        mode={advancedDialogMode}
        advancedSettings={schedule.advancedSettings}
        onClose={handleAdvancedDialogClose}
        onOk={handleAdvancedDialogOk}
        onAdvancedSettingsChange={handleAdvancedSettingsChange}
      />

      {/* Validation Modals */}
      <ValidationModals
        cronTipModalOpen={cronTipModalOpen}
        setCronTipModalOpen={setCronTipModalOpen}
        intervalErrorModalOpen={intervalErrorModalOpen}
        setIntervalErrorModalOpen={setIntervalErrorModalOpen}
        intervalErrorMessage={intervalErrorMessage}
        saveErrorModalOpen={saveErrorModalOpen}
        setSaveErrorModalOpen={setSaveErrorModalOpen}
        saveErrorMessage={saveErrorMessage}
      />
        </>
      )}
    </Box>
  );
};

export default DataPrunerTab;
