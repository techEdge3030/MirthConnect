import { Alert, Button, Grid, Snackbar, Stack } from '@mui/material';
import type { GridColDef, GridRowParams } from '@mui/x-data-grid';
import { DataGrid } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';


import { getAllChannels, getChannelGroups, saveChannelWithUpdateFirst } from '../../services';
import { getChannelFullDetails } from '../../services/channelsService';
import { setChannel } from '../../states/channelReducer';
import type { Channel } from '../../types/channel.type';
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
  CircularProgress
} from '@mui/material';
import { useGroupedChannelsWithResizableColumns, ColumnConfig } from '../../hooks/useGroupedChannelsWithResizableColumns';
import React from 'react';
import { Add, Remove } from '@mui/icons-material';

const COLUMN_CONFIG: ColumnConfig[] = [
  { title: 'Status', minWidth: 100, maxWidth: 200, defaultWidth: 120, align: 'left' },
  { title: 'Data Type', minWidth: 100, maxWidth: 200, defaultWidth: 120, align: 'left' },
  { title: 'Name', minWidth: 150, maxWidth: 400, defaultWidth: 150, align: 'left' },
  { title: 'Id', minWidth: 200, maxWidth: 400, defaultWidth: 300, align: 'left' },
  { title: 'Local Id', minWidth: 100, maxWidth: 200, defaultWidth: 120, align: 'left' },
  { title: 'Description', minWidth: 100, maxWidth: 400, defaultWidth: 150, align: 'left' },
  { title: 'Rev Δ', minWidth: 80, maxWidth: 150, defaultWidth: 90, align: 'left' },
  { title: 'Last Deployed', minWidth: 150, maxWidth: 300, defaultWidth: 180, align: 'left' },
  { title: 'Last Modified', minWidth: 150, maxWidth: 300, defaultWidth: 180, align: 'left' }
];

