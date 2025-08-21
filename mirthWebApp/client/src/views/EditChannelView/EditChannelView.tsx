import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  Menu,
  MenuItem,
  Snackbar,
  Tab,
  Tabs
} from '@mui/material';
import type { MouseEvent } from 'react';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { updateChannel } from '../../services';
import type { RootState } from '../../states';
import ChannelSummaryView from './ChannelSummaryView';
import DestinationView from './DestinationView';
import ScriptsView from './ScriptsView';
import SourceView from './SourceView';

const EditChannelView = () => {
  const [value, setValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const navigate = useNavigate();
  const open = Boolean(anchorEl);
  const channel = useSelector((state: RootState) => state.channels.channel);

  const handleChange = (_: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleActionClick = (event: MouseEvent<HTMLButtonElement>) =>
    setAnchorEl(event.currentTarget);
  
  const handleClose = () => setAnchorEl(null);
  
  const handleSaveClick = async () => {
    if (!channel || !channel.id) {
      setSaveError('No channel data available to save');
      return;
    }

    setSaving(true);
    setSaveError(null);
    
    try {
      console.log('Saving channel:', channel.name);
      await updateChannel(channel);
      
      setSaveSuccess(true);
      console.log('Channel saved successfully');
      
      // Close the menu after successful save
      handleClose();
      
      // Show success message for 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
      
    } catch (error: any) {
      console.error('Save failed:', error);
      setSaveError(error.message || 'Failed to save channel');
    } finally {
      setSaving(false);
    }
  };
  const handleClickEditFilter = () => navigate('/filter');
  const handleClickEditTransformer = () => navigate('/transformer');

  return (
    <Grid
      container
      style={{ backgroundColor: 'white', height: '100%' }}
      direction="column"
    >
      <Grid item flexGrow={1}>
        <Box display="flex">
          <Tabs
            value={value}
            onChange={handleChange}
            indicatorColor="secondary"
            textColor="inherit"
            variant="standard"
            aria-label="full width tabs"
          >
            <Tab label="Summary" />
            <Tab label="Source" />
            <Tab label="Destinations" />
            <Tab label="Scripts" />
          </Tabs>
          <div style={{ flexGrow: 1 }} />
          <Button
            color="inherit"
            id="action-button"
            aria-controls={open ? 'action-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            onClick={handleActionClick}
          >
            Actions
          </Button>
          <Menu
            id="basic-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
          >
            <MenuItem
              disabled={value === 0 || value === 3}
              onClick={handleClickEditFilter}
            >
              Edit Filter
            </MenuItem>
            <MenuItem
              disabled={value === 0 || value === 3}
              onClick={handleClickEditTransformer}
            >
              Edit Transformer
            </MenuItem>
            <Divider />
            <MenuItem 
              onClick={handleSaveClick}
              disabled={saving || !channel?.id}
            >
              {saving ? (
                <>
                  <CircularProgress size={16} sx={{ mr: 1 }} />
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </MenuItem>
          </Menu>
        </Box>

        <Box>
          {value === 0 && <ChannelSummaryView />}
          {value === 1 && <SourceView />}
          {value === 2 && <DestinationView />}
          {value === 3 && <ScriptsView />}
        </Box>
      </Grid>
      
      {/* Success Notification */}
      <Snackbar
        open={saveSuccess}
        autoHideDuration={3000}
        onClose={() => setSaveSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSaveSuccess(false)} severity="success" sx={{ width: '100%' }}>
          Channel saved successfully!
        </Alert>
      </Snackbar>
      
      {/* Error Notification */}
      <Snackbar
        open={!!saveError}
        autoHideDuration={6000}
        onClose={() => setSaveError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSaveError(null)} severity="error" sx={{ width: '100%' }}>
          {saveError}
        </Alert>
      </Snackbar>
    </Grid>
  );
};

export default EditChannelView;
