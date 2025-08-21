import { Stack } from '@mui/material';

import DestinationSettings from '../DestinationSettings';
import type { DestinationSettingsProps } from '../DestinationView.type';
import JavaScriptWriterSettings from './JavaScriptWriterSettings';

const JavaScriptWriter = ({
  current,
  destinations
}: DestinationSettingsProps) => {
  return (
    <Stack direction="column" spacing={0.5}>
      <DestinationSettings current={current} destinations={destinations} />

      <JavaScriptWriterSettings current={current} destinations={destinations} />
    </Stack>
  );
};

export default JavaScriptWriter;
