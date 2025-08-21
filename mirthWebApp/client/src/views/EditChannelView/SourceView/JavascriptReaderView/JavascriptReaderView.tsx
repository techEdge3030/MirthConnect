import { Stack } from '@mui/material';

import PollingSettingsView from '../PollingSettingsView';
import SourceSettingsView from '../SourceSettingsView';
import JavascriptReaderSettingsView from './JavascriptReaderSettingsView';

const JavascriptReaderView = () => {
  return (
    <Stack direction="column" spacing={0.5}>
      <PollingSettingsView />

      <SourceSettingsView />

      <JavascriptReaderSettingsView />
    </Stack>
  );
};

export default JavascriptReaderView;
