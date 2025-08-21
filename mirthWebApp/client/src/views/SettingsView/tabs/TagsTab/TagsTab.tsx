import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import {
  Add as AddIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import {
  Box,
  Button,
  Checkbox,
  Divider,
  IconButton,
  InputAdornment,
  Paper,
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
import { useDispatch } from 'react-redux';
import { setDirty } from '../../../../states/settingsReducer';
import type { AppDispatch } from '../../../../states';
import { 
  getChannelTags, 
  getChannelIdsAndNames, 
  saveChannelTags,
  type Tag,
  type ChannelData
} from '../../../../services/tagsService';

/**
 * TagsTab component with full API integration and tag-channel association management
 * Features:
 * - Tag management with bulk selection and operations
 * - Dynamic channel association based on selected tags
 * - Contextual channel selection with proper disabled states
 * - Integration with settings save/refresh functionality
 */
const TagsTab: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  // State management
  const [tags, setTags] = useState<Tag[]>([]);
  const [channels, setChannels] = useState<ChannelData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [channelFilter, setChannelFilter] = useState('');
  // Removed: const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Filter channels based on search input - memoized for performance
  const filteredChannels = useMemo(() =>
    channels.filter(channel => {
      // Ensure channel.name is a string before calling toLowerCase
      const channelName = typeof channel.name === 'string' ? channel.name : String(channel.name || '');
      return channelName.toLowerCase().includes(channelFilter.toLowerCase());
    }), [channels, channelFilter]);

  // Create mapping from channels to tags for efficient lookup - memoized for performance
  const channelToTagsMap = useMemo(() => {
    const map = new Map<string, Set<string>>();
    
    // Initialize map with all channels
    channels.forEach(channel => {
      map.set(channel.id, new Set<string>());
    });
    
    // Populate map with tag associations
    tags.forEach(tag => {
      if (tag.channelIds) {
        tag.channelIds.forEach(channelId => {
          if (!map.has(channelId)) {
            map.set(channelId, new Set<string>());
          }
          map.get(channelId)!.add(tag.id);
        });
      }
    });
    
    console.log('Channel to tags mapping created:', map.size, 'channels mapped');
    return map;
  }, [tags, channels]);

  // Determine which channels should be checked based on selected tags
  const getChannelCheckboxState = useCallback((channelId: string) => {
    if (selectedTags.length === 0) {
      return { checked: false, indeterminate: false };
    }
    
    // Get tags associated with this channel
    const channelTags = channelToTagsMap.get(channelId) || new Set<string>();
    const selectedTagsSet = new Set(selectedTags);
    
    // Calculate intersection of channel's tags with selected tags
    const intersection = new Set([...channelTags].filter(tagId => selectedTagsSet.has(tagId)));
    
    if (intersection.size === 0) {
      // Channel is not associated with any selected tags
      return { checked: false, indeterminate: false };
    } else if (intersection.size === selectedTags.length) {
      // Channel is associated with ALL selected tags
      return { checked: true, indeterminate: false };
    } else {
      // Channel is associated with SOME but not all selected tags
      return { checked: false, indeterminate: true };
    }
  }, [selectedTags, channelToTagsMap]);

  // Load data from server
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Loading tags and channels from server...');
      
      // Load both tags and channels in parallel
      const [tagsData, channelsData] = await Promise.all([
        getChannelTags(),
        getChannelIdsAndNames()
      ]);
      
      console.log('Loaded tags:', tagsData.length, 'channels:', channelsData.length);
      console.log('Channel data sample:', channelsData.slice(0, 2));
      
      setTags(tagsData);
      setChannels(channelsData);
      
    } catch (err: any) {
      console.error('Failed to load tags data:', err);
      setError(err.message || 'Failed to load data from server');
      
      // Set empty arrays on error to prevent UI issues
      setTags([]);
      setChannels([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Optimized event handlers with useCallback
  const handleEdit = useCallback((tagId: string) => {
    setTags(prev => prev.map(tag =>
      tag.id === tagId
        ? { ...tag, isEditing: true }
        : tag
    ));
    // Removed: dispatch(setDirty(true)); - dirty state should only trigger on actual save
  }, []);

  const handleSave = useCallback((tagId: string) => {
    setTags(prev => prev.map(tag =>
      tag.id === tagId
        ? {
            ...tag,
            isEditing: false,
            originalName: tag.name,
            originalColor: tag.color
          }
        : tag
    ));
    // Mark as dirty when user confirms save (clicks tick button)
    dispatch(setDirty(true));
  }, [dispatch]);

  const handleCancel = useCallback((tagId: string) => {
    setTags(prev => prev.map(tag => 
      tag.id === tagId 
        ? { 
            ...tag, 
            isEditing: false,
            name: tag.originalName,
            color: tag.originalColor
          }
        : tag
    ));
  }, []);

  const handleDelete = useCallback((tagId: string) => {
    setTags(prev => prev.filter(tag => tag.id !== tagId));
    // Mark as dirty when deleting
    dispatch(setDirty(true));
  }, [dispatch]);

  const handleRemoveSelectedTags = useCallback(() => {
    if (selectedTags.length === 0) return;

    setTags(prev => prev.filter(tag => !selectedTags.includes(tag.id)));
    setSelectedTags([]);
    // Mark as dirty when deleting
    dispatch(setDirty(true));
  }, [selectedTags, dispatch]);

  const handleNameChange = useCallback((tagId: string, newName: string) => {
    setTags(prev => prev.map(tag => 
      tag.id === tagId 
        ? { ...tag, name: newName }
        : tag
    ));
    // Removed: dispatch(setDirty(true)); - dirty state should only trigger on actual save
  }, []);

  const handleColorChange = useCallback((tagId: string, newColor: string) => {
    setTags(prev => prev.map(tag => 
      tag.id === tagId 
        ? { ...tag, color: newColor }
        : tag
    ));
    // Removed: dispatch(setDirty(true)); - dirty state should only trigger on actual save
  }, []);

  const handleAddTag = useCallback(() => {
    const newTag: Tag = {
      id: `new-tag-${Date.now()}`, // Temporary ID for new tags
      name: 'New Tag',
      color: '#808080',
      channelCount: 0,
      channelIds: [], // Initialize with empty channel associations
      isEditing: true,
      originalName: 'New Tag',
      originalColor: '#808080'
    };
    setTags(prev => [...prev, newTag]);
    // Mark as dirty when adding new tag
    dispatch(setDirty(true));
  }, [dispatch]);

  const isTagModified = useCallback((tag: Tag) => {
    return tag.name !== tag.originalName || tag.color !== tag.originalColor;
  }, []);

  const handleSelectAllChannels = useCallback(() => {
    if (selectedTags.length === 0) return; // Don't allow selection when no tags selected
    
    // Determine if we should select all or deselect all
    const allChannelsAssociated = filteredChannels.every(channel => {
      const checkboxState = getChannelCheckboxState(channel.id);
      return checkboxState.checked;
    });
    
    // Update tag-channel associations for all filtered channels
    setTags(prev => prev.map(tag => {
      if (selectedTags.includes(tag.id)) {
        const currentChannelIds = tag.channelIds || [];
        let newChannelIds: string[];
        
        if (allChannelsAssociated) {
          // Remove all filtered channels from this tag
          const filteredChannelIds = new Set(filteredChannels.map(c => c.id));
          newChannelIds = currentChannelIds.filter(id => !filteredChannelIds.has(id));
        } else {
          // Add all filtered channels to this tag
          const channelIdsSet = new Set(currentChannelIds);
          filteredChannels.forEach(channel => {
            channelIdsSet.add(channel.id);
          });
          newChannelIds = Array.from(channelIdsSet);
        }
        
        return {
          ...tag,
          channelIds: newChannelIds,
          channelCount: newChannelIds.length
        };
      }
      return tag;
    }));
    
    // Mark as dirty when channel associations change
    dispatch(setDirty(true));
  }, [filteredChannels, selectedTags, getChannelCheckboxState, dispatch]);

  // Tag selection handlers
  const handleSelectAllTags = useCallback(() => {
    if (selectedTags.length === tags.length) {
      setSelectedTags([]);
    } else {
      setSelectedTags(tags.map(tag => tag.id));
    }
  }, [selectedTags.length, tags]);

  const handleTagSelection = useCallback((tagId: string, isSelected: boolean) => {
    setSelectedTags(prev => {
      if (isSelected) {
        return [...prev, tagId];
      } else {
        return prev.filter(id => id !== tagId);
      }
    });
  }, []);

  // Update channel selection handler to modify tag-channel associations
  const handleChannelSelection = useCallback((channelId: string, isSelected: boolean) => {
    if (selectedTags.length === 0) return; // Don't allow selection when no tags selected
    
    // Update tag-channel associations
    setTags(prev => prev.map(tag => {
      if (selectedTags.includes(tag.id)) {
        const currentChannelIds = tag.channelIds || [];
        let newChannelIds: string[];
        
        if (isSelected) {
          // Add channel to tag if not already present
          if (!currentChannelIds.includes(channelId)) {
            newChannelIds = [...currentChannelIds, channelId];
          } else {
            newChannelIds = currentChannelIds;
          }
        } else {
          // Remove channel from tag
          newChannelIds = currentChannelIds.filter(id => id !== channelId);
        }
        
        return {
          ...tag,
          channelIds: newChannelIds,
          channelCount: newChannelIds.length
        };
      }
      return tag;
    }));
    
    // Mark as dirty when channel associations change
    dispatch(setDirty(true));
  }, [selectedTags, dispatch]);

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

  // Save tags to server
  const saveTagsToServer = useCallback(async () => {
    try {
      setSaving(true);
      setError(null);
      
      console.log('Saving tags to server:', tags.length, 'tags');
      
      await saveChannelTags(tags);
      
      console.log('Tags saved successfully');
      dispatch(setDirty(false));
      
    } catch (err: any) {
      console.error('Failed to save tags:', err);
      setError(err.message || 'Failed to save tags to server');
      throw err; // Re-throw to allow caller to handle
    } finally {
      setSaving(false);
    }
  }, [tags, dispatch]);

  // Add save handler that listens to the custom event
  useEffect(() => {
    const handleSaveEvent = async () => {
      try {
        await saveTagsToServer();
      } catch (err) {
        // Error already handled in saveTagsToServer
        console.error('Save event handler failed:', err);
      }
    };

    window.addEventListener('settings-save-requested', handleSaveEvent);

    return () => {
      window.removeEventListener('settings-save-requested', handleSaveEvent);
    };
  }, [saveTagsToServer]);

  // Add refresh handler that listens to the custom event
  useEffect(() => {
    const handleRefreshEvent = async () => {
      try {
        console.log('Refresh event received, reloading data...');
        await loadData();
        
        // Reset UI state
        setSelectedTags([]);
        setChannelFilter('');
        
        // Clear dirty state after successful refresh
        dispatch(setDirty(false));
        
        console.log('Tags refreshed successfully');
      } catch (err) {
        console.error('Refresh event handler failed:', err);
        // Error already handled in loadData
      }
    };

    window.addEventListener('tags-refresh-requested', handleRefreshEvent);

    return () => {
      window.removeEventListener('tags-refresh-requested', handleRefreshEvent);
    };
  }, [loadData, dispatch]);

  // Removed: useEffect(() => {
  //   if (selectedTags.length === 0) {
  //     setSelectedChannels([]);
  //   }
  // }, [selectedTags.length]);

  // Calculate select all channels checkbox state based on current associations
  const selectAllChannelsState = useMemo(() => {
    if (selectedTags.length === 0 || filteredChannels.length === 0) {
      return { checked: false, indeterminate: false };
    }
    
    const checkedChannels = filteredChannels.filter(channel => {
      const checkboxState = getChannelCheckboxState(channel.id);
      return checkboxState.checked;
    });
    
    const indeterminateChannels = filteredChannels.filter(channel => {
      const checkboxState = getChannelCheckboxState(channel.id);
      return checkboxState.indeterminate;
    });
    
    if (checkedChannels.length === filteredChannels.length) {
      return { checked: true, indeterminate: false };
    } else if (checkedChannels.length > 0 || indeterminateChannels.length > 0) {
      return { checked: false, indeterminate: true };
    } else {
      return { checked: false, indeterminate: false };
    }
  }, [selectedTags, filteredChannels, getChannelCheckboxState]);

  return (
    <Box sx={{ p: 3 }}>
      {/* Error Display */}
      {error && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="error" sx={{ 
            p: 2, 
            backgroundColor: 'error.light', 
            borderRadius: 1,
            color: 'error.contrastText'
          }}>
            {error}
          </Typography>
        </Box>
      )}

      <Stack spacing={4}>
        {/* Tags Section */}
        <Box>
          <SectionTitle>Tags</SectionTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Manage channel tags for organization and filtering.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                color="error"
                onClick={handleRemoveSelectedTags}
                size="small"
                disabled={loading || saving || selectedTags.length === 0}
              >
                Remove
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddTag}
                size="small"
                disabled={loading || saving}
              >
                Add Tag
              </Button>
            </Box>
          </Box>

          <TableContainer component={Paper} sx={{ border: 1, borderColor: 'divider' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell 
                    padding="checkbox"
                    sx={{ 
                      borderRight: '1px solid rgba(224, 224, 224, 1)',
                      width: '42px'
                    }}
                  >
                    <Checkbox
                      indeterminate={selectedTags.length > 0 && selectedTags.length < tags.length}
                      checked={tags.length > 0 && selectedTags.length === tags.length}
                      onChange={handleSelectAllTags}
                      disabled={loading || tags.length === 0}
                      size="small"
                    />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: '300px' }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: '150px' }}>Color</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: '120px', textAlign: 'center' }}>Channel Count</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: '80px', textAlign: 'center' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        Loading tags...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : tags.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        No tags defined. Click "Add Tag" to create your first tag.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  tags.map((tag) => (
                    <TableRow key={tag.id} hover>
                      <TableCell 
                        padding="checkbox"
                        sx={{ 
                          borderRight: '1px solid rgba(224, 224, 224, 1)',
                          height: '53px'
                        }}
                      >
                        <Checkbox
                          checked={selectedTags.includes(tag.id)}
                          onChange={(e) => handleTagSelection(tag.id, e.target.checked)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell sx={{ height: '53px' }}>
                        {tag.isEditing ? (
                          <TextField
                            value={tag.name}
                            onChange={(e) => handleNameChange(tag.id, e.target.value)}
                            size="small"
                            fullWidth
                            autoFocus
                            disabled={saving}
                            sx={{ '& .MuiInputBase-root': { height: '32px' } }}
                          />
                        ) : (
                          <Box sx={{ display: 'flex', alignItems: 'center', height: '32px' }}>
                            <Typography variant="body2">{tag.name}</Typography>
                          </Box>
                        )}
                      </TableCell>
                      <TableCell sx={{ height: '53px' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, height: '32px' }}>
                          <Box
                            sx={{
                              width: '24px',
                              height: '24px',
                              backgroundColor: tag.color,
                              border: '1px solid #ccc',
                              borderRadius: '4px',
                              flexShrink: 0
                            }}
                          />
                          {tag.isEditing ? (
                            <input
                              type="color"
                              value={tag.color}
                              onChange={(e) => handleColorChange(tag.id, e.target.value)}
                              disabled={saving}
                              style={{
                                width: '32px',
                                height: '24px',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                cursor: saving ? 'not-allowed' : 'pointer'
                              }}
                            />
                          ) : (
                            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '11px' }}>
                              {tag.color.toUpperCase()}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center', height: '53px' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '32px' }}>
                          <Typography variant="body2">{tag.channelCount}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center', height: '53px' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0.5, height: '32px' }}>
                          {tag.isEditing ? (
                            <>
                              <IconButton
                                size="small"
                                onClick={() => handleSave(tag.id)}
                                color="success"
                                disabled={(!isTagModified(tag) && tag.name.trim() === '') || saving}
                                sx={{ p: 0.5 }}
                              >
                                <CheckIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleCancel(tag.id)}
                                color="default"
                                disabled={saving}
                                sx={{ p: 0.5 }}
                              >
                                <CloseIcon fontSize="small" />
                              </IconButton>
                            </>
                          ) : (
                            <IconButton
                              size="small"
                              onClick={() => handleEdit(tag.id)}
                              color="primary"
                              disabled={saving}
                              sx={{ p: 0.5 }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* Channels Section */}
        <Box>
          <SectionTitle>Channels</SectionTitle>
          <Typography 
            variant="body2" 
            color={selectedTags.length === 0 ? "text.disabled" : "text.secondary"} 
            sx={{ mb: 2 }}
          >
            {selectedTags.length === 0 
              ? "Select one or more tags above to manage channel associations."
              : "Channel selections will be applied to the currently selected tags."
            }
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', mb: 2 }}>
            <TextField
              size="small"
              placeholder="Filter channels..."
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              disabled={loading || selectedTags.length === 0}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color={selectedTags.length === 0 ? "disabled" : "action"} />
                  </InputAdornment>
                ),
              }}
              sx={{ width: '300px' }}
            />
          </Box>

          <TableContainer component={Paper} sx={{ border: 1, borderColor: 'divider', minHeight: '200px' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell 
                    padding="checkbox"
                    sx={{ 
                      borderRight: '1px solid rgba(224, 224, 224, 1)',
                      width: '42px'
                    }}
                  >
                    <Checkbox
                      indeterminate={selectAllChannelsState.indeterminate}
                      checked={selectAllChannelsState.checked}
                      onChange={handleSelectAllChannels}
                      disabled={loading || filteredChannels.length === 0 || selectedTags.length === 0}
                      size="small"
                    />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={2} sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        Loading channels...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : filteredChannels.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        {channels.length === 0 ? 'No channels available.' : 'No channels match the current filter.'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredChannels.map((channel) => {
                    const checkboxState = getChannelCheckboxState(channel.id);
                    return (
                      <TableRow 
                        key={channel.id}
                        sx={{ 
                          '&:hover': { 
                            backgroundColor: selectedTags.length > 0 ? 'rgba(0, 0, 0, 0.04)' : 'transparent' 
                          },
                          height: '40px',
                          opacity: selectedTags.length === 0 ? 0.5 : 1
                        }}
                      >
                        <TableCell 
                          padding="checkbox"
                          sx={{ 
                            borderRight: '1px solid rgba(224, 224, 224, 1)',
                            height: '40px'
                          }}
                        >
                          <Checkbox
                            checked={checkboxState.checked}
                            indeterminate={checkboxState.indeterminate}
                            onChange={(e) => handleChannelSelection(channel.id, e.target.checked)}
                            disabled={selectedTags.length === 0}
                            size="small"
                          />
                        </TableCell>
                        <TableCell sx={{ height: '40px', color: selectedTags.length === 0 ? 'text.disabled' : 'text.primary' }}>
                          {typeof channel.name === 'string' ? channel.name : String(channel.name || '')}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Stack>
    </Box>
  );
};

// Memoize component for performance optimization
export default memo(TagsTab);
