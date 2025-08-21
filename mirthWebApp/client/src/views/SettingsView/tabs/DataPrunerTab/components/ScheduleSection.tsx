import React from 'react';
import {
  Box,
  Grid,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  Select,
  MenuItem,
  IconButton,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Checkbox,
  TextField,
  Button
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';

interface CronJob {
  expression: string;
  description: string;
  editingExpression?: boolean;
  editingDescription?: boolean;
}

interface ScheduleSettings {
  enabled: boolean;
  scheduleType: string;
  interval: string;
  intervalUnit: string;
  time: string;
  cronJobs: CronJob[];
  advancedSettings: {
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
  };
}

interface ScheduleSectionProps {
  schedule: ScheduleSettings;
  onScheduleChange: (field: string, value: any) => void;
  onFieldFocus: (fieldId: string) => void;
  onFieldBlur: () => void;
  onSpannerClick: (scheduleType: string) => void;
  onCronTipOpen: () => void;
  selectedCronJobs: number[];
  onCronJobSelect: (index: number) => void;
  onSelectAllCronJobs: () => void;
  onCronJobEditToggle: (index: number, field: string, editing: boolean) => void;
  onCronJobEdit: (index: number, field: string, value: string) => void;
  onAddCronJob: () => void;
  onRemoveCronJobs: () => void;
  SectionTitle: React.ComponentType<{ children: React.ReactNode }>;
  FieldLabel: React.ComponentType<{ children: React.ReactNode; disabled?: boolean }>;
  ClickableTextField: React.ComponentType<any>;
}

const ScheduleSection: React.FC<ScheduleSectionProps> = ({
  schedule,
  onScheduleChange,
  onFieldFocus,
  onFieldBlur,
  onSpannerClick,
  onCronTipOpen,
  selectedCronJobs,
  onCronJobSelect,
  onSelectAllCronJobs,
  onCronJobEditToggle,
  onCronJobEdit,
  onAddCronJob,
  onRemoveCronJobs,
  SectionTitle,
  FieldLabel,
  ClickableTextField
}) => {
  const isSelectAllChecked = () => {
    return schedule.cronJobs.length > 0 && selectedCronJobs.length === schedule.cronJobs.length;
  };

  const isSelectAllIndeterminate = () => {
    return selectedCronJobs.length > 0 && selectedCronJobs.length < schedule.cronJobs.length;
  };

  return (
    <>
      <SectionTitle>Schedule</SectionTitle>

      <Box sx={{ mb: 4 }}>
        <Grid container alignItems="center" spacing={2} sx={{ mb: 2 }}>
          <Grid item>
            <FieldLabel>Enable:</FieldLabel>
          </Grid>
          <Grid item>
            <RadioGroup
              row
              value={schedule.enabled ? 'Yes' : 'No'}
              onChange={(e) => onScheduleChange('enabled', e.target.value === 'Yes')}
            >
              <FormControlLabel value="Yes" control={<Radio size="small" />} label="Yes" />
              <FormControlLabel value="No" control={<Radio size="small" />} label="No" />
            </RadioGroup>
          </Grid>
        </Grid>

        <Grid container alignItems="center" spacing={2} sx={{ mb: 2 }}>
          <Grid item>
            <FieldLabel disabled={!schedule.enabled}>Schedule Type:</FieldLabel>
          </Grid>
          <Grid item>
            <FormControl size="small" disabled={!schedule.enabled}>
              <Select
                value={schedule.scheduleType}
                onChange={(e) => onScheduleChange('scheduleType', e.target.value)}
                sx={{ minWidth: '120px' }}
              >
                <MenuItem value="Interval">Interval</MenuItem>
                <MenuItem value="Time">Time</MenuItem>
                <MenuItem value="Cron">Cron</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Dynamic Schedule Content based on Schedule Type */}
        {schedule.scheduleType === 'Interval' && (
          <Grid container alignItems="center" spacing={2}>
            <Grid item>
              <FieldLabel disabled={!schedule.enabled}>Interval:</FieldLabel>
            </Grid>
            <Grid item>
              <ClickableTextField
                size="small"
                type="number"
                value={schedule.interval}
                onChange={(e: any) => onScheduleChange('interval', e.target.value)}
                disabled={!schedule.enabled}
                fieldId="interval"
                onFocus={onFieldFocus}
                onBlur={onFieldBlur}
                sx={{ width: '80px' }}
              />
            </Grid>
            <Grid item>
              <FormControl size="small" disabled={!schedule.enabled}>
                <Select
                  value={schedule.intervalUnit}
                  onChange={(e) => onScheduleChange('intervalUnit', e.target.value)}
                  sx={{ minWidth: '100px' }}
                >
                  <MenuItem value="milliseconds">milliseconds</MenuItem>
                  <MenuItem value="seconds">seconds</MenuItem>
                  <MenuItem value="minutes">minutes</MenuItem>
                  <MenuItem value="hours">hours</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item>
              <IconButton
                size="small"
                disabled={!schedule.enabled}
                onClick={() => onSpannerClick('Interval')}
                sx={{
                  border: '1px solid',
                  borderColor: schedule.enabled ? 'primary.main' : 'action.disabled',
                  borderRadius: '4px',
                  width: '32px',
                  height: '32px'
                }}
              >
                <SettingsIcon fontSize="small" />
              </IconButton>
            </Grid>
          </Grid>
        )}

        {schedule.scheduleType === 'Time' && (
          <Grid container alignItems="center" spacing={2}>
            <Grid item>
              <FieldLabel disabled={!schedule.enabled}>Time:</FieldLabel>
            </Grid>
            <Grid item>
              <ClickableTextField
                type="time"
                size="small"
                value={schedule.time}
                onChange={(e: any) => onScheduleChange('time', e.target.value)}
                disabled={!schedule.enabled}
                fieldId="time"
                onFocus={onFieldFocus}
                onBlur={onFieldBlur}
                sx={{ width: '120px' }}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item>
              <IconButton
                size="small"
                disabled={!schedule.enabled}
                onClick={() => onSpannerClick('Time')}
                sx={{
                  border: '1px solid',
                  borderColor: schedule.enabled ? 'primary.main' : 'action.disabled',
                  borderRadius: '4px',
                  width: '32px',
                  height: '32px'
                }}
              >
                <SettingsIcon fontSize="small" />
              </IconButton>
            </Grid>
          </Grid>
        )}

        {schedule.scheduleType === 'Cron' && (
          <Grid container alignItems="flex-start" spacing={2}>
            <Grid item>
              <FieldLabel disabled={!schedule.enabled}>Cron Jobs:</FieldLabel>
            </Grid>
            <Grid item sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 200 }}>
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell
                            padding="checkbox"
                            sx={{
                              fontWeight: 'bold',
                              backgroundColor: 'grey.100',
                              border: '1px solid #ccc',
                              width: '60px',
                              minWidth: '60px',
                              maxWidth: '60px'
                            }}
                          >
                            <Checkbox
                              checked={isSelectAllChecked()}
                              indeterminate={isSelectAllIndeterminate()}
                              onChange={onSelectAllCronJobs}
                              size="small"
                            />
                          </TableCell>
                          <TableCell sx={{
                            fontWeight: 'bold',
                            backgroundColor: 'grey.100',
                            border: '1px solid #ccc',
                            width: '200px',
                            minWidth: '200px',
                            maxWidth: '200px'
                          }}>
                            Expression
                          </TableCell>
                          <TableCell sx={{
                            fontWeight: 'bold',
                            backgroundColor: 'grey.100',
                            border: '1px solid #ccc',
                            width: 'auto'
                          }}>
                            Description
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {schedule.cronJobs.map((job, index) => (
                          <TableRow
                            key={index}
                            selected={selectedCronJobs.includes(index)}
                            sx={{
                              backgroundColor: index % 2 === 0 ? 'grey.50' : 'white',
                              cursor: 'pointer',
                              '&.Mui-selected': {
                                backgroundColor: 'rgba(25, 118, 210, 0.12)',
                                '&:hover': {
                                  backgroundColor: 'rgba(25, 118, 210, 0.16)'
                                }
                              }
                            }}
                          >
                            <TableCell
                              padding="checkbox"
                              sx={{
                                border: '1px solid #ccc',
                                width: '60px',
                                minWidth: '60px',
                                maxWidth: '60px'
                              }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Checkbox
                                checked={selectedCronJobs.includes(index)}
                                onChange={() => onCronJobSelect(index)}
                                size="small"
                              />
                            </TableCell>
                            <TableCell
                              sx={{
                                fontFamily: 'monospace',
                                fontSize: '0.875rem',
                                border: '1px solid #ccc',
                                cursor: 'text',
                                width: '200px',
                                minWidth: '200px',
                                maxWidth: '200px'
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!job.editingExpression) {
                                  onCronJobEditToggle(index, 'expression', true);
                                }
                              }}
                            >
                              {job.editingExpression ? (
                                <TextField
                                  size="small"
                                  value={job.expression}
                                  onChange={(e) => onCronJobEdit(index, 'expression', e.target.value)}
                                  onBlur={() => onCronJobEditToggle(index, 'expression', false)}
                                  autoFocus
                                  fullWidth
                                  variant="standard"
                                  sx={{ '& .MuiInput-underline:before': { borderBottom: 'none' } }}
                                />
                              ) : (
                                job.expression || 'Click to edit'
                              )}
                            </TableCell>
                            <TableCell
                              sx={{
                                border: '1px solid #ccc',
                                cursor: 'text',
                                width: 'auto'
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!job.editingDescription) {
                                  onCronJobEditToggle(index, 'description', true);
                                }
                              }}
                            >
                              {job.editingDescription ? (
                                <TextField
                                  size="small"
                                  value={job.description}
                                  onChange={(e) => onCronJobEdit(index, 'description', e.target.value)}
                                  onBlur={() => onCronJobEditToggle(index, 'description', false)}
                                  autoFocus
                                  fullWidth
                                  variant="standard"
                                  sx={{ '& .MuiInput-underline:before': { borderBottom: 'none' } }}
                                />
                              ) : (
                                job.description || 'Click to edit'
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={onAddCronJob}
                    sx={{ minWidth: '80px' }}
                  >
                    Add
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={onRemoveCronJobs}
                    disabled={selectedCronJobs.length === 0}
                    sx={{ minWidth: '80px' }}
                  >
                    Remove
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={onCronTipOpen}
                    sx={{ minWidth: '80px' }}
                  >
                    Tip
                  </Button>
                </Box>
              </Box>
            </Grid>
          </Grid>
        )}
      </Box>
    </>
  );
};

export default ScheduleSection;
