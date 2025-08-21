import {
  Button,
  Checkbox,
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
  updateDestinationBufferSize,
  updateDestinationCharsetEncoding,
  updateDestinationCheckRemoteHost,
  updateDestinationDataTypeBinary,
  updateDestinationIgnoreResponse,
  updateDestinationKeepConnectionOpen,
  updateDestinationLocalAddress,
  updateDestinationLocalPort,
  updateDestinationMaxConnections,
  updateDestinationOverrideLocalBinding,
  updateDestinationQueueOnResponseTimeout,
  updateDestinationRemoteAddress,
  updateDestinationRemotePort,
  updateDestinationResponseTimeout,
  updateDestinationSendTimeout,
  updateDestinationServerMode,
  updateDestinationTemplate,
  updateDestinationTransmissionMode
} from '../../../../../states/channelReducer';
import {
  ENCODING_TYPES,
  TRANSMISSION_MODES
} from '../../../EditChannelView.constant';
import type { DestinationSettingsProps } from '../../DestinationView.type';

const TCPSenderSettings = ({
  current,
  destinations
}: DestinationSettingsProps) => {
  const settings = useMemo(() => {
    if (current) {
      return destinations.find(d => d.metaDataId === current)!.properties;
    }
    return undefined;
  }, [current, destinations]);
  const dispatch = useDispatch();
  const frameLabel = useMemo(() => {
    return settings?.transmissionModeProperties.pluginPointName === 'basic'
      ? 'Sampler Frame:'
      : 'MLLP Sample Frame:';
  }, [settings?.transmissionModeProperties.pluginPointName]);
  const frameString = useMemo(() => {
    return settings?.transmissionModeProperties.pluginPointName === 'basic'
      ? '<Message Data>'
      : '<VT> <Message Data> <FS> <CR>';
  }, [settings?.transmissionModeProperties.pluginPointName]);

  const handleChangeTransmissionMode = (value: string) =>
    dispatch(updateDestinationTransmissionMode({ current, data: value }));
  const handleChangeModeClient = () =>
    dispatch(updateDestinationServerMode({ current, data: true }));
  const handleChangeModeServer = () =>
    dispatch(updateDestinationServerMode({ current, data: false }));
  const handleChangeRemoteAddress = (event: FocusEvent<HTMLInputElement>) =>
    dispatch(
      updateDestinationRemoteAddress({
        current,
        data: event.target.value
      })
    );
  const handleChangeRemotePort = (event: FocusEvent<HTMLInputElement>) =>
    dispatch(
      updateDestinationRemotePort({
        current,
        data: event.target.value
      })
    );
  const handleChangeLocalBindingYes = () =>
    dispatch(updateDestinationOverrideLocalBinding({ current, data: true }));
  const handleChangeLocalBindingNo = () =>
    dispatch(updateDestinationOverrideLocalBinding({ current, data: false }));
  const handleChangeLocalAddress = (event: FocusEvent<HTMLInputElement>) =>
    dispatch(
      updateDestinationLocalAddress({ current, data: event.target.value })
    );
  const handleChangeLocalPort = (event: FocusEvent<HTMLInputElement>) =>
    dispatch(updateDestinationLocalPort({ current, data: event.target.value }));
  const handleChangeMaxConnection = (event: FocusEvent<HTMLInputElement>) =>
    dispatch(
      updateDestinationMaxConnections({
        current,
        data: event.target.value
      })
    );
  const handleChangeKeepConnectionOpenYes = () =>
    dispatch(updateDestinationKeepConnectionOpen({ current, data: true }));
  const handleChangeKeepConnectionOpenNo = () =>
    dispatch(updateDestinationKeepConnectionOpen({ current, data: false }));
  const handleChangeRemoteHostYes = () =>
    dispatch(updateDestinationCheckRemoteHost({ current, data: true }));
  const handleChangeRemoteHostNo = () =>
    dispatch(updateDestinationCheckRemoteHost({ current, data: false }));
  const handleChangeSendTimeout = (event: FocusEvent<HTMLInputElement>) =>
    dispatch(
      updateDestinationSendTimeout({
        current,
        data: event.target.value
      })
    );
  const handleChangeBufferSize = (event: FocusEvent<HTMLInputElement>) =>
    dispatch(
      updateDestinationBufferSize({
        current,
        data: event.target.value
      })
    );
  const handleChangeResponseTimeout = (event: FocusEvent<HTMLInputElement>) =>
    dispatch(
      updateDestinationResponseTimeout({
        current,
        data: event.target.value
      })
    );
  const handleChangeQueueResponseYes = () =>
    dispatch(updateDestinationQueueOnResponseTimeout({ current, data: true }));
  const handleChangeQueueResponseNo = () =>
    dispatch(updateDestinationQueueOnResponseTimeout({ current, data: false }));
  const handleChangeDataTypeBinary = () =>
    dispatch(updateDestinationDataTypeBinary({ current, data: true }));
  const handleChangeDataTypeText = () =>
    dispatch(updateDestinationDataTypeBinary({ current, data: false }));
  const handleChangeEncoding = (value: string) =>
    dispatch(updateDestinationCharsetEncoding({ current, data: value }));
  const handleChangeTemplate = (event: FocusEvent<HTMLTextAreaElement>) =>
    dispatch(updateDestinationTemplate({ current, data: event.target.value }));
  const handleChangeIgnoreResponse = (event: ChangeEvent<HTMLInputElement>) =>
    dispatch(
      updateDestinationIgnoreResponse({
        current,
        data: event.target.checked
      })
    );

  return (
    <div>
      <GroupBox label="TCP Sender Settings">
        <Grid container rowSpacing={0.5} columnSpacing={2} alignItems="center">
          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Transmission Mode:
            </Typography>
          </Grid>

          <Grid item md={1}>
            <MirthSelect
              value={settings?.transmissionModeProperties.pluginPointName ?? ''}
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
              {frameLabel}
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            {frameString}
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Mode:
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <FormControlLabel
              label="Client"
              labelPlacement="end"
              control={
                <Radio
                  checked={!settings?.serverMode}
                  onClick={handleChangeModeClient}
                />
              }
            />
            <FormControlLabel
              label="Server"
              labelPlacement="end"
              control={
                <Radio
                  checked={settings?.serverMode}
                  onClick={handleChangeModeServer}
                />
              }
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Remote Address:
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <TextField
              value={settings?.remoteAddress}
              onBlur={handleChangeRemoteAddress}
              disabled={settings?.serverMode}
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Remote Poort:
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <TextField
              value={settings?.remoteAddress}
              onBlur={handleChangeRemotePort}
              disabled={settings?.serverMode}
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Override Local Binding:
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <FormControlLabel
              label="Yes"
              labelPlacement="end"
              control={
                <Radio
                  checked={!settings?.overrideLocalBinding}
                  onClick={handleChangeLocalBindingYes}
                />
              }
              disabled={settings?.serverMode}
            />
            <FormControlLabel
              label="No"
              labelPlacement="end"
              control={
                <Radio
                  checked={settings?.overrideLocalBinding}
                  onClick={handleChangeLocalBindingNo}
                />
              }
              disabled={settings?.serverMode}
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Local Address:
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <TextField
              value={settings?.localAddress}
              onBlur={handleChangeLocalAddress}
              disabled={!settings?.overrideLocalBinding}
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Local Poort:
            </Typography>
          </Grid>

          <Grid item md={1}>
            <TextField
              value={settings?.localPort}
              onBlur={handleChangeLocalPort}
              disabled={!settings?.overrideLocalBinding}
              fullWidth
            />
          </Grid>

          <Grid item md={9.5}>
            <Button variant="contained">Ports in Use</Button>
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Max Connections:
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <TextField
              value={settings?.maxConnections}
              onBlur={handleChangeMaxConnection}
              disabled={!settings?.serverMode}
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Keep Connection Open:
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <FormControlLabel
              label="Yes"
              labelPlacement="end"
              control={
                <Radio
                  checked={!settings?.keepConnectionOpen}
                  onClick={handleChangeKeepConnectionOpenYes}
                />
              }
              disabled={settings?.serverMode}
            />
            <FormControlLabel
              label="No"
              labelPlacement="end"
              control={
                <Radio
                  checked={settings?.keepConnectionOpen}
                  onClick={handleChangeKeepConnectionOpenNo}
                />
              }
              disabled={settings?.serverMode}
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Check Remote Host:
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <FormControlLabel
              label="Yes"
              labelPlacement="end"
              control={
                <Radio
                  checked={settings?.checkRemoteHost}
                  onClick={handleChangeRemoteHostYes}
                />
              }
              disabled={!settings?.keepConnectionOpen}
            />
            <FormControlLabel
              label="No"
              labelPlacement="end"
              control={
                <Radio
                  checked={!settings?.checkRemoteHost}
                  onClick={handleChangeRemoteHostNo}
                />
              }
              disabled={!settings?.keepConnectionOpen}
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Send Timeout (ms):
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <TextField
              value={settings?.sendTimeout}
              onBlur={handleChangeSendTimeout}
              disabled={!settings?.keepConnectionOpen}
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Buffer Size (bytes):
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <TextField
              value={settings?.bufferSize}
              onBlur={handleChangeBufferSize}
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Response Timeout (ms):
            </Typography>
          </Grid>

          <Grid item md={1}>
            <TextField
              value={settings?.responseTimeout}
              onBlur={handleChangeResponseTimeout}
            />
          </Grid>

          <Grid item md={9.5}>
            <FormControlLabel
              label="Ignore Response"
              labelPlacement="end"
              control={
                <Checkbox
                  checked={settings?.ignoreResponse}
                  onChange={handleChangeIgnoreResponse}
                />
              }
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Queue on Response Timeout:
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <FormControlLabel
              label="Yes"
              labelPlacement="end"
              control={
                <Radio
                  checked={settings?.queueOnResponseTimeout}
                  onClick={handleChangeQueueResponseYes}
                />
              }
            />
            <FormControlLabel
              label="No"
              labelPlacement="end"
              control={
                <Radio
                  checked={!settings?.queueOnResponseTimeout}
                  onClick={handleChangeQueueResponseNo}
                />
              }
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Data Type:
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <FormControlLabel
              label="Binary"
              labelPlacement="end"
              control={
                <Radio
                  checked={settings?.dataTypeBinary}
                  onClick={handleChangeDataTypeBinary}
                />
              }
            />
            <FormControlLabel
              label="Text"
              labelPlacement="end"
              control={
                <Radio
                  checked={!settings?.dataTypeBinary}
                  onClick={handleChangeDataTypeText}
                />
              }
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Encoding:
            </Typography>
          </Grid>

          <Grid item md={1}>
            <MirthSelect
              value={settings?.charsetEncoding ?? ''}
              items={ENCODING_TYPES}
              onChange={handleChangeEncoding}
              fullWdith
            />
          </Grid>

          <Grid item md={9.5} />

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Template:
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <TextareaAutosize
              value={settings?.template}
              onBlur={handleChangeTemplate}
              minRows={5}
              maxRows={5}
              style={{ width: '100%' }}
            />
          </Grid>
        </Grid>
      </GroupBox>
    </div>
  );
};

export default TCPSenderSettings;
