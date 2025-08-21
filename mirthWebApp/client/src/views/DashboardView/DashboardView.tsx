import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  PlayArrow,
  Stop,
  Pause,
  Refresh,
  FilterList,
  Tag,
  Timeline,
  TrendingUp,
  KeyboardArrowUp,
  KeyboardArrowDown,
  ExpandMore,
  ExpandLess,
  Add,
  Remove
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../states';
import { fetchChannels } from '../../states/channelReducer';
import { ChannelStatus } from '../../types/channel.type';
import { startChannel, stopChannel, pauseChannel, getChannelGroups } from '../../services/channelsService';
import { useChannelSelection } from '../../providers/AlertProvider';
import LogPanel from '../../components/LogPanel';
import { ResizableBox, ResizableBoxProps, ResizeCallbackData } from 'react-resizable';
import 'react-resizable/css/styles.css';
import { useGroupedChannelsWithResizableColumns, ColumnConfig } from '../../hooks/useGroupedChannelsWithResizableColumns';

const DEFAULT_LOG_HEIGHT = 250;
const MIN_LOG_HEIGHT = 100;
const MAX_LOG_HEIGHT_RATIO = 0.8; // 80% of container

// Restore DATA_COLUMNS as the array of column configs for useGroupedChannelsWithResizableColumns and colSpan.
// Use DEFAULT_COLUMN_WIDTHS only for the object-based columnWidths state and rendering.
const DATA_COLUMNS: ColumnConfig[] = [
  { title: 'Name/Description', minWidth: 120, maxWidth: 600, defaultWidth: 200, align: 'left' },
  { title: 'Revision', minWidth: 60, maxWidth: 200, defaultWidth: 80, align: 'right' },
  { title: 'Last Modified', minWidth: 100, maxWidth: 300, defaultWidth: 120, align: 'right' },
  { title: 'Received', minWidth: 80, maxWidth: 200, defaultWidth: 100, align: 'right' },
  { title: 'Filtered', minWidth: 80, maxWidth: 200, defaultWidth: 100, align: 'right' },
  { title: 'Queued', minWidth: 80, maxWidth: 200, defaultWidth: 100, align: 'right' },
  { title: 'Sent', minWidth: 80, maxWidth: 200, defaultWidth: 100, align: 'right' },
  { title: 'Error', minWidth: 80, maxWidth: 200, defaultWidth: 100, align: 'right' },
];
const DEFAULT_COLUMN_WIDTHS: { [key: string]: number } = {
  status: 120,
  name: 280,
  rev: 90,
  lastDeployed: 150,
  received: 110,
  filtered: 110,
  queued: 110,
  sent: 110,
  error: 110,
  actions: 120,
};

const MIN_COLUMN_WIDTH = 60;

