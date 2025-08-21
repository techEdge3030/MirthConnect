import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box
} from '@mui/material';
import { Help, Warning } from '@mui/icons-material';

interface ReloadResourceDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDirty: boolean;
}

const ReloadResourceDialog: React.FC<ReloadResourceDialogProps> = ({
  open,
  onClose,
  onConfirm,
  isDirty
}) => {
  // If dirty state, show warning dialog first
  if (isDirty) {
    return (
      <Dialog 
        open={open} 
        onClose={onClose}
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
            Warning
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ textAlign: 'center', pb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
            <Warning 
              sx={{ 
                fontSize: 40,
                color: 'error.main'
              }} 
            />
            <Typography variant="body1">
              You must save before reloading any resources.
            </Typography>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Button
            onClick={onClose}
            variant="contained"
            sx={{ minWidth: 80 }}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  // If not dirty, show confirmation dialog
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      PaperProps={{
        sx: { 
          minWidth: 500,
          textAlign: 'center'
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6">
          Select an Option
        </Typography>
      </DialogTitle>
      
      <DialogContent sx={{ textAlign: 'left', pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
          <Help 
            sx={{ 
              fontSize: 40,
              color: 'success.main',
              backgroundColor: 'success.light',
              borderRadius: '50%',
              p: 1,
              mt: 0.5
            }} 
          />
          <Box>
            <Typography variant="body1" sx={{ mb: 1 }}>
              Libraries associated with any changed resources will be reloaded.
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              Any channels / connectors using those libraries will be affected.
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              Also, a maximum of 1000 files may be loaded into a directory
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              resource, with additional files being skipped.
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
              Are you sure you wish to continue?
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ justifyContent: 'center', gap: 2, pb: 2 }}>
        <Button
          onClick={onConfirm}
          variant="contained"
          sx={{ minWidth: 80 }}
        >
          Yes
        </Button>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{ minWidth: 80 }}
        >
          No
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReloadResourceDialog;