const ChannelListView = () => {
  const [rows, setRows] = useState<any>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [currentChannel, setCurrentChannel] = useState('');

  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });
  const [channelGroups, setChannelGroups] = React.useState<any[]>([]);
  const [collapsedGroups, setCollapsedGroups] = React.useState<Set<string>>(new Set());
  const dispatch = useDispatch();
  const navigate = useNavigate();

  React.useEffect(() => {
    getChannelGroups().then(setChannelGroups);
  }, []);

  const { groupedChannels, columnWidths, handleResize } = useGroupedChannelsWithResizableColumns({
    channels,
    groups: channelGroups,
    columnConfig: COLUMN_CONFIG,
    groupByDeployed: false,
  });
  const resizingCol = React.useRef<number | null>(null);
  const startX = React.useRef<number>(0);
  const startWidth = React.useRef<number>(0);

  const handleResizeStart = (colIdx: number, e: React.MouseEvent) => {
    resizingCol.current = colIdx;
    startX.current = e.clientX;
    startWidth.current = columnWidths[colIdx];
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
  };
  const handleResizeMove = (e: MouseEvent) => {
    if (resizingCol.current === null) return;
    const diff = e.clientX - startX.current;
    handleResize(resizingCol.current, startWidth.current + diff);
  };
  const handleResizeEnd = () => {
    resizingCol.current = null;
    document.body.style.userSelect = '';
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);
  };
  React.useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeEnd);
      document.body.style.userSelect = '';
    };
  }, []);

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Name', width: 150 },
    { field: 'id', headerName: 'Id', width: 300 },
    { field: 'description', headerName: 'Description', width: 150 },
    { field: 'lastModified', headerName: 'Last Modified', width: 200 }
  ];

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getAllChannels();
      setChannels(res);
    } catch (error) {
      console.error('Error fetching channels:', error);
      setNotification({
        open: true,
        message: 'Error loading channels',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRowClick = (channelId: string) => setCurrentChannel(channelId);

  const handleEditClick = async () => {
    if (currentChannel) {
      try {
        setLoading(true);
        // Fetch full channel details including metadata
        const detailedChannel = await getChannelFullDetails(currentChannel);
        if (detailedChannel) {
          dispatch(setChannel(detailedChannel));
          navigate('/editchannel');
        } else {
          // Fallback to basic channel data if summary fails
          const channel = channels.find((channel: any) => channel.id === currentChannel);
          dispatch(setChannel(channel));
          navigate('/editchannel');
        }
      } catch (error) {
        console.error('Error fetching full channel data:', error);
        // Fallback to basic channel data
        const channel = channels.find((channel: any) => channel.id === currentChannel);
        dispatch(setChannel(channel));
        navigate('/editchannel');
      } finally {
        setLoading(false);
      }
    }
  };



  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

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

  const isGroupCollapsed = (groupName: string) => collapsedGroups.has(groupName);

  return (
    <Grid container style={{ backgroundColor: 'white', height: '100%' }} direction="column">
      <Grid item flexGrow={1}>
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    {COLUMN_CONFIG.map((col, idx) => (
                      <TableCell
                        key={col.title}
                        align={col.align}
                        sx={{ width: columnWidths[idx], minWidth: col.minWidth, maxWidth: col.maxWidth, p: 0, ...(idx === 0 ? { pl: '40px' } : {}) }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%', ...(idx === 0 ? { pl: 0 } : {}) }}>
                          <Box sx={{ flex: 1, px: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', ...(idx === 0 ? { pl: 0 } : {}) }}>{col.title}</Box>
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
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(groupedChannels).flatMap(([groupName, groupChannels]) => {
                    const groupHeader = (
                      <TableRow key={groupName} sx={{ backgroundColor: 'action.hover' }}>
                        <TableCell colSpan={COLUMN_CONFIG.length} style={{ fontWeight: 700 }}>
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
                    const channelRows = (groupChannels as any[]).map((channel) => (
                      <TableRow key={channel.id} hover selected={currentChannel === channel.id} onClick={() => handleRowClick(channel.id)} sx={{ cursor: 'pointer' }}>
                        {/* Status: using enabled property as a placeholder (true/false) */}
                        <TableCell align="left" sx={{ width: columnWidths[0], minWidth: COLUMN_CONFIG[0].minWidth, maxWidth: COLUMN_CONFIG[0].maxWidth, pl: '40px' }}>
                          {channel.sourceConnector?.enabled !== undefined ? (channel.sourceConnector.enabled ? 'Enabled' : 'Disabled') : ''}
                        </TableCell>
                        {/* Data Type: using sourceConnector.transportName or transformer.inboundDataType */}
                        <TableCell align="left" sx={{ width: columnWidths[1], minWidth: COLUMN_CONFIG[1].minWidth, maxWidth: COLUMN_CONFIG[1].maxWidth }}>
                          {channel.sourceConnector?.transportName || channel.sourceConnector?.transformer?.inboundDataType || ''}
                        </TableCell>
                        {/* Name */}
                        <TableCell align="left" sx={{ width: columnWidths[2], minWidth: COLUMN_CONFIG[2].minWidth, maxWidth: COLUMN_CONFIG[2].maxWidth }}>
                          {channel.name}
                        </TableCell>
                        {/* Id */}
                        <TableCell align="left" sx={{ width: columnWidths[3], minWidth: COLUMN_CONFIG[3].minWidth, maxWidth: COLUMN_CONFIG[3].maxWidth }}>
                          {channel.id}
                        </TableCell>
                        {/* Local Id: using nextMetaDataId as a placeholder */}
                        <TableCell align="left" sx={{ width: columnWidths[4], minWidth: COLUMN_CONFIG[4].minWidth, maxWidth: COLUMN_CONFIG[4].maxWidth }}>
                          {channel.nextMetaDataId}
                        </TableCell>
                        {/* Description */}
                        <TableCell align="left" sx={{ width: columnWidths[5], minWidth: COLUMN_CONFIG[5].minWidth, maxWidth: COLUMN_CONFIG[5].maxWidth }}>
                          {channel.description}
                        </TableCell>
                        {/* Rev Δ: using revision */}
                        <TableCell align="left" sx={{ width: columnWidths[6], minWidth: COLUMN_CONFIG[6].minWidth, maxWidth: COLUMN_CONFIG[6].maxWidth }}>
                          {channel.revision}
                        </TableCell>
                        {/* Last Deployed: using exportData.metadata.lastModified.time as a placeholder */}
                        <TableCell align="left" sx={{ width: columnWidths[7], minWidth: COLUMN_CONFIG[7].minWidth, maxWidth: COLUMN_CONFIG[7].maxWidth }}>
                          {channel.exportData?.metadata?.lastModified?.time
                            ? new Date(channel.exportData.metadata.lastModified.time).toLocaleString()
                            : ''}
                        </TableCell>
                        {/* Last Modified: using exportData.metadata.lastModified.time as a placeholder (same as Last Deployed for now) */}
                        <TableCell align="left" sx={{ width: columnWidths[8], minWidth: COLUMN_CONFIG[8].minWidth, maxWidth: COLUMN_CONFIG[8].maxWidth }}>
                          {channel.exportData?.metadata?.lastModified?.time
                            ? new Date(channel.exportData.metadata.lastModified.time).toLocaleString()
                            : ''}
                        </TableCell>
                      </TableRow>
                    ));
                    return [groupHeader, ...channelRows];
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Grid>
      <Grid item flexGrow={0} style={{ marginTop: '10px', marginBottom: '10px' }}>
        <Stack direction="row" justifyContent="space-evenly">
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleEditClick}
            disabled={!currentChannel || loading}
          >
            Edit
          </Button>
          <Button variant="contained" color="warning">
            Deploy
          </Button>
          <Button variant="contained" color="error">
            Delete
          </Button>
        </Stack>
      </Grid>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Grid>
  );
};

export default ChannelListView;
