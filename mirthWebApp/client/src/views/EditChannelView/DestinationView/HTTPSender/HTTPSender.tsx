import { Stack } from '@mui/material';

import DestinationSettings from '../DestinationSettings';
import type { DestinationSettingsProps } from '../DestinationView.type';
import HTTPSenderSettings from './HTTPSenderSettings';

const HTTPSender = ({ current, destinations }: DestinationSettingsProps) => {
  return (
    <Stack direction="column" spacing={0.5}>
      <DestinationSettings current={current} destinations={destinations} />

      <HTTPSenderSettings current={current} destinations={destinations} />
    </Stack>
  );
};

export default HTTPSender;
