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
import { Help } from '@mui/icons-material';

interface ConfirmationDialogProps {
  open: boolean;
  onOk: () => void;
  onCancel: () => void;
  title?: string;
  message?: string;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  onOk,
  onCancel,
  title = "Select an Option",
  message = "Your new settings will first be saved. Continue?"
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
        <Typography variant="h6">
          {title}
        </Typography>
      </DialogTitle>
      
      <DialogContent sx={{ textAlign: 'center', pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
          <Help 
            sx={{ 
              fontSize: 40,
              color: 'success.main',
              backgroundColor: 'success.light',
              borderRadius: '50%',
              p: 1
            }} 
          />
          <Typography variant="body1">
            {message}
          </Typography>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ justifyContent: 'center', gap: 2, pb: 2 }}>
        <Button
          onClick={onOk}
          variant="contained"
          sx={{ minWidth: 80 }}
        >
          OK
        </Button>
        <Button
          onClick={onCancel}
          variant="outlined"
          sx={{ minWidth: 80 }}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialog;