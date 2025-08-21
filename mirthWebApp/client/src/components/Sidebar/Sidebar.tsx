import {
  CodeOff,
  Dashboard as DashboardIcon,
  Javascript,
  Layers,
  Logout,
  People,
  Settings,
  Notifications,
  Help,
  Event,
  Extension,
  Email,
  Delete,
  BarChart,
  Pause,
  Stop,
  Undo,
  Api,
  Info,
  Language,
  ReportProblem,
  Add,
  FileDownload,
  FileUpload,
  PlayArrow,
  Refresh,
  Save,
  Backup,
  Restore,
  RestoreFromTrash
} from '@mui/icons-material';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchChannels } from '../../states/channelReducer';
import type { RootState, AppDispatch } from '../../states';
import { logout } from '../../utils/logout';
import { pauseChannel, stopChannel, sendMessage, removeAllMessages, clearStatistics } from '../../services/channelsService';
import { resetSettingsToDefaults } from '../../services/settingsService';
import { useAlert, useChannelSelection } from '../../providers/AlertProvider';
import { useAdministratorBackground } from '../../providers';
import SendMessageDialog from '../SendMessageDialog/SendMessageDialog';
import ViewMessagesDialog from '../ViewMessagesDialog/ViewMessagesDialog';
import RemoveAllMessagesDialog from '../RemoveAllMessagesDialog/RemoveAllMessagesDialog';
import ClearStatisticsDialog from '../ClearStatisticsDialog/ClearStatisticsDialog';
import { UsersContext } from '../../pages/UsersPage/UsersPage';
import { useContext } from 'react';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { setDirty } from '../../states/settingsReducer';
import { createBackup } from '../../services/backupService';
import BackupConfigDialog from '../BackupConfigDialog/BackupConfigDialog';
import DirtyStateDialog from '../DirtyStateDialog/DirtyStateDialog';
import RestoreConfigDialog from '../RestoreConfigDialog/RestoreConfigDialog';
import ClearAllStatisticsDialog from '../ClearAllStatisticsDialog/ClearAllStatisticsDialog';
import SettingsSidebar from './SettingsSidebar/SettingsSidebar';
import ChannelCreationDialog from '../ChannelCreationDialog/ChannelCreationDialog';
import { getAllChannels } from '../../services';

const drawerWidth = 240;

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar
}));

interface ISidebarProps {
  open: boolean;
  handleDrawerClose: () => void;
  currentSection?: string;
  onAlertEnableSelected?: () => void;
  onAlertDisableSelected?: () => void;
  onAlertDeleteSelected?: () => void;
  onAlertNew?: () => void;
}

const mirthConnectNav = [
  { name: 'Dashboard', href: '/dashboard', icon: <DashboardIcon /> },
  { name: 'Channels', href: '/channels', icon: <Layers /> },
  { name: 'Users', href: '/users', icon: <People /> },
  { name: 'Settings', href: '/settings', icon: <Settings /> },
  { name: 'Alerts', href: '/alerts', icon: <Notifications /> },
  { name: 'Events', href: '/events', icon: <Event /> },
  { name: 'Extensions', href: '/extensions', icon: <Extension /> }
];



const groupTasks = [
  { name: 'New Group', icon: <Add />, handler: () => {} },
  { name: 'Import Group', icon: <FileUpload />, handler: () => {} },
  { name: 'Export All Groups', icon: <FileDownload />, handler: () => {} }
];

const other = [
  { name: 'Notifications', icon: <Notifications />, count: 3, href: '/notifications' },
  { name: 'View User API', icon: <Api />, href: '/user-api' },
  { name: 'View Client API', icon: <Api />, href: '/client-api' },
  { name: 'Help', icon: <Help />, href: '/help' },
  { name: 'About Mirth Connect', icon: <Info />, href: '/about' },
  { name: 'Visit nextgen.com', icon: <Language />, href: 'https://www.nextgen.com', external: true },
  { name: 'Report Issue', icon: <ReportProblem />, href: '/report-issue' },
  { name: 'Logout', icon: <Logout />, handler: async () => {
    await logout();
  } }
];

