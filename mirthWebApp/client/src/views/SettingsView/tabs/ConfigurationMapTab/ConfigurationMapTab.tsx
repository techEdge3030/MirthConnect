import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Checkbox,
  Divider,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { setDirty } from '../../../../states/settingsReducer';
import type { AppDispatch, RootState } from '../../../../states';
import ExportMapDialog from '../../../../components/ExportMapDialog/ExportMapDialog';
import ImportMapDialog from '../../../../components/ImportMapDialog/ImportMapDialog';
import DirtyStateDialog from '../../../../components/DirtyStateDialog/DirtyStateDialog';
import { 
  getAllConfigurationMapItems, 
  saveConfigurationMapItems,
  exportConfigurationMap, 
  importConfigurationMap,
  generatePropertiesContent
} from '../../../../services/configMapService';
import type { ConfigurationMapItem } from '../../../../types/configurationMap.type';

interface ConfigMapEntry {
  id: string;
  key: string;
  value: string;
  comment: string;
}

// Data transformation utilities
const transformApiToUI = (apiItems: ConfigurationMapItem[]): ConfigMapEntry[] => {
  console.log('Transforming API items to UI format:', apiItems.length, 'items');
  
  const uiEntries = apiItems.map((item, index) => {
    const uiEntry: ConfigMapEntry = {
      id: `config-${index}-${Date.now()}`,
      key: item.string || '',
      value: item['com.mirth.connect.util.ConfigurationProperty']?.value || '',
      comment: item['com.mirth.connect.util.ConfigurationProperty']?.comment || ''
    };
    
    console.log(`API Item ${index + 1}:`, {
      apiItem: item,
      uiEntry
    });
    
    return uiEntry;
  });
  
  console.log('Transformed UI entries:', uiEntries);
  return uiEntries;
};

const transformUIToApi = (uiEntries: ConfigMapEntry[]): ConfigurationMapItem[] => {
  console.log('=== TRANSFORM UI TO API START ===');
  console.log('Input UI entries:', uiEntries.length, 'items');
  console.log('Input data:', uiEntries);
  
  // Only filter out entries with completely empty keys
  const validEntries = uiEntries.filter((entry, index) => {
    const hasKey = entry.key && entry.key.trim() !== '';
    console.log(`Entry ${index + 1}: key="${entry.key}", hasKey=${hasKey}`);
    if (!hasKey) {
      console.warn('Skipping entry with empty key:', entry);
    }
    return hasKey;
  });
  
  console.log('Valid entries after filtering:', validEntries.length, 'items');
  
  const apiItems = validEntries.map((entry, index) => {
    const apiItem: ConfigurationMapItem = {
      string: entry.key.trim(),
      'com.mirth.connect.util.ConfigurationProperty': {
        value: entry.value || '',
        comment: entry.comment || ''
      }
    };
    
    console.log(`Transforming entry ${index + 1}:`, {
      input: { key: entry.key, value: entry.value, comment: entry.comment },
      output: apiItem
    });
    
    return apiItem;
  });
  
  console.log('=== TRANSFORM UI TO API COMPLETE ===');
  console.log('Final API items:', apiItems.length, 'items');
  console.log('Final API data:', apiItems);
  return apiItems;
};

/**
 * ConfigurationMapTab component displaying system configuration key-value pairs
 */
