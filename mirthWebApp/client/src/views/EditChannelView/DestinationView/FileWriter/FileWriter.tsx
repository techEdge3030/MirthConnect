import { Stack } from '@mui/material';

import DestinationSettings from '../DestinationSettings';
import type { DestinationSettingsProps } from '../DestinationView.type';
import FileWriterSettings from './FileWriterSettings';

const FileWriter = ({ current, destinations }: DestinationSettingsProps) => {
  return (
    <Stack direction="column" spacing={0.5}>
      <DestinationSettings current={current} destinations={destinations} />

      <FileWriterSettings current={current} destinations={destinations} />
    </Stack>
  );
};

export default FileWriter;