interface SectionHeaderProps {
  children: React.ReactNode;
  collapsed: boolean;
  onToggle: () => void;
  useAdminColor?: boolean;
}

const SectionHeader = ({ children, collapsed, onToggle, useAdminColor = false }: SectionHeaderProps) => {
  const { backgroundColor } = useAdministratorBackground();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        px: 2,
        py: 1.5,
        minHeight: 48,
        cursor: 'pointer',
        backgroundColor: useAdminColor ? backgroundColor : 'transparent',
        color: useAdminColor ? '#fff' : 'inherit',
        '&:hover': {
          backgroundColor: useAdminColor ? backgroundColor : 'rgba(0, 0, 0, 0.04)',
          opacity: useAdminColor ? 0.9 : 1
        }
      }}
      onClick={onToggle}
    >
      <Typography
        variant="subtitle2"
        sx={{
          fontWeight: 'bold',
          flex: 1,
          color: useAdminColor ? '#fff' : 'inherit'
        }}
      >
        {children}
      </Typography>
      {collapsed ?
        <ExpandMoreIcon fontSize="small" sx={{ color: useAdminColor ? '#fff' : '#888' }} /> :
        <ExpandLessIcon fontSize="small" sx={{ color: useAdminColor ? '#fff' : '#888' }} />
      }
    </Box>
  );
};

