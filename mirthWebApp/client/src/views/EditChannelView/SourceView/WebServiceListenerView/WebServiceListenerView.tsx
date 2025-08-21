import { Stack } from '@mui/material';

import HttpAuthenticationView from '../HttpAuthenticationView';
import ListenerSettingsView from '../ListenerSettingsView';
import SourceSettingsView from '../SourceSettingsView';
import WebServiceListenerSettingsView from './WebServiceListenerSettingsView';

const WebServiceListenerView = () => {
  return (
    <Stack direction="column" spacing={0.5}>
      <ListenerSettingsView />

      <SourceSettingsView />

      <HttpAuthenticationView />

      <WebServiceListenerSettingsView />
    </Stack>
  );
};

export default WebServiceListenerView;
