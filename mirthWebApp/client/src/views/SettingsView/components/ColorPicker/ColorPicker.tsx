import React from 'react';
import { Box, TextField } from '@mui/material';
import { ColorPickerProps } from '../../SettingsView.types';

/**
 * Color picker component for background color selection
 */
const ColorPicker: React.FC<ColorPickerProps> = ({ 
  value, 
  onChange, 
  disabled = false 
}) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
    <input
      type="color"
      value={value}
      onChange={e => onChange(e.target.value)}
      disabled={disabled}
      style={{
        width: '40px',
        height: '30px',
        border: 'none',
        borderRadius: '4px',
        cursor: disabled ? 'not-allowed' : 'pointer'
      }}
    />
    <TextField
      value={value}
      onChange={e => onChange(e.target.value)}
      disabled={disabled}
      size="small"
      sx={{ width: '100px' }}
    />
  </Box>
);

export default ColorPicker; 