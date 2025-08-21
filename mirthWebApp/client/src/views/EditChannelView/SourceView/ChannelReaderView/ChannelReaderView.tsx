import { Stack } from '@mui/material';

import { GroupBox } from '../../../../components';
import SourceSettingsView from '../SourceSettingsView';

const ChannelReaderView = () => {
  return (
    <Stack direction="column" spacing={1}>
      <SourceSettingsView />

      <div>
        <GroupBox label="Channel Reader Settings">
          No configurable settings.
        </GroupBox>
      </div>
    </Stack>
  );
};

export default ChannelReaderView;
