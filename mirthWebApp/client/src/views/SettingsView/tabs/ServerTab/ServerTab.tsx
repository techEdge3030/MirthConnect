import React, { useState, useEffect, useCallback } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Grid,
  Link,
  Radio,
  RadioGroup,
  Snackbar,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import {
  Error as ErrorIcon,
  Lightbulb as LightbulbIcon
} from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { addDirtyField, setDirty } from '../../../../states/settingsReducer';
import type { AppDispatch } from '../../../../states';
import {
  loadServerConfigurationData, 
  saveServerConfiguration,
  type ServerFormData 
} from '../../../../services/settingsService';

/**
 * ServerTab component matching the Java GUI design
 */
const ServerTab: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Loading and error states
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  
  // State for form values - will be populated from API
  const [formData, setFormData] = useState<ServerFormData>({
    environmentName: '',
    serverName: '',
    defaultBackgroundColor: '#f0f0f0',
    provideUsageStatistics: 'yes',
    enableAutoLogout: 'yes',
    autoLogoutInterval: '5',
    clearGlobalMapOnRedeploy: 'yes',
    defaultQueueBufferSize: '1000',
    metadataColumns: {
      source: true,
      type: true,
      version: true
    },
    smtpHost: '',
    smtpPort: '',
    sendTimeout: '5000',
    defaultFromAddress: '',
    secureConnection: 'none',
    requireAuthentication: 'no',
    username: '',
    password: '',
    requireLoginNotification: 'no',
    loginNotification: ''
  });

  // Dialog and snackbar states
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);
  const [sendEmailDialogOpen, setSendEmailDialogOpen] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState('yourgmail@gmail.com');
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Safely mark field as dirty with enhanced error handling
    try {
      dispatch(addDirtyField(field));
    } catch (error) {
      console.warn('ServerTab: Failed to mark field as dirty:', error);
      // Continue without Redux state - form still works
      // Show warning to user if Redux state is critical
      if (field === 'environmentName' || field === 'serverName') {
        setSnackbar({
          open: true,
          message: 'Warning: Changes may not be tracked properly',
          severity: 'warning'
        });
      }
    }
  };

  const handleMetadataColumnChange = (column: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      metadataColumns: {
        ...prev.metadataColumns,
        [column]: checked
      }
    }));
  };

  const handleColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange('defaultBackgroundColor', event.target.value);
  };

  // Load server configuration data
  const loadServerData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('ServerTab: Loading server configuration data...');
      
      const serverData = await loadServerConfigurationData();
      
      console.log('ServerTab: Server data loaded:', serverData);
      setFormData(serverData);
      
    } catch (err: any) {
      console.error('ServerTab: Failed to load server data:', err);
      setError(err.message || 'Failed to load server configuration');
      
      setSnackbar({
        open: true,
        message: err.message || 'Failed to load server configuration',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Validation logic for email fields
  const validateEmailFields = () => {
    const errors = [];
    if (!formData.smtpHost.trim()) errors.push('"SMTP Host" is required');
    if (!formData.smtpPort.trim()) errors.push('"SMTP Port" is required');
    if (!formData.sendTimeout.trim()) errors.push('"Send Timeout" is required');
    if (!formData.defaultFromAddress.trim()) errors.push('"Default From Address" is required');
    return errors;
  };

  const handleSendTestEmail = () => {
    const errors = validateEmailFields();
    if (errors.length > 0) {
      setShowValidationErrors(true);
      setValidationDialogOpen(true);
      return;
    }
    setSendEmailDialogOpen(true);
  };

  const handleSendTestEmailConfirm = () => {
    setSendEmailDialogOpen(false);
    // Simulate sending email
    setTimeout(() => {
      // Simulate failure for demo
      setSnackbar({
        open: true,
        message: `Sending the email to the following server failed : ${formData.smtpHost}:${formData.smtpPort}`,
        severity: 'error'
      });
    }, 500);
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Conditional disabling logic
  const isAutoLogoutDisabled = formData.enableAutoLogout === 'no';
  const isAuthFieldsDisabled = formData.requireAuthentication === 'no';
  const isLoginNotificationDisabled = formData.requireLoginNotification === 'no';

  // Responsive label width - larger on bigger screens
  const labelWidth = { xs: '180px', md: '220px', lg: '250px' };

  // Event handlers for sidebar actions
  const handleRefresh = useCallback(async () => {
    console.log('ServerTab: Refresh action triggered');
    
    // Clear any validation errors and dialogs
    setShowValidationErrors(false);
    setValidationDialogOpen(false);
    setSendEmailDialogOpen(false);
    
    // Reload data from API
    await loadServerData();
    
    // Clear dirty state
    dispatch(setDirty(false));
    
    console.log('ServerTab: Refresh completed');
  }, [loadServerData, dispatch]);

  const handleSave = useCallback(async () => {
    try {
      setSaving(true);
      
      console.log('ServerTab: Saving server settings:', formData);
      
      // Use actual API call instead of simulation
      await saveServerConfiguration(formData);
      
      dispatch(setDirty(false));
      
      setSnackbar({
        open: true,
        message: 'Server settings saved successfully',
        severity: 'success'
      });
      
    } catch (err: any) {
      console.error('ServerTab: Save failed:', err);
      setSnackbar({
        open: true,
        message: err.message || 'Failed to save server settings',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  }, [formData, dispatch]);

  // Load data on component mount
  useEffect(() => {
    loadServerData();
  }, [loadServerData]);

  // Listen for sidebar events
  useEffect(() => {
    const handleRefreshEvent = async () => {
      console.log('ServerTab: Sidebar refresh event received');
      await handleRefresh();
    };
    
    const handleSaveEvent = async () => {
      console.log('ServerTab: Sidebar save event received');
      await handleSave();
    };

    window.addEventListener('server-refresh-requested', handleRefreshEvent);
    window.addEventListener('settings-save-requested', handleSaveEvent);

    return () => {
      window.removeEventListener('server-refresh-requested', handleRefreshEvent);
      window.removeEventListener('settings-save-requested', handleSaveEvent);
    };
  }, [handleRefresh, handleSave]);

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
  const FieldLabel = ({
    children,
    disabled = false
  }: {
    children: React.ReactNode;
    disabled?: boolean;
  }) => (
    <Typography 
      variant="body2" 
      sx={{ 
        textAlign: 'right',
        color: disabled ? 'text.disabled' : 'text.primary'
      }}
    >
      {children}
    </Typography>
  );

  const validationErrors = validateEmailFields();

  // Show loading state
  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px' 
      }}>
        <Stack spacing={2} alignItems="center">
          <CircularProgress />
          <Typography variant="body2" color="text.secondary">
            Loading server configuration...
          </Typography>
        </Stack>
      </Box>
    );
  }

  // Show error state with retry option
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert 
          severity="error" 
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={loadServerData}
              disabled={loading}
            >
              Retry
            </Button>
          }
        >
          <Typography variant="body2">
            {error}
          </Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: '900px' }}>
      <Stack spacing={4}>
        {/* General Section */}
        <Box>
          <SectionTitle>General</SectionTitle>
          <Stack spacing={2}>
            <Grid container alignItems="center" spacing={2}>
              <Grid item sx={{ width: labelWidth }}>
                <FieldLabel>Environment name:</FieldLabel>
              </Grid>
              <Grid item xs>
                <TextField
                  size="small"
                  value={formData.environmentName}
                  onChange={(e) => handleInputChange('environmentName', e.target.value)}
                  sx={{ width: '300px' }}
                />
              </Grid>
            </Grid>

            <Grid container alignItems="center" spacing={2}>
              <Grid item sx={{ width: labelWidth }}>
                <FieldLabel>Server name:</FieldLabel>
              </Grid>
              <Grid item xs>
                <TextField
                  size="small"
                  value={formData.serverName}
                  onChange={(e) => handleInputChange('serverName', e.target.value)}
                  sx={{ width: '300px' }}
                />
              </Grid>
            </Grid>

            <Grid container alignItems="center" spacing={2}>
              <Grid item sx={{ width: labelWidth }}>
                <FieldLabel>Default Background Color:</FieldLabel>
              </Grid>
              <Grid item xs>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <input
                    type="color"
                    value={formData.defaultBackgroundColor}
                    onChange={handleColorChange}
                    style={{
                      width: '30px',
                      height: '25px',
                      border: '1px solid #ccc',
                      cursor: 'pointer',
                      borderRadius: '4px'
                    }}
                  />
                  <Typography variant="body2" sx={{ minWidth: '70px' }}>
                    {formData.defaultBackgroundColor}
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            <Grid container alignItems="center" spacing={2}>
              <Grid item sx={{ width: labelWidth }}>
                <FieldLabel>Provide usage statistics:</FieldLabel>
              </Grid>
              <Grid item xs>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <RadioGroup
                    row
                    value={formData.provideUsageStatistics}
                    onChange={(e) => handleInputChange('provideUsageStatistics', e.target.value)}
                  >
                    <FormControlLabel value="yes" control={<Radio size="small" />} label="Yes" />
                    <FormControlLabel value="no" control={<Radio size="small" />} label="No" />
                  </RadioGroup>
                  <Link 
                    href="https://www.nextgen.com/legal-notice" 
                    target="_blank"
                    variant="body2" 
                    sx={{ textDecoration: 'underline' }}
                  >
                    More Info
                  </Link>
                </Box>
              </Grid>
            </Grid>

            <Grid container alignItems="center" spacing={2}>
              <Grid item sx={{ width: labelWidth }}>
                <FieldLabel>Enable Auto Logout:</FieldLabel>
              </Grid>
              <Grid item xs>
                <RadioGroup
                  row
                  value={formData.enableAutoLogout}
                  onChange={(e) => handleInputChange('enableAutoLogout', e.target.value)}
                >
                  <FormControlLabel value="yes" control={<Radio size="small" />} label="Yes" />
                  <FormControlLabel value="no" control={<Radio size="small" />} label="No" />
                </RadioGroup>
              </Grid>
            </Grid>

            <Grid container alignItems="center" spacing={2}>
              <Grid item sx={{ width: labelWidth }}>
                <FieldLabel disabled={isAutoLogoutDisabled}>Auto Logout Interval (minutes):</FieldLabel>
              </Grid>
              <Grid item xs>
                <TextField
                  size="small"
                  value={formData.autoLogoutInterval}
                  onChange={(e) => handleInputChange('autoLogoutInterval', e.target.value)}
                  disabled={isAutoLogoutDisabled}
                  sx={{ width: '80px' }}
                />
              </Grid>
            </Grid>
          </Stack>
        </Box>

        {/* Channel Section */}
        <Box>
          <SectionTitle>Channel</SectionTitle>
          <Stack spacing={2}>
            <Grid container alignItems="center" spacing={2}>
              <Grid item sx={{ width: labelWidth }}>
                <FieldLabel>Clear global map on redeploy:</FieldLabel>
              </Grid>
              <Grid item xs>
                <RadioGroup
                  row
                  value={formData.clearGlobalMapOnRedeploy}
                  onChange={(e) => handleInputChange('clearGlobalMapOnRedeploy', e.target.value)}
                >
                  <FormControlLabel value="yes" control={<Radio size="small" />} label="Yes" />
                  <FormControlLabel value="no" control={<Radio size="small" />} label="No" />
                </RadioGroup>
              </Grid>
            </Grid>

            <Grid container alignItems="center" spacing={2}>
              <Grid item sx={{ width: labelWidth }}>
                <FieldLabel>Default Queue Buffer Size:</FieldLabel>
              </Grid>
              <Grid item xs>
                <TextField
                  size="small"
                  value={formData.defaultQueueBufferSize}
                  onChange={(e) => handleInputChange('defaultQueueBufferSize', e.target.value)}
                  sx={{ width: '100px' }}
                />
              </Grid>
            </Grid>

            <Grid container alignItems="flex-start" spacing={2}>
              <Grid item sx={{ width: labelWidth }}>
                <FieldLabel>Default Metadata Columns:</FieldLabel>
              </Grid>
              <Grid item xs>
                <Box sx={{ display: 'flex', gap: 3 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        size="small"
                        checked={formData.metadataColumns.source}
                        onChange={(e) => handleMetadataColumnChange('source', e.target.checked)}
                      />
                    }
                    label="Source"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        size="small"
                        checked={formData.metadataColumns.type}
                        onChange={(e) => handleMetadataColumnChange('type', e.target.checked)}
                      />
                    }
                    label="Type"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        size="small"
                        checked={formData.metadataColumns.version}
                        onChange={(e) => handleMetadataColumnChange('version', e.target.checked)}
                      />
                    }
                    label="Version"
                  />
                </Box>
              </Grid>
            </Grid>
          </Stack>
        </Box>

        {/* Email Section */}
        <Box>
          <SectionTitle>Email</SectionTitle>
          <Stack spacing={2}>
            <Grid container alignItems="center" spacing={2}>
              <Grid item sx={{ width: labelWidth }}>
                <FieldLabel>SMTP Host:</FieldLabel>
              </Grid>
              <Grid item xs>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <TextField
                    size="small"
                    value={formData.smtpHost}
                    onChange={(e) => handleInputChange('smtpHost', e.target.value)}
                    error={!formData.smtpHost.trim() && showValidationErrors}
                    sx={{ width: '200px' }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleSendTestEmail}
                    sx={{ 
                      whiteSpace: 'nowrap',
                      height: '40px' // Match TextField height
                    }}
                  >
                    Send Test Email
                  </Button>
                </Box>
              </Grid>
            </Grid>

            <Grid container alignItems="center" spacing={2}>
              <Grid item sx={{ width: labelWidth }}>
                <FieldLabel>SMTP Port:</FieldLabel>
              </Grid>
              <Grid item xs>
                <TextField
                  size="small"
                  value={formData.smtpPort}
                  onChange={(e) => handleInputChange('smtpPort', e.target.value)}
                  error={!formData.smtpPort.trim() && showValidationErrors}
                  sx={{ width: '100px' }}
                />
              </Grid>
            </Grid>

            <Grid container alignItems="center" spacing={2}>
              <Grid item sx={{ width: labelWidth }}>
                <FieldLabel>Send Timeout (ms):</FieldLabel>
              </Grid>
              <Grid item xs>
                <TextField
                  size="small"
                  value={formData.sendTimeout}
                  onChange={(e) => handleInputChange('sendTimeout', e.target.value)}
                  error={!formData.sendTimeout.trim() && showValidationErrors}
                  sx={{ width: '100px' }}
                />
              </Grid>
            </Grid>

            <Grid container alignItems="center" spacing={2}>
              <Grid item sx={{ width: labelWidth }}>
                <FieldLabel>Default From Address:</FieldLabel>
              </Grid>
              <Grid item xs>
                <TextField
                  size="small"
                  value={formData.defaultFromAddress}
                  onChange={(e) => handleInputChange('defaultFromAddress', e.target.value)}
                  error={!formData.defaultFromAddress.trim() && showValidationErrors}
                  sx={{ width: '300px' }}
                />
              </Grid>
            </Grid>

            <Grid container alignItems="center" spacing={2}>
              <Grid item sx={{ width: labelWidth }}>
                <FieldLabel>Secure Connection:</FieldLabel>
              </Grid>
              <Grid item xs>
                <RadioGroup
                  row
                  value={formData.secureConnection}
                  onChange={(e) => handleInputChange('secureConnection', e.target.value)}
                >
                  <FormControlLabel value="none" control={<Radio size="small" />} label="None" />
                  <FormControlLabel value="starttls" control={<Radio size="small" />} label="STARTTLS" />
                  <FormControlLabel value="ssl" control={<Radio size="small" />} label="SSL" />
                </RadioGroup>
              </Grid>
            </Grid>

            <Grid container alignItems="center" spacing={2}>
              <Grid item sx={{ width: labelWidth }}>
                <FieldLabel>Require Authentication:</FieldLabel>
              </Grid>
              <Grid item xs>
                <RadioGroup
                  row
                  value={formData.requireAuthentication}
                  onChange={(e) => handleInputChange('requireAuthentication', e.target.value)}
                >
                  <FormControlLabel value="yes" control={<Radio size="small" />} label="Yes" />
                  <FormControlLabel value="no" control={<Radio size="small" />} label="No" />
                </RadioGroup>
              </Grid>
            </Grid>

            <Grid container alignItems="center" spacing={2}>
              <Grid item sx={{ width: labelWidth }}>
                <FieldLabel disabled={isAuthFieldsDisabled}>Username:</FieldLabel>
              </Grid>
              <Grid item xs>
                <TextField
                  size="small"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  disabled={isAuthFieldsDisabled}
                  sx={{ width: '200px' }}
                />
              </Grid>
            </Grid>

            <Grid container alignItems="center" spacing={2}>
              <Grid item sx={{ width: labelWidth }}>
                <FieldLabel disabled={isAuthFieldsDisabled}>Password:</FieldLabel>
              </Grid>
              <Grid item xs>
                <TextField
                  size="small"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  disabled={isAuthFieldsDisabled}
                  sx={{ width: '200px' }}
                />
              </Grid>
            </Grid>
          </Stack>
        </Box>

        {/* Notification Section */}
        <Box>
          <SectionTitle>Notification</SectionTitle>
          <Stack spacing={2}>
            <Grid container alignItems="center" spacing={2}>
              <Grid item sx={{ width: labelWidth }}>
                <FieldLabel>Require Login Notification and Consent:</FieldLabel>
              </Grid>
              <Grid item xs>
                <RadioGroup
                  row
                  value={formData.requireLoginNotification}
                  onChange={(e) => handleInputChange('requireLoginNotification', e.target.value)}
                >
                  <FormControlLabel value="yes" control={<Radio size="small" />} label="Yes" />
                  <FormControlLabel value="no" control={<Radio size="small" />} label="No" />
                </RadioGroup>
              </Grid>
            </Grid>

            <Grid container alignItems="flex-start" spacing={2}>
              <Grid item sx={{ width: labelWidth }}>
                <FieldLabel disabled={isLoginNotificationDisabled}>Login Notification:</FieldLabel>
              </Grid>
              <Grid item xs>
                <TextField
                  multiline
                  rows={10}
                  value={formData.loginNotification}
                  onChange={(e) => handleInputChange('loginNotification', e.target.value)}
                  disabled={isLoginNotificationDisabled}
                  sx={{ width: '500px' }}
                  variant="outlined"
                />
              </Grid>
            </Grid>
          </Stack>
        </Box>
      </Stack>

      {/* Validation Error Dialog */}
      <Dialog open={validationDialogOpen} onClose={() => setValidationDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ErrorIcon color="error" />
          Error(s)
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Please fix the following errors before sending a test email:
          </Typography>
          <Box sx={{ border: 1, borderColor: 'divider', p: 2, borderRadius: 1 }}>
            {validationErrors.map((error, index) => (
              <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
                {error}
              </Typography>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setValidationDialogOpen(false)} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Send Test Email Dialog */}
      <Dialog open={sendEmailDialogOpen} onClose={() => setSendEmailDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LightbulbIcon color="primary" />
          Send Test Email
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Send test email to:
          </Typography>
          <TextField
            fullWidth
            value={testEmailAddress}
            onChange={(e) => setTestEmailAddress(e.target.value)}
            variant="outlined"
            size="small"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSendEmailDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSendTestEmailConfirm} variant="contained">
            OK
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ServerTab; 
