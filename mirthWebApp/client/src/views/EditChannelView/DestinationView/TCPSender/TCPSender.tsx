import { Stack } from '@mui/material';

import DestinationSettings from '../DestinationSettings';
import type { DestinationSettingsProps } from '../DestinationView.type';
import TCPSenderSettings from './TCPSenderSettings';

const TCPSender = ({ current, destinations }: DestinationSettingsProps) => {
  return (
    <Stack direction="column" spacing={0.5}>
      <DestinationSettings current={current} destinations={destinations} />

      <TCPSenderSettings current={current} destinations={destinations} />
    </Stack>
  );
};

export default TCPSender;
