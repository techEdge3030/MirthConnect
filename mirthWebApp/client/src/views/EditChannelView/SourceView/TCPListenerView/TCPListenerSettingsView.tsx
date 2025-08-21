import {
  FormControlLabel,
  Grid,
  Radio,
  TextField,
  Typography
} from '@mui/material';
import type { ChangeEvent } from 'react';
import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { GroupBox, MirthSelect, SettingsButton } from '../../../../components';
import type { RootState } from '../../../../states';
import {
  updateBufferSize,
  updateCharsetEncoding,
  updateDataTypeBinary,
  updateKeepConnectionOpen,
  updateMaxConnection,
  updateOverrideLocalBinding,
  updateReceiveTimeout,
  updateReconnectInterval,
  updateRemoteAddress,
  updateRemotePort,
  updateRespondOnNewConnection,
  updateResponseAddress,
  updateResponsePort,
  updateServerMode,
  updateTransmissionMode
} from '../../../../states/channelReducer';
import {
  ENCODING_TYPES,
  TRANSMISSION_MODES
} from '../../EditChannelView.constant';

const TCPListenerSettingsView = () => {
  const setting = useSelector(
    (state: RootState) => state.channels.channel.sourceConnector.properties
  );
  const dispatch = useDispatch();
  const frameLabel = useMemo(
    () =>
      `${setting.transmissionModeProperties.pluginPointName === 'Basic' ? '' : 'MLLP'} Sample Frame:`,
    [setting.transmissionModeProperties.pluginPointName]
  );
  const frameValue = useMemo(
    () =>
      setting.transmissionModeProperties.pluginPointName === 'Basic'
        ? '<MessageData>'
        : '<VT><MessageData><FS><CR>',
    [setting.transmissionModeProperties.pluginPointName]
  );

  const handleChangeTransmissionMode = (value: string) =>
    dispatch(updateTransmissionMode(value));
  const handleChangeModeServer = () => dispatch(updateServerMode(true));
  const handleChangeModeClient = () => dispatch(updateServerMode(false));
  const handleChangeRemoteAddress = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => dispatch(updateRemoteAddress(event.target.value));
  const handleChangeRemotePort = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => dispatch(updateRemotePort(Number(event.target.value)));
  const handleChangeOverrideLocalBindingYes = () =>
    dispatch(updateOverrideLocalBinding(true));
  const handleChangeOverrideLocalBindingNo = () =>
    dispatch(updateOverrideLocalBinding(false));
  const handleChangeReconnectInterval = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => dispatch(updateReconnectInterval(Number(event.target.value)));
  const handleChangeMaxConnections = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => dispatch(updateMaxConnection(Number(event.target.value)));
  const handleChangeReceiveTimeout = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => dispatch(updateReceiveTimeout(Number(event.target.value)));
  const handleChangeBufferSize = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => dispatch(updateBufferSize(Number(event.target.value)));
  const handleChangeKeepConnectionOpenYes = () =>
    dispatch(updateKeepConnectionOpen(true));
  const handleChangeKeepConnectionOpenNo = () =>
    dispatch(updateKeepConnectionOpen(false));
  const handleChangeDataTypeBinary = () => dispatch(updateDataTypeBinary(true));
  const handleChangeDataTypeText = () => dispatch(updateDataTypeBinary(false));
  const handleChangeCharsetEncoding = (value: string) =>
    dispatch(updateCharsetEncoding(value));
  const handleChangeRespondOnNewConnectionYes = () =>
    dispatch(updateRespondOnNewConnection(1));
  const handleChangeRespondOnNewConnectionNo = () =>
    dispatch(updateRespondOnNewConnection(0));
  const handleChangeRespondOnNewConnectionMessageRecovery = () =>
    dispatch(updateRespondOnNewConnection(2));
  const handleChangeResponseAddress = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => dispatch(updateResponseAddress(event.target.value));
  const handleChangeResponsePort = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => dispatch(updateResponsePort(Number(event.target.value)));

  return (
    <div>
      <GroupBox label="TCP Listener Settings">
        <Grid
          container
          direction="row"
          rowSpacing={0.5}
          columnSpacing={2}
          alignItems="center"
        >
          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Transmission Mode:
            </Typography>
          </Grid>

          <Grid item md={1}>
            <MirthSelect
              value={setting.transmissionModeProperties.pluginPointName}
              items={TRANSMISSION_MODES}
              onChange={handleChangeTransmissionMode}
              fullWdith
            />
          </Grid>

          <Grid item md={9.5}>
            <SettingsButton />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              {' '}
              {frameLabel}{' '}
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            {' '}
            {frameValue}{' '}
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              {' '}
              Mode:{' '}
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <FormControlLabel
              label="Server"
              labelPlacement="end"
              control={
                <Radio
                  checked={setting.serverMode}
                  onClick={handleChangeModeServer}
                />
              }
            />
            <FormControlLabel
              label="Client"
              labelPlacement="end"
              control={
                <Radio
                  checked={!setting.serverMode}
                  onClick={handleChangeModeClient}
                />
              }
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              {' '}
              Remote Address:{' '}
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <TextField
              value={setting.remoteAddress}
              onChange={handleChangeRemoteAddress}
              disabled={setting.serverMode}
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              {' '}
              Remote Port:{' '}
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <TextField
              value={setting.remotePort}
              onChange={handleChangeRemotePort}
              disabled={setting.serverMode}
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              {' '}
              Override Local Binding:{' '}
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <FormControlLabel
              label="Yes"
              labelPlacement="end"
              control={
                <Radio
                  checked={setting.overrideLocalBinding}
                  onClick={handleChangeOverrideLocalBindingYes}
                />
              }
              disabled={setting.serverMode}
            />
            <FormControlLabel
              label="No"
              labelPlacement="end"
              control={
                <Radio
                  checked={!setting.overrideLocalBinding}
                  onClick={handleChangeOverrideLocalBindingNo}
                />
              }
              disabled={setting.serverMode}
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              {' '}
              Reconnect Interval (ms):{' '}
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <TextField
              value={setting.reconnectInterval}
              onChange={handleChangeReconnectInterval}
              disabled={setting.serverMode}
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              {' '}
              Max Connections:{' '}
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <TextField
              value={setting.maxConnections}
              onChange={handleChangeMaxConnections}
              disabled={!setting.serverMode}
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              {' '}
              Receive Timeout (ms):{' '}
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <TextField
              value={setting.receiveTimeout}
              onChange={handleChangeReceiveTimeout}
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              {' '}
              Buffer Size (bytes):{' '}
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <TextField
              value={setting.bufferSize}
              onChange={handleChangeBufferSize}
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              {' '}
              Keep Connection Open:{' '}
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <FormControlLabel
              label="Yes"
              labelPlacement="end"
              control={
                <Radio
                  checked={setting.keepConnectionOpen}
                  onClick={handleChangeKeepConnectionOpenYes}
                />
              }
            />
            <FormControlLabel
              label="No"
              labelPlacement="end"
              control={
                <Radio
                  checked={!setting.keepConnectionOpen}
                  onClick={handleChangeKeepConnectionOpenNo}
                />
              }
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              {' '}
              Data Type:{' '}
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <FormControlLabel
              label="Binary"
              labelPlacement="end"
              control={
                <Radio
                  checked={setting.dataTypeBinary}
                  onClick={handleChangeDataTypeBinary}
                />
              }
            />
            <FormControlLabel
              label="Text"
              labelPlacement="end"
              control={
                <Radio
                  checked={!setting.dataTypeBinary}
                  onClick={handleChangeDataTypeText}
                />
              }
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              {' '}
              Encoding:{' '}
            </Typography>
          </Grid>

          <Grid item md={1}>
            <MirthSelect
              value={setting.charsetEncoding}
              items={ENCODING_TYPES}
              onChange={handleChangeCharsetEncoding}
              fullWdith
            />
          </Grid>

          <Grid item md={9.5} />

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              {' '}
              Respond on New Connection:{' '}
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <FormControlLabel
              label="Yes"
              labelPlacement="end"
              control={
                <Radio
                  checked={setting.respondOnNewConnection === 1}
                  onClick={handleChangeRespondOnNewConnectionYes}
                />
              }
            />
            <FormControlLabel
              label="No"
              labelPlacement="end"
              control={
                <Radio
                  checked={setting.respondOnNewConnection === 0}
                  onClick={handleChangeRespondOnNewConnectionNo}
                />
              }
            />
            <FormControlLabel
              label="No"
              labelPlacement="end"
              control={
                <Radio
                  checked={setting.respondOnNewConnection === 2}
                  onClick={handleChangeRespondOnNewConnectionMessageRecovery}
                />
              }
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              {' '}
              Response Address:{' '}
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <TextField
              value={setting.responseAddress}
              onChange={handleChangeResponseAddress}
              disabled={setting.respondOnNewConnection === 0}
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              {' '}
              Response Port:{' '}
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <TextField
              value={setting.responsePort}
              onChange={handleChangeResponsePort}
              disabled={setting.respondOnNewConnection === 0}
            />
          </Grid>
        </Grid>
      </GroupBox>
    </div>
  );
};

export default TCPListenerSettingsView;
