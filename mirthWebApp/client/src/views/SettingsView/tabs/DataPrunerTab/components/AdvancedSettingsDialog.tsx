import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  TextField
} from '@mui/material';

interface AdvancedSettings {
  activeDaysType: string;
  weeklyDays: {
    sunday: boolean;
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
  };
  monthlyDay: string;
  activeTimeType: string;
  timeRangeStart: string;
  timeRangeEnd: string;
}

interface AdvancedSettingsDialogProps {
  open: boolean;
  mode: 'Interval' | 'Time';
  advancedSettings: AdvancedSettings;
  onClose: () => void;
  onOk: () => void;
  onAdvancedSettingsChange: (field: string, value: any) => void;
}

const AdvancedSettingsDialog: React.FC<AdvancedSettingsDialogProps> = ({
  open,
  mode,
  advancedSettings,
  onClose,
  onOk,
  onAdvancedSettingsChange
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          minWidth: 600,
          minHeight: 400
        }
      }}
    >
      <DialogTitle sx={{ textAlign: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Advanced Settings
        </Typography>
      </DialogTitle>

      <DialogContent>
        {/* Active Days Section */}
        <Box sx={{ mb: 4 }}>
          <Grid container alignItems="center" spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={3}>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                Active Days:
              </Typography>
            </Grid>
            <Grid item xs={9}>
              <RadioGroup
                row
                value={advancedSettings.activeDaysType}
                onChange={(e) => onAdvancedSettingsChange('activeDaysType', e.target.value as 'Weekly' | 'Monthly')}
              >
                <FormControlLabel value="Weekly" control={<Radio />} label="Weekly" />
                <FormControlLabel value="Monthly" control={<Radio />} label="Monthly" />
              </RadioGroup>
            </Grid>
          </Grid>

          {advancedSettings.activeDaysType === 'Weekly' && (
            <Grid container alignItems="center" spacing={2}>
              <Grid item xs={3}></Grid>
              <Grid item xs={9}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  {Object.entries(advancedSettings.weeklyDays).map(([day, checked], index) => {
                    const dayLabels = ['S', 'M', 'T', 'W', 'Th', 'F', 'S'];
                    return (
                      <Box key={day} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 'bold' }}>
                          {dayLabels[index]}
                        </Typography>
                        <Checkbox
                          checked={checked}
                          onChange={(e) => onAdvancedSettingsChange('weeklyDays', {
                            ...advancedSettings.weeklyDays,
                            [day]: e.target.checked
                          })}
                          size="small"
                        />
                      </Box>
                    );
                  })}
                </Box>
              </Grid>
            </Grid>
          )}

          {advancedSettings.activeDaysType === 'Monthly' && (
            <Grid container alignItems="center" spacing={2}>
              <Grid item xs={3}></Grid>
              <Grid item xs={9}>
                <TextField
                  type="number"
                  size="small"
                  value={advancedSettings.monthlyDay}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (value >= 1 && value <= 31) {
                      onAdvancedSettingsChange('monthlyDay', e.target.value);
                    }
                  }}
                  sx={{ width: '80px' }}
                  inputProps={{ min: 1, max: 31 }}
                />
              </Grid>
            </Grid>
          )}
        </Box>

        {/* Active Time Section */}
        <Box sx={{
          mb: 4,
          opacity: mode === 'Time' ? 0.5 : 1,
          pointerEvents: mode === 'Time' ? 'none' : 'auto'
        }}>
          <Grid container alignItems="center" spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={3}>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                Active Time:
              </Typography>
            </Grid>
            <Grid item xs={9}>
              <RadioGroup
                row
                value={advancedSettings.activeTimeType}
                onChange={(e) => onAdvancedSettingsChange('activeTimeType', e.target.value as 'All Day' | 'Range')}
              >
                <FormControlLabel value="All Day" control={<Radio />} label="All Day" />
                <FormControlLabel value="Range" control={<Radio />} label="Range" />
              </RadioGroup>
            </Grid>
          </Grid>

          {advancedSettings.activeTimeType === 'Range' && (
            <Grid container alignItems="center" spacing={2}>
              <Grid item xs={3}></Grid>
              <Grid item xs={9}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <TextField
                    type="time"
                    size="small"
                    value={advancedSettings.timeRangeStart}
                    onChange={(e) => onAdvancedSettingsChange('timeRangeStart', e.target.value)}
                    sx={{ width: '120px' }}
                    InputLabelProps={{ shrink: true }}
                  />
                  <Typography variant="body2">-</Typography>
                  <TextField
                    type="time"
                    size="small"
                    value={advancedSettings.timeRangeEnd}
                    onChange={(e) => onAdvancedSettingsChange('timeRangeEnd', e.target.value)}
                    sx={{ width: '120px' }}
                    InputLabelProps={{ shrink: true }}
                  />
                </Box>
              </Grid>
            </Grid>
          )}
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
          onClick={onClose}
          variant="outlined"
          sx={{ minWidth: 80 }}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AdvancedSettingsDialog;
