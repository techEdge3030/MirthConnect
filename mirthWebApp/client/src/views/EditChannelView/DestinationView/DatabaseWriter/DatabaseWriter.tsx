import { Stack } from '@mui/material';

import DestinationSettings from '../DestinationSettings';
import type { DestinationSettingsProps } from '../DestinationView.type';
import DatabaseWriterSettings from './DatabaseWriterSettings';

const DatabaseWriter = ({
  current,
  destinations
}: DestinationSettingsProps) => {
  return (
    <Stack direction="column" spacing={0.5}>
      <DestinationSettings current={current} destinations={destinations} />

      <DatabaseWriterSettings current={current} destinations={destinations} />
    </Stack>
  );
};

export default DatabaseWriter;
