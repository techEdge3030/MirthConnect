import {
  Button,
  FormControlLabel,
  Grid,
  Radio,
  TextareaAutosize,
  TextField,
  Typography
} from '@mui/material';
import type { FocusEvent } from 'react';
import { useMemo } from 'react';
import { useDispatch } from 'react-redux';

import { GroupBox } from '../../../../../components';
import {
  updateDestinationAcceptTo,
  updateDestinationApplicationEntity,
  updateDestinationAsync,
  updateDestinationBufSize,
  updateDestinationConnectTo,
  updateDestinationHost,
  updateDestinationKeyPW,
  updateDestinationKeyStore,
  updateDestinationKeyStorePW,
  updateDestinationLocalApplicationEntity,
  updateDestinationLocalHost,
  updateDestinationLocalPort,
  updateDestinationNoClientAuth,
  updateDestinationNossl2,
  updateDestinationPasscode,
  updateDestinationPdv1,
  updateDestinationPort,
  updateDestinationPriority,
  updateDestinationRcvpdulen,
  updateDestinationReaper,
  updateDestinationReleaseTo,
  updateDestinationRspTo,
  updateDestinationShutdownDelay,
  updateDestinationSndpdulen,
  updateDestinationSoCloseDelay,
  updateDestinationSorcvbuf,
  updateDestinationSosndbuf,
  updateDestinationStgcmt,
  updateDestinationTcpDelay,
  updateDestinationTemplate,
  updateDestinationTls,
  updateDestinationTrustStore,
  updateDestinationTrustStorePW,
  updateDestinationTs1,
  updateDestinationUidnegrsp,
  updateDestinationUsername
} from '../../../../../states/channelReducer';
import type { DestinationSettingsProps } from '../../DestinationView.type';

