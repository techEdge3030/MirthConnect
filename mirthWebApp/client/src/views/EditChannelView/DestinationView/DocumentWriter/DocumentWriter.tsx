import { Stack } from '@mui/material';

import DestinationSettings from '../DestinationSettings';
import type { DestinationSettingsProps } from '../DestinationView.type';
import DocumentWriterSettings from './DocumentWriterSettings';

const DocumentWriter = ({
  current,
  destinations
}: DestinationSettingsProps) => {
  return (
    <Stack direction="column" spacing={0.5}>
      <DestinationSettings current={current} destinations={destinations} />

      <DocumentWriterSettings current={current} destinations={destinations} />
    </Stack>
  );
};

export default DocumentWriter;
