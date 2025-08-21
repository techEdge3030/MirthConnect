import type { AlertColor } from '@mui/material';
import { Alert, Snackbar } from '@mui/material';
import { useMemo, useState } from 'react';

import { AlertContext, ChannelSelectionContext } from './AlertContext';
import type { AlertInfo, AlertProviderProps } from './AlertProvider.type';

interface ChannelSelectionProviderProps {
  children: React.ReactNode;
  refreshChannels?: () => void;
}

const AlertProvider = ({ children, refreshChannels }: AlertProviderProps & { refreshChannels?: () => void }) => {
  const [open, setOpen] = useState(false);
  const [severity, setSeverity] = useState<AlertColor>('success');
  const [message, setMessage] = useState('');
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);

  const alertContextValue: AlertInfo = useMemo(() => {
    return {
      setOpen,
      setSeverity,
      setMessage
    };
  }, []);

  const channelSelectionContextValue = useMemo(() => {
    return {
      selectedChannels,
      setSelectedChannels,
      refreshChannels
    };
  }, [selectedChannels, refreshChannels]);

  const handleClose = () => setOpen(false);

  return (
    <AlertContext.Provider value={alertContextValue}>
      <ChannelSelectionContext.Provider value={channelSelectionContextValue}>
        <Snackbar
          open={open}
          autoHideDuration={6000}
          onClose={handleClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={handleClose} severity={severity}>
            {message}
          </Alert>
        </Snackbar>
        {children}
      </ChannelSelectionContext.Provider>
    </AlertContext.Provider>
  );
};

export default AlertProvider;
