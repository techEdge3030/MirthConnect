import { Stack } from '@mui/material';

import ListenerSettingsView from '../ListenerSettingsView';
import SourceSettingsView from '../SourceSettingsView';
import DicomListenerSettingsView from './DicomListenerSettingsView';

const DicomListenerView = () => {
  return (
    <Stack direction="column" spacing={0.5}>
      <ListenerSettingsView />

      <SourceSettingsView />

      <DicomListenerSettingsView />
    </Stack>
  );
};

export default DicomListenerView;
