import { Stack } from '@mui/material';

import ListenerSettingsView from '../ListenerSettingsView';
import SourceSettingsView from '../SourceSettingsView';
import TCPListenerSettingsView from './TCPListenerSettingsView';

const TCPListenerView = () => {
  return (
    <Stack direction="column" spacing={0.5}>
      <ListenerSettingsView />

      <SourceSettingsView />

      <TCPListenerSettingsView />
    </Stack>
  );
};

export default TCPListenerView;
