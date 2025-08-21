import {
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

import { GroupBox, MirthSelect, MirthTable } from '../../../../../components';
import {
  updateDestinationAttachmentsVariable,
  updateDestinationAuthentication,
  updateDestinationBody,
  updateDestinationCharsetEncoding,
  updateDestinationEncryption,
  updateDestinationFrom,
  updateDestinationHeadersVariable,
  updateDestinationHtml,
  updateDestinationIsUseAttachmentsVariable,
  updateDestinationIsUseHeadersVariable,
  updateDestinationLocalAddress,
  updateDestinationLocalPort,
  updateDestinationOverrideLocalBinding,
  updateDestinationPassword,
  updateDestinationSmtpHost,
  updateDestinationSmtpPort,
  updateDestinationSubject,
  updateDestinationTimeout,
  updateDestinationTo,
  updateDestinationUsername
} from '../../../../../states/channelReducer';
import type { Column, Row } from '../../../../../types';
import { ENCODING_TYPES } from '../../../EditChannelView.constant';
import type { DestinationSettingsProps } from '../../DestinationView.type';

const SMTPSenderSettings = ({
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
  const headerColumns: Column[] = [
    { id: 'name', title: 'Name' },
    { id: 'value', title: 'Value' }
  ];
  const handerRows: Row[] = useMemo(() => {
    return settings?.headers.entry?.map(
      (h: any) =>
        ({
          id: h.string[0],
          name: { type: 'text', value: h.string[0] },
          value: { type: 'text', value: h.string[1] }
        }) as Row
    );
  }, [settings?.headers.entry]);
  const attachmentColumns: Column[] = [
    { id: 'name', title: 'Name' },
    { id: 'content', title: 'Content' },
    { id: 'mimeType', title: 'MIME type' }
  ];
  const attachmentRows: Row[] = useMemo(() => {
    return (
      settings?.attachments['com.mirth.connect.connectors.smtp.Attachment'].map(
        a =>
          ({
            id: a.name,
            name: { type: 'text', value: a.name },
            content: { type: 'text', value: a.content },
            mimeType: { type: 'text', value: a.mimeType }
          }) as Row
      ) ?? []
    );
  }, [settings?.attachments['com.mirth.connect.connectors.smtp.Attachment']]);

  const handleChangeSmtPHost = (event: FocusEvent<HTMLInputElement>) =>
    dispatch(updateDestinationSmtpHost({ current, data: event.target.value }));
  const handleChangeSmtpPort = (event: FocusEvent<HTMLInputElement>) =>
    dispatch(updateDestinationSmtpPort({ current, data: event.target.value }));
  const handleChangeLocalBindingYes = () =>
    dispatch(updateDestinationOverrideLocalBinding({ current, data: true }));
  const handleChangeLocalBindingNo = () =>
    dispatch(updateDestinationOverrideLocalBinding({ current, data: false }));
  const handleChangeLocalAddress = (event: FocusEvent<HTMLInputElement>) =>
    dispatch(
      updateDestinationLocalAddress({
        current,
        data: event.target.value
      })
    );
  const handleChangeLocalPort = (event: FocusEvent<HTMLInputElement>) =>
    dispatch(updateDestinationLocalPort({ current, data: event.target.value }));
  const handleChangeSendTimeout = (event: FocusEvent<HTMLInputElement>) =>
    dispatch(updateDestinationTimeout({ current, data: event.target.value }));
  const handleChangeEncryptionNone = () =>
    dispatch(updateDestinationEncryption({ current, data: 'none' }));
  const handleChangeEncryptionTLS = () =>
    dispatch(updateDestinationEncryption({ current, data: 'TLS' }));
  const handleChangeEncryptionSSL = () =>
    dispatch(updateDestinationEncryption({ current, data: 'SSL' }));
  const handleChangeAuthenticationYes = () =>
    dispatch(updateDestinationAuthentication({ current, data: true }));
  const handleChangeAuthenticationNo = () =>
    dispatch(updateDestinationAuthentication({ current, data: false }));
  const handleChangeUsername = (event: FocusEvent<HTMLInputElement>) =>
    dispatch(updateDestinationUsername({ current, data: event.target.value }));
  const handleChangePassword = (event: FocusEvent<HTMLInputElement>) =>
    dispatch(updateDestinationPassword({ current, data: event.target.value }));
  const handleChangeTo = (event: FocusEvent<HTMLInputElement>) =>
    dispatch(updateDestinationTo({ current, data: event.target.value }));
  const handleChangeFrom = (event: FocusEvent<HTMLInputElement>) =>
    dispatch(updateDestinationFrom({ current, data: event.target.value }));
  const handleChangeSubject = (event: FocusEvent<HTMLInputElement>) =>
    dispatch(updateDestinationSubject({ current, data: event.target.value }));
  const handleChangeCharsetEncoding = (value: string) =>
    dispatch(updateDestinationCharsetEncoding({ current, data: value }));
  const handleChangeHtmlBodyYes = () =>
    dispatch(updateDestinationHtml({ current, data: true }));
  const handleChangeHtmlBodyNo = () =>
    dispatch(updateDestinationHtml({ current, data: false }));
  const handleChangeBody = (event: FocusEvent<HTMLTextAreaElement>) =>
    dispatch(updateDestinationBody({ current, data: event.target.value }));
  const handleChangeHeadersTable = () =>
    dispatch(updateDestinationIsUseHeadersVariable({ current, data: false }));
  const handleChangeHeadersMap = () =>
    dispatch(updateDestinationIsUseHeadersVariable({ current, data: true }));
  const handleChangeHeadersVariable = (event: FocusEvent<HTMLInputElement>) =>
    dispatch(
      updateDestinationHeadersVariable({
        current,
        data: event.target.value
      })
    );
  const handleChangeAttachmentsTable = () =>
    dispatch(
      updateDestinationIsUseAttachmentsVariable({
        current,
        data: false
      })
    );
  const handleChangeAttachmentsMap = () =>
    dispatch(
      updateDestinationIsUseAttachmentsVariable({
        current,
        data: true
      })
    );
  const handleChangeAttachmentsVariable = (
    event: FocusEvent<HTMLInputElement>
  ) =>
    dispatch(
      updateDestinationAttachmentsVariable({
        current,
        data: event.target.value
      })
    );

  return (
    <div>
      <GroupBox label="SMTP Sender Settings">
        <Grid container rowSpacing={0.5} columnSpacing={2} alignItems="center">
          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              SMTP Host:
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <TextField
              value={settings?.smtpHost}
              onBlur={handleChangeSmtPHost}
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              SMTP Port:
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <TextField
              value={settings?.smtpPort}
              onBlur={handleChangeSmtpPort}
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
                  checked={settings?.overrideLocalBinding}
                  onClick={handleChangeLocalBindingYes}
                />
              }
            />
            <FormControlLabel
              label="No"
              labelPlacement="end"
              control={
                <Radio
                  checked={!settings?.overrideLocalBinding}
                  onClick={handleChangeLocalBindingNo}
                />
              }
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
              Local Port:
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <TextField
              value={settings?.localPort}
              onBlur={handleChangeLocalPort}
              disabled={!settings?.overrideLocalBinding}
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Send Timeout (ms):
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <TextField
              value={settings?.timeout}
              onBlur={handleChangeSendTimeout}
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Encryption:
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <FormControlLabel
              label="None"
              labelPlacement="end"
              control={
                <Radio
                  checked={settings?.encryption === 'none'}
                  onClick={handleChangeEncryptionNone}
                />
              }
            />
            <FormControlLabel
              label="STARTTLS"
              labelPlacement="end"
              control={
                <Radio
                  checked={settings?.encryption === 'TLS'}
                  onClick={handleChangeEncryptionTLS}
                />
              }
            />
            <FormControlLabel
              label="SSL"
              labelPlacement="end"
              control={
                <Radio
                  checked={settings?.encryption === 'SSL'}
                  onClick={handleChangeEncryptionSSL}
                />
              }
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Use Authentication:
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <FormControlLabel
              label="Yes"
              labelPlacement="end"
              control={
                <Radio
                  checked={settings?.useAuthentication}
                  onClick={handleChangeAuthenticationYes}
                />
              }
            />
            <FormControlLabel
              label="No"
              labelPlacement="end"
              control={
                <Radio
                  checked={!settings?.useAuthentication}
                  onClick={handleChangeAuthenticationNo}
                />
              }
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Username:
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <TextField
              value={settings?.username}
              onBlur={handleChangeUsername}
              disabled={!settings?.useAuthentication}
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Password:
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <TextField
              value={settings?.password}
              onBlur={handleChangePassword}
              disabled={!settings?.useAuthentication}
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              To:
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <TextField value={settings?.to} onBlur={handleChangeTo} />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              From:
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <TextField value={settings?.from} onBlur={handleChangeFrom} />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Subject:
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <TextField value={settings?.subject} onBlur={handleChangeSubject} />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Charset Encoding:
            </Typography>
          </Grid>

          <Grid item md={1}>
            <MirthSelect
              value={settings?.charsetEncoding ?? ''}
              items={ENCODING_TYPES}
              onChange={handleChangeCharsetEncoding}
            />
          </Grid>

          <Grid item md={9.5} />

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              HTML Body:
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <FormControlLabel
              label="Yes"
              labelPlacement="end"
              control={
                <Radio
                  checked={settings?.html}
                  onClick={handleChangeHtmlBodyYes}
                />
              }
            />
            <FormControlLabel
              label="No"
              labelPlacement="end"
              control={
                <Radio
                  checked={!settings?.html}
                  onClick={handleChangeHtmlBodyNo}
                />
              }
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Body:
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <TextareaAutosize
              value={settings?.body ?? ''}
              onBlur={handleChangeBody}
              minRows={5}
              maxRows={5}
              style={{ width: '100%' }}
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Headers:
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <FormControlLabel
              label="Use Table"
              labelPlacement="end"
              control={
                <Radio
                  checked={!settings?.isUseHeadersVariable}
                  onClick={handleChangeHeadersTable}
                />
              }
            />
            <FormControlLabel
              label="Use Map:"
              labelPlacement="end"
              control={
                <Radio
                  checked={settings?.isUseHeadersVariable}
                  onClick={handleChangeHeadersMap}
                />
              }
            />
            <TextField
              value={settings?.headersVariable}
              onBlur={handleChangeHeadersVariable}
            />
          </Grid>

          <Grid item md={1.5} />

          <Grid item md={10.5}>
            <MirthTable rows={handerRows} columns={headerColumns} />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Attachments:
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <FormControlLabel
              label="Use Table"
              labelPlacement="end"
              control={
                <Radio
                  checked={!settings?.isUseAttachmentsVariable}
                  onClick={handleChangeAttachmentsTable}
                />
              }
            />
            <FormControlLabel
              label="Use List:"
              labelPlacement="end"
              control={
                <Radio
                  checked={settings?.isUseAttachmentsVariable}
                  onClick={handleChangeAttachmentsMap}
                />
              }
            />
            <TextField
              value={settings?.attachmentsVariable}
              onBlur={handleChangeAttachmentsVariable}
            />
          </Grid>

          <Grid item md={1.5} />

          <Grid item md={10.5}>
            <MirthTable rows={attachmentRows} columns={attachmentColumns} />
          </Grid>
        </Grid>
      </GroupBox>
    </div>
  );
};

export default SMTPSenderSettings;
