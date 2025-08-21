import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Alert
} from '@mui/material';

interface DeleteConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  isLastUser?: boolean;
}

const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  isLastUser = false
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6">
          {title}
        </Typography>
      </DialogTitle>
      <DialogContent>
        {isLastUser && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            You must have at least one user account.
          </Alert>
        )}
        <Typography>
          {message}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          No
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="error"
          disabled={isLastUser}
        >
          Yes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmationDialog; 