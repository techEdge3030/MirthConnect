import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert
} from '@mui/material';
import { 
  Warning,
  Lightbulb
} from '@mui/icons-material';

interface ClearAllStatisticsDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

const ClearAllStatisticsDialog: React.FC<ClearAllStatisticsDialogProps> = ({
  open,
  onClose,
  onConfirm
}) => {
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [touched, setTouched] = useState(false);

  const handleConfirm = async () => {
    setTouched(true);
    
    if (confirmation !== 'CLEAR') {
      setError('You must type CLEAR to confirm.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      await onConfirm();
      setShowSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to clear statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessOk = () => {
    setShowSuccess(false);
    handleClose();
  };

  const handleClose = () => {
    if (!loading) {
      setError('');
      setConfirmation('');
      setTouched(false);
      onClose();
    }
  };

  const isConfirmEnabled = confirmation === 'CLEAR';

  // Success Dialog
  if (showSuccess) {
    return (
      <Dialog 
        open={true} 
        onClose={handleSuccessOk}
        maxWidth="sm"
        PaperProps={{
          sx: { 
            minWidth: 400,
            textAlign: 'center'
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6">
            Information
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ textAlign: 'center', pb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
            <Lightbulb 
              sx={{ 
                fontSize: 40,
                color: 'info.main',
                backgroundColor: 'info.light',
                borderRadius: '50%',
                p: 1
              }} 
            />
            <Typography variant="body1">
              All current and lifetime statistics have been cleared for all channels.
            </Typography>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Button
            onClick={handleSuccessOk}
            variant="contained"
            sx={{ minWidth: 80 }}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  // Main Clear Statistics Dialog
  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: { minWidth: 500 }
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="h6">
          Clear All Statistics
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mt: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
            <Warning 
              sx={{ 
                fontSize: 40,
                color: 'error.main',
                mt: 0.5
              }} 
            />
            <Typography variant="body1">
              This will reset all channel statistics (including lifetime statistics) for all channels (including undeployed channels).
            </Typography>
          </Box>

          <Typography variant="body1" sx={{ mb: 2 }}>
            Type <strong>CLEAR</strong> and click the OK button to continue.
          </Typography>

          <TextField
            fullWidth
            value={confirmation}
            onChange={(e) => {
              setConfirmation(e.target.value);
              setTouched(true);
              // Clear error when user starts typing correctly
              if (e.target.value === 'CLEAR') {
                setError('');
              }
            }}
            error={touched && confirmation !== 'CLEAR'}
            helperText={
              touched && confirmation !== 'CLEAR' 
                ? 'You must type CLEAR to enable the OK button.' 
                : ''
            }
            placeholder="Type CLEAR here"
            autoFocus
            sx={{ mb: 2 }}
          />

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button 
          onClick={handleClose}
          disabled={loading}
          variant="outlined"
        >
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={loading || !isConfirmEnabled}
        >
          {loading ? 'Clearing...' : 'OK'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ClearAllStatisticsDialog;