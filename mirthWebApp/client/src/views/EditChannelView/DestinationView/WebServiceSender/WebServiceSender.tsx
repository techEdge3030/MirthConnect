import { Stack } from '@mui/material';

import DestinationSettings from '../DestinationSettings';
import type { DestinationSettingsProps } from '../DestinationView.type';
import WebServiceSenderSettings from './WebServiceSenderSettings';

const WebServiceSender = ({
  current,
  destinations
}: DestinationSettingsProps) => {
  return (
    <Stack direction="column" spacing={0.5}>
      <DestinationSettings current={current} destinations={destinations} />

      <WebServiceSenderSettings current={current} destinations={destinations} />
    </Stack>
  );
};

export default WebServiceSender;
