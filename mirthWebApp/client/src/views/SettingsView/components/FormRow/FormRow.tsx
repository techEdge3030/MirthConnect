import React from 'react';
import { Grid, Typography, Tooltip } from '@mui/material';
import { FormRowProps } from '../../SettingsView.types';

/**
 * FormRow component for consistent form field layout
 * Matches the native Mirth Connect design pattern with right-aligned labels
 */
const FormRow: React.FC<FormRowProps> = ({ 
  label, 
  tooltip, 
  children, 
  fullWidth = false 
}) => (
  <Grid container spacing={2} alignItems="center" sx={{ mb: 1 }}>
    <Grid item xs={fullWidth ? 12 : 4}>
      <Tooltip title={tooltip} arrow placement="left">
        <Typography 
          variant="body2" 
          sx={{ 
            textAlign: fullWidth ? 'left' : 'right',
            width: fullWidth ? 'auto' : '320px',
            pr: fullWidth ? 0 : 1,
            cursor: 'help'
          }}
        >
          {label}:
        </Typography>
      </Tooltip>
    </Grid>
    <Grid item xs={fullWidth ? 12 : 8}>
      {children}
    </Grid>
  </Grid>
);

export default FormRow; 