import type { AlertColor } from '@mui/material';
import type { ReactNode } from 'react';

export interface AlertInfo {
  setOpen: (isOpen: boolean) => void;
  setSeverity: (severity: AlertColor) => void;
  setMessage: (message: string) => void;
}

export interface AlertProviderProps {
  children: ReactNode;
}
