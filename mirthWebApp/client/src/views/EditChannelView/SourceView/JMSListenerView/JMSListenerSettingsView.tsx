import {
  Checkbox,
  FormControlLabel,
  Grid,
  Radio,
  TextField,
  Typography
} from '@mui/material';
import type { ChangeEvent } from 'react';
import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { GroupBox, MirthTable } from '../../../../components';
import type { RootState } from '../../../../states';
import {
  updateClientId,
  updateConnectionFacotryName,
  updateConnectionFactoryClass,
  updateContextFactory,
  updateDestinationName,
  updateDestinationType,
  updateDuralbeTopic,
  updatePassword,
  updateProviderUrl,
  updateReconnectIntervalMillis,
  updateSelector,
  updateUseJndi,
  updateUsername
} from '../../../../states/channelReducer';
import type { Column, Row } from '../../../../types';

const JMSListenerSettingsView = () => {
  const settings = useSelector(
    (state: RootState) => state.channels.channel.sourceConnector.properties
  );
  const dispatch = useDispatch();
  const columns: Column[] = [
    { id: 'property', title: 'Property', width: '10%' },
    { id: 'value', title: 'Value', width: '90%' }
  ];
  const rows: Row[] = useMemo(() => {
    if (!settings.connectionProperties.entry) {
      return [];
    }
    const data = settings.connectionProperties.entry.map(
      value =>
        ({
          id: value.string[0],
          property: {
            type: 'text',
            value: value.string[0]
          },
          value: {
            type: 'text',
            value: value.string[1]
          }
        }) as Row
    );
    return data;
  }, [settings.connectionProperties.entry]);

  const handleChangeUseJndiYes = () => dispatch(updateUseJndi(true));
  const handleChangeUseJndiNo = () => dispatch(updateUseJndi(false));
  const handleChangeProviderURl = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => dispatch(updateProviderUrl(event.target.value));
  const handleChangeContextFactory = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => dispatch(updateContextFactory(event.target.value));
  const handleChangeConnectionFactoryName = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => dispatch(updateConnectionFacotryName(event.target.value));
  const handleChangeConnectionFactoryClass = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => dispatch(updateConnectionFactoryClass(event.target.value));
  const handleChangeUsername = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => dispatch(updateUsername(event.target.value));
  const handleChangePassword = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => dispatch(updatePassword(event.target.value));
  const handleChangeDestinationTypeQueue = () =>
    dispatch(updateDestinationType(false));
  const handleChangeDestinationTypeTopic = () =>
    dispatch(updateDestinationType(true));
  const handleChangeDestinationDurableTopic = () =>
    dispatch(updateDuralbeTopic(!settings.durableTopic));
  const handleChangeDestinationName = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => dispatch(updateDestinationName(event.target.value));
  const handleChangeClientId = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => dispatch(updateClientId(event.target.value));
  const handleChangeReconnectionInterval = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => dispatch(updateReconnectIntervalMillis(Number(event.target.value)));
  const handleChangeSelector = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => dispatch(updateSelector(event.target.value));

  return (
    <div>
      <GroupBox label="JMS Listener Settings">
        <Grid
          container
          direction="row"
          rowSpacing={0.5}
          columnSpacing={2}
          alignItems="center"
        >
          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Use JNDI:
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <FormControlLabel
              label="Yes"
              labelPlacement="end"
              control={
                <Radio
                  checked={settings.useJndi}
                  onClick={handleChangeUseJndiYes}
                />
              }
            />
            <FormControlLabel
              label="No"
              labelPlacement="end"
              control={
                <Radio
                  checked={!settings.useJndi}
                  onClick={handleChangeUseJndiNo}
                />
              }
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Provider URL:
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <TextField
              value={settings.jndiProviderUrl}
              onChange={handleChangeProviderURl}
              disabled={!settings.useJndi}
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Initial Context Factory:
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <TextField
              value={settings.jndiInitialContextFactory}
              onChange={handleChangeContextFactory}
              disabled={!settings.useJndi}
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Connection Factory Name:
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <TextField
              value={settings.jndiConnectionFactoryName}
              onChange={handleChangeConnectionFactoryName}
              disabled={!settings.useJndi}
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Initial Context Factory:
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <TextField
              value={settings.connectionFactoryClass}
              onChange={handleChangeConnectionFactoryClass}
              disabled={settings.useJndi}
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Connection Properties:
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <MirthTable rows={rows} columns={columns} />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Username:
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <TextField
              value={settings.username}
              onChange={handleChangeUsername}
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Password:
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <TextField
              value={settings.password}
              onChange={handleChangePassword}
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Destination Type:
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <FormControlLabel
              label="Queue"
              labelPlacement="end"
              control={
                <Radio
                  checked={!settings.topic}
                  onClick={handleChangeDestinationTypeQueue}
                />
              }
            />
            <FormControlLabel
              label="Topic"
              labelPlacement="end"
              control={
                <Radio
                  checked={settings.topic}
                  onClick={handleChangeDestinationTypeTopic}
                />
              }
            />
            <FormControlLabel
              label="Duralbe"
              labelPlacement="end"
              control={
                <Checkbox
                  checked={settings.durableTopic}
                  onClick={handleChangeDestinationDurableTopic}
                />
              }
              disabled={!settings.topic}
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Destination Name:
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <TextField
              value={settings.destinationName}
              onChange={handleChangeDestinationName}
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Client ID:
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <TextField
              value={settings.clientId}
              onChange={handleChangeClientId}
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Reconnect Interval (ms):
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <TextField
              value={settings.reconnectIntervalMillis}
              onChange={handleChangeReconnectionInterval}
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Selector:
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <TextField
              value={settings.selector}
              onChange={handleChangeSelector}
            />
          </Grid>
        </Grid>
      </GroupBox>
    </div>
  );
};

export default JMSListenerSettingsView;
