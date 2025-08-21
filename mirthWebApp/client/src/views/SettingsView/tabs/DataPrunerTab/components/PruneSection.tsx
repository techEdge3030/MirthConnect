import React from 'react';
import {
  Box,
  Grid,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio
} from '@mui/material';

interface PruneSettings {
  blockSize: string;
  pruneEvents: boolean;
  pruneEventAge: number;
}

interface PruneSectionProps {
  pruneSettings: PruneSettings;
  onPruneChange: (field: keyof PruneSettings, value: string | boolean) => void;
  onFieldFocus: (fieldId: string) => void;
  onFieldBlur: () => void;
  SectionTitle: React.ComponentType<{ children: React.ReactNode }>;
  FieldLabel: React.ComponentType<{ children: React.ReactNode; disabled?: boolean }>;
  ClickableTextField: React.ComponentType<any>;
}

const PruneSection: React.FC<PruneSectionProps> = ({
  pruneSettings,
  onPruneChange,
  onFieldFocus,
  onFieldBlur,
  SectionTitle,
  FieldLabel,
  ClickableTextField
}) => {
  return (
    <>
      <SectionTitle>Prune Settings</SectionTitle>

      <Box sx={{ mb: 4 }}>
        <Grid container alignItems="center" spacing={2} sx={{ mb: 2 }}>
          <Grid item>
            <FieldLabel>Block Size:</FieldLabel>
          </Grid>
          <Grid item>
            <ClickableTextField
              size="small"
              type="number"
              value={pruneSettings.blockSize}
              onChange={(e: any) => onPruneChange('blockSize', e.target.value)}
              fieldId="blockSize"
              onFocus={onFieldFocus}
              onBlur={onFieldBlur}
              inputProps={{ min: 50, max: 10000 }}
              sx={{ width: '100px' }}
            />
          </Grid>
          <Grid item>
            <Typography variant="caption" color="textSecondary" sx={{ ml: 1 }}>
              (50-10000, recommended: 1000)
            </Typography>
          </Grid>
        </Grid>

        <Grid container alignItems="center" spacing={2} sx={{ mb: 2 }}>
          <Grid item>
            <FieldLabel>Prune Events:</FieldLabel>
          </Grid>
          <Grid item>
            <RadioGroup
              row
              value={pruneSettings.pruneEvents ? 'Yes' : 'No'}
              onChange={(e) => onPruneChange('pruneEvents', e.target.value === 'Yes')}
            >
              <FormControlLabel value="Yes" control={<Radio size="small" />} label="Yes" />
              <FormControlLabel value="No" control={<Radio size="small" />} label="No" />
            </RadioGroup>
          </Grid>
        </Grid>

        <Grid container alignItems="center" spacing={2}>
          <Grid item>
            <FieldLabel disabled={!pruneSettings.pruneEvents}>Prune Event Age:</FieldLabel>
          </Grid>
          <Grid item>
            <ClickableTextField
              size="small"
              type="number"
              value={pruneSettings.pruneEventAge}
              onChange={(e: any) => onPruneChange('pruneEventAge', e.target.value)}
              disabled={!pruneSettings.pruneEvents}
              fieldId="pruneEventAge"
              onFocus={onFieldFocus}
              onBlur={onFieldBlur}
              sx={{ width: '100px' }}
            />
          </Grid>
          <Grid item>
            <Typography variant="body2" sx={{ color: !pruneSettings.pruneEvents ? 'text.disabled' : 'text.primary' }}>
              days
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default PruneSection;
