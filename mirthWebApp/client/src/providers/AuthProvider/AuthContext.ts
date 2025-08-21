import React from 'react';

interface AuthContextProps {
  isLoggedIn: boolean;
  setLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
}

export const AuthContext = React.createContext<AuthContextProps>({
  isLoggedIn: false,
  setLoggedIn: () => {}
});
