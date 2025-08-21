import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';

interface ValidationModalsProps {
  // Cron Tip Modal
  cronTipModalOpen: boolean;
  setCronTipModalOpen: (open: boolean) => void;
  
  // Interval Error Modal
  intervalErrorModalOpen: boolean;
  setIntervalErrorModalOpen: (open: boolean) => void;
  intervalErrorMessage: string;
  
  // Save Error Modal
  saveErrorModalOpen: boolean;
  setSaveErrorModalOpen: (open: boolean) => void;
  saveErrorMessage: string;
}

const ValidationModals: React.FC<ValidationModalsProps> = ({
  cronTipModalOpen,
  setCronTipModalOpen,
  intervalErrorModalOpen,
  setIntervalErrorModalOpen,
  intervalErrorMessage,
  saveErrorModalOpen,
  setSaveErrorModalOpen,
  saveErrorMessage
}) => {
  const handleCronTipClose = () => {
    setCronTipModalOpen(false);
  };

  const handleIntervalErrorClose = () => {
    setIntervalErrorModalOpen(false);
  };

  return (
    <>
      {/* Cron Tip Modal (read-only, no dirty state) */}
      <Dialog
        open={cronTipModalOpen}
        onClose={handleCronTipClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            minWidth: 700,
            minHeight: 500
          }
        }}
      >
        <DialogTitle>
          <Typography variant="h6">Cron Expression Format</Typography>
        </DialogTitle>

        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Cron expressions must be in Quartz format with at least 6 fields.
          </Typography>

          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            Format:
          </Typography>

          <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'grey.100' }}>Field</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'grey.100' }}>Required</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'grey.100' }}>Values</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'grey.100' }}>Special Characters</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow><TableCell>Seconds</TableCell><TableCell>YES</TableCell><TableCell>0-59</TableCell><TableCell>, - * /</TableCell></TableRow>
                <TableRow><TableCell>Minutes</TableCell><TableCell>YES</TableCell><TableCell>0-59</TableCell><TableCell>, - * /</TableCell></TableRow>
                <TableRow><TableCell>Hours</TableCell><TableCell>YES</TableCell><TableCell>0-23</TableCell><TableCell>, - * /</TableCell></TableRow>
                <TableRow><TableCell>Day of Month</TableCell><TableCell>YES</TableCell><TableCell>1-31</TableCell><TableCell>, - * ? / L W</TableCell></TableRow>
                <TableRow><TableCell>Month</TableCell><TableCell>YES</TableCell><TableCell>1-12 or JAN-DEC</TableCell><TableCell>, - * /</TableCell></TableRow>
                <TableRow><TableCell>Day of Week</TableCell><TableCell>YES</TableCell><TableCell>1-7 or SUN-SAT</TableCell><TableCell>, - * ? / L #</TableCell></TableRow>
                <TableRow><TableCell>Year</TableCell><TableCell>NO</TableCell><TableCell>empty, 1970-2099</TableCell><TableCell>, - * /</TableCell></TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            Special Characters:
          </Typography>

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2"><strong>*</strong> : all values</Typography>
            <Typography variant="body2"><strong>?</strong> : no specific value</Typography>
            <Typography variant="body2"><strong>-</strong> : used to specify ranges</Typography>
            <Typography variant="body2"><strong>,</strong> : used to specify list of values</Typography>
            <Typography variant="body2"><strong>/</strong> : used to specify increments</Typography>
            <Typography variant="body2"><strong>L</strong> : used to specify the last of</Typography>
            <Typography variant="body2"><strong>W</strong> : used to specify the nearest weekday</Typography>
            <Typography variant="body2"><strong>#</strong> : used to specify the nth day of the month</Typography>
          </Box>

          <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
            Example:
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'monospace', backgroundColor: 'grey.100', p: 1, borderRadius: 1, mb: 2 }}>
            0 */5 8-17 * * ? means to fire every 5 minutes starting at 8am and ending at 5pm everyday
          </Typography>

          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            Note: Support for specifying both a day-of-week and day-of-month is not yet supported. A ? must be used in one of these fields.
          </Typography>
        </DialogContent>

        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Button
            onClick={handleCronTipClose}
            variant="contained"
            sx={{ minWidth: 80 }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Interval Validation Error Modal */}
      <Dialog open={intervalErrorModalOpen} onClose={handleIntervalErrorClose}>
        <DialogTitle>Invalid Interval</DialogTitle>
        <DialogContent>
          <Typography>
            {intervalErrorMessage}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Button
            onClick={handleIntervalErrorClose}
            variant="contained"
            sx={{ minWidth: 80 }}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>

      {/* Save Error Modal */}
      <Dialog open={saveErrorModalOpen} onClose={() => setSaveErrorModalOpen(false)}>
        <DialogTitle>Save Failed</DialogTitle>
        <DialogContent>
          <Typography>
            Failed to save Data Pruner settings: {saveErrorMessage}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveErrorModalOpen(false)} color="primary">
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ValidationModals;
