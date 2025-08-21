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

import { GroupBox, MirthSelect } from '../../../../../components';
import {
  updateDestinationDocumentType,
  updateDestinationEncrypt,
  updateDestinationHost,
  updateDestinationOutput,
  updateDestinationOutputPattern,
  updateDestinationPageHeight,
  updateDestinationPageUnit,
  updateDestinationPageWidth,
  updateDestinationPassword,
  updateDestinationTemplate
} from '../../../../../states/channelReducer';
import type { DestinationSettingsProps } from '../../DestinationView.type';
import { PAGE_UNITS } from './DocumentWriterSettings.constant';

const DocumentWriterSettings = ({
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

  const handleChangeOutputFile = () =>
    dispatch(updateDestinationOutput({ current, data: 'FILE' }));
  const handleChangeOutputAttachment = () =>
    dispatch(updateDestinationOutput({ current, data: 'ATTACHMENT' }));
  const handleChangeOutputBoth = () =>
    dispatch(updateDestinationOutput({ current, data: 'BOTH' }));
  const handleChangeDirectory = (event: FocusEvent<HTMLInputElement>) =>
    dispatch(updateDestinationHost({ current, data: event.target.value }));
  const handleChangeFileName = (event: FocusEvent<HTMLInputElement>) =>
    dispatch(
      updateDestinationOutputPattern({
        current,
        data: event.target.value
      })
    );
  const handleChangeDocumentTypePDF = () =>
    dispatch(updateDestinationDocumentType({ current, data: 'pdf' }));
  const handleChangeDocumentTypeRTF = () =>
    dispatch(updateDestinationDocumentType({ current, data: 'rtf' }));
  const handleChangeEncryptedYes = () =>
    dispatch(updateDestinationEncrypt({ current, data: true }));
  const handleChangeEncryptedNo = () =>
    dispatch(updateDestinationEncrypt({ current, data: false }));
  const handleChangePassword = (event: FocusEvent<HTMLInputElement>) =>
    dispatch(updateDestinationPassword({ current, data: event.target.value }));
  const handleChangePageWidth = (event: FocusEvent<HTMLInputElement>) =>
    dispatch(updateDestinationPageWidth({ current, data: event.target.value }));
  const handleChangePageHeight = (event: FocusEvent<HTMLInputElement>) =>
    dispatch(
      updateDestinationPageHeight({
        current,
        data: event.target.value
      })
    );
  const handleChangePageUnit = (value: string) =>
    dispatch(updateDestinationPageUnit({ current, data: value }));
  const handleChangeTemplate = (event: FocusEvent<HTMLTextAreaElement>) =>
    dispatch(updateDestinationTemplate({ current, data: event.target.value }));

  return (
    <div>
      <GroupBox label="Document Writer Settings">
        <Grid container rowSpacing={0.5} columnSpacing={2}>
          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Output:
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <FormControlLabel
              label="File"
              labelPlacement="end"
              control={
                <Radio
                  checked={settings?.output === 'FILE'}
                  onClick={handleChangeOutputFile}
                />
              }
            />
            <FormControlLabel
              label="Attachment"
              labelPlacement="end"
              control={
                <Radio
                  checked={settings?.output === 'ATTACHMENT'}
                  onClick={handleChangeOutputAttachment}
                />
              }
            />
            <FormControlLabel
              label="Both"
              labelPlacement="end"
              control={
                <Radio
                  checked={settings?.output === 'BOTH'}
                  onClick={handleChangeOutputBoth}
                />
              }
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Directory:
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <TextField
              defaultValue={settings?.host}
              onBlur={handleChangeDirectory}
            />
            <Button variant="contained">Test Write</Button>
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              File Name:
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <TextField
              defaultValue={settings?.outputPattern}
              onBlur={handleChangeFileName}
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Document Type:
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <FormControlLabel
              label="PDF"
              labelPlacement="end"
              control={
                <Radio
                  checked={settings?.documentType === 'pdf'}
                  onClick={handleChangeDocumentTypePDF}
                />
              }
            />
            <FormControlLabel
              label="RTF"
              labelPlacement="end"
              control={
                <Radio
                  checked={settings?.documentType === 'rtf'}
                  onClick={handleChangeDocumentTypeRTF}
                />
              }
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Encrypted:
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <FormControlLabel
              label="Yes"
              labelPlacement="end"
              control={
                <Radio
                  checked={settings?.encrypt === true}
                  onClick={handleChangeEncryptedYes}
                />
              }
            />
            <FormControlLabel
              label="No"
              labelPlacement="end"
              control={
                <Radio
                  checked={settings?.encrypt === false}
                  onClick={handleChangeEncryptedNo}
                />
              }
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Password:
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <TextField
              defaultValue={settings?.password}
              onBlur={handleChangePassword}
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Page Size:
            </Typography>
          </Grid>

          <Grid item md={0.5}>
            <TextField
              defaultValue={settings?.pageWidth}
              onBlur={handleChangePageWidth}
              fullWidth
            />
          </Grid>

          <Grid item>X</Grid>

          <Grid item md={0.5}>
            <TextField
              defaultValue={settings?.pageHeight}
              onBlur={handleChangePageHeight}
              fullWidth
            />
          </Grid>

          <Grid item md={1}>
            <MirthSelect
              value={settings?.pageUnit ?? ''}
              items={PAGE_UNITS}
              onChange={handleChangePageUnit}
              fullWdith
            />
          </Grid>

          <Grid item md={7.4} />

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              HTML Template:
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <TextareaAutosize
              defaultValue={settings?.template}
              onBlur={handleChangeTemplate}
              minRows={20}
              maxRows={20}
              style={{ width: '100%' }}
            />
          </Grid>
        </Grid>
      </GroupBox>
    </div>
  );
};

export default DocumentWriterSettings;