const ConfigurationMapTab: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const isDirty = useSelector((state: RootState) => state.settings.isDirty);
  
  // State management
  const [entries, setEntries] = useState<ConfigMapEntry[]>([]);
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newEntry, setNewEntry] = useState({ key: '', value: '', comment: '' });
  const [showValues, setShowValues] = useState(false);
  
  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Dialog states
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [dirtyStateDialogOpen, setDirtyStateDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  // Ref for scrolling to bottom of table
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // Track dirty state for any changes
  const markDirty = () => {
    dispatch(setDirty(true));
  };

  // Load configuration map data from API
  const loadConfigurationMap = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('=== LOAD OPERATION START ===');
      const apiItems = await getAllConfigurationMapItems();
      console.log('Raw API response items:', apiItems.length, 'entries');
      console.log('Raw API data:', apiItems);
      
      const uiEntries = transformApiToUI(apiItems);
      console.log('Transformed UI entries:', uiEntries.length, 'entries');
      console.log('UI entries data:', uiEntries);
      
      setEntries(uiEntries);
      console.log('=== LOAD OPERATION COMPLETE ===');
    } catch (err: any) {
      console.error('=== LOAD OPERATION FAILED ===');
      console.error('Load error:', err);
      setError('Failed to load configuration map. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  };

  // Save configuration map data to API
  const saveConfigurationMap = useCallback(async () => {
    try {
      setSaving(true);
      setError(null);
      
      console.log('=== SAVE OPERATION START ===');
      console.log('Current UI entries:', entries.length, 'items');
      console.log('UI entries data:', entries);
      
      const apiItems = transformUIToApi(entries);
      console.log('Transformed API items:', apiItems.length, 'items');
      console.log('API items data:', apiItems);
      
      // Log the exact payload structure
      const payload = {
        map: {
          entry: apiItems
        }
      };
      console.log('Exact API payload:', JSON.stringify(payload, null, 2));
      
      const result = await saveConfigurationMapItems(apiItems);
      console.log('Save API response:', result);
      console.log('=== SAVE OPERATION SUCCESS ===');
      
      dispatch(setDirty(false));
    } catch (err: any) {
      console.error('=== SAVE OPERATION FAILED ===');
      console.error('Save error:', err);
      setError('Failed to save configuration map. Please try again.');
      throw err;
    } finally {
      setSaving(false);
    }
  }, [entries, dispatch]);

  // Load data on component mount
  useEffect(() => {
    loadConfigurationMap();
  }, []);

  const handleAddEntry = () => {
    console.log('Add entry clicked');
    setIsAddingNew(true);
    setNewEntry({ key: '', value: '', comment: '' });

    // Scroll to bottom of the page to show the new entry form
    setTimeout(() => {
      if (tableContainerRef.current) {
        tableContainerRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'end'
        });
      } else {
        window.scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: 'smooth'
        });
      }
    }, 100);
  };

  const handleSaveNewEntry = () => {
    console.log('=== ADD NEW ENTRY START ===');
    console.log('New entry data:', newEntry);
    console.log('Current entries before add:', entries.length, 'items');
    
    if (newEntry.key.trim() && newEntry.value.trim()) {
      // Check for duplicate keys
      const existingEntry = entries.find(entry => entry.key === newEntry.key.trim());
      if (existingEntry) {
        setError(`Configuration key "${newEntry.key.trim()}" already exists. Please use a different key.`);
        return;
      }

      const newConfigEntry: ConfigMapEntry = {
        id: `new-${Date.now()}-${Math.random()}`,
        key: newEntry.key.trim(),
        value: newEntry.value.trim(),
        comment: newEntry.comment.trim()
      };
      
      console.log('Creating new entry:', newConfigEntry);
      
      const updatedEntries = [...entries, newConfigEntry];
      console.log('Updated entries array:', updatedEntries.length, 'items');
      console.log('All entries:', updatedEntries);
      
      setEntries(updatedEntries);
      setIsAddingNew(false);
      setNewEntry({ key: '', value: '', comment: '' });
      markDirty();
      setError(null);
      
      console.log('=== ADD NEW ENTRY COMPLETE ===');
    } else {
      setError('Both key and value are required for configuration entries.');
    }
  };

  const handleCancelNewEntry = () => {
    setIsAddingNew(false);
    setNewEntry({ key: '', value: '', comment: '' });
  };

  const handleRemoveEntry = () => {
    if (selectedEntries.length === 0) return;

    const newEntries = entries.filter(entry => !selectedEntries.includes(entry.id));
    setEntries(newEntries);
    setSelectedEntries([]);
    markDirty();
    setError(null); // Clear any previous errors
    console.log(`Removed ${selectedEntries.length} configuration entries`);
  };

  const toggleShowValues = () => {
    setShowValues(!showValues);
  };

  const formatValue = (value: string | null | undefined): string => {
    // Handle null/undefined values safely
    if (!value) {
      return showValues ? '' : '****';
    }
    
    if (showValues) {
      return value;
    }
    return '*'.repeat(Math.max(4, Math.min(value.length, 20)));
  };

  // Handle dirty state dialog responses
  const handleSaveFirst = async () => {
    setDirtyStateDialogOpen(false);
    try {
      await saveConfigurationMap();
      // Proceed with pending action after successful save
      setTimeout(() => {
        if (pendingAction) {
          pendingAction();
          setPendingAction(null);
        }
      }, 500);
    } catch (err) {
      // Error already handled in saveConfigurationMap
      setPendingAction(null);
    }
  };

  const handleContinueWithoutSaving = () => {
    setDirtyStateDialogOpen(false);
    // Clear dirty state before proceeding
    dispatch(setDirty(false));
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  const handleCancelDirtyDialog = () => {
    setDirtyStateDialogOpen(false);
    setPendingAction(null);
  };

  // Handle getting properties content without downloading
  const handleGetExportContent = (): string => {
    try {
      return generatePropertiesContent(entries);
    } catch (error) {
      console.error('Failed to generate properties content:', error);
      return '';
    }
  };

  // Handle actual export creation
  const handleCreateExport = async (filename: string, filePath: string, fileType: string) => {
    try {
      setError(null);
      
      // Use the existing exportConfigurationMap service function with actual entries
      await exportConfigurationMap(filename, entries);
      
      console.log(`Configuration Map exported to ${filename}`);
    } catch (error: any) {
      console.error('Export failed:', error);
      setError(`Export failed: ${error.message}`);
      throw error;
    }
  };

  // Handle import map with dirty state check
  const handleImportMap = () => {
    if (isDirty) {
      setPendingAction(() => () => setImportDialogOpen(true));
      setDirtyStateDialogOpen(true);
    } else {
      setImportDialogOpen(true);
    }
  };

  // Handle actual import creation
  const handleCreateImport = async (file: File, fileType: string, options: any) => {
    try {
      setError(null);
      
      console.log('Starting import operation');
      console.log('Import options:', options);
      
      // Use the existing importConfigurationMap service function
      const importedEntries = await importConfigurationMap(file, {
        overwriteExisting: options.overwriteExisting,
        mergeWithCurrent: options.mergeWithCurrent
      });
      
      console.log('Imported entries:', importedEntries.length, 'items');
      console.log('Imported data:', importedEntries);

      let finalEntries: ConfigMapEntry[];

      // Apply import logic based on options
      if (options.mergeWithCurrent) {
        // Merge with existing entries
        const mergedEntries = [...entries];
        importedEntries.forEach(importedEntry => {
          const existingIndex = mergedEntries.findIndex(e => e.key === importedEntry.key);
          if (existingIndex >= 0 && options.overwriteExisting) {
            // Overwrite existing entry
            mergedEntries[existingIndex] = { ...importedEntry, id: mergedEntries[existingIndex].id };
          } else if (existingIndex < 0) {
            // Add new entry
            mergedEntries.push({ ...importedEntry, id: `imported-${Date.now()}-${Math.random()}` });
          }
        });
        console.log('Merged entries:', mergedEntries.length, 'total items');
        finalEntries = mergedEntries;
      } else {
        // Replace all entries
        finalEntries = importedEntries.map((entry, index) => ({
          ...entry,
          id: `imported-${Date.now()}-${index}`
        }));
        console.log('Replacing all entries with imported data:', finalEntries.length, 'items');
      }

      // Update UI state
      setEntries(finalEntries);
      markDirty();

      // Immediately save the imported data to persist it
      console.log('Auto-saving imported data...');
      const apiItems = transformUIToApi(finalEntries);
      await saveConfigurationMapItems(apiItems);
      
      // Clear dirty state after successful save
      dispatch(setDirty(false));
      
      console.log('Import and save operation completed successfully');
    } catch (error: any) {
      console.error('Import failed:', error);
      setError(`Import failed: ${error.message}`);
      throw error;
    }
  };

  // Event handlers for sidebar actions
  const handleRefresh = useCallback(async () => {
    const performRefresh = async () => {
      try {
        await loadConfigurationMap();
        setSelectedEntries([]);
        setIsAddingNew(false);
        setNewEntry({ key: '', value: '', comment: '' });
        setError(null);
        dispatch(setDirty(false));
        console.log('Configuration map refreshed successfully');
      } catch (err) {
        console.error('Refresh failed:', err);
        // Error already handled in loadConfigurationMap
      }
    };

    // Check if there are unsaved changes
    if (isDirty) {
      setPendingAction(() => performRefresh);
      setDirtyStateDialogOpen(true);
    } else {
      await performRefresh();
    }
  }, [isDirty, dispatch]);

  const handleSave = useCallback(async () => {
    try {
      console.log('Save button clicked, current entries:', entries.length);
      console.log('Current entries data:', entries);
      
      // Allow saving even with empty configuration (to clear all entries)
      await saveConfigurationMap();
      console.log('Save operation completed successfully from handleSave');
    } catch (err) {
      console.error('Save operation failed in handleSave:', err);
      // Error already handled in saveConfigurationMap
    }
  }, [entries, saveConfigurationMap]);

  const handleImport = useCallback(() => {
    handleImportMap();
  }, []);

  const handleExport = useCallback(() => {
    if (isDirty) {
      setPendingAction(() => () => setExportDialogOpen(true));
      setDirtyStateDialogOpen(true);
    } else {
      setExportDialogOpen(true);
    }
  }, [isDirty]);

  // Add event listeners for sidebar actions
  useEffect(() => {
    const handleSaveEvent = async () => {
      console.log('Sidebar save event received, current entries:', entries.length);
      await handleSave();
    };

    const handleRefreshEvent = async () => {
      console.log('Sidebar refresh event received');
      await handleRefresh();
    };

    const handleImportEvent = () => {
      console.log('Sidebar import event received');
      handleImport();
    };

    const handleExportEvent = () => {
      console.log('Sidebar export event received');
      handleExport();
    };

    // Add event listeners
    window.addEventListener('settings-save-requested', handleSaveEvent);
    window.addEventListener('configmap-refresh-requested', handleRefreshEvent);
    window.addEventListener('configmap-import-requested', handleImportEvent);
    window.addEventListener('configmap-export-requested', handleExportEvent);

    return () => {
      // Cleanup event listeners
      window.removeEventListener('settings-save-requested', handleSaveEvent);
      window.removeEventListener('configmap-refresh-requested', handleRefreshEvent);
      window.removeEventListener('configmap-import-requested', handleImportEvent);
      window.removeEventListener('configmap-export-requested', handleExportEvent);
    };
  }, [entries, handleSave, handleRefresh, handleImport, handleExport]); // Include entries in dependencies

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

  // Debug logging
  console.log('ConfigurationMapTab render:', {
    isAddingNew,
    entriesCount: entries.length,
    selectedCount: selectedEntries.length,
    loading,
    saving,
    isDirty
  });

  return (
    <Box sx={{ p: 3 }}>
      <SectionTitle>Configuration Map</SectionTitle>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Action buttons */}
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Tooltip title="Add new configuration entry">
              <IconButton
                onClick={handleAddEntry}
                disabled={saving}
                color="primary"
                sx={{
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'primary.dark'
                  }
                }}
              >
                <AddIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={selectedEntries.length === 0 ? "Select entries to remove" : "Remove selected entries"}>
              <span>
                <IconButton
                  onClick={handleRemoveEntry}
                  disabled={selectedEntries.length === 0 || saving}
                  color="error"
                  sx={{
                    backgroundColor: selectedEntries.length > 0 ? 'error.main' : 'grey.300',
                    color: selectedEntries.length > 0 ? 'white' : 'grey.500',
                    '&:hover': {
                      backgroundColor: selectedEntries.length > 0 ? 'error.dark' : 'grey.400'
                    },
                    '&.Mui-disabled': {
                      backgroundColor: 'grey.300',
                      color: 'grey.500'
                    }
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </span>
            </Tooltip>
            {saving && (
              <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                <Typography variant="body2">Saving...</Typography>
              </Box>
            )}
          </Box>

          {/* Configuration table */}
          <TableContainer
            ref={tableContainerRef}
            component={Paper}
            sx={{
              border: 1,
              borderColor: 'divider'
            }}
          >
            <Table size="small" stickyHeader sx={{ tableLayout: 'fixed' }}>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{ width: '50px', fontWeight: 'bold', textAlign: 'center', pl: 1, pr: 1 }}
                  >
                    <Checkbox
                      indeterminate={selectedEntries.length > 0 && selectedEntries.length < entries.length}
                      checked={entries.length > 0 && selectedEntries.length === entries.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedEntries(entries.map(entry => entry.id));
                        } else {
                          setSelectedEntries([]);
                        }
                      }}
                      size="small"
                    />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: '300px' }}>
                    Key
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: '250px' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      Value
                      <Tooltip title={showValues ? 'Hide values' : 'Show values'}>
                        <IconButton
                          size="small"
                          onClick={toggleShowValues}
                          sx={{ ml: 1 }}
                        >
                          {showValues ? (
                            <VisibilityOffIcon fontSize="small" />
                          ) : (
                            <VisibilityIcon fontSize="small" />
                          )}
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: 'auto' }}>
                    Comment
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: '120px', textAlign: 'center' }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {[...entries].reverse().map(entry => (
                  <TableRow 
                    key={entry.id}
                    sx={{ 
                      '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
                      height: '40px'
                    }}
                  >
                    <TableCell sx={{ height: '40px', textAlign: 'center', pl: 1, pr: 1 }}>
                      <Checkbox
                        checked={selectedEntries.includes(entry.id)}
                        onChange={(e) => {
                          const newSelected = [...selectedEntries];
                          if (e.target.checked) {
                            newSelected.push(entry.id);
                          } else {
                            newSelected.splice(newSelected.indexOf(entry.id), 1);
                          }
                          setSelectedEntries(newSelected);
                        }}
                        size="small"
                      />
                    </TableCell>
                    <TableCell sx={{ 
                      height: '40px', 
                      fontSize: '0.875rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {entry.key || ''}
                    </TableCell>
                    <TableCell sx={{ 
                      height: '40px', 
                      fontSize: '0.875rem', 
                      fontFamily: 'monospace',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {formatValue(entry.value)}
                    </TableCell>
                    <TableCell sx={{
                      height: '40px',
                      fontSize: '0.875rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {entry.comment || ''}
                    </TableCell>
                    <TableCell sx={{ height: '40px', textAlign: 'center' }}>
                      {/* Future: Add edit/delete buttons for individual entries */}
                    </TableCell>
                  </TableRow>
                ))}
                {isAddingNew && (
                  <TableRow sx={{ '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }, height: '40px' }}>
                    <TableCell sx={{ height: '40px', textAlign: 'center', pl: 1, pr: 1 }}>
                      {/* Empty checkbox column for new entry */}
                    </TableCell>
                    <TableCell sx={{ 
                      height: '40px', 
                      fontSize: '0.875rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      <TextField
                        size="small"
                        placeholder="Enter key..."
                        value={newEntry.key}
                        onChange={(e) => setNewEntry({ ...newEntry, key: e.target.value })}
                        fullWidth
                        sx={{ '& .MuiInputBase-root': { height: '32px' } }}
                      />
                    </TableCell>
                    <TableCell sx={{ 
                      height: '40px', 
                      fontSize: '0.875rem', 
                      fontFamily: 'monospace',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      <TextField
                        size="small"
                        placeholder="Enter value..."
                        value={newEntry.value}
                        onChange={(e) => setNewEntry({ ...newEntry, value: e.target.value })}
                        fullWidth
                        sx={{ '& .MuiInputBase-root': { height: '32px' } }}
                      />
                    </TableCell>
                    <TableCell sx={{
                      height: '40px',
                      fontSize: '0.875rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      <TextField
                        size="small"
                        placeholder="Enter comment..."
                        value={newEntry.comment}
                        onChange={(e) => setNewEntry({ ...newEntry, comment: e.target.value })}
                        fullWidth
                        sx={{ '& .MuiInputBase-root': { height: '32px' } }}
                      />
                    </TableCell>
                    <TableCell sx={{ height: '40px', textAlign: 'center' }}>
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                        <IconButton
                          size="small"
                          onClick={handleSaveNewEntry}
                          color="success"
                          disabled={!newEntry.key.trim() || !newEntry.value.trim()}
                        >
                          <CheckIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={handleCancelNewEntry}
                          color="default"
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* Export Map Dialog */}
      <ExportMapDialog
        open={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
        onExport={handleCreateExport}
        onGetContent={handleGetExportContent}
      />

      {/* Import Map Dialog */}
      <ImportMapDialog
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        onImport={handleCreateImport}
      />

      {/* Dirty State Dialog */}
      <DirtyStateDialog
        open={dirtyStateDialogOpen}
        onSaveFirst={handleSaveFirst}
        onContinueWithoutSaving={handleContinueWithoutSaving}
        onCancel={handleCancelDirtyDialog}
        message="Would you like to save the configuration changes first?"
      />
    </Box>
  );
};

export default ConfigurationMapTab;
