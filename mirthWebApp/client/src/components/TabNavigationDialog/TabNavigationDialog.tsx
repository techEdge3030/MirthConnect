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

interface TabNavigationDialogProps {
  open: boolean;
  onYes: () => void;
  onNo: () => void;
  onCancel: () => void;
  currentTabName: string;
}

const TabNavigationDialog: React.FC<TabNavigationDialogProps> = ({
  open,
  onYes,
  onNo,
  onCancel,
  currentTabName
}) => {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="sm"
      PaperProps={{
        sx: {
          minWidth: 500,
          textAlign: 'center'
        }
      }}
    >
      <DialogTitle sx={{ pb: 1, fontWeight: 'bold', textAlign: 'center' }}>
        Select an Option
      </DialogTitle>

      <DialogContent sx={{ textAlign: 'center', pb: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: 2,
            mb: 2
          }}
        >
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
            Would you like to save the {currentTabName} settings changes?
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'center', gap: 1, pb: 2 }}>
        <Button onClick={onYes} variant="contained" sx={{ minWidth: 80 }}>
          Yes
        </Button>
        <Button onClick={onNo} variant="outlined" sx={{ minWidth: 80 }}>
          No
        </Button>
        <Button
          onClick={onCancel}
          variant="outlined"
          color="secondary"
          sx={{ minWidth: 80 }}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TabNavigationDialog;