const Sidebar = ({ open, currentSection, onAlertEnableSelected, onAlertDisableSelected, onAlertDeleteSelected, onAlertNew }: ISidebarProps) => {
  const { setOpen, setSeverity, setMessage } = useAlert();
  const { selectedChannels } = useChannelSelection();
  const { backgroundColor } = useAdministratorBackground();
  const dispatch = useDispatch<AppDispatch>();
  const channels = useSelector((state: RootState) => state.channels.channels);
  const [loading, setLoading] = React.useState(false);
  const usersContext = useContext(UsersContext);
  
  // Safe Redux selectors with fallbacks
  const currentTab = useSelector((state: RootState) => state.settings?.currentTab ?? 0);
  const isDirty = useSelector((state: RootState) => state.settings?.isDirty ?? false);
  
  // Dialog states
  const [backupDialogOpen, setBackupDialogOpen] = useState(false);
  const [dirtyStateDialogOpen, setDirtyStateDialogOpen] = useState(false);
  const [restoreDefaultsDialogOpen, setRestoreDefaultsDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [undeployDialogOpen, setUndeployDialogOpen] = React.useState(false);
  const [undeploying, setUndeploying] = React.useState(false);
  const [deployDialogOpen, setDeployDialogOpen] = React.useState(false);
  const [deploying, setDeploying] = React.useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [clearAllStatisticsOpen, setClearAllStatisticsOpen] = React.useState(false);
  const [channelCreationDialogOpen, setChannelCreationDialogOpen] = React.useState(false);
  const [dialogChannels, setDialogChannels] = React.useState<any[]>([]);

  // Calculate channel counts for dashboard tasks
  const pauseableCount = selectedChannels.filter(id => {
    const channel = channels.find(c => c.id === id);
    return channel?.state?.toUpperCase() === 'STARTED';
  }).length;

  const stoppableCount = selectedChannels.filter(id => {
    const channel = channels.find(c => c.id === id);
    const state = channel?.state?.toUpperCase();
    return state === 'STARTED' || state === 'PAUSED';
  }).length;

  // Helper function to get first selected channel
  const getFirstSelectedChannel = () => {
    return selectedChannels.length > 0 ? channels.find(c => c.id === selectedChannels[0]) : null;
  };

  // Settings-specific handlers
  const handleSettingsSave = () => {
    const saveEvent = new CustomEvent('settings-save-requested');
    window.dispatchEvent(saveEvent);
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

  // Handle actual backup creation with path and type
  const handleCreateBackup = async (filename: string, filePath: string) => {
    try {
      // Create full file path
      const fullPath = `${filePath}/${filename}`;
      
      await createBackup(filename);
      
      setSeverity('success');
      setMessage(`Server Configuration was written to ${fullPath}`);
      setOpen(true);
      
    } catch (error: any) {
      setSeverity('error');
      setMessage(error.message || 'Failed to create backup');
      setOpen(true);
    }
  };



  // Handle actual restore with file and options
  const handleCreateRestore = async (file: File, options: any) => {
    try {
      // Create FormData to send file
      const formData = new FormData();
      formData.append('configFile', file);
      formData.append('deployAllChannels', options.deployAllChannels.toString());
      formData.append('overwriteConfigMap', options.overwriteConfigMap.toString());
      
      const response = await fetch('/api/server/configuration/restore', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Failed to restore configuration');
      }
      
      // Success is handled by the dialog itself now
      
    } catch (error: any) {
      throw new Error(error.message || 'Failed to restore configuration');
    }
  };

  // Placeholder handlers for other actions
  const handleClearAllStatistics = () => {
    setClearAllStatisticsOpen(true);
  };

  const handleConfirmClearAllStatistics = async () => {
    try {
      // Call API to clear all statistics for all channels
      const response = await fetch('/api/channels/_clearAllStatistics', {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error('Failed to clear all statistics');
      }
      
      // Success is handled by the dialog itself
      
    } catch (error: any) {
      throw new Error(error.message || 'Failed to clear all statistics');
    }
  };

  // Channel action handlers
  const handleStartSelected = async () => {
    if (selectedChannels.length === 0) return;
    setLoading(true);
    // Implementation would go here
    setLoading(false);
  };

  const handlePauseSelected = async () => {
    if (selectedChannels.length === 0) return;
    setLoading(true);
    let success = 0;
    let fail = 0;
    await Promise.allSettled(selectedChannels.map(async (id) => {
      try {
        await pauseChannel(id);
        success++;
      } catch {
        fail++;
      }
    }));
    setLoading(false);
    if (success > 0) {
      setSeverity('success');
      setMessage(`${success} channel(s) paused${fail > 0 ? `, ${fail} failed` : ''}`);
      setOpen(true);
      await dispatch(fetchChannels());
    } else {
      setSeverity('error');
      setMessage('Failed to pause selected channels');
      setOpen(true);
    }
  };

  const handleStopSelected = async () => {
    if (selectedChannels.length === 0) return;
    setLoading(true);
    let success = 0;
    let fail = 0;
    await Promise.allSettled(selectedChannels.map(async (id) => {
      try {
        await stopChannel(id);
        success++;
      } catch {
        fail++;
      }
    }));
    setLoading(false);
    if (success > 0) {
      setSeverity('success');
      setMessage(`${success} channel(s) stopped${fail > 0 ? `, ${fail} failed` : ''}`);
      setOpen(true);
      await dispatch(fetchChannels());
    } else {
      setSeverity('error');
      setMessage('Failed to stop selected channels');
      setOpen(true);
    }
  };

  const handleUndeploySelected = async () => {
    if (selectedChannels.length === 0) return;
    setUndeploying(true);
    // Implementation would go here
    setUndeploying(false);
    setUndeployDialogOpen(false);
  };

  const handleDeploySelected = async () => {
    if (selectedChannels.length === 0) return;
    setDeploying(true);
    // Implementation would go here
    setDeploying(false);
    setDeployDialogOpen(false);
  };

  // Dialog states for messages
  const [sendMessageOpen, setSendMessageOpen] = React.useState(false);
  const [viewMessagesOpen, setViewMessagesOpen] = React.useState(false);
  const [removeAllMessagesOpen, setRemoveAllMessagesOpen] = React.useState(false);
  const [clearStatisticsOpen, setClearStatisticsOpen] = React.useState(false);

  // Message handlers
  const handleSendMessages = async (
    message: string,
    destinationMetaDataIds: number[],
    sourceMapVars: { key: string; value: string }[],
    advancedOptions: { overwrite: boolean; imported: boolean; originalMessageId: string }
  ) => {
    await Promise.all(selectedChannels.map(channelId =>
      sendMessage(channelId, message, destinationMetaDataIds, sourceMapVars, advancedOptions)
    ));
    setSeverity('success');
    setMessage(`Message sent to ${selectedChannels.length} channel(s)`);
    setOpen(true);
  };

  const handleRemoveAllMessages = async (options: { restartRunningChannels: boolean; clearStatistics: boolean }) => {
    await Promise.all(selectedChannels.map(channelId =>
      removeAllMessages(channelId, options.restartRunningChannels, options.clearStatistics)
    ));
    setSeverity('success');
    setMessage(`All messages removed from ${selectedChannels.length} channel(s)`);
    setOpen(true);
  };

  const handleClearStatistics = async (stats: { received: boolean; filtered: boolean; sent: boolean; errored: boolean }) => {
    await clearStatistics(selectedChannels, stats.received, stats.filtered, stats.sent, stats.errored);
    setSeverity('success');
    setMessage(`Statistics cleared for ${selectedChannels.length} channel(s)`);
    setOpen(true);
  };

  // Handle restore defaults - go directly to confirmation dialog
  const handleRestoreDefaults = () => {
    setRestoreDefaultsDialogOpen(true);
  };

  // Handle confirmed restore defaults
  const handleConfirmRestoreDefaults = async () => {
    try {
      await resetSettingsToDefaults();
      setSeverity('success');
      setMessage('Administrator settings restored to defaults successfully!');
      setOpen(true);
      setRestoreDefaultsDialogOpen(false);
      // Clear dirty state
      dispatch(setDirty(false));
      // Optionally reload to reflect changes
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      setSeverity('error');
      setMessage('Failed to restore default settings');
      setOpen(true);
    }
  };

  // Fetch channels for the creation dialog
  const fetchChannelsForDialog = async () => {
    try {
      const fetchedChannels = await getAllChannels();
      setDialogChannels(fetchedChannels);
    } catch (error) {
      console.error('Error fetching channels:', error);
    }
  };

  // Handle channel creation
  const handleCreateChannel = async (_channelData: any) => {
    try {
      // The channel has already been created by the dialog, just show success and refresh
      setSeverity('success');
      setMessage('Channel created successfully!');
      setOpen(true);
      // Refresh the channel list
      await fetchChannelsForDialog();
      // Also refresh the main channel list
      await dispatch(fetchChannels());
    } catch (error) {
      console.error('Error handling channel creation:', error);
      setSeverity('error');
      setMessage(error instanceof Error ? error.message : 'Error handling channel creation');
      setOpen(true);
    }
  };

  // Handle opening channel creation dialog
  const handleOpenChannelCreation = () => {
    fetchChannelsForDialog();
    setChannelCreationDialogOpen(true);
  };

  // Collapse state for different sections
  const [collapsedSections, setCollapsedSections] = React.useState({
    mirthConnect: false,
    dashboardTasks: false,
    channelTasks: false,
    groupTasks: false,
    administratorTasks: false,
    other: true
  });

  // Reset "other" section to collapsed when currentSection changes
  React.useEffect(() => {
    setCollapsedSections(prev => ({
      ...prev,
      other: true
    }));
  }, [currentSection]);

  const toggleSection = (section: keyof typeof collapsedSections) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Dashboard tasks with proper counts
  const dashboardTasks = [
    { name: 'Refresh', icon: <Notifications />, handler: () => {} },
    { name: 'Send Message', icon: <Email />, handler: () => setSendMessageOpen(true), disabled: selectedChannels.length === 0 },
    { name: 'View Messages', icon: <Email />, handler: () => setViewMessagesOpen(true), disabled: selectedChannels.length === 0 },
    { name: 'Remove All Messages', icon: <Delete />, handler: () => setRemoveAllMessagesOpen(true), disabled: selectedChannels.length === 0 },
    { name: 'Clear Statistics', icon: <BarChart />, handler: () => setClearStatisticsOpen(true) },
    { 
      name: `Pause (${pauseableCount})`, 
      icon: <Pause />, 
      handler: handlePauseSelected,
      disabled: loading || pauseableCount === 0
    },
    { 
      name: `Stop (${stoppableCount})`,
      icon: <Stop />,
      handler: handleStopSelected,
      disabled: loading || stoppableCount === 0
    },
    {
      name: 'Undeploy Channel',
      icon: <Undo />,
      handler: () => setUndeployDialogOpen(true),
      disabled: selectedChannels.length === 0
    }
  ];

  // Dynamic Settings Tasks - SettingsSidebar handles all settings tasks
  const getSettingsTasks = () => {
    return [];
  };

  const settingsTasks = getSettingsTasks();

  // Safe section header title
  const getSettingsSectionTitle = () => {
    try {
      return currentTab === 0 ? 'Server Tasks' : 'Administrator Tasks';
    } catch (error) {
      return 'Administrator Tasks';
    }
  };

  // Other items filtered for Settings page
  const settingsOtherItems = other.filter(item => 
    ['Notifications', 'View User API', 'View Client API', 'Help'].includes(item.name)
  );

  // Channel tasks with proper handlers
  const channelTasks = [
    { name: 'Refresh', icon: <Notifications />, handler: () => {} },
    { name: 'Redeploy All', icon: <Undo />, handler: () => {} },
    { name: 'Edit Global Scripts', icon: <Javascript />, handler: () => {} },
    { name: 'Edit Code Templates', icon: <CodeOff />, handler: () => {} },
    { name: 'New Channel', icon: <Add />, handler: handleOpenChannelCreation },
    { name: 'Import Channel', icon: <FileUpload />, handler: () => {} },
    {
      name: 'Deploy Channel',
      icon: <PlayArrow />,
      handler: () => {}
    }
  ];

  return (
    <React.Fragment>
      <Drawer variant="permanent" open={open}
        sx={{
          '& .MuiDrawer-paper': {
            background: '#f4f4f4',
            borderRight: '1px solid #ddd',
            boxSizing: 'border-box',
            width: drawerWidth,
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            justifyContent: 'flex-start',
          }
        }}
      >
        <SectionHeader
          collapsed={collapsedSections.mirthConnect}
          onToggle={() => toggleSection('mirthConnect')}
          useAdminColor={true}
        >
          Mirth Connect
        </SectionHeader>
        {!collapsedSections.mirthConnect && (
          <List>
            {mirthConnectNav.map(item => (
              <ListItem key={item.name} disablePadding sx={{ display: 'block' }}>
                <ListItemButton
                  component={Link}
                  to={item.href}
                  selected={currentSection?.toLowerCase() === item.name.toLowerCase()}
                  sx={{
                    minHeight: 36,
                    justifyContent: open ? 'initial' : 'center',
                    px: 2.5,
                    background: currentSection?.toLowerCase() === item.name.toLowerCase() ? '#e0e0e0' : 'inherit',
                    borderRadius: 1,
                    mb: 0.5,
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
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.name}
                    sx={{
                      opacity: open ? 1 : 0,
                      color: backgroundColor
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
        {currentSection === 'dashboard' && (
          <>
            <SectionHeader
              collapsed={collapsedSections.dashboardTasks}
              onToggle={() => toggleSection('dashboardTasks')}
              useAdminColor={true}
            >
              Dashboard Tasks
            </SectionHeader>
            {!collapsedSections.dashboardTasks && (
              <List>
                {dashboardTasks.map(task => (
                  <ListItem key={task.name} disablePadding sx={{ display: 'block' }}>
                    <ListItemButton
                      onClick={task.handler}
                      disabled={(task as any).disabled}
                      sx={{
                        minHeight: 36,
                        px: 2.5,
                        opacity: (task as any).disabled ? 0.5 : 1
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
            )}
            <Dialog open={undeployDialogOpen} onClose={() => setUndeployDialogOpen(false)}>
              <DialogTitle>Undeploy Channel{selectedChannels.length > 1 ? 's' : ''}</DialogTitle>
              <DialogContent>
                Are you sure you want to undeploy the selected channel{selectedChannels.length > 1 ? 's' : ''}?
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setUndeployDialogOpen(false)} disabled={undeploying}>Cancel</Button>
                <Button onClick={handleUndeploySelected} color="error" variant="contained" disabled={undeploying}>
                  {undeploying ? 'Undeploying...' : 'Undeploy'}
                </Button>
              </DialogActions>
            </Dialog>
          </>
        )}
        {currentSection === 'channels' && (
          <>
            <SectionHeader
              collapsed={collapsedSections.channelTasks}
              onToggle={() => toggleSection('channelTasks')}
              useAdminColor={true}
            >
              Channel Tasks
            </SectionHeader>
            {!collapsedSections.channelTasks && (
              <List>
                {channelTasks.map(task => (
                  <ListItem key={task.name} disablePadding sx={{ display: 'block' }}>
                    <ListItemButton onClick={task.handler} sx={{ minHeight: 36, px: 2.5 }}>
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
            )}
            <SectionHeader
              collapsed={collapsedSections.groupTasks}
              onToggle={() => toggleSection('groupTasks')}
              useAdminColor={true}
            >
              Group Tasks
            </SectionHeader>
            {!collapsedSections.groupTasks && (
              <List>
                {groupTasks.map(task => (
                  <ListItem key={task.name} disablePadding sx={{ display: 'block' }}>
                    <ListItemButton onClick={task.handler} sx={{ minHeight: 36, px: 2.5 }}>
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
            )}
            <Dialog open={deployDialogOpen} onClose={() => setDeployDialogOpen(false)}>
              <DialogTitle>Deploy Channel{selectedChannels.length > 1 ? 's' : ''}</DialogTitle>
              <DialogContent>
                Are you sure you want to deploy the selected channel{selectedChannels.length > 1 ? 's' : ''}?
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setDeployDialogOpen(false)} disabled={deploying}>Cancel</Button>
                <Button onClick={handleDeploySelected} color="success" variant="contained" disabled={deploying}>
                  {deploying ? 'Deploying...' : 'Deploy'}
                </Button>
              </DialogActions>
            </Dialog>
          </>
        )}
        {currentSection === 'users' && usersContext && (
          <>
            <SectionHeader
              collapsed={collapsedSections.channelTasks}
              onToggle={() => toggleSection('channelTasks')}
              useAdminColor={true}
            >
              User Tasks
            </SectionHeader>
            {!collapsedSections.channelTasks && (
              <List>
                <ListItem disablePadding sx={{ display: 'block' }}>
                  <ListItemButton onClick={usersContext.handleRefresh} sx={{ minHeight: 36, px: 2.5 }}>
                    <ListItemIcon sx={{
                      minWidth: 0,
                      mr: open ? 2 : 'auto',
                      justifyContent: 'center',
                      color: backgroundColor
                    }}>
                      <Refresh />
                    </ListItemIcon>
                    <ListItemText
                      primary="Refresh"
                      sx={{
                        opacity: open ? 1 : 0,
                        color: backgroundColor
                      }}
                    />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding sx={{ display: 'block' }}>
                  <ListItemButton onClick={usersContext.handleCreateUser} sx={{ minHeight: 36, px: 2.5 }}>
                    <ListItemIcon sx={{
                      minWidth: 0,
                      mr: open ? 2 : 'auto',
                      justifyContent: 'center',
                      color: backgroundColor
                    }}>
                      <PersonAddIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="New User"
                      sx={{
                        opacity: open ? 1 : 0,
                        color: backgroundColor
                      }}
                    />
                  </ListItemButton>
                </ListItem>
                {usersContext.selectedUser && (
                  <>
                    <ListItem disablePadding sx={{ display: 'block' }}>
                      <ListItemButton onClick={() => usersContext.handleEditUser(usersContext.selectedUser!)} sx={{ minHeight: 36, px: 2.5 }}>
                        <ListItemIcon sx={{
                          minWidth: 0,
                          mr: open ? 2 : 'auto',
                          justifyContent: 'center',
                          color: backgroundColor
                        }}>
                          <EditIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary="Edit User"
                          sx={{
                            opacity: open ? 1 : 0,
                            color: backgroundColor
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding sx={{ display: 'block' }}>
                      <ListItemButton onClick={() => usersContext.handleDeleteUser(usersContext.selectedUser!)} sx={{ minHeight: 36, px: 2.5 }}>
                        <ListItemIcon sx={{
                          minWidth: 0,
                          mr: open ? 2 : 'auto',
                          justifyContent: 'center',
                          color: backgroundColor
                        }}>
                          <DeleteIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary="Delete User"
                          sx={{
                            opacity: open ? 1 : 0,
                            color: backgroundColor
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                  </>
                )}
              </List>
            )}
          </>
        )}
        {currentSection === 'settings' && (
          <>
            <SectionHeader
              collapsed={collapsedSections.administratorTasks}
              onToggle={() => toggleSection('administratorTasks')}
              useAdminColor={true}
            >
              {(() => {
                switch (currentTab) {
                  case 0: return 'Server Tasks';
                  case 1: return 'Administrator Tasks';
                  case 2: return 'Tags Tasks';
                  case 3: return 'Configuration Map Tasks';
                  case 4: return 'Database Tasks Tasks';
                  case 5: return 'Resources Tasks';
                  case 6: return 'Data Pruner Tasks';
                  default: return 'Administrator Tasks';
                }
              })()}
            </SectionHeader>
            {!collapsedSections.administratorTasks && (
              <SettingsSidebar open={open} />
            )}
            <SectionHeader
              collapsed={collapsedSections.other}
              onToggle={() => toggleSection('other')}
              useAdminColor={true}
            >
              Other
            </SectionHeader>
        {!collapsedSections.other && (
          <List>
            {other.map(item => (
              <ListItem key={item.name} disablePadding sx={{ display: 'block' }}>
                {item.href ? (
                  <ListItemButton
                    component={item.external ? 'a' : Link}
                    to={item.external ? undefined : item.href}
                    href={item.external ? item.href : undefined}
                    target={item.external ? '_blank' : undefined}
                    rel={item.external ? 'noopener noreferrer' : undefined}
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
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.name}
                      sx={{
                        opacity: open ? 1 : 0,
                        color: backgroundColor
                      }}
                      primaryTypographyProps={item.count ? { component: 'span', sx: { display: 'flex', alignItems: 'center' } } : undefined}
                    />
                    {item.count && (
                      <Box component="span" sx={{ ml: 1, fontWeight: 'bold', color: backgroundColor, fontSize: 13 }}>{`(${item.count})`}</Box>
                    )}
                  </ListItemButton>
                ) : (
                  <ListItemButton
                    onClick={item.handler}
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
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.name}
                      sx={{
                        opacity: open ? 1 : 0,
                        color: backgroundColor
                      }}
                    />
                  </ListItemButton>
                )}
              </ListItem>
            ))}
          </List>
        )}
          </>
        )}
        <Box sx={{ flexGrow: 1 }} />
      </Drawer>
      
      {/* All dialog components */}
      <SendMessageDialog
        open={sendMessageOpen}
        onClose={() => setSendMessageOpen(false)}
        onSend={handleSendMessages}
        selectedChannel={getFirstSelectedChannel()}
      />
      <ViewMessagesDialog
        open={viewMessagesOpen}
        onClose={() => setViewMessagesOpen(false)}
        channelId={selectedChannels[0]}
      />
      <RemoveAllMessagesDialog
        open={removeAllMessagesOpen}
        onClose={() => setRemoveAllMessagesOpen(false)}
        onConfirm={handleRemoveAllMessages}
        selectedChannel={getFirstSelectedChannel()}
        isChannelRunning={selectedChannels.some(id => channels.find(c => c.id === id)?.state === 'STARTED')}
      />
      <ClearStatisticsDialog
        open={clearStatisticsOpen}
        onClose={() => setClearStatisticsOpen(false)}
        onConfirm={handleClearStatistics}
        defaultSelections={{ received: true, filtered: true, sent: true, errored: true }}
      />
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
        
        <DialogActions sx={{ justifyContent: 'center', gap: 2, pb: 2 }}>
          <Button
            onClick={handleConfirmRestoreDefaults}
            variant="contained"
            sx={{ minWidth: 80 }}
          >
            OK
          </Button>
          <Button
            onClick={() => setRestoreDefaultsDialogOpen(false)}
            variant="outlined"
            sx={{ minWidth: 80 }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
      <ChannelCreationDialog
        open={channelCreationDialogOpen}
        onClose={() => setChannelCreationDialogOpen(false)}
        onCreateChannel={handleCreateChannel}
        existingChannels={dialogChannels}
      />
    </React.Fragment>
  );
};

export default Sidebar;