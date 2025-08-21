import { Stack } from '@mui/material';

import PollingSettingsView from '../PollingSettingsView';
import SourceSettingsView from '../SourceSettingsView';
import FileReaderSettingsView from './FileReaderSettingsView';

const FileReaderView = () => {
  return (
    <Stack direction="column" spacing={0.5}>
      <PollingSettingsView />

      <SourceSettingsView />

      <FileReaderSettingsView />
    </Stack>
  );
};

export default FileReaderView;
