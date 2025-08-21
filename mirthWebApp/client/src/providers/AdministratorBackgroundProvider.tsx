import React, { createContext, useContext, useEffect, useState } from 'react';
import { getUserPreferences, xmlColorToHex } from '../services/adminService';

interface AdministratorBackgroundContextType {
  backgroundColor: string;
  isServerDefault: boolean;
  updateBackgroundColor: (color: string, isServerDefault: boolean) => void;
  refreshBackgroundColor: () => Promise<void>;
}

const AdministratorBackgroundContext = createContext<AdministratorBackgroundContextType | undefined>(undefined);

export const useAdministratorBackground = () => {
  const context = useContext(AdministratorBackgroundContext);
  if (!context) {
    throw new Error('useAdministratorBackground must be used within an AdministratorBackgroundProvider');
  }
  return context;
};

interface AdministratorBackgroundProviderProps {
  children: React.ReactNode;
}

export const AdministratorBackgroundProvider: React.FC<AdministratorBackgroundProviderProps> = ({ children }) => {
  const [backgroundColor, setBackgroundColor] = useState<string>('#1976d2'); // Default Material-UI primary blue
  const [isServerDefault, setIsServerDefault] = useState<boolean>(true);

  const updateBackgroundColor = (color: string, isServerDefault: boolean) => {
    setBackgroundColor(color);
    setIsServerDefault(isServerDefault);
  };

  const refreshBackgroundColor = async () => {
    try {
      console.log('Refreshing administrator background color...');
      
      // Get user preferences to determine background color
      const userPrefs = await getUserPreferences();
      
      if (userPrefs.administratorBackgroundColor === 'custom') {
        // Use custom color
        setBackgroundColor(userPrefs.customBackgroundColor);
        setIsServerDefault(false);
        console.log('Using custom administrator background color:', userPrefs.customBackgroundColor);
      } else {
        // Use server default (Material-UI primary blue)
        setBackgroundColor('#1976d2');
        setIsServerDefault(true);
        console.log('Using server default administrator background color');
      }
    } catch (error) {
      console.warn('Failed to load administrator background color, using default:', error);
      // Fallback to default
      setBackgroundColor('#1976d2');
      setIsServerDefault(true);
    }
  };

  // Load background color on mount
  useEffect(() => {
    refreshBackgroundColor();
  }, []);

  const value = {
    backgroundColor,
    isServerDefault,
    updateBackgroundColor,
    refreshBackgroundColor
  };

  return (
    <AdministratorBackgroundContext.Provider value={value}>
      {children}
    </AdministratorBackgroundContext.Provider>
  );
};
