import { createContext, useContext } from 'react';

import type { AlertInfo } from './AlertProvider.type';

export const AlertContext = createContext({} as AlertInfo);

export const useAlert = () => {
  return useContext(AlertContext);
};

// Channel Selection Context
export interface ChannelSelectionContextType {
  selectedChannels: string[];
  setSelectedChannels: (channels: string[]) => void;
  refreshChannels?: () => void;
}

export const ChannelSelectionContext = createContext({} as ChannelSelectionContextType);

export const useChannelSelection = () => {
  return useContext(ChannelSelectionContext);
};
