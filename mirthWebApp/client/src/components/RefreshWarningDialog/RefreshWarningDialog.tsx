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

interface RefreshWarningDialogProps {
  open: boolean;
  onYes: () => void;
  onNo: () => void;
}

const RefreshWarningDialog: React.FC<RefreshWarningDialogProps> = ({
  open,
  onYes,
  onNo
}) => {
  return (
    <Dialog 
      open={open} 
      onClose={onNo}
      maxWidth="sm"
      PaperProps={{
        sx: { 
          minWidth: 400,
          textAlign: 'center'
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Warning
        </Typography>
      </DialogTitle>
      
      <DialogContent sx={{ textAlign: 'center', pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 2, mb: 2 }}>
          <Help 
            sx={{ 
              fontSize: 40,
              color: 'success.main',
              backgroundColor: 'success.light',
              borderRadius: '50%',
              p: 1
            }} 
          />
          <Box sx={{ textAlign: 'left' }}>
            <Typography variant="body1" sx={{ mb: 1 }}>
              Any unsaved changes will be lost.
            </Typography>
            <Typography variant="body1">
              Would you like to continue?
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ justifyContent: 'center', gap: 1, pb: 2 }}>
        <Button
          onClick={onYes}
          variant="contained"
          sx={{ minWidth: 80 }}
        >
          Yes
        </Button>
        <Button
          onClick={onNo}
          variant="outlined"
          sx={{ minWidth: 80 }}
        >
          No
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RefreshWarningDialog;
