import { Grid, TextareaAutosize, Typography } from '@mui/material';
import type { ChangeEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { GroupBox } from '../../../../components';
import type { RootState } from '../../../../states';
import { updateScript } from '../../../../states/channelReducer';

const JavascriptReaderSettingsView = () => {
  const script = useSelector(
    (state: RootState) =>
      state.channels.channel.sourceConnector.properties.script
  );
  const dispatch = useDispatch();

  const handleChangeScript = (event: ChangeEvent<HTMLTextAreaElement>) =>
    dispatch(updateScript(event.target.value));

  return (
    <div>
      <GroupBox label="Javascript Reader Settings">
        <Grid container direction="row" rowSpacing={0.5} columnSpacing={2}>
          <Grid item md={1}>
            <Typography variant="subtitle1" textAlign="right">
              script:
            </Typography>
          </Grid>

          <Grid item md={11}>
            <TextareaAutosize
              minRows={20}
              maxRows={20}
              style={{ width: '100%' }}
              value={script}
              onChange={handleChangeScript}
            />
          </Grid>
        </Grid>
      </GroupBox>
    </div>
  );
};

export default JavascriptReaderSettingsView;
