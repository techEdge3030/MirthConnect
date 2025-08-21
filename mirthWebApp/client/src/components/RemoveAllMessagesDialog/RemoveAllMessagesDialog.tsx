import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControlLabel,
  Checkbox,
  Alert,
  Typography,
  Box,
  TextField
} from '@mui/material';

interface RemoveAllMessagesDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (options: { restartRunningChannels: boolean; clearStatistics: boolean }) => void;
  selectedChannel?: { id: string; name: string } | null;
  isChannelRunning?: boolean;
}

const RemoveAllMessagesDialog = ({ 
  open, 
  onClose, 
  onConfirm, 
  selectedChannel,
  isChannelRunning = false 
}: RemoveAllMessagesDialogProps) => {
  const [restartRunningChannels, setRestartRunningChannels] = useState(false);
  const [clearStatistics, setClearStatistics] = useState(true);
  const [error, setError] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [touched, setTouched] = useState(false);

  const handleConfirm = () => {
    if (!selectedChannel) {
      setError('No channel selected.');
      return;
    }
    if (confirmation !== 'REMOVEALL') {
      setError('You must type REMOVEALL to confirm.');
      return;
    }
    setError('');
    onConfirm({ restartRunningChannels, clearStatistics });
    setConfirmation('');
    setTouched(false);
  };

  const handleClose = () => {
    setError('');
    setRestartRunningChannels(false);
    setClearStatistics(true);
    setConfirmation('');
    setTouched(false);
    onClose();
  };

  const isConfirmEnabled = confirmation === 'REMOVEALL';

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Remove All Messages {selectedChannel ? `from ${selectedChannel.name}` : ''}
      </DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <Typography variant="body1" sx={{ mb: 2 }}>
          This will remove <strong>all</strong> messages (including QUEUED) for the selected channel.
          This action cannot be undone.
        </Typography>

        {isChannelRunning && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            This channel is currently running. You may need to stop it first or use the option below.
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={restartRunningChannels}
                onChange={(e) => setRestartRunningChannels(e.target.checked)}
              />
            }
            label="Include running channels (channels will be temporarily stopped while messages are being removed)"
          />
          
          <FormControlLabel
            control={
              <Checkbox
                checked={clearStatistics}
                onChange={(e) => setClearStatistics(e.target.checked)}
              />
            }
            label="Clear statistics for affected channel(s)"
          />
        </Box>

        <TextField
          label="Type REMOVEALL to confirm"
          value={confirmation}
          onChange={e => { setConfirmation(e.target.value); setTouched(true); }}
          error={touched && confirmation !== 'REMOVEALL'}
          helperText={touched && confirmation !== 'REMOVEALL' ? 'You must type REMOVEALL to enable the button.' : 'Required for confirmation.'}
          fullWidth
          autoFocus
          sx={{ mb: 2 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button 
          onClick={handleConfirm} 
          variant="contained" 
          color="error"
          disabled={!isConfirmEnabled}
        >
          Remove All Messages
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RemoveAllMessagesDialog; 