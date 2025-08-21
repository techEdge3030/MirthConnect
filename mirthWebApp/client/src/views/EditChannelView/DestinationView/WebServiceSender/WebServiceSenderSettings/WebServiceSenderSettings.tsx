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
  updateDestinationEnvelope,
  updateDestinationHeadersVariable,
  updateDestinationIsUseAttachmentsVariable,
  updateDestinationIsUseHeadersVariable,
  updateDestinationLocationURI,
  updateDestinationOneWay,
  updateDestinationOperation,
  updateDestinationPassword,
  updateDestinationPort,
  updateDestinationService,
  updateDestinationSoapAction,
  updateDestinationSocketTimeout,
  updateDestinationUseMtom,
  updateDestinationUsername,
  updateDestinationWsdlUrl
} from '../../../../../states/channelReducer';
import type { Column, Row } from '../../../../../types';
import type { DestinationSettingsProps } from '../../DestinationView.type';
import { OPERATIONS } from './WebServiceSenderSettings.constant';

const WebServiceSenderSettings = ({
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

  const headerRows: Row[] = useMemo(() => {
    return settings?.headers.entry.map(
      (h: any) =>
        ({
          id: h.string,
          name: { type: 'text', value: h.string },
          value: { type: 'text', value: h.list.string }
        }) as Row
    );
  }, [settings?.headers.entry]);

  const attachmentColumns: Column[] = [
    { id: 'name', title: 'ID' },
    { id: 'content', title: 'Content' },
    { id: 'mimeType', title: 'MIME Type' }
  ];

  const attachmentRows: Row[] = useMemo(() => {
    return (
      settings?.attachmentNames.string.map(
        (s, index) =>
          ({
            id: s,
            name: { type: 'text', value: s },
            content: {
              type: 'text',
              value: settings?.attachmentContents.string[index]
            },
            mimeType: {
              type: 'text',
              value: settings?.attachmentTypes.string[index]
            }
          }) as Row
      ) ?? []
    );
  }, [
    settings?.attachmentContents.string,
    settings?.attachmentNames.string,
    settings?.attachmentTypes.string
  ]);

  const handleChangeWSDLUrl = (event: FocusEvent<HTMLInputElement>) =>
    dispatch(updateDestinationWsdlUrl({ current, data: event.target.value }));
  const handleChangeService = (event: FocusEvent<HTMLInputElement>) =>
    dispatch(updateDestinationService({ current, data: event.target.value }));
  const handleChangePort = (event: FocusEvent<HTMLInputElement>) =>
    dispatch(updateDestinationPort({ current, data: event.target.value }));
  const handleChangeLocation = (event: FocusEvent<HTMLInputElement>) =>
    dispatch(
      updateDestinationLocationURI({
        current,
        data: event.target.value
      })
    );
  const handleChangeSocketTimeout = (event: FocusEvent<HTMLInputElement>) =>
    dispatch(
      updateDestinationSocketTimeout({
        current,
        data: event.target.value
      })
    );
  const handleChangeAuthenticationYes = () =>
    dispatch(updateDestinationAuthentication({ current, data: true }));
  const handleChangeAuthenticationNo = () =>
    dispatch(updateDestinationAuthentication({ current, data: false }));
  const handleChangeUsername = (event: FocusEvent<HTMLInputElement>) =>
    dispatch(updateDestinationUsername({ current, data: event.target.value }));
  const handleChangePassword = (event: FocusEvent<HTMLInputElement>) =>
    dispatch(updateDestinationPassword({ current, data: event.target.value }));
  const handleChangeInvocationTypeOneWay = () =>
    dispatch(updateDestinationOneWay({ current, data: true }));
  const handleChangeInvocationTypeTwoWay = () =>
    dispatch(updateDestinationOneWay({ current, data: false }));
  const handleChangeOperation = (value: string) =>
    dispatch(updateDestinationOperation({ current, data: value }));
  const handleChangeSOAPAction = (event: FocusEvent<HTMLInputElement>) =>
    dispatch(
      updateDestinationSoapAction({
        current,
        data: event.target.value
      })
    );
  const handleChangeSOAPEnvelope = (event: FocusEvent<HTMLTextAreaElement>) =>
    dispatch(updateDestinationEnvelope({ current, data: event.target.value }));
  const handleChangeHeaderTable = () =>
    dispatch(updateDestinationIsUseHeadersVariable({ current, data: false }));
  const handleChangeHeaderMap = () =>
    dispatch(updateDestinationIsUseHeadersVariable({ current, data: true }));
  const handleChangeHeaderVariable = (event: FocusEvent<HTMLInputElement>) =>
    dispatch(
      updateDestinationHeadersVariable({
        current,
        data: event.target.value
      })
    );
  const handleChangeMTOMYes = () =>
    dispatch(updateDestinationUseMtom({ current, data: true }));
  const handleChangeMTOMNo = () =>
    dispatch(updateDestinationUseMtom({ current, data: false }));
  const handleChangeAttachmentsTable = () =>
    dispatch(
      updateDestinationIsUseAttachmentsVariable({
        current,
        data: false
      })
    );
  const handleChangeAttachmentsList = () =>
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
      <GroupBox label="Web Service Sender Settings">
        <Grid container rowSpacing={0.5} columnSpacing={2} alignItems="center">
          <Grid item md={1.5}>
            <Typography variant="subtitle1">WSDL URL:</Typography>
          </Grid>

          <Grid item md={10.5}>
            <TextField
              value={settings?.wsdlUrl}
              onBlur={handleChangeWSDLUrl}
              fullWidth
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1">Service:</Typography>
          </Grid>

          <Grid item md={10.5}>
            <TextField
              value={settings?.service}
              onBlur={handleChangeService}
              fullWidth
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1">Port / Endpoint:</Typography>
          </Grid>

          <Grid item md={10.5}>
            <TextField
              value={settings?.port}
              onBlur={handleChangePort}
              fullWidth
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1">Location URI:</Typography>
          </Grid>

          <Grid item md={10.5}>
            <TextField
              value={settings?.locationURI}
              onBlur={handleChangeLocation}
              fullWidth
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1">Socket Timeout (ms):</Typography>
          </Grid>

          <Grid item md={10.5}>
            <TextField
              value={settings?.socketTimeout}
              onBlur={handleChangeSocketTimeout}
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1">Authentication:</Typography>
          </Grid>

          <Grid item md={10.5}>
            <FormControlLabel
              label="Yes"
              labelPlacement="end"
              control={
                <Radio
                  checked={settings?.authentication}
                  onClick={handleChangeAuthenticationYes}
                />
              }
            />
            <FormControlLabel
              label="No"
              labelPlacement="end"
              control={
                <Radio
                  checked={!settings?.authentication}
                  onClick={handleChangeAuthenticationNo}
                />
              }
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1">Username:</Typography>
          </Grid>

          <Grid item md={10.5}>
            <TextField
              value={settings?.username}
              onBlur={handleChangeUsername}
              disabled={!settings?.authentication}
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1">Password:</Typography>
          </Grid>

          <Grid item md={10.5}>
            <TextField
              value={settings?.password}
              onBlur={handleChangePassword}
              disabled={!settings?.authentication}
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1">Invocation Type:</Typography>
          </Grid>

          <Grid item md={10.5}>
            <FormControlLabel
              label="One-Way"
              labelPlacement="end"
              control={
                <Radio
                  checked={settings?.oneWay}
                  onClick={handleChangeInvocationTypeOneWay}
                />
              }
            />
            <FormControlLabel
              label="Two-Way"
              labelPlacement="end"
              control={
                <Radio
                  checked={!settings?.oneWay}
                  onClick={handleChangeInvocationTypeTwoWay}
                />
              }
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1">Operation:</Typography>
          </Grid>

          <Grid item md={10.5}>
            <MirthSelect
              value={settings?.operation ?? ''}
              items={OPERATIONS}
              onChange={handleChangeOperation}
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1">SOAP Action:</Typography>
          </Grid>

          <Grid item md={10.5}>
            <TextField
              value={settings?.soapAction}
              onBlur={handleChangeSOAPAction}
              fullWidth
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1">SOAP Envelope:</Typography>
          </Grid>

          <Grid item md={10.5}>
            <TextareaAutosize
              value={settings?.envelope ?? ''}
              onBlur={handleChangeSOAPEnvelope}
              minRows={5}
              maxRows={5}
              style={{ width: '100%' }}
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1">Headers:</Typography>
          </Grid>

          <Grid item md={10.5}>
            <FormControlLabel
              label="Use Table"
              labelPlacement="end"
              control={
                <Radio
                  checked={!settings?.isUseHeadersVariable}
                  onClick={handleChangeHeaderTable}
                />
              }
            />
            <FormControlLabel
              label="Use Map:"
              labelPlacement="end"
              control={
                <Radio
                  checked={settings?.isUseHeadersVariable}
                  onClick={handleChangeHeaderMap}
                />
              }
            />
            <TextField
              value={settings?.headersVariable}
              onBlur={handleChangeHeaderVariable}
              disabled={!settings?.isUseHeadersVariable}
            />
          </Grid>

          <Grid item md={1.5} />

          <Grid item md={10.5}>
            <MirthTable columns={headerColumns} rows={headerRows} />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1">Use MTOM:</Typography>
          </Grid>

          <Grid item md={10.5}>
            <FormControlLabel
              label="Yes"
              labelPlacement="end"
              control={
                <Radio
                  checked={settings?.useMtom}
                  onClick={handleChangeMTOMYes}
                />
              }
            />
            <FormControlLabel
              label="No:"
              labelPlacement="end"
              control={
                <Radio
                  checked={!settings?.useMtom}
                  onClick={handleChangeMTOMNo}
                />
              }
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1">Attachments:</Typography>
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
              label="Use Map:"
              labelPlacement="end"
              control={
                <Radio
                  checked={settings?.isUseAttachmentsVariable}
                  onClick={handleChangeAttachmentsList}
                />
              }
            />
            <TextField
              value={settings?.attachmentsVariable}
              onBlur={handleChangeAttachmentsVariable}
              disabled={!settings?.isUseAttachmentsVariable}
            />
          </Grid>

          <Grid item md={1.5} />

          <Grid item md={10.5}>
            <MirthTable columns={attachmentColumns} rows={attachmentRows} />
          </Grid>
        </Grid>
      </GroupBox>
    </div>
  );
};

export default WebServiceSenderSettings;
