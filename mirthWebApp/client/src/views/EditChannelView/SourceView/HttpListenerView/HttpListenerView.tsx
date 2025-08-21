import { Stack } from '@mui/material';

import HttpAuthenticationView from '../HttpAuthenticationView';
import ListenerSettingsView from '../ListenerSettingsView';
import SourceSettingsView from '../SourceSettingsView';
import HttpListenerSettingsView from './HttpListenerSettingsView';

const HttpListenerView = () => {
  return (
    <Stack direction="column" spacing={0.5}>
      <ListenerSettingsView />

      <SourceSettingsView />

      <HttpAuthenticationView />

      <HttpListenerSettingsView />
    </Stack>
  );
};

export default HttpListenerView;
