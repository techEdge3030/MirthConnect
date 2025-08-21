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
import { Error as ErrorIcon } from '@mui/icons-material';

interface ResourceValidationDialogProps {
  open: boolean;
  onClose: () => void;
  message: string;
}

const ResourceValidationDialog: React.FC<ResourceValidationDialogProps> = ({
  open,
  onClose,
  message
}) => {
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
          Error
        </Typography>
      </DialogTitle>
      
      <DialogContent sx={{ textAlign: 'center', pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
          <ErrorIcon 
            sx={{ 
              fontSize: 40,
              color: 'error.main'
            }} 
          />
          <Box sx={{ textAlign: 'left' }}>
            <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
              Error validating resource settings:
            </Typography>
            <Typography variant="body1">
              {message}
            </Typography>
          </Box>
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
};

export default ResourceValidationDialog;
