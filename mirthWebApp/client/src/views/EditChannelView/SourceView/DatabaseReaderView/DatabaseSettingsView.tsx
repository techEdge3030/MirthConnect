import {
  Button,
  FormControlLabel,
  Grid,
  Radio,
  TextareaAutosize,
  TextField,
  Typography
} from '@mui/material';
import type { ChangeEvent } from 'react';
import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { GroupBox, MirthSelect, SettingsButton } from '../../../../components';
import type { RootState } from '../../../../states';
import {
  updateAggregateResults,
  updateCacheResults,
  updateDriver,
  updateEncoding,
  updateFetchSize,
  updateKeepConnectionOpen,
  updatePassword,
  updateRetryCount,
  updateRetryInterval,
  updateSelectCode,
  updateUpdateCode,
  updateUpdateMode,
  updateUrl,
  updateUsername,
  updateUseScript
} from '../../../../states/channelReducer';
import { ENCODING_TYPES } from '../../EditChannelView.constant';
import { DRIVER_TYPES } from './DatabaseSettingsView.constant';

const DatabaseSettingsView = () => {
  const settings = useSelector(
    (state: RootState) => state.channels.channel.sourceConnector.properties
  );
  const driverType = useMemo(() => {
    if (!settings.driver) {
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
  }, [settings.driver]);
  const dispatch = useDispatch();

  const handleChangeDriverType = (value: string) => {
    if (value === 'blank') {
      dispatch(updateDriver(''));
    } else if (value !== 'custom') {
      dispatch(updateDriver(value));
    }
  };
  const handleChangeDriver = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => dispatch(updateDriver(event.target.value));
  const handleChangeUrl = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => dispatch(updateUrl(event.target.value));
  const handleChangeUsername = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => dispatch(updateUsername(event.target.value));
  const handleChangePassword = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => dispatch(updatePassword(event.target.value));
  const handleChangeUseJavascriptYes = () => dispatch(updateUseScript(true));
  const handleChangeUseJavascriptNo = () => dispatch(updateUseScript(false));
  const handleChangeKeepConnectionOpenYes = () =>
    dispatch(updateKeepConnectionOpen(true));
  const handleChangeKeepConnectionOpenNo = () =>
    dispatch(updateKeepConnectionOpen(true));
  const handleChangeAggregateResultYes = () => {
    dispatch(updateAggregateResults(true));
    dispatch(updateCacheResults(true));
  };
  const handleChangeAggregateResultNo = () =>
    dispatch(updateAggregateResults(false));
  const handleChangeCacheResultYes = () => dispatch(updateCacheResults(true));
  const handleChangeCacheResultNo = () => dispatch(updateCacheResults(false));
  const handleChangeFetchSize = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => dispatch(updateFetchSize(Number(event.target.value)));
  const handleChangeRetryCount = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => dispatch(updateRetryCount(Number(event.target.value)));
  const handleChangeRetryInterval = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => dispatch(updateRetryInterval(Number(event.target.value)));
  const handleChangeEncoding = (value: string) =>
    dispatch(updateEncoding(value));
  const handleChangeSelectCode = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => dispatch(updateSelectCode(event.target.value));
  const handleChangeUpdateModeNever = () => dispatch(updateUpdateMode(1));
  const handleChangeUpdateModeAfterEachMessage = () =>
    dispatch(updateUpdateMode(3));
  const handleChangeUpdateModeOnceAfterAllMessage = () =>
    dispatch(updateUpdateMode(2));
  const handleChangeUpdateCode = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => dispatch(updateUpdateCode(event.target.value));

  return (
    <GroupBox label="Database Reader Settings">
      <Grid
        container
        direction="row"
        rowSpacing={0.5}
        columnSpacing={2}
        alignItems="center"
      >
        <Grid item md={1.5}>
          <Typography variant="subtitle1" textAlign="right">
            Driver:{' '}
          </Typography>
        </Grid>

        <Grid item md={1.5}>
          <MirthSelect
            value={driverType}
            items={DRIVER_TYPES}
            onChange={handleChangeDriverType}
            fullWdith
          />
        </Grid>

        <Grid item md={2}>
          <TextField
            value={settings.driver}
            onChange={handleChangeDriver}
            fullWidth
          />
        </Grid>

        <Grid item md={7}>
          <SettingsButton />
        </Grid>

        <Grid item md={1.5}>
          <Typography variant="subtitle1" textAlign="right">
            URL:{' '}
          </Typography>
        </Grid>

        <Grid item md={3}>
          <TextField
            value={settings.url}
            onChange={handleChangeUrl}
            fullWidth
          />
        </Grid>

        <Grid item md={1.5}>
          <Button variant="contained" fullWidth>
            Insert URL Template
          </Button>
        </Grid>

        <Grid item md={6} />

        <Grid item md={1.5}>
          <Typography variant="subtitle1" textAlign="right">
            Username:{' '}
          </Typography>
        </Grid>

        <Grid item md={1}>
          <TextField
            value={settings.username}
            onChange={handleChangeUsername}
            fullWidth
          />
        </Grid>

        <Grid item md={9.5} />

        <Grid item md={1.5}>
          <Typography variant="subtitle1" textAlign="right">
            Password:{' '}
          </Typography>
        </Grid>

        <Grid item md={1}>
          <TextField
            value={settings.password}
            onChange={handleChangePassword}
            fullWidth
            type="password"
          />
        </Grid>

        <Grid item md={9.5} />

        <Grid item md={1.5}>
          <Typography variant="subtitle1" textAlign="right">
            Use Javascript:{' '}
          </Typography>
        </Grid>

        <Grid item md={1}>
          <FormControlLabel
            label="Yes"
            labelPlacement="end"
            control={
              <Radio
                checked={settings.useScript}
                onClick={handleChangeUseJavascriptYes}
              />
            }
          />
          <FormControlLabel
            label="No"
            labelPlacement="end"
            control={
              <Radio
                checked={!settings.useScript}
                onClick={handleChangeUseJavascriptNo}
              />
            }
          />
        </Grid>

        <Grid item md={9.5} />

        <Grid item md={1.5}>
          <Typography variant="subtitle1" textAlign="right">
            Keep Connection Open:{' '}
          </Typography>
        </Grid>

        <Grid item md={1}>
          <FormControlLabel
            label="Yes"
            labelPlacement="end"
            control={
              <Radio
                checked={settings.keepConnectionOpen}
                onClick={handleChangeKeepConnectionOpenYes}
              />
            }
            disabled={settings.useScript}
          />
          <FormControlLabel
            label="No"
            labelPlacement="end"
            control={
              <Radio
                checked={!settings.keepConnectionOpen}
                onClick={handleChangeKeepConnectionOpenNo}
              />
            }
            disabled={settings.useScript}
          />
        </Grid>

        <Grid item md={9.5} />

        <Grid item md={1.5}>
          <Typography variant="subtitle1" textAlign="right">
            Aggregate Results:{' '}
          </Typography>
        </Grid>

        <Grid item md={1}>
          <FormControlLabel
            label="Yes"
            labelPlacement="end"
            control={
              <Radio
                checked={settings.aggregateResults}
                onClick={handleChangeAggregateResultYes}
              />
            }
          />
          <FormControlLabel
            label="No"
            labelPlacement="end"
            control={
              <Radio
                checked={!settings.aggregateResults}
                onClick={handleChangeAggregateResultNo}
              />
            }
          />
        </Grid>

        <Grid item md={9.5} />

        <Grid item md={1.5}>
          <Typography variant="subtitle1" textAlign="right">
            Cache Results:{' '}
          </Typography>
        </Grid>

        <Grid item md={1}>
          <FormControlLabel
            label="Yes"
            labelPlacement="end"
            control={
              <Radio
                checked={settings.cacheResults}
                onClick={handleChangeCacheResultYes}
              />
            }
            disabled={settings.useScript || settings.aggregateResults}
          />
          <FormControlLabel
            label="No"
            labelPlacement="end"
            control={
              <Radio
                checked={!settings.cacheResults}
                onClick={handleChangeCacheResultNo}
              />
            }
            disabled={settings.useScript || settings.aggregateResults}
          />
        </Grid>

        <Grid item md={9.5} />

        <Grid item md={1.5}>
          <Typography variant="subtitle1" textAlign="right">
            Fetch Size:{' '}
          </Typography>
        </Grid>

        <Grid item md={1}>
          <TextField
            value={settings.fetchSize}
            onChange={handleChangeFetchSize}
            fullWidth
            disabled={settings.cacheResults}
          />
        </Grid>

        <Grid item md={9.5} />

        <Grid item md={1.5}>
          <Typography variant="subtitle1" textAlign="right">
            # of Retries on Error:{' '}
          </Typography>
        </Grid>

        <Grid item md={1}>
          <TextField
            value={settings.retryCount}
            onChange={handleChangeRetryCount}
            fullWidth
          />
        </Grid>

        <Grid item md={9.5} />

        <Grid item md={1.5}>
          <Typography variant="subtitle1" textAlign="right">
            Retry Interval (ms):{' '}
          </Typography>
        </Grid>

        <Grid item md={1}>
          <TextField
            value={settings.retryInterval}
            onChange={handleChangeRetryInterval}
            fullWidth
          />
        </Grid>

        <Grid item md={9.5} />

        <Grid item md={1.5}>
          <Typography variant="subtitle1" textAlign="right">
            Encoding:{' '}
          </Typography>
        </Grid>

        <Grid item md={1}>
          <MirthSelect
            value={settings.encoding}
            items={ENCODING_TYPES}
            onChange={handleChangeEncoding}
            fullWdith
          />
        </Grid>

        <Grid item md={7} />

        <Grid item md={0.5}>
          <Typography variant="subtitle1">Generate:</Typography>
        </Grid>

        <Grid item md={1}>
          <Button variant="contained" disabled={!settings.useScript} fullWidth>
            Connection
          </Button>
        </Grid>

        <Grid item md={1}>
          <Button variant="contained" fullWidth>
            Select
          </Button>
        </Grid>

        <Grid item md={1.5}>
          <Typography variant="subtitle1" textAlign="right">
            {' '}
            {settings.useScript ? 'Javascript:' : 'SQL:'}{' '}
          </Typography>
        </Grid>

        <Grid item md={10.5}>
          <TextareaAutosize
            minRows={8}
            maxRows={8}
            value={settings.select}
            style={{ width: '100%' }}
            onChange={handleChangeSelectCode}
          />
        </Grid>

        <Grid item md={1.5}>
          <Typography variant="subtitle1" textAlign="right">
            Run Post-Process {settings.useScript ? 'Script:' : 'SQL:'}{' '}
          </Typography>
        </Grid>

        <Grid item md={4}>
          <FormControlLabel
            label="Never"
            labelPlacement="end"
            control={
              <Radio
                checked={settings.updateMode === 1}
                onClick={handleChangeUpdateModeNever}
              />
            }
          />
          <FormControlLabel
            label={settings.useScript ? 'After each message' : 'For each row'}
            labelPlacement="end"
            control={
              <Radio
                checked={settings.updateMode === 3}
                onClick={handleChangeUpdateModeAfterEachMessage}
              />
            }
          />
          <FormControlLabel
            label={
              settings.useScript
                ? 'Once after all messages'
                : 'Once for all rows'
            }
            labelPlacement="end"
            control={
              <Radio
                checked={settings.updateMode === 2}
                onClick={handleChangeUpdateModeOnceAfterAllMessage}
              />
            }
          />
        </Grid>

        <Grid item md={4} />

        <Grid item md={0.5}>
          <Typography variant="subtitle1">Generate:</Typography>
        </Grid>

        <Grid item md={1}>
          <Button variant="contained" disabled={!settings.useScript} fullWidth>
            Connection
          </Button>
        </Grid>

        <Grid item md={1}>
          <Button variant="contained" fullWidth>
            Update
          </Button>
        </Grid>

        <Grid item md={1.5}>
          <Typography variant="subtitle1" textAlign="right">
            {' '}
            {settings.useScript ? 'Javascript:' : 'SQL:'}{' '}
          </Typography>
        </Grid>

        <Grid item md={10.5}>
          <TextareaAutosize
            minRows={8}
            maxRows={8}
            style={{ width: '100%' }}
            value={settings.update}
            onChange={handleChangeUpdateCode}
            disabled={settings.updateMode === 1}
          />
        </Grid>
      </Grid>
    </GroupBox>
  );
};

export default DatabaseSettingsView;
