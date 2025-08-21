import React, { useState, useEffect, useMemo } from 'react';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box
} from '@mui/material';
import {
  Refresh,
  Save,
  Backup,
  Restore,
  BarChart,
  RestoreFromTrash,
  Help,
  FileDownload,
  FileUpload,
  Add,
  Replay,
  Remove,
  Visibility,
  PlayArrow
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../../states';
import { setDirty } from '../../../states/settingsReducer';
import { useAlert } from '../../../providers/AlertProvider';
import { useAdministratorBackground } from '../../../providers';
import { getServerSettings, resetSettingsToDefaults } from '../../../services/settingsService';
import BackupConfigDialog from '../../BackupConfigDialog/BackupConfigDialog';
import DirtyStateDialog from '../../DirtyStateDialog/DirtyStateDialog';
import RestoreConfigDialog from '../../RestoreConfigDialog/RestoreConfigDialog';
import ClearAllStatisticsDialog from '../../ClearAllStatisticsDialog/ClearAllStatisticsDialog';
import RefreshWarningDialog from '../../RefreshWarningDialog/RefreshWarningDialog';
import { createBackup } from '../../../services/backupService';

interface SettingsSidebarProps {
  open: boolean;
}

const SettingsSidebar: React.FC<SettingsSidebarProps> = ({ open }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { setOpen, setSeverity, setMessage } = useAlert();
  const { backgroundColor } = useAdministratorBackground();
  
  // Redux state
  const currentTab = useSelector((state: RootState) => state.settings?.currentTab ?? 0);
  const isDirty = useSelector((state: RootState) => state.settings?.isDirty ?? false);

  // Resource selection state
  const [hasSelectedResource, setHasSelectedResource] = useState(false);
  
  // Dialog states
  const [backupDialogOpen, setBackupDialogOpen] = useState(false);
  const [dirtyStateDialogOpen, setDirtyStateDialogOpen] = useState(false);
  const [restoreDefaultsDialogOpen, setRestoreDefaultsDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [clearAllStatisticsOpen, setClearAllStatisticsOpen] = useState(false);
  const [refreshWarningDialogOpen, setRefreshWarningDialogOpen] = useState(false);
  const [pendingRefreshAction, setPendingRefreshAction] = useState<(() => void) | null>(null);

  // Generic refresh handler with dirty state check
  const handleRefreshWithDirtyCheck = (refreshAction: () => void) => {
    if (isDirty) {
      setPendingRefreshAction(() => refreshAction);
      setRefreshWarningDialogOpen(true);
    } else {
      refreshAction();
    }
  };

  // Handle refresh warning dialog responses
  const handleRefreshWarningYes = () => {
    setRefreshWarningDialogOpen(false);
    if (pendingRefreshAction) {
      pendingRefreshAction();
      setPendingRefreshAction(null);
    }
    dispatch(setDirty(false)); // Clear dirty state after refresh
  };

  const handleRefreshWarningNo = () => {
    setRefreshWarningDialogOpen(false);
    setPendingRefreshAction(null);
  };

  // Tab-specific refresh handlers
  const handleServerTabRefresh = async () => {
    try {
      // Dispatch event to Server tab to refresh its data
      const refreshEvent = new CustomEvent('server-refresh-requested');
      window.dispatchEvent(refreshEvent);
      setSeverity('success');
      setMessage('Server settings refreshed successfully!');
      setOpen(true);
    } catch (error) {
      setSeverity('error');
      setMessage('Failed to refresh server settings');
      setOpen(true);
    }
  };

  const handleAdministratorTabRefresh = async () => {
    try {
      // Dispatch event to Administrator tab to refresh its data
      const refreshEvent = new CustomEvent('administrator-refresh-requested');
      window.dispatchEvent(refreshEvent);
      setSeverity('success');
      setMessage('Administrator settings refreshed successfully!');
      setOpen(true);
    } catch (error) {
      setSeverity('error');
      setMessage('Failed to refresh administrator settings');
      setOpen(true);
    }
  };

  const handleTagsTabRefresh = async () => {
    try {
      // Dispatch event to Tags tab to refresh its data
      const refreshEvent = new CustomEvent('tags-refresh-requested');
      window.dispatchEvent(refreshEvent);
      setSeverity('success');
      setMessage('Tags refreshed successfully!');
      setOpen(true);
    } catch (error) {
      setSeverity('error');
      setMessage('Failed to refresh tags');
      setOpen(true);
    }
  };

  const handleDatabaseTasksTabRefresh = async () => {
    try {
      // Dispatch event to Database Tasks tab to refresh its data
      const refreshEvent = new CustomEvent('database-tasks-refresh-requested');
      window.dispatchEvent(refreshEvent);
      setSeverity('success');
      setMessage('Database tasks refreshed successfully!');
      setOpen(true);
    } catch (error) {
      setSeverity('error');
      setMessage('Failed to refresh database tasks');
      setOpen(true);
    }
  };

  const handleDataPrunerTabRefresh = async () => {
    try {
      // Dispatch event to Data Pruner tab to refresh its data
      const refreshEvent = new CustomEvent('data-pruner-refresh-requested');
      window.dispatchEvent(refreshEvent);
      setSeverity('success');
      setMessage('Data pruner settings refreshed successfully!');
      setOpen(true);
    } catch (error) {
      setSeverity('error');
      setMessage('Failed to refresh data pruner settings');
      setOpen(true);
    }
  };

  const handleViewEvents = async () => {
    try {
      // Dispatch event to Data Pruner tab to view events
      const viewEventsEvent = new CustomEvent('data-pruner-view-events-requested');
      window.dispatchEvent(viewEventsEvent);
    } catch (error) {
      setSeverity('error');
      setMessage('Failed to open data pruner events');
      setOpen(true);
    }
  };

  const handlePruneNow = async () => {
    try {
      // Dispatch event to Data Pruner tab to start pruning
      const pruneNowEvent = new CustomEvent('data-pruner-prune-now-requested');
      window.dispatchEvent(pruneNowEvent);
      setSeverity('success');
      setMessage('Data pruning started...');
      setOpen(true);
    } catch (error) {
      setSeverity('error');
      setMessage('Failed to start data pruning');
      setOpen(true);
    }
  };

  // Legacy handler for backward compatibility
  const handleSettingsRefresh = () => handleRefreshWithDirtyCheck(handleServerTabRefresh);

  const handleSettingsSave = async () => {
    const saveEvent = new CustomEvent('settings-save-requested');
    window.dispatchEvent(saveEvent);
  };

  const handleAdministratorSave = async () => {
    const saveEvent = new CustomEvent('administrator-save-requested');
    window.dispatchEvent(saveEvent);
  };

  const handleSettingsRestore = async () => {
    try {
      await resetSettingsToDefaults();
      setSeverity('success');
      setMessage('Settings restored to defaults successfully!');
      setOpen(true);
      window.location.reload();
    } catch (error) {
      setSeverity('error');
      setMessage('Failed to restore default settings');
      setOpen(true);
    }
  };

  // Handle backup config with dirty state check
  const handleBackupConfig = () => {
    if (isDirty) {
      setPendingAction(() => () => setBackupDialogOpen(true));
      setDirtyStateDialogOpen(true);
    } else {
      setBackupDialogOpen(true);
    }
  };

  // Handle dirty state dialog responses
  const handleSaveFirst = () => {
    setDirtyStateDialogOpen(false);
    handleSettingsSave();
    setTimeout(() => {
      if (pendingAction) {
        pendingAction();
        setPendingAction(null);
      }
    }, 500);
  };

  const handleContinueWithoutSaving = () => {
    setDirtyStateDialogOpen(false);
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  const handleCancelDirtyDialog = () => {
    setDirtyStateDialogOpen(false);
    setPendingAction(null);
  };

  // Handle restore config with dirty state check
  const handleRestoreConfig = () => {
    if (isDirty) {
      setPendingAction(() => () => setRestoreDialogOpen(true));
      setDirtyStateDialogOpen(true);
    } else {
      setRestoreDialogOpen(true);
    }
  };

  // Handle actual restore with file and options
  const handleCreateRestore = async (file: File, fileType: string, options: any) => {
    try {
      // Read file content as text
      const xmlContent = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const content = e.target?.result as string;
            console.log('File reading result type:', typeof content);
            console.log('File content length:', content?.length || 0);
            
            if (!content) {
              reject(new Error('File content is empty'));
              return;
            }
            
            if (typeof content !== 'string') {
              reject(new Error('File content is not a string'));
              return;
            }
            
            if (!content.includes('<serverConfiguration')) {
              reject(new Error('Invalid configuration file format - missing serverConfiguration element'));
              return;
            }
            
            resolve(content);
          } catch (error) {
            reject(new Error(`Error processing file content: ${error}`));
          }
        };
        reader.onerror = (error) => {
          console.error('FileReader error:', error);
          reject(new Error('Failed to read configuration file'));
        };
        reader.readAsText(file);
      });
      
      console.log('Final XML content type:', typeof xmlContent);
      
      const { restoreServerConfiguration } = await import('../../../services/backupService');
      
      // UI options to API parameters
      const restoreOptions = {
        deployAllChannels: options.deployAllChannels,
        overwriteConfigMap: options.overwriteConfigMap
      };
      
      // Execute restore
      await restoreServerConfiguration(xmlContent, restoreOptions);
      
      // Dispatch refresh event to Server tab after successful restore
      const refreshEvent = new CustomEvent('server-refresh-requested');
      window.dispatchEvent(refreshEvent);
      
      // Clear dirty state after Success
      dispatch(setDirty(false));
      
      console.log('SettingsSidebar: Configuration restored successfully');
      
    } catch (error: any) {
      console.error('SettingsSidebar: Restore failed:', error);
      throw new Error(error.message || 'Failed to restore configuration');
    }
  };

  // Handle backup creation
  const handleCreateBackup = async (options: any) => {
    try {
      await createBackup(options);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create backup');
    }
  };

  const handleClearAllStatistics = () => {
    setClearAllStatisticsOpen(true);
  };

  const handleConfirmClearAllStatistics = async () => {
    try {
      const { clearAllStatistics } = await import('../../../services/serverService');
      await clearAllStatistics();
    } catch (error: any) {
      throw new Error(error.message || 'Failed to clear all statistics');
    }
  };

  const handleRestoreDefaults = () => {
    setRestoreDefaultsDialogOpen(true);
  };

  const handleConfirmRestoreDefaults = async () => {
    try {
      setRestoreDefaultsDialogOpen(false);

      // Dispatch administrator-specific restore defaults event
      const restoreEvent = new CustomEvent('administrator-restore-defaults-requested');
      window.dispatchEvent(restoreEvent);

    } catch (error) {
      setSeverity('error');
      setMessage('Failed to restore default settings');
      setOpen(true);
    }
  };

  // Configuration Map handlers
  const handleConfigMapTabRefresh = async () => {
    try {
      // Dispatch custom event for Configuration Map refresh
      const refreshEvent = new CustomEvent('configmap-refresh-requested');
      window.dispatchEvent(refreshEvent);
      setSeverity('success');
      setMessage('Configuration Map refreshed successfully!');
      setOpen(true);
    } catch (error) {
      setSeverity('error');
      setMessage('Failed to refresh Configuration Map');
      setOpen(true);
    }
  };

  const handleConfigMapRefresh = () => handleRefreshWithDirtyCheck(handleConfigMapTabRefresh);

  const handleConfigMapImport = () => {
    // Dispatch custom event for Configuration Map import
    const importEvent = new CustomEvent('configmap-import-requested');
    window.dispatchEvent(importEvent);
  };

  const handleConfigMapExport = () => {
    // Dispatch custom event for Configuration Map export
    const exportEvent = new CustomEvent('configmap-export-requested');
    window.dispatchEvent(exportEvent);
  };

  // Resources handlers
  const handleResourcesTabRefresh = async () => {
    try {
      // Dispatch custom event for Resources refresh
      const refreshEvent = new CustomEvent('resources-refresh-requested');
      window.dispatchEvent(refreshEvent);
      setSeverity('success');
      setMessage('Resources refreshed successfully!');
      setOpen(true);
    } catch (error) {
      setSeverity('error');
      setMessage('Failed to refresh Resources');
      setOpen(true);
    }
  };

  const handleResourcesRefresh = () => handleRefreshWithDirtyCheck(handleResourcesTabRefresh);

  const handleAddResource = () => {
    // Dispatch custom event for Add Resource
    const addEvent = new CustomEvent('resources-add-requested');
    window.dispatchEvent(addEvent);
  };

  const handleReloadResource = () => {
    // Dispatch custom event for Reload Resource
    const reloadEvent = new CustomEvent('resources-reload-requested');
    window.dispatchEvent(reloadEvent);
  };

  const handleRemoveResource = () => {
    // Dispatch custom event for Remove Resource
    const removeEvent = new CustomEvent('resources-remove-requested');
    window.dispatchEvent(removeEvent);
  };

  // Listen for resource selection changes
  useEffect(() => {
    const handleResourceSelection = (event: any) => {
      const hasSelection = event.detail?.hasSelection || false;
      setHasSelectedResource(hasSelection);
    };

    window.addEventListener('resources-selection-changed', handleResourceSelection);

    return () => {
      window.removeEventListener('resources-selection-changed', handleResourceSelection);
    };
  }, []);

  // Dynamic Settings Tasks
  const getSettingsTasks = () => {
    try {
      switch (currentTab) {
        case 0: // Server Tab
          return [
            { name: 'Refresh', icon: <Refresh />, handler: () => handleRefreshWithDirtyCheck(handleServerTabRefresh) },
            ...(isDirty ? [{ name: 'Save', icon: <Save />, handler: handleSettingsSave }] : []),
            { name: 'Backup Config', icon: <Backup />, handler: handleBackupConfig },
            { name: 'Restore Config', icon: <Restore />, handler: handleRestoreConfig },
            { name: 'Clear All Statistics', icon: <BarChart />, handler: handleClearAllStatistics }
          ];
        case 1: // Administrator Tab
          return [
            { name: 'Refresh', icon: <Refresh />, handler: () => handleRefreshWithDirtyCheck(handleAdministratorTabRefresh) },
            ...(isDirty ? [{ name: 'Save', icon: <Save />, handler: handleAdministratorSave }] : []),
            { name: 'Restore Defaults', icon: <RestoreFromTrash />, handler: handleRestoreDefaults }
          ];
        case 2: // Tags Tab
          return [
            { name: 'Refresh', icon: <Refresh />, handler: () => handleRefreshWithDirtyCheck(handleTagsTabRefresh) },
            ...(isDirty ? [{ name: 'Save', icon: <Save />, handler: handleSettingsSave }] : [])
          ];
        case 3: // Configuration Map Tab
          return [
            { name: 'Refresh', icon: <Refresh />, handler: handleConfigMapRefresh },
            ...(isDirty ? [{ name: 'Save', icon: <Save />, handler: handleSettingsSave }] : []),
            { name: 'Import Map', icon: <FileUpload />, handler: handleConfigMapImport },
            { name: 'Export Map', icon: <FileDownload />, handler: handleConfigMapExport }
          ];
        case 4: // Database Tasks Tab
          return [
            { name: 'Refresh', icon: <Refresh />, handler: () => handleRefreshWithDirtyCheck(handleDatabaseTasksTabRefresh) },
            ...(isDirty ? [{ name: 'Save', icon: <Save />, handler: handleSettingsSave }] : [])
          ];
        case 5: // Resources Tab
          return [
            { name: 'Refresh', icon: <Refresh />, handler: handleResourcesRefresh },
            ...(isDirty ? [{ name: 'Save', icon: <Save />, handler: handleSettingsSave }] : []),
            { name: 'Add Resource', icon: <Add />, handler: handleAddResource },
            ...(hasSelectedResource ? [{ name: 'Remove Resource', icon: <Remove />, handler: handleRemoveResource }] : []),
            { name: 'Reload Resource', icon: <Replay />, handler: handleReloadResource }
          ];
        case 6: // Data Pruner Tab
          return [
            { name: 'Refresh', icon: <Refresh />, handler: () => handleRefreshWithDirtyCheck(handleDataPrunerTabRefresh) },
            ...(isDirty ? [{ name: 'Save', icon: <Save />, handler: handleSettingsSave }] : []),
            { name: 'View Events', icon: <Visibility />, handler: handleViewEvents },
            { name: 'Prune Now', icon: <PlayArrow />, handler: handlePruneNow }
          ];
        default:
          return [
            { name: 'Refresh', icon: <Refresh />, handler: () => handleRefreshWithDirtyCheck(handleServerTabRefresh) },
            ...(isDirty ? [{ name: 'Save', icon: <Save />, handler: handleSettingsSave }] : [])
          ];
      }
    } catch (error) {
      console.warn('Error building settings tasks:', error);
      return [
        { name: 'Refresh', icon: <Refresh />, handler: () => handleRefreshWithDirtyCheck(handleServerTabRefresh) },
        ...(isDirty ? [{ name: 'Save', icon: <Save />, handler: handleSettingsSave }] : [])
      ];
    }
  };

  const settingsTasks = useMemo(() => getSettingsTasks(), [currentTab, isDirty, hasSelectedResource]);

  const getSettingsSectionTitle = () => {
    try {
      switch (currentTab) {
        case 0:
          return 'Server Tasks';
        case 1:
          return 'Administrator Tasks';
        case 2:
          return 'Tags Tasks';
        case 3:
          return 'Configuration Map Tasks';
        case 4:
          return 'Database Tasks Tasks';
        case 5:
          return 'Resources Tasks';
        case 6:
          return 'Data Pruner Tasks';
        default:
          return 'Administrator Tasks';
      }
    } catch (error) {
      return 'Administrator Tasks';
    }
  };

  return (
    <>
      <List>
        {settingsTasks.map(task => (
          <ListItem key={task.name} disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              onClick={task.handler}
              sx={{
                minHeight: 36,
                px: 2.5,
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)'
                }
              }}
            >
              <ListItemIcon sx={{
                minWidth: 0,
                mr: open ? 2 : 'auto',
                justifyContent: 'center',
                color: backgroundColor
              }}>
                {task.icon}
              </ListItemIcon>
              <ListItemText
                primary={task.name}
                sx={{
                  opacity: open ? 1 : 0,
                  color: backgroundColor
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* All dialog components */}
      <BackupConfigDialog
        open={backupDialogOpen}
        onClose={() => setBackupDialogOpen(false)}
        onBackup={handleCreateBackup}
      />
      <DirtyStateDialog
        open={dirtyStateDialogOpen}
        onSaveFirst={handleSaveFirst}
        onContinueWithoutSaving={handleContinueWithoutSaving}
        onCancel={handleCancelDirtyDialog}
        message="Would you like to save the settings first?"
      />
      <RestoreConfigDialog
        open={restoreDialogOpen}
        onClose={() => setRestoreDialogOpen(false)}
        onRestore={handleCreateRestore}
      />
      <ClearAllStatisticsDialog
        open={clearAllStatisticsOpen}
        onClose={() => setClearAllStatisticsOpen(false)}
        onConfirm={handleConfirmClearAllStatistics}
      />

      {/* Refresh Warning Dialog */}
      <RefreshWarningDialog
        open={refreshWarningDialogOpen}
        onYes={handleRefreshWarningYes}
        onNo={handleRefreshWarningNo}
      />
      
      {/* Restore Defaults Confirmation Dialog */}
      <Dialog 
        open={restoreDefaultsDialogOpen} 
        onClose={() => setRestoreDefaultsDialogOpen(false)}
        maxWidth="sm"
        PaperProps={{
          sx: { 
            minWidth: 400,
            textAlign: 'center'
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <Help 
              sx={{ 
                fontSize: 40,
                color: 'success.main',
                backgroundColor: 'success.light',
                borderRadius: '50%',
                p: 1
              }} 
            />
          </Box>
          <Typography variant="h6" sx={{ mt: 1 }}>
            Select an Option
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ textAlign: 'left', pb: 2 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Set Administrator Settings to defaults?
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            This will reset all of your local settings!
          </Typography>
          <Typography variant="body2" color="text.secondary">
            It is suggested that you restart the Administrator since some settings may not take effect until the Administrator has been reloaded.
          </Typography>
        </DialogContent>
        
        <DialogActions sx={{ justifyContent: 'center', gap: 1, pb: 3 }}>
          <Button 
            onClick={() => setRestoreDefaultsDialogOpen(false)}
            variant="outlined"
            sx={{ minWidth: 100 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmRestoreDefaults}
            variant="contained"
            color="warning"
            sx={{ minWidth: 100 }}
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SettingsSidebar;
