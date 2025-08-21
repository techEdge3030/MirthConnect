import {
  FormControlLabel,
  Grid,
  Radio,
  TextField,
  Typography
} from '@mui/material';
import type { ChangeEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { GroupBox } from '../../../../components';
import type { RootState } from '../../../../states';
import {
  updateApplicationEntity,
  updateBigEndian,
  updateClientAuthentication,
  updateDefaultTransferSyntax,
  updateDIMSEIntervalPeriod,
  updateIdelTimeout,
  updateKeyPassword,
  updateKeyStore,
  updateKeyStorePassword,
  updateMaxAsyncOperations,
  updateNativeData,
  updatePackPDV,
  updateReceivePDULen,
  updateReleaseTo,
  updateRequestTimeout,
  updateRspDelay,
  updateSendPDULen,
  updateSocketCloseDelay,
  updateSocketReceiveBuffer,
  updateSocketSendBuffer,
  updateSslHandshake,
  updateStoreObjects,
  updateTcpDelay,
  updateTls,
  updateTranscodeBufferSize,
  updateTrustStore,
  updateTrustStorePassword
} from '../../../../states/channelReducer';

const DicomListenerSettingsView = () => {
  const properties = useSelector(
    (state: RootState) => state.channels.channel.sourceConnector.properties
  );
  const dispatch = useDispatch();

  const handleChangeApplicationEntity = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => dispatch(updateApplicationEntity(event.target.value));
  const handleChangeMaxAsyncOperation = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => dispatch(updateMaxAsyncOperations(event.target.value));
  const handlePackPDVYes = () => dispatch(updatePackPDV(true));
  const handlePackPDVNo = () => dispatch(updatePackPDV(false));
  const handleChangeDIMSEIntervalPeriod = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => dispatch(updateDIMSEIntervalPeriod(event.target.value));
  const handleChangeSendPDULen = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => dispatch(updateSendPDULen(event.target.value));
  const handleChangeRelease = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => dispatch(updateReleaseTo(event.target.value));
  const handleChangeReceivePDULen = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => dispatch(updateReceivePDULen(event.target.value));
  const handleChangeSocketCloseDelay = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => dispatch(updateSocketCloseDelay(event.target.value));
  const handleChangeSocketSendBuffer = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => dispatch(updateSocketSendBuffer(event.target.value));
  const handleChangeRequestTimeout = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => dispatch(updateRequestTimeout(event.target.value));
  const handleChangeSocketReceiveBuffer = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => dispatch(updateSocketReceiveBuffer(event.target.value));
  const handleChangeIdelTimeout = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => dispatch(updateIdelTimeout(event.target.value));
  const handleChangeTranscodeBufferSize = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => dispatch(updateTranscodeBufferSize(event.target.value));
  const handleChangeRspDelay = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => dispatch(updateRspDelay(event.target.value));
  const handleBigEndianYes = () => dispatch(updateBigEndian(true));
  const handleBigEndianNo = () => dispatch(updateBigEndian(false));
  const handleDefaultTransferSyntaxYes = () =>
    dispatch(updateDefaultTransferSyntax(true));
  const handleDefaultTransferSyntaxNo = () =>
    dispatch(updateDefaultTransferSyntax(false));
  const handleNativeDataYes = () => dispatch(updateNativeData(true));
  const handleNativeDataNo = () => dispatch(updateNativeData(false));
  const handleTcpDelayYes = () => dispatch(updateTcpDelay(true));
  const handleTcpDelayNo = () => dispatch(updateTcpDelay(false));
  const handleTls3Des = () => dispatch(updateTls('3DES'));
  const handleTlsAES = () => dispatch(updateTls('AES'));
  const handleTlsWithout = () => dispatch(updateTls('Without'));
  const handleTlsNoTls = () => dispatch(updateTls('NoTls'));
  const handleClientAuthenticationYes = () =>
    dispatch(updateClientAuthentication(true));
  const handleClientAuthenticationNo = () =>
    dispatch(updateClientAuthentication(false));
  const handleSslHandshakeYes = () => dispatch(updateSslHandshake(true));
  const handleSslHandshakeNo = () => dispatch(updateSslHandshake(false));
  const handleChangeKeyStore = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => dispatch(updateKeyStore(event.target.value));
  const handleChangeKeyStorePassword = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => dispatch(updateKeyStorePassword(event.target.value));
  const handleChangeTrustStore = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => dispatch(updateTrustStore(event.target.value));
  const handleChangeTrustStorePassword = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => dispatch(updateTrustStorePassword(event.target.value));
  const handleChangeKeyPassword = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => dispatch(updateKeyPassword(event.target.value));
  const handleChangeStoreObjects = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => dispatch(updateStoreObjects(event.target.value));

  return (
    <div>
      <GroupBox label="DICOM Listener Settings">
        <Grid container direction="row" alignItems="center" spacing={1}>
          <Grid item md={2}>
            <Typography variant="subtitle1" textAlign="right">
              {' '}
              Application Entity:{' '}
            </Typography>
          </Grid>

          <Grid item md={1}>
            <TextField
              fullWidth
              value={properties.applicationEntity}
              onChange={handleChangeApplicationEntity}
            />
          </Grid>

          <Grid item md={9} />

          <Grid item md={2}>
            <Typography variant="subtitle1" textAlign="right">
              {' '}
              Max Async operations:{' '}
            </Typography>
          </Grid>

          <Grid item md={1}>
            <TextField
              fullWidth
              value={properties.async}
              onChange={handleChangeMaxAsyncOperation}
            />
          </Grid>

          <Grid item md={9} />

          <Grid item md={2}>
            <Typography variant="subtitle1" textAlign="right">
              {' '}
              Pack PDV:{' '}
            </Typography>
          </Grid>

          <Grid item md={1}>
            <FormControlLabel
              label="Yes"
              labelPlacement="end"
              control={
                <Radio checked={properties.pdv1} onClick={handlePackPDVYes} />
              }
            />
            <FormControlLabel
              label="No"
              labelPlacement="end"
              control={
                <Radio checked={!properties.pdv1} onClick={handlePackPDVNo} />
              }
            />
          </Grid>

          <Grid item md={9} />

          <Grid item md={2}>
            <Typography variant="subtitle1" textAlign="right">
              {' '}
              DIMSE-RSP interval period (s):{' '}
            </Typography>
          </Grid>

          <Grid item md={1}>
            <TextField
              fullWidth
              value={properties.reaper}
              onChange={handleChangeDIMSEIntervalPeriod}
            />
          </Grid>

          <Grid item md={2.2}>
            <Typography variant="subtitle1" textAlign="right">
              {' '}
              P-DATA-TF PDUs max length sent (KB):{' '}
            </Typography>
          </Grid>

          <Grid item md={1}>
            <TextField
              fullWidth
              value={properties.sndpdulen}
              onChange={handleChangeSendPDULen}
            />
          </Grid>

          <Grid item md={5.8} />

          <Grid item md={2}>
            <Typography variant="subtitle1" textAlign="right">
              {' '}
              A-RELEASE-RP timeout (s):{' '}
            </Typography>
          </Grid>

          <Grid item md={1}>
            <TextField
              fullWidth
              value={properties.releaseTo}
              onChange={handleChangeRelease}
            />
          </Grid>

          <Grid item md={2.2}>
            <Typography variant="subtitle1" textAlign="right">
              {' '}
              P-DATA-TF PDUs max length received (KB):{' '}
            </Typography>
          </Grid>

          <Grid item md={1}>
            <TextField
              fullWidth
              value={properties.rcvpdulen}
              onChange={handleChangeReceivePDULen}
            />
          </Grid>

          <Grid item md={5.8} />

          <Grid item md={2}>
            <Typography variant="subtitle1" textAlign="right">
              {' '}
              Socket Close Delay After A-ABORT (ms):{' '}
            </Typography>
          </Grid>

          <Grid item md={1}>
            <TextField
              fullWidth
              value={properties.soCloseDelay}
              onChange={handleChangeSocketCloseDelay}
            />
          </Grid>

          <Grid item md={2.2}>
            <Typography variant="subtitle1" textAlign="right">
              {' '}
              Send Socket Buffer Size (KB):{' '}
            </Typography>
          </Grid>

          <Grid item md={1}>
            <TextField
              fullWidth
              value={properties.sosndbuf}
              onChange={handleChangeSocketSendBuffer}
            />
          </Grid>

          <Grid item md={5.8} />

          <Grid item md={2}>
            <Typography variant="subtitle1" textAlign="right">
              {' '}
              ASSOCIATE-RQ timeout (ms):{' '}
            </Typography>
          </Grid>

          <Grid item md={1}>
            <TextField
              fullWidth
              value={properties.requestTo}
              onChange={handleChangeRequestTimeout}
            />
          </Grid>

          <Grid item md={2.2}>
            <Typography variant="subtitle1" textAlign="right">
              {' '}
              Receive Socket Buffer Size (KB):{' '}
            </Typography>
          </Grid>

          <Grid item md={1}>
            <TextField
              fullWidth
              value={properties.sorcvbuf}
              onChange={handleChangeSocketReceiveBuffer}
            />
          </Grid>

          <Grid item md={5.8} />

          <Grid item md={2}>
            <Typography variant="subtitle1" textAlign="right">
              {' '}
              DIMSE-RQ timeout (ms):{' '}
            </Typography>
          </Grid>

          <Grid item md={1}>
            <TextField
              fullWidth
              value={properties.idleTo}
              onChange={handleChangeIdelTimeout}
            />
          </Grid>

          <Grid item md={2.2}>
            <Typography variant="subtitle1" textAlign="right">
              {' '}
              Transcoder Buffer Size (KB):{' '}
            </Typography>
          </Grid>

          <Grid item md={1}>
            <TextField
              fullWidth
              value={properties.bufSize}
              onChange={handleChangeTranscodeBufferSize}
            />
          </Grid>

          <Grid item md={5.8} />

          <Grid item md={2}>
            <Typography variant="subtitle1" textAlign="right">
              {' '}
              DIMSE-RSP delay (ms):{' '}
            </Typography>
          </Grid>

          <Grid item md={1}>
            <TextField
              fullWidth
              value={properties.rspDelay}
              onChange={handleChangeRspDelay}
            />
          </Grid>

          <Grid item md={9} />

          <Grid item md={2}>
            <Typography variant="subtitle1" textAlign="right">
              {' '}
              Accept Explict VR Big Endian:{' '}
            </Typography>
          </Grid>

          <Grid item md={1}>
            <FormControlLabel
              label="Yes"
              labelPlacement="end"
              control={
                <Radio
                  checked={properties.bigEndian}
                  onClick={handleBigEndianYes}
                />
              }
            />
            <FormControlLabel
              label="No"
              labelPlacement="end"
              control={
                <Radio
                  checked={!properties.bigEndian}
                  onClick={handleBigEndianNo}
                />
              }
            />
          </Grid>

          <Grid item md={9} />

          <Grid item md={2}>
            <Typography variant="subtitle1" textAlign="right">
              {' '}
              Only Accept Default Transfer Syntax:{' '}
            </Typography>
          </Grid>

          <Grid item md={1}>
            <FormControlLabel
              label="Yes"
              labelPlacement="end"
              control={
                <Radio
                  checked={properties.defts}
                  onClick={handleDefaultTransferSyntaxYes}
                />
              }
            />
            <FormControlLabel
              label="No"
              labelPlacement="end"
              control={
                <Radio
                  checked={!properties.defts}
                  onClick={handleDefaultTransferSyntaxNo}
                />
              }
            />
          </Grid>

          <Grid item md={9} />

          <Grid item md={2}>
            <Typography variant="subtitle1" textAlign="right">
              {' '}
              Only Uncompressed Pixel Data:{' '}
            </Typography>
          </Grid>

          <Grid item md={1}>
            <FormControlLabel
              label="Yes"
              labelPlacement="end"
              control={
                <Radio
                  checked={properties.nativeData}
                  onClick={handleNativeDataYes}
                />
              }
            />
            <FormControlLabel
              label="No"
              labelPlacement="end"
              control={
                <Radio
                  checked={!properties.nativeData}
                  onClick={handleNativeDataNo}
                />
              }
            />
          </Grid>

          <Grid item md={9} />

          <Grid item md={2}>
            <Typography variant="subtitle1" textAlign="right">
              {' '}
              TCP Delay:{' '}
            </Typography>
          </Grid>

          <Grid item md={1}>
            <FormControlLabel
              label="Yes"
              labelPlacement="end"
              control={
                <Radio
                  checked={properties.tcpDelay}
                  onClick={handleTcpDelayYes}
                />
              }
            />
            <FormControlLabel
              label="No"
              labelPlacement="end"
              control={
                <Radio
                  checked={!properties.tcpDelay}
                  onClick={handleTcpDelayNo}
                />
              }
            />
          </Grid>

          <Grid item md={9} />

          <Grid item md={2}>
            <Typography variant="subtitle1" textAlign="right">
              {' '}
              Store Received Objects in Directory:{' '}
            </Typography>
          </Grid>

          <Grid item md={2}>
            <TextField
              fullWidth
              value={properties.dest}
              onChange={handleChangeStoreObjects}
            />
          </Grid>

          <Grid item md={8} />

          <Grid item md={2}>
            <Typography variant="subtitle1" textAlign="right">
              {' '}
              TLS:{' '}
            </Typography>
          </Grid>

          <Grid item md={3}>
            <FormControlLabel
              label="3DES"
              labelPlacement="end"
              control={
                <Radio
                  checked={properties.tls === '3DES'}
                  onClick={handleTls3Des}
                />
              }
            />
            <FormControlLabel
              label="AES"
              labelPlacement="end"
              control={
                <Radio
                  checked={properties.tls === 'AES'}
                  onClick={handleTlsAES}
                />
              }
            />
            <FormControlLabel
              label="Without"
              labelPlacement="end"
              control={
                <Radio
                  checked={properties.tls === 'Without'}
                  onClick={handleTlsWithout}
                />
              }
            />
            <FormControlLabel
              label="No TLS"
              labelPlacement="end"
              control={
                <Radio
                  checked={properties.tls === 'No TLS'}
                  onClick={handleTlsNoTls}
                />
              }
            />
          </Grid>

          <Grid item md={7} />

          <Grid item md={2}>
            <Typography variant="subtitle1" textAlign="right">
              {' '}
              Client Authentication TLS:{' '}
            </Typography>
          </Grid>

          <Grid item md={1}>
            <FormControlLabel
              label="Yes"
              labelPlacement="end"
              control={
                <Radio
                  checked={properties.noClientAuth}
                  onClick={handleClientAuthenticationYes}
                />
              }
            />
            <FormControlLabel
              label="No"
              labelPlacement="end"
              control={
                <Radio
                  checked={!properties.noClientAuth}
                  onClick={handleClientAuthenticationNo}
                />
              }
            />
          </Grid>

          <Grid item md={9} />

          <Grid item md={2}>
            <Typography variant="subtitle1" textAlign="right">
              {' '}
              Accept ssl v2 TLS handshake:{' '}
            </Typography>
          </Grid>

          <Grid item md={1}>
            <FormControlLabel
              label="Yes"
              labelPlacement="end"
              control={
                <Radio
                  checked={properties.nossl2}
                  onClick={handleSslHandshakeYes}
                />
              }
            />
            <FormControlLabel
              label="No"
              labelPlacement="end"
              control={
                <Radio
                  checked={!properties.nossl2}
                  onClick={handleSslHandshakeNo}
                />
              }
            />
          </Grid>

          <Grid item md={9} />

          <Grid item md={2}>
            <Typography variant="subtitle1" textAlign="right">
              {' '}
              Keystore:{' '}
            </Typography>
          </Grid>

          <Grid item md={2}>
            <TextField
              fullWidth
              value={properties.keyStore}
              onChange={handleChangeKeyStore}
            />
          </Grid>

          <Grid item md={1.2}>
            <Typography variant="subtitle1" textAlign="right">
              {' '}
              Keystore Password:{' '}
            </Typography>
          </Grid>

          <Grid item md={1}>
            <TextField
              fullWidth
              value={properties.keyStorePW}
              onChange={handleChangeKeyStorePassword}
            />
          </Grid>

          <Grid item md={5.8} />

          <Grid item md={2}>
            <Typography variant="subtitle1" textAlign="right">
              {' '}
              Trust Store:{' '}
            </Typography>
          </Grid>

          <Grid item md={2}>
            <TextField
              fullWidth
              value={properties.trustStore}
              onChange={handleChangeTrustStore}
            />
          </Grid>

          <Grid item md={1.2}>
            <Typography variant="subtitle1" textAlign="right">
              {' '}
              Trust Store Password:{' '}
            </Typography>
          </Grid>

          <Grid item md={1}>
            <TextField
              fullWidth
              value={properties.trustStorePW}
              onChange={handleChangeTrustStorePassword}
            />
          </Grid>

          <Grid item md={5.8} />

          <Grid item md={2}>
            <Typography variant="subtitle1" textAlign="right">
              {' '}
              Key Password:{' '}
            </Typography>
          </Grid>

          <Grid item md={2}>
            <TextField
              fullWidth
              value={properties.keyPW}
              onChange={handleChangeKeyPassword}
            />
          </Grid>

          <Grid item md={8} />
        </Grid>
      </GroupBox>
    </div>
  );
};

export default DicomListenerSettingsView;
