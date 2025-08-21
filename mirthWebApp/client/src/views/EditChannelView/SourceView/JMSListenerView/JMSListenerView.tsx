import { Stack } from '@mui/material';

import SourceSettingsView from '../SourceSettingsView';
import JMSListenerSettingsView from './JMSListenerSettingsView';

const JMSListenerView = () => {
  return (
    <Stack direction="column" spacing={0.5}>
      <SourceSettingsView />

      <JMSListenerSettingsView />
    </Stack>
  );
};

export default JMSListenerView;
