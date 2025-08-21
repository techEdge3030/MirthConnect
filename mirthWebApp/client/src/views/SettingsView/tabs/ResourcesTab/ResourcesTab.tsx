import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import {
  Box,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { setDirty } from '../../../../states/settingsReducer';
import type { AppDispatch, RootState } from '../../../../states';
import ReloadResourceDialog from '../../../../components/ReloadResourceDialog/ReloadResourceDialog';
import ResourceValidationDialog from '../../../../components/ResourceValidationDialog/ResourceValidationDialog';
import {
  getResources,
  updateResources,
  reloadResource,
  getResourceLibraries,
  type Resource as ApiResource
} from '../../../../services/resourcesService';

// =============================================================================
// RESOURCES TAB COMPONENT
// =============================================================================

// Extended Resource interface for UI state with local editing support
interface Resource extends Omit<ApiResource, 'description' | 'content' | 'lastModified'> {
  globalScripts: boolean;
  loadParentFirst: boolean;
  isEditing?: boolean;
  isDefault?: boolean; // Flag for [Default Resource]
  originalApiData?: ApiResource; // Store original API data to preserve all fields
}

// Local editing state management interfaces
interface LocalEditingState {
  originalData: Resource[]; // Original data from server
  workingData: Resource[]; // Current editing state
  hasUnsavedChanges: boolean; // Track if working data differs from original
  lastSavedTimestamp: number; // Track when data was last saved
}

// Removed unused interface - keeping for future use if needed
// interface LocalDirectorySettings {
//   [resourceId: string]: DirectorySettings;
// }

interface DirectorySettings {
  directory: string;
  includeSubdirectories: boolean;
  description: string;
}

interface ResourceDirectorySettings {
  [resourceId: string]: DirectorySettings;
}

/**
 * ResourcesTab component displaying resource management settings
 * Implements local editing pattern as required by CTO:
 * - Store data locally during editing sessions
 * - Edit local copies, not live data
 * - Only send to API on explicit save
 */
const ResourcesTab: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const isDirty = useSelector((state: RootState) => state.settings.isDirty);

  // =============================================================================
  // REACT STRICT MODE PROTECTION
  // =============================================================================

  // React Strict Mode protection - prevent duplicate API calls
  const hasLoadedRef = useRef(false);
  const isLoadingRef = useRef(false);

  // =============================================================================
  // LOCAL EDITING STATE MANAGEMENT
  // =============================================================================

  // Local editing state - separates original data from working copies
  const [localState, setLocalState] = useState<LocalEditingState>({
    originalData: [],
    workingData: [],
    hasUnsavedChanges: false,
    lastSavedTimestamp: 0
  });

  // Legacy state for backward compatibility (now derived from localState)
  const resources = localState.workingData;
  const setResources = (newResources: Resource[] | ((prev: Resource[]) => Resource[])) => {
    setLocalState(prev => {
      const updatedWorkingData = typeof newResources === 'function'
        ? newResources(prev.workingData)
        : newResources;

      const hasChanges = JSON.stringify(updatedWorkingData) !== JSON.stringify(prev.originalData);

      return {
        ...prev,
        workingData: updatedWorkingData,
        hasUnsavedChanges: hasChanges
      };
    });
  };

  const [error, setError] = useState<string | null>(null);

  // Dialog state for reload resource
  const [reloadDialogOpen, setReloadDialogOpen] = useState(false);

  // Validation dialog state
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');

  // Track which resources have validation errors
  const [resourcesWithErrors, setResourcesWithErrors] = useState<Set<string>>(new Set());

  // Selected resources state
  const [selectedResourceIds, setSelectedResourceIds] = useState<string[]>([]);

  // Currently selected resource for Directory Settings (single selection)
  // This state persists across navigation to match Java GUI behavior
  const [currentResourceId, setCurrentResourceId] = useState<string | null>(null);

  // Storage key for persistent selected resource state
  const SELECTED_RESOURCE_STORAGE_KEY = 'mirth-resources-selected-resource';

  // Utility functions for selected resource state persistence
  const saveSelectedResourceToStorage = (resourceId: string | null) => {
    try {
      if (resourceId) {
        localStorage.setItem(SELECTED_RESOURCE_STORAGE_KEY, resourceId);
      } else {
        localStorage.removeItem(SELECTED_RESOURCE_STORAGE_KEY);
      }
    } catch (error) {
      console.warn('Failed to save selected resource to localStorage:', error);
    }
  };

  const loadSelectedResourceFromStorage = (): string | null => {
    try {
      return localStorage.getItem(SELECTED_RESOURCE_STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to load selected resource from localStorage:', error);
      return null;
    }
  };

  // Utility function to encode resource ID for API URLs
  // Special handling for [Default Resource] which becomes "Default%20Resource"
  const encodeResourceIdForUrl = (resourceId: string): string => {
    return encodeURIComponent(resourceId);
  };

  // Enhanced setCurrentResourceId that persists to localStorage
  const setCurrentResourceIdWithPersistence = (resourceId: string | null) => {
    setCurrentResourceId(resourceId);
    saveSelectedResourceToStorage(resourceId);
  };

  // Track currently editing resource for click-outside detection
  const [editingResourceId, setEditingResourceId] = useState<string | null>(null);
  const editingRowRef = useRef<HTMLTableRowElement>(null);

  // =============================================================================
  // LOCAL EDITING STATE MANAGEMENT FUNCTIONS
  // =============================================================================

  /**
   * Mark local changes as dirty and update Redux state
   * This is called whenever working data is modified
   */
  const markDirty = () => {
    dispatch(setDirty(true));
  };

  /**
   * Check if there are unsaved local changes
   * Compares working data with original data
   * Currently unused but kept for future functionality
   */
  // const hasUnsavedChanges = () => {
  //   return localState.hasUnsavedChanges;
  // };

  /**
   * Reset working data to original data (discard local changes)
   */
  const discardLocalChanges = () => {
    setLocalState(prev => ({
      ...prev,
      workingData: [...prev.originalData], // Reset to original
      hasUnsavedChanges: false
    }));
    dispatch(setDirty(false));
  };

  // Notify sidebar about resource selection changes
  const notifyResourceSelection = (hasSelection: boolean) => {
    const event = new CustomEvent('resources-selection-changed', {
      detail: { hasSelection }
    });
    window.dispatchEvent(event);
  };

  // Directory settings state (per resource)
  const [resourceDirectorySettings, setResourceDirectorySettings] = useState<ResourceDirectorySettings>({});

  // Get directory settings for current resource
  const getCurrentDirectorySettings = (): DirectorySettings => {
    if (!currentResourceId) {
      return { directory: '', includeSubdirectories: true, description: '' };
    }
    return resourceDirectorySettings[currentResourceId] || {
      directory: '',
      includeSubdirectories: true,
      description: ''
    };
  };

  // Update directory settings for current resource
  const updateCurrentDirectorySettings = (updates: Partial<DirectorySettings>) => {
    if (!currentResourceId) return;

    setResourceDirectorySettings(prev => ({
      ...prev,
      [currentResourceId]: {
        ...getCurrentDirectorySettings(),
        ...updates
      }
    }));
    markDirty();
  };

  // =============================================================================
  // LOCAL EDITING PATTERN IMPLEMENTATION
  // =============================================================================

  /**
   * Load initial data from server using real API calls
   * Implements dual API call pattern: resources + libraries for selected resource
   * This is called once on mount and stores both original and working copies
   * Protected against React Strict Mode duplicate calls
   */
  const loadInitialData = async (isRefresh = false) => {
    // Prevent duplicate calls in React Strict Mode
    if (!isRefresh && (hasLoadedRef.current || isLoadingRef.current)) {
      console.log('ResourcesTab: Load skipped - already loaded or loading');
      return;
    }

    if (isRefresh && isLoadingRef.current) {
      console.log('ResourcesTab: Refresh skipped - already loading');
      return;
    }

    try {
      isLoadingRef.current = true;
      setError(null);

      console.log(`ResourcesTab: Loading initial data from API... (${isRefresh ? 'refresh' : 'initial'})`);

      // Step 1: Load all resources from API
      const apiResources: ApiResource[] = await getResources();
      console.log('ResourcesTab: Loaded resources from API:', apiResources);

      // Convert API resources to UI resources
      // The API already includes [Default Resource] so we don't need to add it separately
      const uiResources: Resource[] = apiResources.map(apiResource => {
        const isDefaultResource = apiResource.id === 'Default Resource';

        // Extract properties from the API resource
        const properties = apiResource.properties || {};

        return {
          id: apiResource.id,
          name: apiResource.name || apiResource.id,
          type: apiResource.type || 'Directory',
          globalScripts: properties.includeWithGlobalScripts || false,
          loadParentFirst: properties.loadParentFirst || false,
          isDefault: isDefaultResource,
          isEditing: false,
          originalApiData: apiResource // Store original API data
        };
      });

      // Set both original and working data to the same initial state
      setLocalState({
        originalData: [...uiResources], // Deep copy for original
        workingData: [...uiResources],  // Deep copy for working
        hasUnsavedChanges: false,
        lastSavedTimestamp: Date.now()
      });

      // Initialize directory settings for all resources from API data
      const initialDirectorySettings: { [key: string]: DirectorySettings } = {};

      apiResources.forEach(resource => {
        const properties = resource.properties || {};
        initialDirectorySettings[resource.id] = {
          directory: properties.directory || '',
          includeSubdirectories: properties.directoryRecursion !== false, // Default to true
          description: resource.description || ''
        };
      });

      setResourceDirectorySettings(initialDirectorySettings);

      hasLoadedRef.current = true;

      // Step 2: Restore selected resource from localStorage or default to [Default Resource]
      const savedSelectedResource = loadSelectedResourceFromStorage();
      let selectedResourceId = 'Default Resource'; // Default fallback

      // Check if saved resource exists in loaded resources
      if (savedSelectedResource && uiResources.some(r => r.id === savedSelectedResource)) {
        selectedResourceId = savedSelectedResource;
      }

      setCurrentResourceIdWithPersistence(selectedResourceId);
      setSelectedResourceIds([selectedResourceId]);

      console.log('ResourcesTab: Selected resource:', selectedResourceId);

      // Step 3: Load libraries for the selected resource
      await loadLibrariesForResource(selectedResourceId);

    } catch (err) {
      console.error('Failed to load resources:', err);
      setError('Failed to load resources');

      // Fallback to default resource only
      const fallbackResources: Resource[] = [
        {
          id: 'default',
          name: '[Default Resource]',
          type: 'Directory',
          globalScripts: false,
          loadParentFirst: false,
          isDefault: true
        }
      ];

      setLocalState({
        originalData: [...fallbackResources],
        workingData: [...fallbackResources],
        hasUnsavedChanges: false,
        lastSavedTimestamp: Date.now()
      });

      hasLoadedRef.current = true; // Set even on error to prevent retry loops
    } finally {
      isLoadingRef.current = false;
    }
  };

  /**
   * Save working data to server and update original data
   * This is the only function that should make API calls for persistence
   */
  const saveLocalChangesToServer = async (currentDirectorySettings?: ResourceDirectorySettings) => {
    try {
      const directorySettings = currentDirectorySettings || resourceDirectorySettings;
      console.log('Saving resources to server...', localState.workingData);

      // Convert UI resources back to API format
      const apiResources = localState.workingData.map(r => {
        const resourceSettings = directorySettings[r.id];
        console.log(`Processing resource ${r.id} (${r.name}):`, {
          resourceSettings,
          hasOriginalApiData: !!r.originalApiData
        });

        // If we have original API data, preserve all fields and only update what changed
        if (r.originalApiData) {
          const result = {
            ...r.originalApiData, // Preserve all original fields
            name: r.name,         // Update only the editable fields
            type: r.type,
            description: resourceSettings?.description || r.originalApiData.description || '',
            properties: {
              ...r.originalApiData.properties,
              directory: resourceSettings?.directory || r.originalApiData.properties?.directory || '',
              directoryRecursion: resourceSettings?.includeSubdirectories ?? r.originalApiData.properties?.directoryRecursion ?? true,
              includeWithGlobalScripts: r.globalScripts,
              loadParentFirst: r.loadParentFirst
            }
          };
          console.log(`Existing resource ${r.id} transformed:`, result);
          return result;
        }
        // For new resources, create complete structure with required fields
        const result = {
          id: r.id,
          name: r.name,
          type: r.type,
          description: resourceSettings?.description || '',
          properties: {
            directory: resourceSettings?.directory || '',
            directoryRecursion: resourceSettings?.includeSubdirectories ?? true,
            includeWithGlobalScripts: r.globalScripts,
            loadParentFirst: r.loadParentFirst
          }
        };
        console.log(`New resource ${r.id} transformed:`, result);
        return result;
      });

      console.log('Sending API resources:', apiResources);

      await updateResources(apiResources);

      console.log('Resources saved successfully to API');

      // Update original data to match working data after successful save
      setLocalState(prev => {
        const updatedWorkingData = prev.workingData.map((resource: Resource, index: number) => {
          const apiResource = apiResources[index];
          return {
            ...resource,
            originalApiData: {
              id: apiResource.id,
              name: apiResource.name,
              type: apiResource.type,
              description: apiResource.description,
              properties: {
                directory: apiResource.properties.directory,
                directoryRecursion: apiResource.properties.directoryRecursion,
                includeWithGlobalScripts: apiResource.properties.includeWithGlobalScripts,
                loadParentFirst: apiResource.properties.loadParentFirst
              }
            }
          };
        });

        console.log('CRITICAL FIX: Updated working data with originalApiData:', updatedWorkingData);

        return {
          ...prev,
          originalData: [...updatedWorkingData],
          workingData: [...updatedWorkingData],
          hasUnsavedChanges: false,
          lastSavedTimestamp: Date.now()
        };
      });

      dispatch(setDirty(false));
      console.log('Resources saved successfully');
    } catch (err) {
      console.error('Failed to save resources:', err);
      throw new Error('Failed to save resources');
    }
  };

  // Legacy function for backward compatibility
  const saveResources = saveLocalChangesToServer;

  // Loaded libraries state
  const [loadedLibraries, setLoadedLibraries] = useState<string[]>([]);

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

  const handleDirectoryChange = (field: keyof DirectorySettings, value: string | boolean) => {
    console.log(`Directory change for resource ${currentResourceId}, field ${field}:`, value);
    updateCurrentDirectorySettings({ [field]: value });
  };

  const handleResourceChange = (resourceId: string, field: 'globalScripts' | 'loadParentFirst', value: boolean) => {
    setResources(prev =>
      prev.map(resource =>
        resource.id === resourceId
          ? { ...resource, [field]: value }
          : resource
      )
    );
    markDirty(); // Mark as dirty when resource settings change
  };

  // Handle resource selection (now allows default resource selection)
  const handleResourceSelect = (resourceId: string, _isDefault: boolean = false) => {
    // Check if there's an editing resource with incomplete directory
    const editingResource = resources.find(r => r.isEditing);
    if (editingResource && editingResource.id !== resourceId) {
      const resourceSettings = resourceDirectorySettings[editingResource.id];
      const directoryValue = resourceSettings?.directory?.trim() || '';

      if (!directoryValue && !editingResource.isDefault) {
        // Show validation error and prevent selection change ONLY if selecting a different resource
        setResourcesWithErrors(prev => new Set([...prev, editingResource.id]));
        setValidationMessage('Directory cannot be blank.');
        setValidationDialogOpen(true);
        return;
      }

      // Auto-save the editing resource if directory is valid
      handleResourceAutoSave(editingResource.id);
    }

    // Allow selection of all resources including [Default Resource]
    setSelectedResourceIds(prev => {
      const newSelection = prev.includes(resourceId)
        ? prev.filter(id => id !== resourceId)
        : [...prev, resourceId];

      // Notify sidebar about selection change (exclude default resource from bulk operations)
      notifyResourceSelection(newSelection.filter(id => {
        const resource = resources.find(r => r.id === id);
        return resource && !resource.isDefault;
      }).length > 0);

      return newSelection;
    });

    // Set current resource for Directory Settings (always the clicked resource)
    setCurrentResourceIdWithPersistence(resourceId);
  };

  // Handle resource name editing (now allows default resource editing)
  const handleResourceNameClick = (resourceId: string, _isDefault: boolean = false) => {
    // Check if there's an editing resource with incomplete directory
    const editingResource = resources.find(r => r.isEditing);
    if (editingResource && editingResource.id !== resourceId) {
      const resourceSettings = resourceDirectorySettings[editingResource.id];
      const directoryValue = resourceSettings?.directory?.trim() || '';

      if (!directoryValue && !editingResource.isDefault) {
        // Show validation error and prevent editing mode change
        setResourcesWithErrors(prev => new Set([...prev, editingResource.id]));
        setValidationMessage('Directory cannot be blank.');
        setValidationDialogOpen(true);
        return;
      }

      // Auto-save the editing resource if directory is valid
      handleResourceAutoSave(editingResource.id);
    }

    setResources(prev =>
      prev.map(resource =>
        resource.id === resourceId
          ? { ...resource, isEditing: true }
          : { ...resource, isEditing: false } // Close other editing
      )
    );

    // Set editing resource ID for click-outside detection
    setEditingResourceId(resourceId);

    // Select the resource when entering edit mode and notify sidebar
    setSelectedResourceIds([resourceId]);
    setCurrentResourceIdWithPersistence(resourceId);

    // Only notify sidebar for non-default resources for bulk operations
    const resource = resources.find(r => r.id === resourceId);
    notifyResourceSelection(resource ? !resource.isDefault : false);
  };

  const handleResourceNameChange = (resourceId: string, newName: string) => {
    setResources(prev =>
      prev.map(resource =>
        resource.id === resourceId
          ? { ...resource, name: newName }
          : resource
      )
    );
    markDirty();
  };

  // Currently unused but kept for future functionality
  // const handleResourceNameSave = (resourceId: string) => {
  //   // Get the current directory value for this specific resource
  //   const resourceSettings = resourceDirectorySettings[resourceId];
  //   const directoryValue = resourceSettings?.directory?.trim() || '';

  //   // Validate directory field before saving
  //   if (!directoryValue) {
  //     setResourcesWithErrors(prev => new Set([...prev, resourceId]));
  //     setValidationMessage('Directory cannot be blank.');
  //     setValidationDialogOpen(true);
  //     return;
  //   }

  //   // Clear error state if validation passes
  //   setResourcesWithErrors(prev => {
  //     const newSet = new Set(prev);
  //     newSet.delete(resourceId);
  //     return newSet;
  //   });

  //   setResources(prev =>
  //     prev.map(resource =>
  //       resource.id === resourceId
  //         ? { ...resource, isEditing: false }
  //         : resource
  //     )
  //   );
  // };

  const handleResourceNameCancel = (resourceId: string) => {
    setResources(prev =>
      prev.map(resource =>
        resource.id === resourceId
          ? { ...resource, isEditing: false }
          : resource
      )
    );

    // Clear editing state
    setEditingResourceId(null);
  };

  // Auto-save handler that doesn't trigger Directory validation (per user requirement)
  const handleResourceAutoSave = useCallback((resourceId: string) => {
    // Simply exit editing mode without validation to prevent Directory errors
    setResources(prev =>
      prev.map(resource =>
        resource.id === resourceId
          ? { ...resource, isEditing: false }
          : resource
      )
    );

    // Clear any error state for this resource
    setResourcesWithErrors(prev => {
      const newSet = new Set(prev);
      newSet.delete(resourceId);
      return newSet;
    });

    // Clear editing state
    setEditingResourceId(null);
  }, []);

  // Click-outside detection for auto-save
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (editingResourceId && editingRowRef.current && !editingRowRef.current.contains(event.target as Node)) {
        handleResourceAutoSave(editingResourceId);
      }
    };

    if (editingResourceId) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [editingResourceId, handleResourceAutoSave]);

  // Event handlers for sidebar actions
  const handleRefresh = async () => {
    console.log('ResourcesTab: Refresh action triggered');

    // Clear all UI state
    setResourceDirectorySettings({});
    setSelectedResourceIds([]);
    setCurrentResourceIdWithPersistence(null);
    setResourcesWithErrors(new Set());
    notifyResourceSelection(false);

    // Discard local changes and reload from original data
    discardLocalChanges();

    // Reset loading flags to allow refresh
    hasLoadedRef.current = false;
    isLoadingRef.current = false;

    // Reload data from server using real API calls
    await loadInitialData(true); // Pass true for refresh

    console.log('ResourcesTab: Refresh completed');
  };

  const handleSave = async () => {
    // Use a callback to get the most current state
    setResourceDirectorySettings(currentSettings => {


      // Check for incomplete resources before saving using current state
      const incompleteResource = resources.find(r => {
        if (r.isDefault) return false;
        const resourceSettings = currentSettings[r.id];
        const directoryValue = resourceSettings?.directory?.trim() || '';
        return !directoryValue;
      });

      if (incompleteResource) {
        setResourcesWithErrors(prev => new Set([...prev, incompleteResource.id]));
        setValidationMessage('Directory cannot be blank.');
        setValidationDialogOpen(true);
        return currentSettings; // Return current state without changes
      }

      performActualSave(currentSettings);
      return currentSettings; // Return current state without changes
    });
  };

  const performActualSave = async (currentDirectorySettings?: ResourceDirectorySettings) => {
    // Clear all error states if validation passes
    setResourcesWithErrors(new Set());

    try {
      await saveLocalChangesToServer(currentDirectorySettings);
      console.log('Resources saved successfully');
      dispatch(setDirty(false));
    } catch (err) {
      console.error('Failed to save resources:', err);
      setError('Failed to save resources');
    }
  };

  const handleAddResource = () => {
    // Check if there's already an incomplete resource (in edit mode without directory)
    const incompleteResource = resources.find(r => {
      if (!r.isEditing) return false;
      const resourceSettings = resourceDirectorySettings[r.id];
      const directoryValue = resourceSettings?.directory?.trim() || '';
      return !directoryValue;
    });

    if (incompleteResource) {
      // Show validation error for the incomplete resource
      setResourcesWithErrors(prev => new Set([...prev, incompleteResource.id]));
      setValidationMessage('Directory cannot be blank.');
      setValidationDialogOpen(true);
      return;
    }

    // Add new resource with default name
    const newResourceId = Date.now().toString();
    const resourceCount = resources.filter(r => !r.isDefault).length + 1;
    const newResource: Resource = {
      id: newResourceId,
      name: `Resource ${resourceCount}`, // Default name instead of empty
      type: 'Directory',
      globalScripts: false,
      loadParentFirst: false,
      isEditing: true, // Auto-focus in edit mode
      originalApiData: undefined // New resources don't have original API data
    };

    setResources(prev => [...prev, newResource]);

    // Initialize directory settings for new resource
    setResourceDirectorySettings(prev => ({
      ...prev,
      [newResourceId]: {
        directory: '',
        includeSubdirectories: true,
        description: ''
      }
    }));

    // Auto-select the new resource and notify sidebar
    setSelectedResourceIds([newResourceId]);
    setCurrentResourceIdWithPersistence(newResourceId);
    notifyResourceSelection(true);

    markDirty();
    console.log('Adding new resource with ID:', newResourceId);
  };

  const handleRemoveResource = () => {
    // Remove selected resources (excluding default resources)
    if (selectedResourceIds.length === 0) return;

    // Filter out default resources from deletion
    const resourcesToDelete = selectedResourceIds.filter(id => {
      const resource = resources.find(r => r.id === id);
      return resource && !resource.isDefault;
    });

    if (resourcesToDelete.length === 0) {
      console.log('No non-default resources selected for deletion');
      return;
    }

    setResources(prev =>
      prev.filter(resource => !resourcesToDelete.includes(resource.id))
    );

    // Clear selection and directory settings for deleted resources
    resourcesToDelete.forEach(id => {
      setResourceDirectorySettings(prev => {
        const newSettings = { ...prev };
        delete newSettings[id];
        return newSettings;
      });
    });

    setSelectedResourceIds([]);
    notifyResourceSelection(false);
    markDirty();
  };

  const handleReloadResource = () => {
    // Show reload resource dialog
    setReloadDialogOpen(true);
  };

  const handleConfirmReload = async () => {
    console.log('Reloading resource...');
    setReloadDialogOpen(false);

    if (currentResourceId) {
      try {
        // Use the fixed reloadResource function
        await reloadResource(currentResourceId);

        console.log('Resource reloaded successfully');

        // Following Java GUI pattern: refresh the entire resource list after reload
        await loadInitialData(true); // Pass true for refresh

        // Then refresh loaded libraries for the current resource
        await loadLibrariesForCurrentResource();
      } catch (err) {
        console.error('Failed to reload resource:', err);
        setError('Failed to reload resource');
      }
    }
  };

  // Load libraries for a specific resource using real API
  const loadLibrariesForResource = async (resourceId: string) => {
    if (!resourceId) {
      setLoadedLibraries([]);
      return;
    }

    try {
      console.log('ResourcesTab: Loading libraries for resource:', resourceId);

      // Use the proper URL encoding for the resource ID
      const encodedResourceId = encodeResourceIdForUrl(resourceId);
      console.log('ResourcesTab: Encoded resource ID for URL:', encodedResourceId);

      const libraries = await getResourceLibraries(resourceId);
      setLoadedLibraries(libraries);

      console.log('ResourcesTab: Loaded libraries:', libraries);
    } catch (err) {
      console.warn('Failed to load libraries for resource:', resourceId, err);
      setLoadedLibraries([]);
    }
  };

  // Load libraries for current resource (wrapper for backward compatibility)
  const loadLibrariesForCurrentResource = async () => {
    if (currentResourceId) {
      await loadLibrariesForResource(currentResourceId);
    } else {
      setLoadedLibraries([]);
    }
  };

  // Listen for sidebar events
  useEffect(() => {
    const handleRefreshEvent = () => handleRefresh();
    const handleSaveEvent = () => handleSave();
    const handleAddResourceEvent = () => handleAddResource();
    const handleRemoveResourceEvent = () => handleRemoveResource();
    const handleReloadResourceEvent = () => handleReloadResource();

    window.addEventListener('resources-refresh-requested', handleRefreshEvent);
    window.addEventListener('settings-save-requested', handleSaveEvent);
    window.addEventListener('resources-add-requested', handleAddResourceEvent);
    window.addEventListener('resources-remove-requested', handleRemoveResourceEvent);
    window.addEventListener('resources-reload-requested', handleReloadResourceEvent);

    return () => {
      window.removeEventListener('resources-refresh-requested', handleRefreshEvent);
      window.removeEventListener('settings-save-requested', handleSaveEvent);
      window.removeEventListener('resources-add-requested', handleAddResourceEvent);
      window.removeEventListener('resources-remove-requested', handleRemoveResourceEvent);
      window.removeEventListener('resources-reload-requested', handleReloadResourceEvent);
    };
  }, [selectedResourceIds, resources]); // Add dependencies to ensure handlers have latest state

  // Load initial data on component mount (local editing pattern)
  useEffect(() => {
    loadInitialData();
  }, []);

  // Load libraries when current resource changes (with React Strict Mode protection)
  useEffect(() => {
    if (currentResourceId) {
      // Add small delay to prevent rapid successive calls in React Strict Mode
      const timeoutId = setTimeout(() => {
        loadLibrariesForCurrentResource();
      }, 50);

      return () => clearTimeout(timeoutId);
    } else {
      setLoadedLibraries([]);
    }
  }, [currentResourceId]);

  // Validate incomplete resources when component unmounts (tab navigation)
  useEffect(() => {
    return () => {
      // Check for incomplete resources when leaving the tab
      const incompleteResource = resources.find(r =>
        !r.isDefault && (!resourceDirectorySettings[r.id]?.directory?.trim())
      );

      if (incompleteResource) {
        // Note: We can't show modal on unmount, but we can mark the error
        setResourcesWithErrors(prev => new Set([...prev, incompleteResource.id]));
      }
    };
  }, [resources, resourceDirectorySettings]);

  return (
    <Box sx={{ p: 3 }}>
      <SectionTitle>Resources</SectionTitle>

      {/* Error Display */}
      {error && (
        <Box sx={{ mb: 2, p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
          <Typography color="error.contrastText">
            {error}
          </Typography>
        </Box>
      )}

      {/* Resources Table */}
      <TableContainer 
        component={Paper} 
        sx={{ 
          border: 1, 
          borderColor: 'divider',
          mb: 4,
          minHeight: '150px'
        }}
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', minWidth: '300px' }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '120px' }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '140px', textAlign: 'center' }}>Global Scripts</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '140px', textAlign: 'center' }}>Load Parent-First</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {resources.map((resource) => (
              <TableRow
                key={resource.id}
                ref={resource.isEditing ? editingRowRef : null}
                selected={selectedResourceIds.includes(resource.id)}
                onClick={() => {
                  handleResourceSelect(resource.id, resource.isDefault);
                }}
                sx={{
                  '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
                  height: '40px',
                  cursor: 'pointer',
                  backgroundColor: resource.isDefault ? '#f5f5f5' : 'inherit',
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(25, 118, 210, 0.12)',
                    '&:hover': {
                      backgroundColor: 'rgba(25, 118, 210, 0.16)'
                    }
                  }
                }}
              >
                <TableCell
                  sx={{ height: '40px' }}
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent row selection when clicking name
                    if (!resource.isEditing) {
                      handleResourceNameClick(resource.id, resource.isDefault);
                    }
                  }}
                >
                  {resource.isEditing ? (
                    <TextField
                      size="small"
                      value={resource.name}
                      onChange={(e) => handleResourceNameChange(resource.id, e.target.value)}
                      autoFocus
                      fullWidth
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleResourceAutoSave(resource.id);
                        } else if (e.key === 'Escape') {
                          handleResourceNameCancel(resource.id);
                        }
                      }}
                    />
                  ) : (
                    <Typography
                      variant="body2"
                      sx={{
                        cursor: 'text',
                        '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
                        p: 0.5,
                        borderRadius: 1,
                        fontWeight: resource.isDefault ? 'medium' : 'normal'
                      }}
                    >
                      {resource.name || (resource.isDefault ? resource.name : 'Click to edit name')}
                    </Typography>
                  )}
                </TableCell>
                <TableCell sx={{ height: '40px' }}>
                  {resource.type}
                </TableCell>
                <TableCell
                  sx={{ height: '40px', textAlign: 'center' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Checkbox
                    checked={resource.globalScripts}
                    onChange={(e) => handleResourceChange(resource.id, 'globalScripts', e.target.checked)}
                    size="small"
                  />
                </TableCell>
                <TableCell
                  sx={{ height: '40px', textAlign: 'center' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Checkbox
                    checked={resource.loadParentFirst}
                    onChange={(e) => handleResourceChange(resource.id, 'loadParentFirst', e.target.checked)}
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}
            {resources.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} sx={{ textAlign: 'center', py: 8 }}>
                  <Typography variant="body2" color="text.secondary">
                    No resources are currently configured.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Directory Settings Section - Always visible */}
      <SectionTitle>Directory Settings</SectionTitle>
      {currentResourceId ? (
        <>

          <Box sx={{ mb: 4 }}>
            <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <Grid item xs={12} sm={2}>
                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                  Directory:
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  size="small"
                  value={getCurrentDirectorySettings().directory}
                  onChange={(e) => {
                    handleDirectoryChange('directory', e.target.value);
                    // Clear error state when user starts typing
                    if (currentResourceId && resourcesWithErrors.has(currentResourceId)) {
                      setResourcesWithErrors(prev => {
                        const newSet = new Set(prev);
                        newSet.delete(currentResourceId);
                        return newSet;
                      });
                    }
                  }}
                  fullWidth
                  error={currentResourceId ? resourcesWithErrors.has(currentResourceId) && !getCurrentDirectorySettings().directory?.trim() : false}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: (currentResourceId && resourcesWithErrors.has(currentResourceId) && !getCurrentDirectorySettings().directory?.trim()) ? '#ffebee' : 'inherit'
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={getCurrentDirectorySettings().includeSubdirectories}
                      onChange={(e) => handleDirectoryChange('includeSubdirectories', e.target.checked)}
                      size="small"
                    />
                  }
                  label="Include All Subdirectories"
                />
              </Grid>
            </Grid>

            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={2}>
                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                  Description:
                </Typography>
              </Grid>
              <Grid item xs={12} sm={10}>
                <TextField
                  multiline
                  rows={8}
                  value={getCurrentDirectorySettings().description}
                  onChange={(e) => handleDirectoryChange('description', e.target.value)}
                  fullWidth
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontFamily: 'monospace',
                      fontSize: '0.875rem'
                    }
                  }}
                />
              </Grid>
            </Grid>

            {/* Loaded Libraries as part of Directory Settings */}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={2}>
                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                  Loaded Libraries:
                </Typography>
              </Grid>
              <Grid item xs={12} sm={10}>
                <TableContainer
                  component={Paper}
                  sx={{
                    border: 1,
                    borderColor: 'divider',
                    minHeight: '150px'
                  }}
                >
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Library</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {loadedLibraries.map((library, index) => (
                        <TableRow
                          key={index}
                          sx={{
                            '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
                            height: '40px'
                          }}
                        >
                          <TableCell sx={{ height: '40px' }}>
                            {library}
                          </TableCell>
                        </TableRow>
                      ))}
                      {loadedLibraries.length === 0 && (
                        <TableRow>
                          <TableCell sx={{ textAlign: 'center', py: 8 }}>
                            <Typography variant="body2" color="text.secondary">
                              No libraries are currently loaded.
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          </Box>
        </>
      ) : (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body2" color="text.secondary">
            Select a resource to view its directory settings.
          </Typography>
        </Box>
      )}



      {/* Reload Resource Dialog */}
      <ReloadResourceDialog
        open={reloadDialogOpen}
        onClose={() => setReloadDialogOpen(false)}
        onConfirm={handleConfirmReload}
        isDirty={isDirty}
      />

      {/* Resource Validation Dialog */}
      <ResourceValidationDialog
        open={validationDialogOpen}
        onClose={() => setValidationDialogOpen(false)}
        message={validationMessage}
      />
    </Box>
  );
};

// Memoize component for performance optimization
export default memo(ResourcesTab);
