import { Stack } from '@mui/material';

import DestinationSettings from '../DestinationSettings';
import type { DestinationSettingsProps } from '../DestinationView.type';
import ChannelWriterSettings from './ChannelWriterSettings';

const ChannelWriter = ({ current, destinations }: DestinationSettingsProps) => {
  return (
    <Stack direction="column" spacing={0.5}>
      <DestinationSettings current={current} destinations={destinations} />

      <ChannelWriterSettings current={current} destinations={destinations} />
    </Stack>
  );
};

export default ChannelWriter;
