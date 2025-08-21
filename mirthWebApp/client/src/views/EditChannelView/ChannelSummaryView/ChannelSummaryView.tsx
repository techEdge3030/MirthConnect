import { Grid, Stack } from '@mui/material';

import ChannelDescriptionView from './ChannelDescriptionView';
import ChannelPropertyView from './ChannelPropertyView';
import CustomMetaDataView from './CustomMetaDataView';
import MessagePrunningView from './MessagePrunningView';
import MessageStorageView from './MessageStorageView';

const ChannelSummaryView = () => {
  return (
    <Stack direction="column" spacing={0.5}>
      <ChannelPropertyView />

      <div>
        <Grid container direction="row" spacing={2}>
          <Grid item md={5}>
            <MessageStorageView />
          </Grid>

          <Grid item flexGrow={1}>
            <MessagePrunningView />
          </Grid>
        </Grid>
      </div>

      <CustomMetaDataView />

      <ChannelDescriptionView />
    </Stack>
  );
};

export default ChannelSummaryView;
