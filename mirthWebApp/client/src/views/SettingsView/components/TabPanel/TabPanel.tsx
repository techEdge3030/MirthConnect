import React from 'react';
import { Box } from '@mui/material';
import { TabPanelProps } from '../../SettingsView.types';

/**
 * TabPanel component for managing tab content visibility
 * Follows accessibility best practices with proper ARIA attributes
 */
const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

export default TabPanel; 