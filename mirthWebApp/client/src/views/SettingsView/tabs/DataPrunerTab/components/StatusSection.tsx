import React from 'react';
import {
  Box,
  Grid,
  Typography
} from '@mui/material';

interface StatusData {
  currentState: string;
  currentProcess: string;
  lastProcess: string;
  nextProcess: string;
}

interface StatusSectionProps {
  status: StatusData;
  SectionTitle: React.ComponentType<{ children: React.ReactNode }>;
}

const StatusSection: React.FC<StatusSectionProps> = ({
  status,
  SectionTitle
}) => {
  return (
    <>
      <SectionTitle>Status</SectionTitle>
      
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={1}>
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" sx={{ width: '140px', fontWeight: 'medium' }}>
                Current State:
              </Typography>
              <Typography variant="body2">{status.currentState}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" sx={{ width: '140px', fontWeight: 'medium' }}>
                Current Process:
              </Typography>
              <Typography variant="body2">{status.currentProcess}</Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" sx={{ width: '140px', fontWeight: 'medium' }}>
                Last Process:
              </Typography>
              <Typography variant="body2">{status.lastProcess}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" sx={{ width: '140px', fontWeight: 'medium' }}>
                Next Process:
              </Typography>
              <Typography variant="body2">{status.nextProcess}</Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default StatusSection;
