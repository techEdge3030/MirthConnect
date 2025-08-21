import { Stack } from '@mui/material';

import PollingSettingsView from '../PollingSettingsView';
import SourceSettingsView from '../SourceSettingsView';
import DatabaseSettingsView from './DatabaseSettingsView';

const DatabaseReaderView = () => {
  return (
    <Stack direction="column" spacing={0.5}>
      <PollingSettingsView />

      <SourceSettingsView />

      <DatabaseSettingsView />
    </Stack>
  );
};

export default DatabaseReaderView;
