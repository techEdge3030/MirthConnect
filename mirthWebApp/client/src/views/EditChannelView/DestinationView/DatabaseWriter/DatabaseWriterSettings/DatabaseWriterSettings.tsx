import {
  Button,
  FormControlLabel,
  Grid,
  Radio,
  TextareaAutosize,
  TextField,
  Typography
} from '@mui/material';
import type { ChangeEvent, FocusEvent } from 'react';
import { useMemo } from 'react';
import { useDispatch } from 'react-redux';

import {
  GroupBox,
  MirthSelect,
  SettingsButton
} from '../../../../../components';
import {
  updateDestinationDriver,
  updateDestinationPassword,
  updateDestinationQuery,
  updateDestinationUrl,
  updateDestinationUsername,
  updateDestinationUseScript
} from '../../../../../states/channelReducer';
import { DRIVER_TYPES } from '../../../SourceView/DatabaseReaderView/DatabaseSettingsView.constant';
import type { DestinationSettingsProps } from '../../DestinationView.type';

const DatabaseWriterSettings = ({
  current,
  destinations
}: DestinationSettingsProps) => {
  const settings = useMemo(() => {
    if (current) {
      return destinations.find(d => d.metaDataId === current)!.properties;
    }
    return undefined;
  }, [current, destinations]);
  const driverType = useMemo(() => {
    if (!settings?.driver) {
      return 'blank';
    }
    if (
      DRIVER_TYPES.filter(
        val => val.value !== 'blank' && val.value !== 'custom'
      )
        .map(val => val.value)
        .includes(settings.driver)
    ) {
      return settings.driver;
    }
    return 'custom';
  }, [settings?.driver]);
  const dispatch = useDispatch();

  const handleChangeDriverType = (value: string) => {
    if (value === 'blank') {
      dispatch(updateDestinationDriver({ current, data: '' }));
    } else if (value !== 'custom') {
      dispatch(updateDestinationDriver({ current, data: value }));
    }
  };
  const handleChangeDriver = (event: ChangeEvent<HTMLInputElement>) =>
    dispatch(updateDestinationDriver({ current, data: event.target.value }));
  const handleChangeUrl = (event: FocusEvent<HTMLInputElement>) =>
    dispatch(updateDestinationUrl({ current, data: event.target.value }));
  const handleChangeUsername = (event: FocusEvent<HTMLInputElement>) =>
    dispatch(updateDestinationUsername({ current, data: event.target.value }));
  const handleChangePassword = (event: FocusEvent<HTMLInputElement>) =>
    dispatch(updateDestinationPassword({ current, data: event.target.value }));
  const handleChangeUseJavaScriptYes = () =>
    dispatch(updateDestinationUseScript({ current, data: true }));
  const handleChangeUseJavaScriptNo = () =>
    dispatch(updateDestinationUseScript({ current, data: false }));
  const handleChangeQuery = (event: FocusEvent<HTMLTextAreaElement>) =>
    dispatch(updateDestinationQuery({ current, data: event.target.value }));

  return (
    <div>
      <GroupBox label="Database Writer Settings">
        <Grid container rowSpacing={0.5} columnSpacing={2}>
          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Driver:
            </Typography>
          </Grid>

          <Grid item md={2}>
            <MirthSelect
              value={driverType}
              items={DRIVER_TYPES}
              onChange={handleChangeDriverType}
              fullWdith
            />
          </Grid>

          <Grid item md={2}>
            <TextField
              value={settings?.driver}
              onChange={handleChangeDriver}
              fullWidth
            />
          </Grid>

          <Grid item md={6.5}>
            <SettingsButton />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              URL:
            </Typography>
          </Grid>

          <Grid item md={3}>
            <TextField
              defaultValue={settings?.url}
              onBlur={handleChangeUrl}
              fullWidth
            />
          </Grid>

          <Grid item md={7.5}>
            <Button variant="contained">Insert URL Template</Button>
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              UserName:
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <TextField
              defaultValue={settings?.username}
              onBlur={handleChangeUsername}
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Password:
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <TextField
              defaultValue={settings?.password}
              onBlur={handleChangePassword}
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Use Javascript:
            </Typography>
          </Grid>

          <Grid item md={1}>
            <FormControlLabel
              label="Yes"
              labelPlacement="end"
              control={
                <Radio
                  checked={settings?.useScript === true}
                  onClick={handleChangeUseJavaScriptYes}
                />
              }
            />

            <FormControlLabel
              label="No"
              labelPlacement="end"
              control={
                <Radio
                  checked={settings?.useScript === false}
                  onClick={handleChangeUseJavaScriptNo}
                />
              }
            />
          </Grid>

          <Grid item md={7} />

          <Grid item md={0.5}>
            <Typography variant="subtitle1">Generate:</Typography>
          </Grid>

          <Grid item md={1}>
            <Button
              variant="contained"
              disabled={!settings?.useScript}
              fullWidth
            >
              Connection
            </Button>
          </Grid>

          <Grid item md={1}>
            <Button variant="contained" fullWidth>
              Insert
            </Button>
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              {settings?.useScript ? 'JavaScript:' : 'SQL:'}
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <TextareaAutosize
              defaultValue={settings?.query ?? ''}
              onBlur={handleChangeQuery}
              minRows={20}
              maxRows={20}
              style={{ width: '100%' }}
            />
          </Grid>
        </Grid>
      </GroupBox>
    </div>
  );
};

export default DatabaseWriterSettings;
