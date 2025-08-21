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
import { Help, Save, Cancel } from '@mui/icons-material';

interface DirtyStateDialogProps {
  open: boolean;
  onSaveFirst: () => void;
  onContinueWithoutSaving: () => void;
  onCancel: () => void;
  title?: string;
  message?: string;
}

const DirtyStateDialog: React.FC<DirtyStateDialogProps> = ({
  open,
  onSaveFirst,
  onContinueWithoutSaving,
  onCancel,
  title = "Save Changes?",
  message = "Would you like to save the settings first?"
}) => {
  return (
    <Dialog 
      open={open} 
      onClose={onCancel}
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
          {title}
        </Typography>
      </DialogTitle>
      
      <DialogContent sx={{ textAlign: 'center', pb: 2 }}>
        <Typography variant="body1">
          {message}
        </Typography>
      </DialogContent>
      
      <DialogActions sx={{ justifyContent: 'center', gap: 1, pb: 2 }}>
        <Button
          onClick={onSaveFirst}
          variant="contained"
          color="primary"
          startIcon={<Save />}
          sx={{ minWidth: 80 }}
        >
          Yes
        </Button>
        <Button
          onClick={onContinueWithoutSaving}
          variant="outlined"
          sx={{ minWidth: 80 }}
        >
          No
        </Button>
        <Button
          onClick={onCancel}
          variant="outlined"
          color="secondary"
          startIcon={<Cancel />}
          sx={{ minWidth: 80 }}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DirtyStateDialog;