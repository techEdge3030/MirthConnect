import {
  Button,
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

import { GroupBox, MirthSelect, SettingsButton } from '../../../../components';
import type { RootState } from '../../../../states';
import {
  updateAfterProcessingAction,
  updateAnonymous,
  updateBinary,
  updateCharsetEncoding,
  updateCheckFileAge,
  updateDirectoryRecursion,
  updateErrorMoveToDirectory,
  updateErrorMoveToFileName,
  updateErrorReadingAction,
  updateErrorResponseAction,
  updateFileAge,
  updateFileFilter,
  updateFileSizeMaximum,
  updateFileSizeMinimum,
  updateHost,
  updateIgnoreDot,
  updateIgnoreFileSizeMaximum,
  updateMoveToDirectory,
  updateMoveToFileName,
  updatePassive,
  updatePassword,
  updateRegex,
  updateScheme,
  updateSecure,
  updateSortBy,
  updateTimeout,
  updateUsername,
  updateValidateConnection
} from '../../../../states/channelReducer';
import { ENCODING_TYPES, SCHEMAS } from '../../EditChannelView.constant';
import {
  AFTER_PROCESSING_ACTION,
  ERROR_READING_ACTION,
  ERROR_RESPONSE_ACTION,
  SORT_BY
} from './FileReaderSettingsView.constant';

const FileReaderSettingsView = () => {
  const settings = useSelector(
    (state: RootState) => state.channels.channel.sourceConnector.properties
  );
  const dispatch = useDispatch();
  const advanceOption = useMemo(() => {
    switch (settings.scheme) {
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
  }, [settings.scheme]);
  const hostLabel = useMemo(() => {
    switch (settings.scheme) {
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
  }, [settings.scheme]);
  const usernameLabel = useMemo(
    () =>
      settings.scheme === 'AMAZON S3' ? 'AWS Access Key ID:' : 'Username:',
    [settings.scheme]
  );
  const passwordLabel = useMemo(
    () =>
      settings.scheme === 'AMAZON S3' ? 'AWS Secret Access Key:' : 'Password:',
    [settings.scheme]
  );

  const handleChangeSchema = (value: string) => dispatch(updateScheme(value));
  const handleChangeHost = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => dispatch(updateHost(event.target.value));
  const handleChangeFileFilter = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => dispatch(updateFileFilter(event.target.value));
  const handleChangeRegex = () => dispatch(updateRegex(!settings.regex));
  const handleChangeDirectoryRecursionYes = () =>
    dispatch(updateDirectoryRecursion(true));
  const handleChangeDirectoryRecursionNo = () =>
    dispatch(updateDirectoryRecursion(false));
  const handleChangeIgnoreDotYes = () => dispatch(updateIgnoreDot(true));
  const handleChangeIgnoreDotNo = () => dispatch(updateIgnoreDot(false));
  const handleChangeAnonymousYes = () => dispatch(updateAnonymous(true));
  const handleChangeAnonymousNo = () => dispatch(updateAnonymous(false));
  const handleChangeUsername = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => dispatch(updateUsername(event.target.value));
  const handleChangePassword = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => dispatch(updatePassword(event.target.value));
  const handleChangeTimeout = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => dispatch(updateTimeout(Number(event.target.value)));
  const handleChangeSecureModeYes = () => dispatch(updateSecure(true));
  const handleChangeSecureModeNo = () => dispatch(updateSecure(false));
  const handleChangePassiveModeYes = () => dispatch(updatePassive(true));
  const handleChangePassiveModeNo = () => dispatch(updatePassive(false));
  const handleChangeValidateConnectionYes = () =>
    dispatch(updateValidateConnection(true));
  const handleChangeValidateConnectionNo = () =>
    dispatch(updateValidateConnection(false));
  const handleChangeAfterProcessingAction = (value: string) =>
    dispatch(updateAfterProcessingAction(value));
  const handleChangeMoveToDiectory = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => dispatch(updateMoveToDirectory(event.target.value));
  const handleChangeMoveToFileName = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => dispatch(updateMoveToFileName(event.target.value));
  const handleChangeErrorReadingAction = (value: string) =>
    dispatch(updateErrorReadingAction(value));
  const handleChangeErrorResponseAction = (value: string) =>
    dispatch(updateErrorResponseAction(value));
  const handleChangeErrorMoveToDirectory = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => dispatch(updateErrorMoveToDirectory(event.target.value));
  const handleChangeErrorMoveToFileName = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => dispatch(updateErrorMoveToFileName(event.target.value));
  const handleChangeCheckFileAgeYes = () => dispatch(updateCheckFileAge(true));
  const handleChangeCheckFileAgeNo = () => dispatch(updateCheckFileAge(false));
  const handleChangeFileAge = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => dispatch(updateFileAge(Number(event.target.value)));
  const handleChangeFileSizeMinimum = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => dispatch(updateFileSizeMinimum(Number(event.target.value)));
  const handleChangeFileSizeMaximum = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => dispatch(updateFileSizeMaximum(Number(event.target.value)));
  const handleChangeIgnoreFilesizeMximum = () =>
    dispatch(updateIgnoreFileSizeMaximum(!settings.ignoreFileSizeMaximum));
  const handleChangeSortBy = (value: string) => dispatch(updateSortBy(value));
  const handleChangeFileTypeBinary = () => dispatch(updateBinary(true));
  const handleChangeFileTypeText = () => dispatch(updateBinary(false));
  const handleChangeEncoding = (value: string) =>
    dispatch(updateCharsetEncoding(value));

  return (
    <div>
      <GroupBox label="File Reader Settings">
        <Grid
          container
          direction="row"
          rowSpacing={0.5}
          columnSpacing={2}
          alignItems="center"
        >
          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Method :
            </Typography>
          </Grid>

          <Grid item md={1}>
            <MirthSelect
              value={settings.scheme}
              items={SCHEMAS}
              fullWdith
              onChange={handleChangeSchema}
            />
          </Grid>

          <Grid item md={1}>
            <Button variant="contained" fullWidth>
              Test Read
            </Button>
          </Grid>

          <Grid item md={8.5}>
            <SettingsButton
              disabled={
                settings.scheme === 'FILE' || settings.scheme === 'WEBDAV'
              }
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Advanced Options:{' '}
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            {' '}
            {advanceOption}{' '}
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              {hostLabel}
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <TextField value={settings.host} onChange={handleChangeHost} />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Filename Filter Pattern:
            </Typography>
          </Grid>

          <Grid item md={1}>
            <TextField
              value={settings.fileFilter}
              onChange={handleChangeFileFilter}
              fullWidth
            />
          </Grid>

          <Grid item md={9.5}>
            <FormControlLabel
              label="Regular Expression"
              labelPlacement="end"
              control={
                <Checkbox
                  checked={settings.regex}
                  onClick={handleChangeRegex}
                />
              }
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Include All Subdirectories:
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <FormControlLabel
              label="Yes"
              labelPlacement="end"
              control={
                <Radio
                  checked={settings.directoryRecursion}
                  onClick={handleChangeDirectoryRecursionYes}
                />
              }
            />
            <FormControlLabel
              label="No"
              labelPlacement="end"
              control={
                <Radio
                  checked={!settings.directoryRecursion}
                  onClick={handleChangeDirectoryRecursionNo}
                />
              }
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Ignore . files:
            </Typography>
          </Grid>
          <Grid item md={10.5}>
            <FormControlLabel
              label="Yes"
              labelPlacement="end"
              control={
                <Radio
                  checked={settings.ignoreDot}
                  onClick={handleChangeIgnoreDotYes}
                />
              }
            />
            <FormControlLabel
              label="No"
              labelPlacement="end"
              control={
                <Radio
                  checked={!settings.ignoreDot}
                  onClick={handleChangeIgnoreDotNo}
                />
              }
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
                  checked={settings.anonymous}
                  onClick={handleChangeAnonymousYes}
                />
              }
              disabled={
                settings.scheme === 'FILE' ||
                settings.scheme === 'SFTP' ||
                settings.scheme === 'SMB'
              }
            />
            <FormControlLabel
              label="No"
              labelPlacement="end"
              control={
                <Radio
                  checked={!settings.anonymous}
                  onClick={handleChangeAnonymousNo}
                  disabled={
                    settings.scheme === 'FILE' ||
                    settings.scheme === 'SFTP' ||
                    settings.scheme === 'SMB'
                  }
                />
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
              value={settings.username}
              onChange={handleChangeUsername}
              disabled={
                settings.scheme === 'FILE' ||
                settings.scheme === 'FTP' ||
                (settings.scheme === 'AMAZON S3' && settings.anonymous)
              }
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              {passwordLabel}
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <TextField
              value={settings.password}
              onChange={handleChangePassword}
              disabled={
                settings.scheme === 'FILE' ||
                settings.scheme === 'FTP' ||
                (settings.scheme === 'AMAZON S3' && settings.anonymous)
              }
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Timeout (ms):
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <TextField
              value={settings.timeout}
              onChange={handleChangeTimeout}
              disabled={
                settings.scheme === 'FILE' || settings.scheme === 'WEBDAV'
              }
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
                  checked={settings.secure}
                  onChange={handleChangeSecureModeYes}
                  disabled={settings.scheme !== 'WEBDAV'}
                />
              }
            />
            <FormControlLabel
              label="No"
              labelPlacement="end"
              control={
                <Radio
                  checked={!settings.secure}
                  onChange={handleChangeSecureModeNo}
                  disabled={settings.scheme !== 'WEBDAV'}
                />
              }
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
                  checked={settings.passive}
                  onChange={handleChangePassiveModeYes}
                  disabled={settings.scheme !== 'FTP'}
                />
              }
            />
            <FormControlLabel
              label="No"
              labelPlacement="end"
              control={
                <Radio
                  checked={!settings.passive}
                  onChange={handleChangePassiveModeNo}
                  disabled={settings.scheme !== 'FTP'}
                />
              }
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
                  checked={settings.validateConnection}
                  onChange={handleChangeValidateConnectionYes}
                  disabled={settings.scheme !== 'FTP'}
                />
              }
            />
            <FormControlLabel
              label="No"
              labelPlacement="end"
              control={
                <Radio
                  checked={!settings.validateConnection}
                  onChange={handleChangeValidateConnectionNo}
                  disabled={settings.scheme !== 'FTP'}
                />
              }
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              After Processing Action:
            </Typography>
          </Grid>

          <Grid item md={1}>
            <MirthSelect
              value={settings.afterProcessingAction!}
              items={AFTER_PROCESSING_ACTION}
              onChange={handleChangeAfterProcessingAction}
              fullWdith
            />
          </Grid>

          <Grid item md={9.5} />

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Move-to Directory:
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <TextField
              value={settings.moveToDirectory}
              onChange={handleChangeMoveToDiectory}
              disabled={settings.afterProcessingAction !== 'MOVE'}
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Move-to File Name:
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <TextField
              value={settings.moveToFileName}
              onChange={handleChangeMoveToFileName}
              disabled={settings.afterProcessingAction !== 'MOVE'}
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Error Reading Action:
            </Typography>
          </Grid>

          <Grid item md={1}>
            <MirthSelect
              value={settings.errorReadingAction}
              items={ERROR_READING_ACTION}
              onChange={handleChangeErrorReadingAction}
              fullWdith
            />
          </Grid>

          <Grid item md={9.5} />

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Error Response Action:
            </Typography>
          </Grid>

          <Grid item md={1}>
            <MirthSelect
              value={settings.errorResponseAction}
              items={ERROR_RESPONSE_ACTION}
              onChange={handleChangeErrorResponseAction}
              fullWdith
            />
          </Grid>

          <Grid item md={9.5} />

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Error Move-to Directory:
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <TextField
              value={settings.errorMoveToDirectory}
              onChange={handleChangeErrorMoveToDirectory}
              disabled={settings.errorMoveToDirectory !== 'MOVE'}
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Error Move-to File Name:
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <TextField
              value={settings.errorMoveToFileName}
              onChange={handleChangeErrorMoveToFileName}
              disabled={settings.errorMoveToFileName !== 'MOVE'}
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Check File Age:
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <FormControlLabel
              label="Yes"
              labelPlacement="end"
              control={
                <Radio
                  checked={settings.checkFileAge}
                  onClick={handleChangeCheckFileAgeYes}
                />
              }
            />
            <FormControlLabel
              label="No"
              labelPlacement="end"
              control={
                <Radio
                  checked={!settings.checkFileAge}
                  onClick={handleChangeCheckFileAgeNo}
                />
              }
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              File Age (ms):
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <TextField
              value={settings.fileAge}
              onChange={handleChangeFileAge}
              disabled={!settings.checkFileAge}
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              File Size (bytes):
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <TextField
              value={settings.fileSizeMinimum}
              onChange={handleChangeFileSizeMinimum}
            />
            {' - '}
            <TextField
              value={settings.fileSizeMaximum}
              onChange={handleChangeFileSizeMaximum}
              disabled={settings.ignoreFileSizeMaximum}
            />
            <FormControlLabel
              label="Ignore Maximum"
              labelPlacement="end"
              style={{ marginLeft: '10px' }}
              control={
                <Checkbox
                  checked={!settings.ignoreFileSizeMaximum}
                  onClick={handleChangeIgnoreFilesizeMximum}
                />
              }
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Sort Files By:
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <MirthSelect
              value={settings.sortBy}
              onChange={handleChangeSortBy}
              items={SORT_BY}
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
                  checked={settings.binary}
                  onClick={handleChangeFileTypeBinary}
                />
              }
            />
            <FormControlLabel
              label="Text"
              labelPlacement="end"
              control={
                <Radio
                  checked={!settings.binary}
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
              value={settings.charsetEncoding}
              onChange={handleChangeEncoding}
              items={ENCODING_TYPES}
            />
          </Grid>
        </Grid>
      </GroupBox>
    </div>
  );
};

export default FileReaderSettingsView;
