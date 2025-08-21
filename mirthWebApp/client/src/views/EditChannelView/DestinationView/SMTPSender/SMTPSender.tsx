import { Stack } from '@mui/material';

import DestinationSettings from '../DestinationSettings';
import type { DestinationSettingsProps } from '../DestinationView.type';
import SMTPSenderSettings from './SMTPSenderSettings';

const SMTPSender = ({ current, destinations }: DestinationSettingsProps) => {
  return (
    <Stack direction="column" spacing={0.5}>
      <DestinationSettings current={current} destinations={destinations} />

      <SMTPSenderSettings current={current} destinations={destinations} />
    </Stack>
  );
};

export default SMTPSender;
