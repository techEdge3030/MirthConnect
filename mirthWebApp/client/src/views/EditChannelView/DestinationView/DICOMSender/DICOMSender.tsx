import { Stack } from '@mui/material';

import DestinationSettings from '../DestinationSettings';
import type { DestinationSettingsProps } from '../DestinationView.type';
import DICOMSenderSettings from './DICOMSenderSettings';

const DICOMSender = ({ current, destinations }: DestinationSettingsProps) => {
  return (
    <Stack direction="column" spacing={0.5}>
      <DestinationSettings current={current} destinations={destinations} />

      <DICOMSenderSettings current={current} destinations={destinations} />
    </Stack>
  );
};

export default DICOMSender;
