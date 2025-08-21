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

import { GroupBox, MirthSelect, MirthTable } from '../../../../components';
import type { RootState } from '../../../../states';
import {
  updateBinaryMimeTypes,
  updateBinaryMimeTypesRegex,
  updateCharset,
  updateContextPath,
  updateIncludeMetadata,
  updateParseMultipart,
  updateResponseContentType,
  updateResponseDataTypeBinary,
  updateResponseHeadersVariable,
  updateResponseStatusCode,
  updateTimeout,
  updateUseResponseHeadersVariable,
  updateXmlBody
} from '../../../../states/channelReducer';
import type { Column, Row } from '../../../../types';
import { ENCODING_TYPES } from '../../EditChannelView.constant';
import { RESOURCE_TYPES } from './HttpListenerView.constant';

const HttpListenerSettingsView = () => {
  const settings = useSelector(
    (state: RootState) => state.channels.channel.sourceConnector.properties
  );
  const port = useSelector(
    (state: RootState) =>
      state.channels.channel.sourceConnector.properties
        .listenerConnectorProperties.port
  );
  const dispatch = useDispatch();
  const url = useMemo(
    () =>
      `http://localhost:${port}/${settings.contextPath ? `${settings.contextPath}/` : ''}`,
    [port, settings.contextPath]
  );
  const headerColumns: Column[] = [
    { id: 'name', title: 'Name', width: '50%' },
    { id: 'value', title: 'Value', width: '50%' }
  ];
  const headerRows: Row[] = useMemo(() => {
    if (!settings.responseHeaders.entry) {
      return [];
    }
    const data = settings.responseHeaders.entry.map(
      value =>
        ({
          id: value.string,
          name: {
            type: 'text',
            value: value.string
          },
          value: {
            type: 'text',
            value: value.list.string
          }
        }) as Row
    );
    return data;
  }, [settings.responseHeaders.entry]);
  const resourceColumns: Column[] = [
    { id: 'contextPath', title: 'Context Path', width: '40%' },
    { id: 'resourceType', title: 'Resource Type', width: '10%' },
    { id: 'value', title: 'Value', width: '40%' },
    { id: 'contentType', title: 'Content Type', width: '10%' }
  ];
  const resourceRows: Row[] = useMemo(() => {
    if (!settings.staticResources) {
      return [];
    }
    const data = settings.staticResources[
      'com.mirth.connect.connectors.http.HttpStaticResource'
    ]!.map(
      value =>
        ({
          id: value.contextPath,
          contextPath: {
            type: 'text',
            value: value.contextPath
          },
          resourceType: {
            type: 'select',
            value: value.resourceType,
            items: RESOURCE_TYPES
          },
          value: {
            type: 'text',
            value: value.value
          },
          contentType: {
            type: 'text',
            value: value.contentType
          }
        }) as Row
    );
    return data;
  }, [settings.responseHeaders.entry]);

  const handleChangeContextPath = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => dispatch(updateContextPath(event.target.value));
  const handleChangeTimeout = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => dispatch(updateTimeout(Number(event.target.value)));
  const handleChangeMessageContentPlainBody = () =>
    dispatch(updateXmlBody(false));
  const handleChangeMessageContentXmlBody = () => dispatch(updateXmlBody(true));
  const handleChangeMultiPartYes = () => dispatch(updateParseMultipart(true));
  const handleChangeMultiPartNo = () => dispatch(updateParseMultipart(false));
  const handleChangeMetadataYes = () => dispatch(updateIncludeMetadata(true));
  const handleChangeMetadataNo = () => dispatch(updateIncludeMetadata(false));
  const handleChangeMimeType = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => dispatch(updateBinaryMimeTypes(event.target.value));
  const handleChangeMimeTypeRegex = () =>
    dispatch(updateBinaryMimeTypesRegex(!settings.binaryMimeTypesRegex));
  const handleChangeContentType = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => dispatch(updateResponseContentType(event.target.value));
  const handleChangeResponseDataTypeBinary = () =>
    dispatch(updateResponseDataTypeBinary(true));
  const handleChangeResponseDataTypeText = () =>
    dispatch(updateResponseDataTypeBinary(false));
  const handleChangeCharsetEncoding = (value: string) =>
    dispatch(updateCharset(value));
  const handleChangeResponseStatusCode = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => dispatch(updateResponseStatusCode(event.target.value));
  const handleChangeResponseHeadersTable = () =>
    dispatch(updateUseResponseHeadersVariable(false));
  const handleChangeResponseHeadersMap = () =>
    dispatch(updateUseResponseHeadersVariable(true));
  const handleChangeResponseHeaderVarialbe = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => dispatch(updateResponseHeadersVariable(event.target.value));

  return (
    <div>
      <GroupBox label="HTTP Listener Settings">
        <Grid
          container
          direction="row"
          rowSpacing={0.5}
          columnSpacing={2}
          alignItems="center"
        >
          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Base Context Path:
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <TextField
              value={settings.contextPath}
              onChange={handleChangeContextPath}
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Receive Timeout (ms):
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <TextField
              value={settings.timeout}
              onChange={handleChangeTimeout}
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Message Content:
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <FormControlLabel
              label="Plain Body"
              labelPlacement="end"
              control={
                <Radio
                  checked={!settings.xmlBody}
                  onClick={handleChangeMessageContentPlainBody}
                />
              }
            />
            <FormControlLabel
              label="XML Body"
              labelPlacement="end"
              control={
                <Radio
                  checked={settings.xmlBody}
                  onClick={handleChangeMessageContentXmlBody}
                />
              }
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Parse Multipart:
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <FormControlLabel
              label="Yes"
              labelPlacement="end"
              control={
                <Radio
                  checked={settings.parseMultipart}
                  onClick={handleChangeMultiPartYes}
                />
              }
              disabled={!settings.xmlBody}
            />
            <FormControlLabel
              label="No"
              labelPlacement="end"
              control={
                <Radio
                  checked={!settings.parseMultipart}
                  onClick={handleChangeMultiPartNo}
                />
              }
              disabled={!settings.xmlBody}
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Include Metadata:
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <FormControlLabel
              label="Yes"
              labelPlacement="end"
              control={
                <Radio
                  checked={settings.parseMultipart}
                  onClick={handleChangeMetadataYes}
                />
              }
              disabled={!settings.xmlBody}
            />
            <FormControlLabel
              label="No"
              labelPlacement="end"
              control={
                <Radio
                  checked={!settings.parseMultipart}
                  onClick={handleChangeMetadataNo}
                />
              }
              disabled={!settings.xmlBody}
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Binary MIME Types:
            </Typography>
          </Grid>

          <Grid item md={3}>
            <TextField
              value={settings.binaryMimeTypes}
              onChange={handleChangeMimeType}
              fullWidth
            />
          </Grid>

          <Grid item md={7.5}>
            <FormControlLabel
              label="Regular Expression"
              labelPlacement="end"
              control={
                <Checkbox
                  checked={settings.binaryMimeTypesRegex}
                  onClick={handleChangeMimeTypeRegex}
                />
              }
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              HTTP URL:
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <TextField value={url} disabled />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Response Content Type:
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <TextField
              value={settings.responseContentType}
              onChange={handleChangeContentType}
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Response Data Type:
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <FormControlLabel
              label="Binary"
              labelPlacement="end"
              control={
                <Radio
                  checked={settings.binary}
                  onClick={handleChangeResponseDataTypeBinary}
                />
              }
            />
            <FormControlLabel
              label="Text"
              labelPlacement="end"
              control={
                <Radio
                  checked={!settings.binary}
                  onClick={handleChangeResponseDataTypeText}
                />
              }
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Charset Encoding:
            </Typography>
          </Grid>

          <Grid item md={1}>
            <MirthSelect
              value={settings.charset}
              items={ENCODING_TYPES}
              onChange={handleChangeCharsetEncoding}
              fullWdith
            />
          </Grid>

          <Grid item md={9.5} />

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Response Status Code:
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <TextField
              value={settings.responseStatusCode}
              onChange={handleChangeResponseStatusCode}
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Response Headers:
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <FormControlLabel
              label="Use Table"
              labelPlacement="end"
              control={
                <Radio
                  checked={!settings.useResponseHeadersVariable}
                  onClick={handleChangeResponseHeadersTable}
                />
              }
            />
            <FormControlLabel
              label="Use Map:"
              labelPlacement="end"
              control={
                <Radio
                  checked={settings.useResponseHeadersVariable}
                  onClick={handleChangeResponseHeadersMap}
                />
              }
            />
            <TextField
              value={settings.responseHeadersVariable}
              onChange={handleChangeResponseHeaderVarialbe}
              disabled={!settings.useResponseHeadersVariable}
            />
          </Grid>

          <Grid item md={1.5} />

          <Grid item md={10.5}>
            <MirthTable rows={headerRows} columns={headerColumns} />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Static Resources:
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <MirthTable rows={resourceRows} columns={resourceColumns} />
          </Grid>
        </Grid>
      </GroupBox>
    </div>
  );
};

export default HttpListenerSettingsView;
