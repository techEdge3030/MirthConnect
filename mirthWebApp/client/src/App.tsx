import { Backdrop, CircularProgress } from '@mui/material';
import { useContext, useEffect, useMemo, useState } from 'react';
import type { RouteProps } from 'react-router-dom';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './states';

import { LoginPage } from './pages';
import ChannelListPage from './pages/ChannelListPage';
import CodeTemplateListPage from './pages/CodeTemplateListPage';
import ConfigurationMapPage from './pages/ConfigurationMapPage';
import DashboardPage from './pages/DashboardPage';
import EditChannelPage from './pages/EditChannelPage';
import EditFilterPage from './pages/EditFilterPage';
import EditTransformerPage from './pages/EditTransformerPage';
import EventPage from './pages/EventPage';
import GlobalScriptsPage from './pages/GlobalScriptsPage';
import LibraryAddPage from './pages/LibraryAddPage';
import SettingsPage from './pages/SettingsPage';
import AuthContext from './providers/AuthProvider';
import { isAuthenticated } from './services/usersService';
import UsersPage from './pages/UsersPage';
import ClientAPIPage from './pages/ClientAPIPage';
import AlertsPage from './pages/AlertsPage';
import EventsPage from './pages/EventsPage';
import ExtensionsPage from './pages/ExtensionsPage';

const PrivateRoute: React.FC<RouteProps> = () => {
  const { isLoggedIn } = useContext(AuthContext);

  // Immediately navigate to login if not authenticated
  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

const PublicRoute: React.FC<RouteProps> = () => {
  const { isLoggedIn } = useContext(AuthContext);

  // Immediately navigate to dashboard if authenticated
  if (isLoggedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

function App() {
  const [isLoading, setLoading] = useState(true);
  const [isLoggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const status = await isAuthenticated();
      setLoggedIn(status);
      setLoading(false);
    };
    checkAuth();
  }, []);

  const routers = useMemo(() => {
    return (
      <Routes>
        <Route element={<PrivateRoute />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="channels" element={<ChannelListPage />} />
          <Route path="editchannel" element={<EditChannelPage />} />
          <Route path="filter" element={<EditFilterPage />} />
          <Route path="transformer" element={<EditTransformerPage />} />
          <Route path="global-scripts" element={<GlobalScriptsPage />} />
          <Route path="code-templates" element={<CodeTemplateListPage />} />
          <Route path="event" element={<EventPage />} />
          <Route
            path="code-templates/library/add"
            element={<LibraryAddPage />}
          />
          <Route path="configuration-map" element={<ConfigurationMapPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="client-api" element={<ClientAPIPage />} />
          <Route path="alerts" element={<AlertsPage />} />
          <Route path="events" element={<EventsPage />} />
          <Route path="extensions" element={<ExtensionsPage />} />
        </Route>
        <Route element={<PublicRoute />}>
          <Route path="" element={<LoginPage />} />
        </Route>
      </Routes>
    );
  }, [isLoading]);

  // Memorize the context value to prevent unnecessary renders
  const authProviderProps = useMemo(
    () => ({ isLoggedIn, setLoggedIn }),
    [isLoggedIn]
  );

  const loadingBar = useMemo(() => {
    return (
      <Backdrop
        sx={{ color: '#fff', zIndex: theme => theme.zIndex.drawer + 1 }}
        open
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    );
  }, [isLoading]);

  return (
    <Provider store={store}>
      <AuthContext.Provider value={authProviderProps}>
        {!isLoading && routers}
        {isLoading && loadingBar}
      </AuthContext.Provider>
    </Provider>
  );
}

export default App;