const DICOMSenderSettings = ({
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

  const handleChangeRemoteHost = (event: FocusEvent<HTMLInputElement>) =>
    dispatch(updateDestinationHost({ current, data: event.target.value }));
  const handleChangeLocalHost = (event: FocusEvent<HTMLInputElement>) =>
    dispatch(updateDestinationLocalHost({ current, data: event.target.value }));
  const handleChangePort = (event: FocusEvent<HTMLInputElement>) =>
    dispatch(updateDestinationPort({ current, data: event.target.value }));
  const handleChangeLocalPort = (event: FocusEvent<HTMLInputElement>) =>
    dispatch(updateDestinationLocalPort({ current, data: event.target.value }));
  const handleChangeRemoteApplicationEntity = (
    event: FocusEvent<HTMLInputElement>
  ) =>
    dispatch(
      updateDestinationApplicationEntity({
        current,
        data: event.target.value
      })
    );
  const handleChangeLocalApplicationEntity = (
    event: FocusEvent<HTMLInputElement>
  ) =>
    dispatch(
      updateDestinationLocalApplicationEntity({
        current,
        data: event.target.value
      })
    );
  const handleChangeMaxAsyncOperations = (
    event: FocusEvent<HTMLInputElement>
  ) => dispatch(updateDestinationAsync({ current, data: event.target.value }));
  const handleChangePriorityHigh = () =>
    dispatch(updateDestinationPriority({ current, data: 'high' }));
  const handleChangePriorityMedium = () =>
    dispatch(updateDestinationPriority({ current, data: 'med' }));
  const handleChangePriorityLow = () =>
    dispatch(updateDestinationPriority({ current, data: 'low' }));
  const handleChangeRequestStorageCommitmentYes = () =>
    dispatch(updateDestinationStgcmt({ current, data: true }));
  const handleChangeRequestStorageCommitmentNo = () =>
    dispatch(updateDestinationStgcmt({ current, data: false }));
  const handleChangeUsername = (event: FocusEvent<HTMLInputElement>) =>
    dispatch(updateDestinationUsername({ current, data: event.target.value }));
  const handleChangePasscode = (event: FocusEvent<HTMLInputElement>) =>
    dispatch(updateDestinationPasscode({ current, data: event.target.value }));
  const handleChangeUserIdentityResponseYes = () =>
    dispatch(updateDestinationUidnegrsp({ current, data: false }));
  const handleChangeUserIdentityResponseNo = () =>
    dispatch(updateDestinationUidnegrsp({ current, data: true }));
  const handleChangePackPDVYes = () =>
    dispatch(updateDestinationPdv1({ current, data: true }));
  const handleChangePackPDVNo = () =>
    dispatch(updateDestinationPdv1({ current, data: false }));
  const handleChangeRSPIntervalPeriod = (event: FocusEvent<HTMLInputElement>) =>
    dispatch(updateDestinationReaper({ current, data: event.target.value }));
  const handleChangePDUMaxLengthSent = (event: FocusEvent<HTMLInputElement>) =>
    dispatch(updateDestinationSndpdulen({ current, data: event.target.value }));
  const handleChangeReleaseTimeout = (event: FocusEvent<HTMLInputElement>) =>
    dispatch(updateDestinationReleaseTo({ current, data: event.target.value }));
  const handleChangePDUMaxLengthReceived = (
    event: FocusEvent<HTMLInputElement>
  ) =>
    dispatch(updateDestinationRcvpdulen({ current, data: event.target.value }));
  const handleChangeRSPTimeout = (event: FocusEvent<HTMLInputElement>) =>
    dispatch(updateDestinationRspTo({ current, data: event.target.value }));
  const handleChangeSendSocketBufferSize = (
    event: FocusEvent<HTMLInputElement>
  ) =>
    dispatch(updateDestinationSosndbuf({ current, data: event.target.value }));
  const handleChangeShutdownDelay = (event: FocusEvent<HTMLInputElement>) =>
    dispatch(
      updateDestinationShutdownDelay({
        current,
        data: event.target.value
      })
    );
  const handleChangeReceiveSocketBufferSize = (
    event: FocusEvent<HTMLInputElement>
  ) =>
    dispatch(updateDestinationSorcvbuf({ current, data: event.target.value }));
  const handleChangeSocketCloseDelay = (event: FocusEvent<HTMLInputElement>) =>
    dispatch(
      updateDestinationSoCloseDelay({
        current,
        data: event.target.value
      })
    );
  const handleChangeBufferSize = (event: FocusEvent<HTMLInputElement>) =>
    dispatch(updateDestinationBufSize({ current, data: event.target.value }));
  const handleChangeAcceptTimeout = (event: FocusEvent<HTMLInputElement>) =>
    dispatch(updateDestinationAcceptTo({ current, data: event.target.value }));
  const handleChangeConnectTimeout = (event: FocusEvent<HTMLInputElement>) =>
    dispatch(updateDestinationConnectTo({ current, data: event.target.value }));
  const handleChangeTcpDelayYes = () =>
    dispatch(updateDestinationTcpDelay({ current, data: true }));
  const handleChangeTcpDelayNo = () =>
    dispatch(updateDestinationTcpDelay({ current, data: false }));
  const handleChangePresentationSyntaxYes = () =>
    dispatch(updateDestinationTs1({ current, data: true }));
  const handleChangePresentationSyntaxNo = () =>
    dispatch(updateDestinationTs1({ current, data: false }));
  const handleChangeTLS3DES = () =>
    dispatch(updateDestinationTls({ current, data: '2des' }));
  const handleChangeTLSAES = () =>
    dispatch(updateDestinationTls({ current, data: 'aes' }));
  const handleChangeTLSWithout = () =>
    dispatch(updateDestinationTls({ current, data: 'without' }));
  const handleChangeTLSNoTLS = () =>
    dispatch(updateDestinationTls({ current, data: 'notls' }));
  const handleChangeClientAuthenticationYes = () =>
    dispatch(updateDestinationNoClientAuth({ current, data: true }));
  const handleChangeClientAuthenticationNo = () =>
    dispatch(updateDestinationNoClientAuth({ current, data: false }));
  const handleChangeSSLHandshakeYes = () =>
    dispatch(updateDestinationNossl2({ current, data: false }));
  const handleChangeSSLHandshakeNo = () =>
    dispatch(updateDestinationNossl2({ current, data: true }));
  const handleChangeKeystore = (event: FocusEvent<HTMLInputElement>) =>
    dispatch(updateDestinationKeyStore({ current, data: event.target.value }));
  const handleChangeKeystorePW = (event: FocusEvent<HTMLInputElement>) =>
    dispatch(
      updateDestinationKeyStorePW({
        current,
        data: event.target.value
      })
    );
  const handleChangeTruststore = (event: FocusEvent<HTMLInputElement>) =>
    dispatch(
      updateDestinationTrustStore({
        current,
        data: event.target.value
      })
    );
  const handleChangeTruststorePW = (event: FocusEvent<HTMLInputElement>) =>
    dispatch(
      updateDestinationTrustStorePW({
        current,
        data: event.target.value
      })
    );
  const handleChangeKeyPassword = (event: FocusEvent<HTMLInputElement>) =>
    dispatch(updateDestinationKeyPW({ current, data: event.target.value }));
  const handleChangeTemplate = (event: FocusEvent<HTMLTextAreaElement>) =>
    dispatch(updateDestinationTemplate({ current, data: event.target.value }));

  return (
    <div>
      <GroupBox label="DICOM Sender Settings">
        <Grid container rowSpacing={0.5} columnSpacing={2}>
          <Grid item md={2.5}>
            <Typography variant="subtitle1" textAlign="right">
              Remote Host:
            </Typography>
          </Grid>

          <Grid item md={1}>
            <TextField
              defaultValue={settings?.host}
              onBlur={handleChangeRemoteHost}
              fullWidth
            />
          </Grid>

          <Grid item md={2.5}>
            <Typography variant="subtitle1" textAlign="right">
              Local Host:
            </Typography>
          </Grid>

          <Grid item md={1}>
            <TextField
              defaultValue={settings?.localHost}
              onBlur={handleChangeLocalHost}
              fullWidth
            />
          </Grid>

          <Grid item md={5} />

          <Grid item md={2.5}>
            <Typography variant="subtitle1" textAlign="right">
              Remote Port:
            </Typography>
          </Grid>

          <Grid item md={1}>
            <TextField
              defaultValue={settings?.port}
              onBlur={handleChangePort}
              fullWidth
            />
          </Grid>

          <Grid item md={2.5}>
            <Typography variant="subtitle1" textAlign="right">
              Local Port:
            </Typography>
          </Grid>

          <Grid item md={1}>
            <TextField
              defaultValue={settings?.localPort}
              onBlur={handleChangeLocalPort}
              fullWidth
            />
          </Grid>

          <Grid item md={5}>
            {' '}
            <Button variant="contained">Ports in Use</Button>{' '}
          </Grid>

          <Grid item md={2.5}>
            <Typography variant="subtitle1" textAlign="right">
              Remote Application Entity:
            </Typography>
          </Grid>

          <Grid item md={1}>
            <TextField
              defaultValue={settings?.applicationEntity}
              onBlur={handleChangeRemoteApplicationEntity}
              fullWidth
            />
          </Grid>

          <Grid item md={2.5}>
            <Typography variant="subtitle1" textAlign="right">
              Local Application Entity:
            </Typography>
          </Grid>

          <Grid item md={1}>
            <TextField
              defaultValue={settings?.localApplicationEntity}
              onBlur={handleChangeLocalApplicationEntity}
              fullWidth
            />
          </Grid>

          <Grid item md={5} />

          <Grid item md={2.5}>
            <Typography variant="subtitle1" textAlign="right">
              Max Async operations:
            </Typography>
          </Grid>

          <Grid item md={9.5}>
            <TextField
              defaultValue={settings?.async}
              onBlur={handleChangeMaxAsyncOperations}
            />
          </Grid>

          <Grid item md={2.5}>
            <Typography variant="subtitle1" textAlign="right">
              Priority:
            </Typography>
          </Grid>

          <Grid item md={9.5}>
            <FormControlLabel
              label="High"
              labelPlacement="end"
              control={
                <Radio
                  checked={settings?.priority === 'high'}
                  onClick={handleChangePriorityHigh}
                />
              }
            />

            <FormControlLabel
              label="Medium"
              labelPlacement="end"
              control={
                <Radio
                  checked={settings?.priority === 'med'}
                  onClick={handleChangePriorityMedium}
                />
              }
            />

            <FormControlLabel
              label="Low"
              labelPlacement="end"
              control={
                <Radio
                  checked={settings?.priority === 'low'}
                  onClick={handleChangePriorityLow}
                />
              }
            />
          </Grid>

          <Grid item md={2.5}>
            <Typography variant="subtitle1" textAlign="right">
              Request Storage Commitment:
            </Typography>
          </Grid>

          <Grid item md={9.5}>
            <FormControlLabel
              label="Yes"
              labelPlacement="end"
              control={
                <Radio
                  checked={settings?.stgcmt === true}
                  onClick={handleChangeRequestStorageCommitmentYes}
                />
              }
            />

            <FormControlLabel
              label="No"
              labelPlacement="end"
              control={
                <Radio
                  checked={settings?.stgcmt === false}
                  onClick={handleChangeRequestStorageCommitmentNo}
                />
              }
            />
          </Grid>

          <Grid item md={2.5}>
            <Typography variant="subtitle1" textAlign="right">
              User Name:
            </Typography>
          </Grid>

          <Grid item md={9.5}>
            <TextField
              defaultValue={settings?.username}
              onBlur={handleChangeUsername}
            />
          </Grid>

          <Grid item md={2.5}>
            <Typography variant="subtitle1" textAlign="right">
              Pass Code:
            </Typography>
          </Grid>

          <Grid item md={9.5}>
            <TextField
              defaultValue={settings?.passcode}
              onBlur={handleChangePasscode}
            />
          </Grid>

          <Grid item md={2.5}>
            <Typography variant="subtitle1" textAlign="right">
              Request Positive User Identity Response:
            </Typography>
          </Grid>

          <Grid item md={9.5}>
            <FormControlLabel
              label="Yes"
              labelPlacement="end"
              control={
                <Radio
                  checked={settings?.uidnegrsp === false}
                  onClick={handleChangeUserIdentityResponseYes}
                />
              }
            />

            <FormControlLabel
              label="No"
              labelPlacement="end"
              control={
                <Radio
                  checked={settings?.uidnegrsp === true}
                  onClick={handleChangeUserIdentityResponseNo}
                />
              }
            />
          </Grid>

          <Grid item md={2.5}>
            <Typography variant="subtitle1" textAlign="right">
              Pack PDV:
            </Typography>
          </Grid>

          <Grid item md={9.5}>
            <FormControlLabel
              label="Yes"
              labelPlacement="end"
              control={
                <Radio
                  checked={settings?.pdv1 === true}
                  onClick={handleChangePackPDVYes}
                />
              }
            />

            <FormControlLabel
              label="No"
              labelPlacement="end"
              control={
                <Radio
                  checked={settings?.pdv1 === false}
                  onClick={handleChangePackPDVNo}
                />
              }
            />
          </Grid>

          <Grid item md={2.5}>
            <Typography variant="subtitle1" textAlign="right">
              DIMSE-RSP interval period (s):
            </Typography>
          </Grid>

          <Grid item md={1}>
            <TextField
              defaultValue={settings?.reaper}
              onBlur={handleChangeRSPIntervalPeriod}
              fullWidth
            />
          </Grid>

          <Grid item md={2.5}>
            <Typography variant="subtitle1" textAlign="right">
              P-DATA-TF PDUs max length sent (KB):
            </Typography>
          </Grid>

          <Grid item md={1}>
            <TextField
              defaultValue={settings?.sndpdulen}
              onBlur={handleChangePDUMaxLengthSent}
              fullWidth
            />
          </Grid>

          <Grid item md={5} />

          <Grid item md={2.5}>
            <Typography variant="subtitle1" textAlign="right">
              A-RELEASE-RP timeout (s):
            </Typography>
          </Grid>

          <Grid item md={1}>
            <TextField
              defaultValue={settings?.releaseTo}
              onBlur={handleChangeReleaseTimeout}
              fullWidth
            />
          </Grid>

          <Grid item md={2.5}>
            <Typography variant="subtitle1" textAlign="right">
              P-DATA-TF PDUs max length received (KB):
            </Typography>
          </Grid>

          <Grid item md={1}>
            <TextField
              defaultValue={settings?.rcvpdulen}
              onBlur={handleChangePDUMaxLengthReceived}
              fullWidth
            />
          </Grid>

          <Grid item md={5} />

          <Grid item md={2.5}>
            <Typography variant="subtitle1" textAlign="right">
              DIMSE-RSP timeout (s):
            </Typography>
          </Grid>

          <Grid item md={9.5}>
            <TextField
              defaultValue={settings?.rspTo}
              onBlur={handleChangeRSPTimeout}
            />
          </Grid>

          <Grid item md={2.5}>
            <Typography variant="subtitle1" textAlign="right">
              Send Socket Buffer Size (KB):
            </Typography>
          </Grid>

          <Grid item md={9.5}>
            <TextField
              defaultValue={settings?.sosndbuf}
              onBlur={handleChangeSendSocketBufferSize}
            />
          </Grid>

          <Grid item md={2.5}>
            <Typography variant="subtitle1" textAlign="right">
              Shutdown delay (ms):
            </Typography>
          </Grid>

          <Grid item md={1}>
            <TextField
              defaultValue={settings?.shutdownDelay}
              onBlur={handleChangeShutdownDelay}
              fullWidth
            />
          </Grid>

          <Grid item md={2.5}>
            <Typography variant="subtitle1" textAlign="right">
              Receive Socket Buffer Size (KB):
            </Typography>
          </Grid>

          <Grid item md={1}>
            <TextField
              defaultValue={settings?.sorcvbuf}
              onBlur={handleChangeReceiveSocketBufferSize}
              fullWidth
            />
          </Grid>

          <Grid item md={5} />

          <Grid item md={2.5}>
            <Typography variant="subtitle1" textAlign="right">
              Socket Close Delay After A-ABORT (ms):
            </Typography>
          </Grid>

          <Grid item md={1}>
            <TextField
              defaultValue={settings?.soCloseDelay}
              onBlur={handleChangeSocketCloseDelay}
              fullWidth
            />
          </Grid>

          <Grid item md={2.5}>
            <Typography variant="subtitle1" textAlign="right">
              Transcoder Buffer Size (KB):
            </Typography>
          </Grid>

          <Grid item md={1}>
            <TextField
              defaultValue={settings?.bufSize}
              onBlur={handleChangeBufferSize}
              fullWidth
            />
          </Grid>

          <Grid item md={5} />

          <Grid item md={2.5}>
            <Typography variant="subtitle1" textAlign="right">
              Timeout A-ASSOCIATE-AC (ms):
            </Typography>
          </Grid>

          <Grid item md={9.5}>
            <TextField
              defaultValue={settings?.acceptTo}
              onBlur={handleChangeAcceptTimeout}
            />
          </Grid>

          <Grid item md={2.5}>
            <Typography variant="subtitle1" textAlign="right">
              TCP Connection Timeout (ms):
            </Typography>
          </Grid>

          <Grid item md={9.5}>
            <TextField
              defaultValue={settings?.connectTo}
              onBlur={handleChangeConnectTimeout}
            />
          </Grid>

          <Grid item md={2.5}>
            <Typography variant="subtitle1" textAlign="right">
              TCP Delay:
            </Typography>
          </Grid>

          <Grid item md={9.5}>
            <FormControlLabel
              label="Yes"
              labelPlacement="end"
              control={
                <Radio
                  checked={settings?.tcpDelay === true}
                  onClick={handleChangeTcpDelayYes}
                />
              }
            />

            <FormControlLabel
              label="No"
              labelPlacement="end"
              control={
                <Radio
                  checked={settings?.tcpDelay === false}
                  onClick={handleChangeTcpDelayNo}
                />
              }
            />
          </Grid>

          <Grid item md={2.5}>
            <Typography variant="subtitle1" textAlign="right">
              Default Presentation Syntax:
            </Typography>
          </Grid>

          <Grid item md={9.5}>
            <FormControlLabel
              label="Yes"
              labelPlacement="end"
              control={
                <Radio
                  checked={settings?.ts1 === true}
                  onClick={handleChangePresentationSyntaxYes}
                />
              }
            />

            <FormControlLabel
              label="No"
              labelPlacement="end"
              control={
                <Radio
                  checked={settings?.ts1 === false}
                  onClick={handleChangePresentationSyntaxNo}
                />
              }
            />
          </Grid>

          <Grid item md={2.5}>
            <Typography variant="subtitle1" textAlign="right">
              TLS:
            </Typography>
          </Grid>

          <Grid item md={9.5}>
            <FormControlLabel
              label="3DES"
              labelPlacement="end"
              control={
                <Radio
                  checked={settings?.tls === '3des'}
                  onClick={handleChangeTLS3DES}
                />
              }
            />

            <FormControlLabel
              label="AES"
              labelPlacement="end"
              control={
                <Radio
                  checked={settings?.tls === 'aes'}
                  onClick={handleChangeTLSAES}
                />
              }
            />

            <FormControlLabel
              label="Without"
              labelPlacement="end"
              control={
                <Radio
                  checked={settings?.tls === 'without'}
                  onClick={handleChangeTLSWithout}
                />
              }
            />

            <FormControlLabel
              label="No TLS"
              labelPlacement="end"
              control={
                <Radio
                  checked={settings?.tls === 'notls'}
                  onClick={handleChangeTLSNoTLS}
                />
              }
            />
          </Grid>

          <Grid item md={2.5}>
            <Typography variant="subtitle1" textAlign="right">
              Client Authentication TLS:
            </Typography>
          </Grid>

          <Grid item md={9.5}>
            <FormControlLabel
              label="Yes"
              labelPlacement="end"
              control={
                <Radio
                  checked={settings?.noClientAuth === false}
                  onClick={handleChangeClientAuthenticationYes}
                />
              }
              disabled={settings?.tls === 'notls'}
            />

            <FormControlLabel
              label="No"
              labelPlacement="end"
              control={
                <Radio
                  checked={settings?.noClientAuth === true}
                  onClick={handleChangeClientAuthenticationNo}
                />
              }
              disabled={settings?.tls === 'notls'}
            />
          </Grid>

          <Grid item md={2.5}>
            <Typography variant="subtitle1" textAlign="right">
              Accept ssl v2 TLS handshake:
            </Typography>
          </Grid>

          <Grid item md={9.5}>
            <FormControlLabel
              label="Yes"
              labelPlacement="end"
              control={
                <Radio
                  checked={settings?.nossl2 === false}
                  onClick={handleChangeSSLHandshakeYes}
                />
              }
              disabled={settings?.tls === 'notls'}
            />

            <FormControlLabel
              label="No"
              labelPlacement="end"
              control={
                <Radio
                  checked={settings?.nossl2 === true}
                  onClick={handleChangeSSLHandshakeNo}
                />
              }
              disabled={settings?.tls === 'notls'}
            />
          </Grid>

          <Grid item md={2.5}>
            <Typography variant="subtitle1" textAlign="right">
              Keystore:
            </Typography>
          </Grid>

          <Grid item md={1}>
            <TextField
              defaultValue={settings?.keyStore}
              onBlur={handleChangeKeystore}
              disabled={settings?.tls === 'notls'}
              fullWidth
            />
          </Grid>

          <Grid item md={2.5}>
            <Typography variant="subtitle1" textAlign="right">
              Keystore Password:
            </Typography>
          </Grid>

          <Grid item md={1}>
            <TextField
              defaultValue={settings?.keyStorePW}
              onBlur={handleChangeKeystorePW}
              disabled={settings?.tls === 'notls'}
              fullWidth
            />
          </Grid>

          <Grid item md={5} />

          <Grid item md={2.5}>
            <Typography variant="subtitle1" textAlign="right">
              Truststore:
            </Typography>
          </Grid>

          <Grid item md={1}>
            <TextField
              defaultValue={settings?.trustStore}
              onBlur={handleChangeTruststore}
              disabled={settings?.tls === 'notls'}
              fullWidth
            />
          </Grid>

          <Grid item md={2.5}>
            <Typography variant="subtitle1" textAlign="right">
              Truststore Password:
            </Typography>
          </Grid>

          <Grid item md={1}>
            <TextField
              defaultValue={settings?.trustStorePW}
              onBlur={handleChangeTruststorePW}
              disabled={settings?.tls === 'notls'}
              fullWidth
            />
          </Grid>

          <Grid item md={5} />

          <Grid item md={2.5}>
            <Typography variant="subtitle1" textAlign="right">
              Key Password:
            </Typography>
          </Grid>

          <Grid item md={9.5}>
            <TextField
              defaultValue={settings?.keyPW}
              onBlur={handleChangeKeyPassword}
              disabled={settings?.tls === 'notls'}
            />
          </Grid>

          <Grid item md={2.5}>
            <Typography variant="subtitle1" textAlign="right">
              Template:
            </Typography>
          </Grid>

          <Grid item md={9.5}>
            <TextareaAutosize
              defaultValue={settings?.template}
              onBlur={handleChangeTemplate}
              style={{ width: '100%' }}
              minRows={5}
              maxRows={5}
            />
          </Grid>
        </Grid>
      </GroupBox>
    </div>
  );
};

export default DICOMSenderSettings;
