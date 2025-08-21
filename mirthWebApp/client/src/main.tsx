import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import App from './App';
import { AlertProvider, AdministratorBackgroundProvider } from './providers';
import { ConfigProvider, useConfig } from './providers/ConfigProvider';
import { store } from './states';

const theme = createTheme();

const AppWithConfig = () => {
  const { UI_CONTEXT_PATH } = useConfig();
  return (
    <BrowserRouter basename={UI_CONTEXT_PATH}>
      <ThemeProvider theme={theme}>
        <AlertProvider>
          <AdministratorBackgroundProvider>
            <CssBaseline />
            <App />
          </AdministratorBackgroundProvider>
        </AlertProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <ConfigProvider>
        <AppWithConfig />
      </ConfigProvider>
    </Provider>
  </React.StrictMode>
);
