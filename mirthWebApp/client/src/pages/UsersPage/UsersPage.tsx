import MainPageLayout from '../../layouts/MainPageLayout';
import { UsersListView } from '../../views';
import React, { createContext, useState, useCallback } from 'react';

// User type
interface User {
  id?: string;
  username: string;
  firstName?: string;
  lastName?: string;
  organization?: string;
  email?: string;
  phoneNumber?: string;
  country?: string;
  stateTerritory?: string;
  role?: string;
  industry?: string;
  description?: string;
}

interface UsersContextType {
  selectedUser: User | null;
  setSelectedUser: (user: User | null) => void;
  handleCreateUser: () => void;
  handleEditUser: (user: User) => void;
  handleDeleteUser: (user: User) => void;
  handleRefresh: () => void;
}

export const UsersContext = createContext<UsersContextType | undefined>(undefined);

const UsersPage = () => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  // Handlers will be provided by UsersListView via context value
  const [handlers, setHandlers] = useState<Partial<Omit<UsersContextType, 'selectedUser' | 'setSelectedUser'>>>({});

  // This will be called by UsersListView to register its handlers
  const registerHandlers = useCallback((h: Partial<Omit<UsersContextType, 'selectedUser' | 'setSelectedUser'>>) => {
    setHandlers(h);
  }, []);

  return (
    <UsersContext.Provider value={{
      selectedUser,
      setSelectedUser,
      handleCreateUser: handlers.handleCreateUser!,
      handleEditUser: handlers.handleEditUser!,
      handleDeleteUser: handlers.handleDeleteUser!,
      handleRefresh: handlers.handleRefresh!
    }}>
      <MainPageLayout title="Users" currentSection="users">
        <UsersListView
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
          registerHandlers={registerHandlers}
        />
      </MainPageLayout>
    </UsersContext.Provider>
  );
};

export default UsersPage; 