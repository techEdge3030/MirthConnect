import { Box, CssBaseline } from '@mui/material';
import type { ReactNode } from 'react';
import { useState } from 'react';

import { Header, Sidebar } from '../components';
import { STORAGE_KEY } from '../constants/constants';
import { StorageUtils } from '../utils/storage';

export interface ILayoutProps {
  children: ReactNode;
  title: string;
  currentSection?: string;
  onAlertEnableSelected?: () => void;
  onAlertDisableSelected?: () => void;
  onAlertDeleteSelected?: () => void;
  onAlertNew?: () => void;
}

const drawerWidth = 240;

const MainPageLayout = ({ title, children, currentSection, onAlertEnableSelected, onAlertDisableSelected, onAlertDeleteSelected, onAlertNew }: ILayoutProps) => {
  const [open, setOpen] = useState(
    StorageUtils.getItem(STORAGE_KEY.SIDEBAR_OPEN) === 'true'
  );

  const handleDrawerOpen = () => {
    setOpen(true);
    StorageUtils.setItem(STORAGE_KEY.SIDEBAR_OPEN, 'true');
  };

  const handleDrawerClose = () => {
    setOpen(false);
    StorageUtils.setItem(STORAGE_KEY.SIDEBAR_OPEN, 'false');
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Header open={open} handleDrawerOpen={handleDrawerOpen} title={title} />
      <Sidebar
        open={open}
        handleDrawerClose={handleDrawerClose}
        currentSection={currentSection}
        onAlertEnableSelected={onAlertEnableSelected}
        onAlertDisableSelected={onAlertDisableSelected}
        onAlertDeleteSelected={onAlertDeleteSelected}
        onAlertNew={onAlertNew}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          height: 'calc(100vh - 50px)',
          marginTop: '50px',
          marginLeft: open ? `${drawerWidth}px` : 0,
          transition: 'margin-left 0.2s ease-in-out',
          overflow: 'auto',
          width: open ? `calc(100% - ${drawerWidth}px)` : '100%'
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default MainPageLayout;
