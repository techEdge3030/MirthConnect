import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControlLabel,
  Checkbox,
  Box,
  Typography
} from '@mui/material';

interface ClearStatisticsDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (stats: { received: boolean; filtered: boolean; sent: boolean; errored: boolean }) => void;
  defaultSelections?: { received: boolean; filtered: boolean; sent: boolean; errored: boolean };
}

const ClearStatisticsDialog = ({ open, onClose, onConfirm, defaultSelections }: ClearStatisticsDialogProps) => {
  const [received, setReceived] = useState(defaultSelections?.received ?? false);
  const [filtered, setFiltered] = useState(defaultSelections?.filtered ?? false);
  const [sent, setSent] = useState(defaultSelections?.sent ?? false);
  const [errored, setErrored] = useState(defaultSelections?.errored ?? false);

  const handleInvert = () => {
    setReceived(r => !r);
    setFiltered(f => !f);
    setSent(s => !s);
    setErrored(e => !e);
  };

  const handleOk = () => {
    onConfirm({ received, filtered, sent, errored });
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Clear Statistics</DialogTitle>
      <DialogContent>
        <Typography sx={{ mb: 2 }}>
          Please select the statistics that you would like to reset:
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <FormControlLabel
            control={<Checkbox checked={received} onChange={e => setReceived(e.target.checked)} />}
            label="Received"
          />
          <FormControlLabel
            control={<Checkbox checked={filtered} onChange={e => setFiltered(e.target.checked)} />}
            label="Filtered"
          />
          <FormControlLabel
            control={<Checkbox checked={sent} onChange={e => setSent(e.target.checked)} />}
            label="Sent"
          />
          <FormControlLabel
            control={<Checkbox checked={errored} onChange={e => setErrored(e.target.checked)} />}
            label="Errored"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleInvert}>Invert Selection</Button>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleOk} variant="contained" disabled={!(received || filtered || sent || errored)}>
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ClearStatisticsDialog; 