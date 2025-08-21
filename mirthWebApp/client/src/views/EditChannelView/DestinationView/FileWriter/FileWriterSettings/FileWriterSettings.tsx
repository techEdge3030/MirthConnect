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

import {
  GroupBox,
  MirthSelect,
  SettingsButton
} from '../../../../../components';
import {
  updateDestinationAnonymous,
  updateDestinationBinary,
  updateDestinationCharsetEncoding,
  updateDestinationErrorOnExists,
  updateDestinationHost,
  updateDestinationKeepConnectionOpen,
  updateDestinationMaxIdleTime,
  updateDestinationOutputAppend,
  updateDestinationOutputPattern,
  updateDestinationPassive,
  updateDestinationPassword,
  updateDestinationScheme,
  updateDestinationSecure,
  updateDestinationTemplate,
  updateDestinationTemporary,
  updateDestinationTimeout,
  updateDestinationUsername,
  updateDestinationValidateConnection
} from '../../../../../states/channelReducer';
import { ENCODING_TYPES, SCHEMAS } from '../../../EditChannelView.constant';
import type { DestinationSettingsProps } from '../../DestinationView.type';

const FileWriterSettings = ({
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
  const advanceOption = useMemo(() => {
    switch (settings?.scheme) {
      case 'FTP':
        return 'Initial Commands:';
      case 'SFTP':
        return 'Password Authentication / Hostname Checking Ask';
      case 'AMAZON S3':
        return 'Using region us-eas-1, Default Credential Provider Chain';
      case 'SMB':
        return 'Using SMB v2.0.2 - SMB v3.1.1';
      default:
        return '<None>';
    }
  }, [settings?.scheme]);
  const hostLabel = useMemo(() => {
    switch (settings?.scheme) {
      case 'FILE':
        return 'Directory:';
      case 'FTP':
        return 'ftp://';
      case 'SFTP':
        return 'sftp://';
      case 'AMAZON S3':
        return 'S3 Bucket:';
      case 'SMB':
        return 'smb://';
      case 'WEBDAV':
        return 'https://';
      default:
        return '';
    }
  }, [settings?.scheme]);
  const usernameLabel = useMemo(
    () =>
      settings?.scheme === 'AMAZON S3' ? 'AWS Access Key ID:' : 'Username:',
    [settings?.scheme]
  );
  const passwordLabel = useMemo(
    () =>
      settings?.scheme === 'AMAZON S3' ? 'AWS Secret Access Key:' : 'Password:',
    [settings?.scheme]
  );

  const handleChangeScheme = (value: string) =>
    dispatch(updateDestinationScheme({ current, data: value }));
  const handleChangeHost = (event: FocusEvent<HTMLInputElement>) =>
    dispatch(updateDestinationHost({ current, data: event.target.value }));
  const handleChangeOutputPattern = (event: FocusEvent<HTMLInputElement>) =>
    dispatch(
      updateDestinationOutputPattern({
        current,
        data: event.target.value
      })
    );
  const handleChangeAnonymouseYes = () =>
    dispatch(updateDestinationAnonymous({ current, data: true }));
  const handleChangeAnonymouseNo = () =>
    dispatch(updateDestinationAnonymous({ current, data: false }));
  const handleChangeUsername = (event: FocusEvent<HTMLInputElement>) =>
    dispatch(updateDestinationUsername({ current, data: event.target.value }));
  const handleChangePassword = (event: FocusEvent<HTMLInputElement>) =>
    dispatch(updateDestinationPassword({ current, data: event.target.value }));
  const handleChangeTimeout = (event: FocusEvent<HTMLInputElement>) =>
    dispatch(updateDestinationTimeout({ current, data: event.target.value }));
  const handleChangeKeepConnectionOpenYes = () =>
    dispatch(updateDestinationKeepConnectionOpen({ current, data: true }));
  const handleChangeKeepConnectionOpenNO = () =>
    dispatch(updateDestinationKeepConnectionOpen({ current, data: false }));
  const handleChangeMaxIdelTime = (event: FocusEvent<HTMLInputElement>) =>
    dispatch(
      updateDestinationMaxIdleTime({
        current,
        data: event.target.value
      })
    );
  const handleChangeSecureModeYes = () =>
    dispatch(updateDestinationSecure({ current, data: true }));
  const handleChangeSecureModeNo = () =>
    dispatch(updateDestinationSecure({ current, data: false }));
  const handleChangePassiveModeYes = () =>
    dispatch(updateDestinationPassive({ current, data: true }));
  const handleChangePassiveModeNo = () =>
    dispatch(updateDestinationPassive({ current, data: false }));
  const handleChangeValidateConnectionYes = () =>
    dispatch(updateDestinationValidateConnection({ current, data: true }));
  const handleChangeValidateConnectionNo = () =>
    dispatch(updateDestinationValidateConnection({ current, data: false }));
  const handleChangeFileExistsAppend = () => {
    dispatch(updateDestinationOutputAppend({ current, data: true }));
    dispatch(updateDestinationErrorOnExists({ current, data: false }));
  };
  const handleChangeFileExistsOverwrite = () => {
    dispatch(updateDestinationOutputAppend({ current, data: false }));
    dispatch(updateDestinationErrorOnExists({ current, data: false }));
  };
  const handleChangeFileExistsError = () => {
    dispatch(updateDestinationOutputAppend({ current, data: false }));
    dispatch(updateDestinationErrorOnExists({ current, data: true }));
  };
  const handleChangeTempFileYes = () =>
    dispatch(updateDestinationTemporary({ current, data: true }));
  const handleChangeTempFileNo = () =>
    dispatch(updateDestinationTemporary({ current, data: false }));
  const handleChangeFileTypeBinary = () =>
    dispatch(updateDestinationBinary({ current, data: true }));
  const handleChangeFileTypeText = () =>
    dispatch(updateDestinationBinary({ current, data: false }));
  const handleChangeEncoding = (value: string) =>
    dispatch(updateDestinationCharsetEncoding({ current, data: value }));
  const handleChangeTemplate = (event: FocusEvent<HTMLTextAreaElement>) =>
    dispatch(updateDestinationTemplate({ current, data: event.target.value }));

  return (
    <div>
      <GroupBox label="File Writer Settings">
        <Grid container rowSpacing={0.5} columnSpacing={2} alignItems="center">
          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Method:
            </Typography>
          </Grid>

          <Grid item md={1}>
            <MirthSelect
              value={settings?.scheme ?? ''}
              items={SCHEMAS}
              onChange={handleChangeScheme}
              fullWdith
            />
          </Grid>

          <Grid item md={9.5}>
            <Button variant="contained">Test Write</Button>
            <SettingsButton disabled />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Advanced Options:
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            {advanceOption}
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              {hostLabel}
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <TextField value={settings?.host} onBlur={handleChangeHost} />
            {' / '}
            <TextField
              value={settings?.outputPattern}
              onBlur={handleChangeOutputPattern}
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Anonymous:
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <FormControlLabel
              label="Yes"
              labelPlacement="end"
              control={
                <Radio
                  checked={settings?.anonymous}
                  onClick={handleChangeAnonymouseYes}
                />
              }
              disabled={
                settings?.scheme === 'FILE' ||
                settings?.scheme === 'SFTP' ||
                settings?.scheme === 'SMB'
              }
            />
            <FormControlLabel
              label="No"
              labelPlacement="end"
              control={
                <Radio
                  checked={!settings?.anonymous}
                  onClick={handleChangeAnonymouseNo}
                />
              }
              disabled={
                settings?.scheme === 'FILE' ||
                settings?.scheme === 'SFTP' ||
                settings?.scheme === 'SMB'
              }
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              {usernameLabel}
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <TextField
              value={settings?.username}
              onBlur={handleChangeUsername}
              disabled={settings?.anonymous}
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              {passwordLabel}
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <TextField
              value={settings?.password}
              onBlur={handleChangePassword}
              disabled={settings?.anonymous}
              type="password"
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Timeout (ms):
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <TextField
              value={settings?.timeout}
              onBlur={handleChangeTimeout}
              disabled={
                settings?.scheme === 'FILE' || settings?.scheme === 'WEBDAV'
              }
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
                  checked={settings?.keepConnectionOpen}
                  onClick={handleChangeKeepConnectionOpenYes}
                />
              }
              disabled={
                settings?.scheme === 'FILE' ||
                settings?.scheme === 'SFTP' ||
                settings?.scheme === 'SMB'
              }
            />
            <FormControlLabel
              label="No"
              labelPlacement="end"
              control={
                <Radio
                  checked={!settings?.keepConnectionOpen}
                  onClick={handleChangeKeepConnectionOpenNO}
                />
              }
              disabled={
                settings?.scheme === 'FILE' ||
                settings?.scheme === 'SFTP' ||
                settings?.scheme === 'SMB'
              }
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Max Idle Time (ms):
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <TextField
              value={settings?.maxIdleTime}
              onBlur={handleChangeMaxIdelTime}
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Secure Mode:
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <FormControlLabel
              label="Yes"
              labelPlacement="end"
              control={
                <Radio
                  checked={settings?.secure}
                  onClick={handleChangeSecureModeYes}
                />
              }
              disabled={settings?.scheme !== 'WEBDAV'}
            />
            <FormControlLabel
              label="No"
              labelPlacement="end"
              control={
                <Radio
                  checked={!settings?.secure}
                  onClick={handleChangeSecureModeNo}
                />
              }
              disabled={settings?.scheme !== 'WEBDAV'}
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Passive Mode:
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <FormControlLabel
              label="Yes"
              labelPlacement="end"
              control={
                <Radio
                  checked={settings?.passive}
                  onClick={handleChangePassiveModeYes}
                />
              }
              disabled={settings?.scheme !== 'FTP'}
            />
            <FormControlLabel
              label="No"
              labelPlacement="end"
              control={
                <Radio
                  checked={!settings?.passive}
                  onClick={handleChangePassiveModeNo}
                />
              }
              disabled={settings?.scheme !== 'FTP'}
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Validate Connection:
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <FormControlLabel
              label="Yes"
              labelPlacement="end"
              control={
                <Radio
                  checked={settings?.validateConnection}
                  onClick={handleChangeValidateConnectionYes}
                />
              }
              disabled={settings?.scheme !== 'FTP'}
            />
            <FormControlLabel
              label="No"
              labelPlacement="end"
              control={
                <Radio
                  checked={!settings?.validateConnection}
                  onClick={handleChangeValidateConnectionNo}
                />
              }
              disabled={settings?.scheme !== 'FTP'}
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              File Exists:
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <FormControlLabel
              label="Append"
              labelPlacement="end"
              control={
                <Radio
                  checked={settings?.outputAppend}
                  onClick={handleChangeFileExistsAppend}
                />
              }
            />
            <FormControlLabel
              label="Overwrite"
              labelPlacement="end"
              control={
                <Radio
                  checked={!settings?.outputAppend && !settings?.errorOnExists}
                  onClick={handleChangeFileExistsOverwrite}
                />
              }
            />
            <FormControlLabel
              label="Error"
              labelPlacement="end"
              control={
                <Radio
                  checked={settings?.errorOnExists}
                  onClick={handleChangeFileExistsError}
                />
              }
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Create Temp File:
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <FormControlLabel
              label="Yes"
              labelPlacement="end"
              control={
                <Radio
                  checked={settings?.temporary}
                  onClick={handleChangeTempFileYes}
                />
              }
            />
            <FormControlLabel
              label="No"
              labelPlacement="end"
              control={
                <Radio
                  checked={!settings?.temporary}
                  onClick={handleChangeTempFileNo}
                />
              }
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              File Type:
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <FormControlLabel
              label="Binary"
              labelPlacement="end"
              control={
                <Radio
                  checked={settings?.binary}
                  onClick={handleChangeFileTypeBinary}
                />
              }
            />
            <FormControlLabel
              label="Text"
              labelPlacement="end"
              control={
                <Radio
                  checked={!settings?.binary}
                  onClick={handleChangeFileTypeText}
                />
              }
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Encoding:
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <MirthSelect
              value={settings?.charsetEncoding ?? ''}
              items={ENCODING_TYPES}
              onChange={handleChangeEncoding}
            />
          </Grid>

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

export default FileWriterSettings;
