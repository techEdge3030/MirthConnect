import {
  FormControlLabel,
  Grid,
  Radio,
  TextField,
  Typography
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';

import { GroupBox, MirthSelect, SettingsButton } from '../../../components';
import type { RootState } from '../../../states';
import {
  updatePollingOnStart,
  updatePollingType
} from '../../../states/channelReducer';
import { INTERVAL_TYPES, SCHEDULE_TYPES } from './SourceView.constant';

const PollingSettingsView = () => {
  const pollsetting = useSelector(
    (state: RootState) =>
      state.channels.channel.sourceConnector.properties.pollConnectorProperties
  );
  const dispatch = useDispatch();

  const handleChangeScheduleType = (value: string) =>
    dispatch(updatePollingType(value));
  const handleChangePollOnStartYes = () => dispatch(updatePollingOnStart(true));
  const handleChangePollOnStartNo = () => dispatch(updatePollingOnStart(false));

  return (
    <div>
      <GroupBox label="Polling Settings">
        <Grid
          container
          direction="row"
          rowSpacing={0.5}
          columnSpacing={2}
          alignItems="center"
        >
          <Grid item md={1}>
            <Typography variant="subtitle1" textAlign="right">
              {' '}
              Schedule Type:{' '}
            </Typography>
          </Grid>

          <Grid item md={1}>
            <MirthSelect
              value={pollsetting.pollingType}
              items={SCHEDULE_TYPES}
              onChange={handleChangeScheduleType}
              fullWdith
            />
          </Grid>

          <Grid item md={10}>
            Next poll at: Monday, Nov 13, 11:18:30 AM
          </Grid>

          <Grid item md={1}>
            <Typography variant="subtitle1" textAlign="right">
              {' '}
              Poll once on Start:{' '}
            </Typography>
          </Grid>

          <Grid item md={1}>
            <FormControlLabel
              label="Yes"
              labelPlacement="end"
              control={
                <Radio
                  checked={pollsetting.pollOnStart}
                  onClick={handleChangePollOnStartYes}
                />
              }
            />
            <FormControlLabel
              label="No"
              labelPlacement="end"
              control={
                <Radio
                  checked={!pollsetting.pollOnStart}
                  onClick={handleChangePollOnStartNo}
                />
              }
            />
          </Grid>

          <Grid item md={10} />

          <Grid item md={1}>
            <Typography variant="subtitle1" textAlign="right">
              {' '}
              Interval:{' '}
            </Typography>
          </Grid>

          <Grid item md={1}>
            <TextField fullWidth />
          </Grid>

          <Grid item md={1}>
            <MirthSelect
              value="seconds"
              items={INTERVAL_TYPES}
              onChange={handleChangeScheduleType}
              fullWdith
            />
          </Grid>

          <Grid item md={1}>
            <SettingsButton />
          </Grid>

          <Grid item md={8} />
        </Grid>
      </GroupBox>
    </div>
  );
};

export default PollingSettingsView;
