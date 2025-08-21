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

import { GroupBox, MirthSelect, MirthTable } from '../../../../../components';
import {
  updateDestinationAuthenticationType,
  updateDestinationCharset,
  updateDestinationContent,
  updateDestinationContentType,
  updateDestinationDataTypeBinary,
  updateDestinationHeadersVariable,
  updateDestinationHost,
  updateDestinationMethod,
  updateDestinationMultipart,
  updateDestinationParametersVariable,
  updateDestinationPassword,
  updateDestinationProxyAddress,
  updateDestinationProxyPort,
  updateDestinationResponseBinaryMimeTypes,
  updateDestinationResponseBinaryMimeTypesRegex,
  updateDestinationResponseIncludeMetadata,
  updateDestinationResponseParseMultipart,
  updateDestinationResponseXmlBody,
  updateDestinationSocketTimeout,
  updateDestinationUseAuthentication,
  updateDestinationUseHeadersVariable,
  updateDestinationUseParametersVariable,
  updateDestinationUsePreemptiveAuthentication,
  updateDestinationUseProxyServer,
  updateDestinationUsername
} from '../../../../../states/channelReducer';
import type { Column, Row } from '../../../../../types';
import { ENCODING_TYPES } from '../../../EditChannelView.constant';
import type { DestinationSettingsProps } from '../../DestinationView.type';