const DashboardView = () => {
  const dispatch = useDispatch();
  const { channels, loading, error } = useSelector((state: RootState) => state.channels);
  const { selectedChannels, setSelectedChannels } = useChannelSelection();
  
  const [showLifetimeStats, setShowLifetimeStats] = useState(false);
  const [tagFilter, setTagFilter] = useState('');
  const [logPanelHeight, setLogPanelHeight] = useState(DEFAULT_LOG_HEIGHT);
  const [isResizing, setIsResizing] = useState(false);
  const [isLogExpanded, setIsLogExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [channelGroups, setChannelGroups] = useState<any[]>([]);
  const { groupedChannels, columnWidths, handleResize } = useGroupedChannelsWithResizableColumns({
    channels,
    groups: channelGroups,
    columnConfig: DATA_COLUMNS,
    groupByDeployed: true,
  });
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const resizingCol = useRef<string | null>(null);
  const startX = useRef<number>(0);
  const startWidth = useRef<number>(0);

  useEffect(() => {
    dispatch(fetchChannels() as any);
    // Fetch channel groups
    getChannelGroups().then(setChannelGroups);
  }, [dispatch]);

  const toggleGroup = (groupName: string) => {
    setCollapsedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupName)) {
        newSet.delete(groupName);
      } else {
        newSet.add(groupName);
      }
      return newSet;
    });
  };

  const isGroupCollapsed = (groupName: string) => {
    return collapsedGroups.has(groupName);
  };

  // Mouse event handlers for resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const mouseY = e.clientY;
      const containerBottom = containerRect.bottom;
      const newHeight = Math.max(MIN_LOG_HEIGHT, containerBottom - mouseY);
      setLogPanelHeight(newHeight);
    };
    const handleMouseUp = () => setIsResizing(false);
    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'started':
        return 'success';
      case 'stopped':
        return 'error';
      case 'paused':
        return 'warning';
      case 'deploying':
      case 'undeploying':
      case 'starting':
      case 'stopping':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'started':
        return <PlayArrow />;
      case 'stopped':
        return <Stop />;
      case 'paused':
        return <Pause />;
      default:
        return <CircularProgress size={16} />;
    }
  };

  const handleChannelAction = async (channelId: string, action: string) => {
    try {
      let success = false;
      
      if (action === 'start') {
        // Smart start: if channel is paused, stop it first, then start it
        const channel = channels.find(c => c.id === channelId);
        if (channel && channel.state === 'PAUSED') {
          console.log(`Channel ${channelId} is paused, stopping first...`);
          await stopChannel(channelId);
          // Wait a moment for the stop to take effect
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        console.log(`Starting channel ${channelId}...`);
        await startChannel(channelId);
        success = true;
      } else if (action === 'stop') {
        console.log(`Stopping channel ${channelId}...`);
        await stopChannel(channelId);
        success = true;
      } else if (action === 'pause') {
        console.log(`Pausing channel ${channelId}...`);
        await pauseChannel(channelId);
        success = true;
      }

      if (success) {
        console.log(`Channel ${action} action completed successfully`);
        // Refresh the dashboard to get updated status
        handleRefresh();
      }
    } catch (error: any) {
      console.error(`Error performing ${action} action on channel ${channelId}:`, error);
      
      // Provide user-friendly error messages
      let errorMessage = `Failed to ${action} channel`;
      if (error.response?.status === 404) {
        errorMessage = `Channel not found`;
      } else if (error.response?.status === 403) {
        errorMessage = `Permission denied to ${action} channel`;
      } else if (error.response?.status >= 500) {
        errorMessage = `Server error while trying to ${action} channel`;
      }
      
      // You could add a toast notification here if you have a notification system
      console.error(errorMessage);
    }
  };

  const handleRefresh = () => {
    dispatch(fetchChannels() as any);
  };

  // Handle expand/collapse
  const handleToggleLogPanel = () => {
    if (!containerRef.current) return;
    const containerHeight = containerRef.current.offsetHeight;
    if (isLogExpanded) {
      setLogPanelHeight(MIN_LOG_HEIGHT);
      setIsLogExpanded(false);
    } else {
      setLogPanelHeight(Math.floor(containerHeight * MAX_LOG_HEIGHT_RATIO));
      setIsLogExpanded(true);
    }
  };

  const handleResizeStart = useCallback((col: string, e: React.MouseEvent) => {
    resizingCol.current = col;
    startX.current = e.clientX;
    startWidth.current = columnWidths[col];
    document.body.style.userSelect = 'none'; // Prevent text selection
    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
  }, [columnWidths]);

  const handleResizeMove = useCallback((e: MouseEvent) => {
    if (!resizingCol.current) return;
    const diff = e.clientX - startX.current;
    // This line was removed as per the edit hint to remove setColumnWidths
    // setColumnWidths((prev) => ({
    //   ...prev,
    //   [resizingCol.current!]: Math.max(MIN_COLUMN_WIDTH, startWidth.current + diff),
    // }));
  }, []);

  const handleResizeEnd = useCallback(() => {
    resizingCol.current = null;
    document.body.style.userSelect = '';
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);
  }, [handleResizeMove]);

  // Clean up listeners on unmount
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeEnd);
      document.body.style.userSelect = '';
    };
  }, [handleResizeMove, handleResizeEnd]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Error loading dashboard: {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Control Panel */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
          {/* Stats Toggle */}
          <RadioGroup
            row
            value={showLifetimeStats ? 'lifetime' : 'current'}
            onChange={(e) => setShowLifetimeStats(e.target.value === 'lifetime')}
          >
            <FormControlLabel
              value="current"
              control={<Radio size="small" />}
              label="Current Stats"
            />
            <FormControlLabel
              value="lifetime"
              control={<Radio size="small" />}
              label="Lifetime Stats"
            />
          </RadioGroup>

          <Divider orientation="vertical" flexItem />

          {/* Tag Filter */}
          <TextField
            size="small"
            placeholder="Filter by tags..."
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            InputProps={{
              startAdornment: <Tag sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
            sx={{ minWidth: 200 }}
          />

          <Divider orientation="vertical" flexItem />

          {/* Refresh Button */}
          <Tooltip title="Refresh Dashboard">
            <span>
              <IconButton onClick={handleRefresh}>
                <Refresh />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      </Paper>

      {/* Main content: Channel Table + LogPanel with resizable divider */}
      <Box ref={containerRef} sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <Paper sx={{ flex: `1 1 auto`, overflow: 'hidden', minHeight: 0 }}>
          <TableContainer sx={{ height: '100%' }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: 120, minWidth: 80, maxWidth: 180 }}>Status</TableCell>
                  {DATA_COLUMNS.map((col, idx) => (
                    <TableCell
                      key={col.title}
                      align={col.align as any}
                      sx={{ width: columnWidths[idx], minWidth: col.minWidth, maxWidth: col.maxWidth, p: 0 }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                        <Box sx={{ flex: 1, px: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{col.title}</Box>
                        <Box
                          sx={{
                            width: 6,
                            height: 28,
                            cursor: 'col-resize',
                            backgroundColor: '#bdbdbd',
                            '&:hover': { backgroundColor: '#1976d2' },
                            borderRadius: 1,
                            ml: 1,
                          }}
                          onMouseDown={(e) => handleResizeStart(idx, e)}
                        />
                      </Box>
                    </TableCell>
                  ))}
                  <TableCell sx={{ width: 120, minWidth: 80, maxWidth: 180 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(groupedChannels).flatMap(([groupName, groupChannels]) => {
                  const groupHeader = (
                    <TableRow key={groupName} sx={{ backgroundColor: 'action.hover' }}>
                      <TableCell colSpan={DATA_COLUMNS.length + 2} style={{ fontWeight: 700 }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Box
                            sx={{
                              width: 24,
                              height: 24,
                              border: '1px solid',
                              borderColor: 'divider',
                              borderRadius: 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              backgroundColor: 'background.paper',
                              '&:hover': {
                                backgroundColor: 'action.hover',
                              }
                            }}
                            onClick={() => toggleGroup(groupName)}
                          >
                            {isGroupCollapsed(groupName) ? (
                              <Add fontSize="small" />
                            ) : (
                              <Remove fontSize="small" />
                            )}
                          </Box>
                          {groupName}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );

                  if (isGroupCollapsed(groupName)) {
                    return [groupHeader];
                  }

                  const channelRows = (groupChannels as any[]).map((channel: any) => (
                    <TableRow
                      key={channel.id}
                      hover
                      selected={selectedChannels.includes(channel.id)}
                      onClick={() => {
                        if (selectedChannels.includes(channel.id)) {
                          setSelectedChannels(selectedChannels.filter(id => id !== channel.id));
                        } else {
                          setSelectedChannels([...selectedChannels, channel.id]);
                        }
                      }}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(channel.state)}
                          label={channel.state}
                          color={getStatusColor(channel.state) as any}
                          size="small"
                          variant="outlined"
                        />
                        {channel.deployed !== undefined && (
                          <Typography variant="caption" display="block" color="text.secondary">
                            {channel.deployed ? 'Deployed' : 'Not Deployed'}
                          </Typography>
                        )}
                        {channel.queued !== undefined && channel.queued > 0 && (
                          <Typography variant="caption" display="block" color="warning.main">
                            {channel.queued} queued
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {channel.name}
                        </Typography>
                        {channel.description && (
                          <Typography variant="caption" color="text.secondary">
                            {channel.description}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {channel.revision || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {channel.lastModified ? new Date(channel.lastModified).toLocaleDateString() : '-'}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {showLifetimeStats ? channel.statistics?.lifetimeReceived || 0 : channel.statistics?.received || 0}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {showLifetimeStats ? channel.statistics?.lifetimeFiltered || 0 : channel.statistics?.filtered || 0}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {channel.statistics?.queued || 0}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {showLifetimeStats ? channel.statistics?.lifetimeSent || 0 : channel.statistics?.sent || 0}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color="error">
                          {showLifetimeStats ? channel.statistics?.lifetimeError || 0 : channel.statistics?.error || 0}
                        </Typography>
                      </TableCell>
                      <TableCell align="right" style={{ width: (columnWidths as Record<string, number>)['actions'], minWidth: 120, maxWidth: 120, position: 'relative' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', width: '100%' }}>
                          <Stack direction="row" spacing={0.5}>
                            <Tooltip title="Start Channel">
                              <span>
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleChannelAction(channel.id, 'start');
                                  }}
                                  disabled={channel.state === 'STARTED'}
                                >
                                  <PlayArrow fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                            <Tooltip title="Stop Channel">
                              <span>
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleChannelAction(channel.id, 'stop');
                                  }}
                                  disabled={channel.state === 'STOPPED'}
                                >
                                  <Stop fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                            <Tooltip title="Pause Channel">
                              <span>
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleChannelAction(channel.id, 'pause');
                                  }}
                                  disabled={channel.state === 'PAUSED'}
                                >
                                  <Pause fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </Stack>
                        </div>
                      </TableCell>
                    </TableRow>
                  ));

                  return [groupHeader, ...channelRows];
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
        {/* Draggable Divider */}
        <Box
          sx={{
            height: 9,
            cursor: 'row-resize',
            background: isResizing ? '#1976d2' : '#e0e0e0',
            transition: 'background 0.2s',
            zIndex: 10,
            userSelect: 'none',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onMouseDown={() => setIsResizing(true)}
        >
          {/* Drag indicator: 3 horizontal lines */}
          <Box
            sx={{
              width: 32,
              height: 6,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2px',
            }}
            onMouseDown={e => e.stopPropagation()} // Prevent drag when clicking indicator
          >
            <Box sx={{ width: '100%', height: 2, borderRadius: 1, background: '#bdbdbd' }} />
            <Box sx={{ width: '100%', height: 2, borderRadius: 1, background: '#bdbdbd' }} />
            <Box sx={{ width: '100%', height: 2, borderRadius: 1, background: '#bdbdbd' }} />
          </Box>
          {/* Expand/Collapse Button */}
          <Box sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)' }}>
            <IconButton
              size="small"
              onClick={e => {
                e.stopPropagation();
                handleToggleLogPanel();
              }}
              sx={{ background: '#fff', boxShadow: 1, border: '1px solid #e0e0e0', p: 0.5 }}
            >
              {isLogExpanded ? <KeyboardArrowDown /> : <KeyboardArrowUp />}
            </IconButton>
          </Box>
        </Box>
        {/* LogPanel with controlled height */}
        <Box sx={{ height: logPanelHeight, minHeight: MIN_LOG_HEIGHT, transition: isResizing ? 'none' : 'height 0.2s', overflow: 'hidden' }}>
          <LogPanel />
        </Box>
      </Box>

      {/* Status Bar */}
      <Paper sx={{ p: 1, mt: 1 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography variant="body2" color="text.secondary">
            {channels.filter(c => c.deployed === true).length} deployed channels
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {channels.filter(c => c.deployed === true && c.state === 'STARTED').length} started
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {channels.filter(c => c.deployed === true && c.state === 'STOPPED').length} stopped
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {channels.filter(c => c.deployed === true && c.state === 'PAUSED').length} paused
          </Typography>
          {channels.some(c => c.deployed !== undefined) && (
            <>
              <Divider orientation="vertical" flexItem />
              <Typography variant="body2" color="text.secondary">
                {channels.filter(c => c.deployed).length} deployed
              </Typography>
            </>
          )}
          {channels.some(c => c.deployed === true && c.queued && c.queued > 0) && (
            <>
              <Divider orientation="vertical" flexItem />
              <Typography variant="body2" color="warning.main">
                {channels.filter(c => c.deployed === true).reduce((sum, c) => sum + (c.queued || 0), 0)} total queued
              </Typography>
            </>
          )}
          {selectedChannels.length > 0 && (
            <>
              <Divider orientation="vertical" flexItem />
              <Typography variant="body2" color="primary">
                {selectedChannels.length} selected
              </Typography>
            </>
          )}
        </Stack>
      </Paper>
    </Box>
  );
};

export default DashboardView;
