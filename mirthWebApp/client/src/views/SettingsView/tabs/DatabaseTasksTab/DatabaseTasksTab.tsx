import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  Alert
} from '@mui/material';
import { useDispatch } from 'react-redux';
import { setDirty } from '../../../../states/settingsReducer';
import { getDatabaseTasks, type DatabaseTask } from '../../../../services/databaseTasksService';

interface AffectedChannel {
  id: string;
  name: string;
  channelId: string;
}

/**
 * DatabaseTasksTab component displaying database maintenance tasks
 */
const DatabaseTasksTab: React.FC = () => {
  const dispatch = useDispatch();
  const [databaseTasks, setDatabaseTasks] = useState<DatabaseTask[]>([]);
  const [affectedChannels, setAffectedChannels] = useState<AffectedChannel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);
  const isLoadingRef = useRef(false);

  // Load database tasks from API
  const loadDatabaseTasks = useCallback(async (isRefresh = false) => {
    // Prevent duplicate calls
    if (!isRefresh && (hasLoadedRef.current || isLoadingRef.current)) {
      console.log('Database tasks load skipped - already loaded or loading');
      return;
    }

    if (isRefresh && isLoadingRef.current) {
      console.log('Database tasks refresh skipped - already loading');
      return;
    }

    try {
      isLoadingRef.current = true;
      setLoading(true);
      setError(null);
      
      console.log(`Loading database tasks from server... (${isRefresh ? 'refresh' : 'initial'})`);
      
      const tasks = await getDatabaseTasks();
      console.log('Loaded database tasks:', tasks);
      
      setDatabaseTasks(tasks);
      setAffectedChannels([]); // Keep empty until API provides affected channels data
      
      hasLoadedRef.current = true;
      
    } catch (err: any) {
      console.error('Failed to load database tasks:', err);
      setError(err.message || 'Failed to load database tasks from server');
      
      // Set empty arrays on error to prevent UI issues
      setDatabaseTasks([]);
      setAffectedChannels([]);
      
      hasLoadedRef.current = true;
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, []);

  // Initial load when component mounts
  useEffect(() => {
    loadDatabaseTasks(false);
  }, []);

  // Add refresh handler that listens to the custom event
  useEffect(() => {
    const handleRefreshEvent = async () => {
      try {
        console.log('Database tasks refresh event received');
        await loadDatabaseTasks(true);
        
        // Clear dirty state after successful refresh
        dispatch(setDirty(false));
        
        console.log('Database tasks refreshed successfully');
      } catch (err) {
        console.error('Database tasks refresh event handler failed:', err);
        // Error already handled in loadDatabaseTasks
      }
    };

    window.addEventListener('database-tasks-refresh-requested', handleRefreshEvent);

    return () => {
      window.removeEventListener('database-tasks-refresh-requested', handleRefreshEvent);
    };
  }, [dispatch]);

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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return '#4caf50';
      case 'running':
        return '#ff9800';
      case 'pending':
      case 'idle':
        return '#9e9e9e';
      case 'failed':
        return '#f44336';
      default:
        return '#9e9e9e';
    }
  };

  const formatStatus = (status: string) => {
    // Convert API status to display format
    switch (status.toLowerCase()) {
      case 'idle':
        return 'Pending';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    }
  };

  const formatDateTime = (dateTime?: string) => {
    if (!dateTime) return '-';
    try {
      return new Date(dateTime).toLocaleString();
    } catch {
      return dateTime;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <SectionTitle>Database Tasks</SectionTitle>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Cleanup or optimization tasks for the internal database. If no tasks are present, no action is necessary.
      </Typography>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Database Tasks Table */}
      <TableContainer 
        component={Paper} 
        sx={{ 
          border: 1, 
          borderColor: 'divider',
          mb: 4,
          minHeight: '200px'
        }}
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', width: '100px' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '200px' }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold', minWidth: '300px' }}>Description</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '180px' }}>Start Time</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} sx={{ textAlign: 'center', py: 8 }}>
                  <CircularProgress size={24} sx={{ mr: 2 }} />
                  <Typography variant="body2" color="text.secondary" component="span">
                    Loading database tasks...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : databaseTasks.length > 0 ? (
              databaseTasks.map((task) => (
                <TableRow 
                  key={task.id}
                  sx={{ 
                    '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
                    height: '40px'
                  }}
                >
                  <TableCell sx={{ height: '40px' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: getStatusColor(task.status)
                        }}
                      />
                      {formatStatus(task.status)}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ height: '40px', fontWeight: 'medium' }}>
                    {task.name}
                  </TableCell>
                  <TableCell sx={{ height: '40px', fontSize: '0.875rem' }}>
                    {task.description}
                  </TableCell>
                  <TableCell sx={{ height: '40px', fontFamily: 'monospace', fontSize: '0.875rem' }}>
                    {formatDateTime(task.lastRun)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} sx={{ textAlign: 'center', py: 8 }}>
                  <Typography variant="body2" color="text.secondary">
                    No database tasks are currently scheduled or running.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Affected Channels Section */}
      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
        Affected Channels
      </Typography>
      
      <TableContainer 
        component={Paper} 
        sx={{ 
          border: 1, 
          borderColor: 'divider',
          minHeight: '200px'
        }}
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', minWidth: '300px' }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '200px' }}>Id</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {affectedChannels.length > 0 ? (
              affectedChannels.map((channel) => (
                <TableRow 
                  key={channel.id}
                  sx={{ 
                    '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
                    height: '40px'
                  }}
                >
                  <TableCell sx={{ height: '40px' }}>
                    {channel.name}
                  </TableCell>
                  <TableCell sx={{ height: '40px', fontFamily: 'monospace', fontSize: '0.875rem' }}>
                    {channel.channelId}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={2} sx={{ textAlign: 'center', py: 8 }}>
                  <Typography variant="body2" color="text.secondary">
                    No channels are currently affected by database tasks.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default DatabaseTasksTab;