const HTTPSenderSettings = ({
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
  const columns: Column[] = [
    { id: 'name', title: 'Name' },
    { id: 'value', title: 'Value' }
  ];
  const parameters: Row[] = useMemo(() => {
    return (
      settings?.parameters.entry.map(
        p =>
          ({
            id: p.string,
            name: {
              value: p.string,
              type: 'text'
            },
            value: {
              type: 'text',
              value: p.list.string
            }
          }) as Row
      ) ?? []
    );
  }, [settings?.parameters.entry]);
  const headers: Row[] = useMemo(() => {
    return (
      settings?.headers.entry.map(
        (h: any) =>
          ({
            id: h.string,
            name: {
              type: 'text',
              value: h.string
            },
            value: {
              type: 'text',
              value: h.list.string
            }
          }) as Row
      ) ?? []
    );
  }, [settings?.headers.entry]);

  const handleChangeUrl = (event: FocusEvent<HTMLInputElement>) =>
    dispatch(updateDestinationHost({ current, data: event.target.value }));
  const handleChangeUseProxyServerYes = () =>
    dispatch(updateDestinationUseProxyServer({ current, data: true }));
  const handleChangeUseProxyServerNo = () =>
    dispatch(updateDestinationUseProxyServer({ current, data: false }));
  const handleChangeProxyAddress = (event: FocusEvent<HTMLInputElement>) =>
    dispatch(
      updateDestinationProxyAddress({
        current,
        data: event.target.value
      })
    );
  const handleChangeProxyPort = (event: FocusEvent<HTMLInputElement>) =>
    dispatch(updateDestinationProxyPort({ current, data: event.target.value }));
  const handleChangeMethodPost = () =>
    dispatch(updateDestinationMethod({ current, data: 'post' }));
  const handleChangeMethodGet = () =>
    dispatch(updateDestinationMethod({ current, data: 'get' }));
  const handleChangeMethodPut = () =>
    dispatch(updateDestinationMethod({ current, data: 'put' }));
  const handleChangeMethodDelete = () =>
    dispatch(updateDestinationMethod({ current, data: 'delete' }));
  const handleChangeMethodPatch = () =>
    dispatch(updateDestinationMethod({ current, data: 'patch' }));
  const handleChangeMultipartYes = () =>
    dispatch(updateDestinationMultipart({ current, data: true }));
  const handleChangeMultipartNo = () =>
    dispatch(updateDestinationMultipart({ current, data: false }));
  const handleChangeSendTimeOut = (event: FocusEvent<HTMLInputElement>) =>
    dispatch(
      updateDestinationSocketTimeout({
        current,
        data: event.target.value
      })
    );
  const handleChangeResponseContentPlainBody = () =>
    dispatch(updateDestinationResponseXmlBody({ current, data: false }));
  const handleChangeResponseContentXMLBody = () =>
    dispatch(updateDestinationResponseXmlBody({ current, data: true }));
  const handleChangeParseMultipartYes = () =>
    dispatch(updateDestinationResponseParseMultipart({ current, data: true }));
  const handleChangeParseMultipartNo = () =>
    dispatch(updateDestinationResponseParseMultipart({ current, data: false }));
  const handleChangeIncludeMetadataYes = () =>
    dispatch(updateDestinationResponseIncludeMetadata({ current, data: true }));
  const handleChangeIncludeMetadataNo = () =>
    dispatch(
      updateDestinationResponseIncludeMetadata({
        current,
        data: false
      })
    );
  const handleChangeBinaryMimeType = (event: FocusEvent<HTMLInputElement>) =>
    dispatch(
      updateDestinationResponseBinaryMimeTypes({
        current,
        data: event.target.value
      })
    );
  const handleChangeRegularExpression = (
    event: ChangeEvent<HTMLInputElement>
  ) =>
    dispatch(
      updateDestinationResponseBinaryMimeTypesRegex({
        current,
        data: event.target.checked
      })
    );
  const handleChangeAuthenticationYes = () =>
    dispatch(updateDestinationUseAuthentication({ current, data: true }));
  const handleChangeAuthenticationNo = () =>
    dispatch(updateDestinationUseAuthentication({ current, data: false }));
  const handleChangeAuthenticationTypeBasic = () =>
    dispatch(updateDestinationAuthenticationType({ current, data: 'Basic' }));
  const handleChangeAuthenticationTypeDigest = () =>
    dispatch(updateDestinationAuthenticationType({ current, data: 'Digest' }));
  const handleChangePreemptive = (event: ChangeEvent<HTMLInputElement>) =>
    dispatch(
      updateDestinationUsePreemptiveAuthentication({
        current,
        data: event.target.checked
      })
    );
  const handleChangeUsername = (event: FocusEvent<HTMLInputElement>) =>
    dispatch(updateDestinationUsername({ current, data: event.target.value }));
  const handleChangePassword = (event: FocusEvent<HTMLInputElement>) =>
    dispatch(updateDestinationPassword({ current, data: event.target.value }));
  const handlechangeQueryParametersTable = () =>
    dispatch(updateDestinationUseParametersVariable({ current, data: false }));
  const handlechangeQueryParametersMap = () =>
    dispatch(updateDestinationUseParametersVariable({ current, data: true }));
  const handlechangeQueryParameter = (event: FocusEvent<HTMLInputElement>) =>
    dispatch(
      updateDestinationParametersVariable({
        current,
        data: event?.target.value
      })
    );
  const handleChangeHeadersTable = () =>
    dispatch(updateDestinationUseHeadersVariable({ current, data: false }));
  const handleChangeHeadersMap = () =>
    dispatch(updateDestinationUseHeadersVariable({ current, data: true }));
  const handleChangeHeader = (event: FocusEvent<HTMLInputElement>) =>
    dispatch(
      updateDestinationHeadersVariable({
        current,
        data: event.target.value
      })
    );
  const handleChangeContentType = (event: FocusEvent<HTMLInputElement>) =>
    dispatch(
      updateDestinationContentType({
        current,
        data: event.target.value
      })
    );
  const handleChangeDataTypeBinary = () =>
    dispatch(updateDestinationDataTypeBinary({ current, data: true }));
  const handleChangeDataTypeText = () =>
    dispatch(updateDestinationDataTypeBinary({ current, data: false }));
  const handleChangeCharsetEncoding = (value: string) =>
    dispatch(updateDestinationCharset({ current, data: value }));
  const handleChangeContent = (event: FocusEvent<HTMLTextAreaElement>) =>
    dispatch(updateDestinationContent({ current, data: event.target.value }));

  return (
    <div>
      <GroupBox label="HTTP Sender Settings">
        <Grid container rowSpacing={0.5} columnSpacing={2} alignItems="center">
          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              URL:
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <TextField value={settings?.url} onBlur={handleChangeUrl} />
            <Button variant="contained">Text Connection</Button>
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Use Proxy Server:
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <FormControlLabel
              label="Yes"
              labelPlacement="end"
              control={
                <Radio
                  checked={settings?.useProxyServer}
                  onClick={handleChangeUseProxyServerYes}
                />
              }
            />
            <FormControlLabel
              label="No"
              labelPlacement="end"
              control={
                <Radio
                  checked={!settings?.useProxyServer}
                  onClick={handleChangeUseProxyServerNo}
                />
              }
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Proxy Address:
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <TextField
              value={settings?.proxyAddress}
              onBlur={handleChangeProxyAddress}
              disabled={!settings?.useProxyServer}
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Proxy Port:
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <TextField
              value={settings?.proxyAddress}
              onBlur={handleChangeProxyPort}
              disabled={!settings?.useProxyServer}
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Method:
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <FormControlLabel
              label="POST"
              labelPlacement="end"
              control={
                <Radio
                  checked={settings?.method === 'post'}
                  onClick={handleChangeMethodPost}
                />
              }
            />
            <FormControlLabel
              label="GET"
              labelPlacement="end"
              control={
                <Radio
                  checked={settings?.method === 'get'}
                  onClick={handleChangeMethodGet}
                />
              }
            />
            <FormControlLabel
              label="PUT"
              labelPlacement="end"
              control={
                <Radio
                  checked={settings?.method === 'put'}
                  onClick={handleChangeMethodPut}
                />
              }
            />
            <FormControlLabel
              label="DELETE"
              labelPlacement="end"
              control={
                <Radio
                  checked={settings?.method === 'delete'}
                  onClick={handleChangeMethodDelete}
                />
              }
            />
            <FormControlLabel
              label="PATCH"
              labelPlacement="end"
              control={
                <Radio
                  checked={settings?.method === 'patch'}
                  onClick={handleChangeMethodPatch}
                />
              }
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Multipart:
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <FormControlLabel
              label="Yes"
              labelPlacement="end"
              control={
                <Radio
                  checked={settings?.multipart}
                  onClick={handleChangeMultipartYes}
                />
              }
            />
            <FormControlLabel
              label="No"
              labelPlacement="end"
              control={
                <Radio
                  checked={!settings?.multipart}
                  onClick={handleChangeMultipartNo}
                />
              }
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
              onBlur={handleChangeSendTimeOut}
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Response Content:
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <FormControlLabel
              label="Plain Body"
              labelPlacement="end"
              control={
                <Radio
                  checked={!settings?.responseXmlBody}
                  onClick={handleChangeResponseContentPlainBody}
                />
              }
            />
            <FormControlLabel
              label="XML Body"
              labelPlacement="end"
              control={
                <Radio
                  checked={settings?.responseXmlBody}
                  onClick={handleChangeResponseContentXMLBody}
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
                  checked={settings?.responseParseMultipart}
                  onClick={handleChangeParseMultipartYes}
                />
              }
              disabled={!settings?.responseXmlBody}
            />
            <FormControlLabel
              label="No"
              labelPlacement="end"
              control={
                <Radio
                  checked={settings?.responseParseMultipart}
                  onClick={handleChangeParseMultipartNo}
                />
              }
              disabled={!settings?.responseXmlBody}
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
                  checked={settings?.responseIncludeMetadata}
                  onClick={handleChangeIncludeMetadataYes}
                />
              }
              disabled={!settings?.responseXmlBody}
            />
            <FormControlLabel
              label="No"
              labelPlacement="end"
              control={
                <Radio
                  checked={settings?.responseIncludeMetadata}
                  onClick={handleChangeIncludeMetadataNo}
                />
              }
              disabled={!settings?.responseXmlBody}
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Binary MIME Types:
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <TextField
              value={settings?.responseBinaryMimeTypes}
              onBlur={handleChangeBinaryMimeType}
            />
            <FormControlLabel
              label="Regular Expression"
              labelPlacement="end"
              control={
                <Checkbox
                  checked={settings?.responseBinaryMimeTypesRegex}
                  onChange={handleChangeRegularExpression}
                />
              }
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Authentication:
            </Typography>
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
            <Typography variant="subtitle1" textAlign="right">
              Authentication Type:
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <FormControlLabel
              label="Basic"
              labelPlacement="end"
              control={
                <Radio
                  checked={settings?.authenticationType === 'Basic'}
                  onClick={handleChangeAuthenticationTypeBasic}
                />
              }
              disabled={!settings?.authentication}
            />
            <FormControlLabel
              label="Digest"
              labelPlacement="end"
              control={
                <Radio
                  checked={settings?.authenticationType === 'Digest'}
                  onClick={handleChangeAuthenticationTypeDigest}
                />
              }
              disabled={!settings?.authentication}
            />
            <FormControlLabel
              label="Preemptive"
              labelPlacement="end"
              control={
                <Checkbox
                  checked={settings?.usePreemptiveAuthentication}
                  onChange={handleChangePreemptive}
                />
              }
              disabled={!settings?.authentication}
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
              disabled={!settings?.authentication}
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
              disabled={!settings?.authentication}
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Query Parameters:
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <FormControlLabel
              label="Use Table"
              labelPlacement="end"
              control={
                <Radio
                  checked={!settings?.useParametersVariable}
                  onClick={handlechangeQueryParametersTable}
                />
              }
            />
            <FormControlLabel
              label="Use Map:"
              labelPlacement="end"
              control={
                <Radio
                  checked={settings?.useParametersVariable}
                  onClick={handlechangeQueryParametersMap}
                />
              }
            />
            <TextField
              value={settings?.parametersVariable}
              onBlur={handlechangeQueryParameter}
              disabled={!settings?.useParametersVariable}
            />
          </Grid>

          <Grid item md={1.5} />

          <Grid item md={10.5}>
            <MirthTable columns={columns} rows={parameters} />
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
                  checked={!settings?.useHeadersVariable}
                  onClick={handleChangeHeadersTable}
                />
              }
            />
            <FormControlLabel
              label="Use Map:"
              labelPlacement="end"
              control={
                <Radio
                  checked={settings?.useHeadersVariable}
                  onClick={handleChangeHeadersMap}
                />
              }
            />
            <TextField
              value={settings?.headersVariable}
              onBlur={handleChangeHeader}
              disabled={!settings?.useHeadersVariable}
            />
          </Grid>

          <Grid item md={1.5} />

          <Grid item md={10.5}>
            <MirthTable columns={columns} rows={headers} />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Content Type:
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <TextField
              value={settings?.contentType}
              onBlur={handleChangeContentType}
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
              Charset Encoding:
            </Typography>
          </Grid>

          <Grid item md={1}>
            <MirthSelect
              value={settings?.charset ?? ''}
              items={ENCODING_TYPES}
              onChange={handleChangeCharsetEncoding}
              fullWdith
            />
          </Grid>

          <Grid item md={9.5} />

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Content:
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <TextareaAutosize
              value={settings?.content ?? ''}
              minRows={5}
              maxRows={5}
              onBlur={handleChangeContent}
              style={{ width: '100%' }}
            />
          </Grid>
        </Grid>
      </GroupBox>
    </div>
  );
};

export default HTTPSenderSettings;
