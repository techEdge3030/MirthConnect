import {
  FormControlLabel,
  Grid,
  Radio,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import type { ChangeEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { GroupBox, MirthSelect } from '../../../components';
import { useAlert } from '../../../providers';
import { getConnectorNames } from '../../../services';
import type { RootState } from '../../../states';
import {
  updateFirstResponse,
  updateProcessBatch,
  updateProcessingThreads,
  updateQueueBufferSize,
  updateRespondAfterProcessing,
  updateResponseVariable
} from '../../../states/channelReducer';
import type { Connector, SelectItem } from '../../../types';
import { SOURCE_QUEUE } from './SourceView.constant';

const SourceSettingsView = () => {
  const [destinations, setDestinations] = useState<Connector[]>([]);
  const { setOpen, setSeverity, setMessage } = useAlert();
  const sourceSettings = useSelector(
    (state: RootState) =>
      state.channels.channel.sourceConnector.properties.sourceConnectorProperties
  );
  const channelId = useSelector((state: RootState) => state.channels.channel.id);
  const connectorType = useSelector(
    (state: RootState) => state.channels.channel.sourceConnector.transportName
  );
  const dispatch = useDispatch();

  const responses: SelectItem[] = useMemo(() => {
    if (sourceSettings.respondAfterProcessing) {
      const destinationData = destinations.map(destination => ({
        value: `d${destination.int}`,
        label: destination.string
      }));
      return [
        { value: 'None', label: 'None' },
        {
          value: 'Auto-generate (Before processing)',
          label: 'Auto-generate (Before processing)'
        },
        {
          value: 'Auto-generate (After source transformer)',
          label: 'Auto-generate (After source transformer)'
        },
        {
          value: 'Auto-generate (Destinations completed)',
          label: 'Auto-generate (Destinations completed)'
        },
        { value: 'Postprocessor', label: 'Postprocessor' },
        ...destinationData
      ];
    }
    return [
      { value: 'None', label: 'None' },
      {
        value: 'Auto-generate (Before processing)',
        label: 'Auto-generate (Before processing)'
      }
    ];
  }, [destinations, sourceSettings.respondAfterProcessing]);

  useEffect(() => {
    const fetchConnectorNames = async () => {
      try {
        const connectors = await getConnectorNames(channelId);
        setDestinations(connectors.filter(connector => connector.int > 0));
      } catch (e) {
        setSeverity('error');
        setMessage((e as Error).message);
        setOpen(true);
      }
    };
    if (sourceSettings.respondAfterProcessing) {
      fetchConnectorNames();
    }
  }, [sourceSettings.respondAfterProcessing, channelId]);

  const handleChangeResponseAfterProcessing = (value: string) =>
    dispatch(updateRespondAfterProcessing(value === 'off'));
  const handleChangeQueueBufferSize = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => dispatch(updateQueueBufferSize(event.target.value));
  const handleChangeResponseVariable = (value: string) =>
    dispatch(updateResponseVariable(value));
  const handleEnableProcessBatch = () => dispatch(updateProcessBatch(true));
  const handleDisableProcessBatch = () => dispatch(updateProcessBatch(false));
  const handleFirstBatchResponse = () => dispatch(updateFirstResponse(true));
  const handleLastBatchResponse = () => dispatch(updateFirstResponse(false));
  const handleChangeProcessingThreads = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => dispatch(updateProcessingThreads(event.target.value));

  return (
    <div>
      <GroupBox label="Source Settings" border={false}>
        <Stack direction="column" spacing={0.5}>
          <Grid container direction="row" columnSpacing={2} alignItems="center">
            <Grid item md={1.3}>
              <Typography variant="subtitle1" align="right">
                Source Queue:
              </Typography>
            </Grid>

            <Grid item md={2}>
              <MirthSelect
                value={sourceSettings.respondAfterProcessing ? 'off' : 'on'}
                items={SOURCE_QUEUE}
                onChange={handleChangeResponseAfterProcessing}
                fullWdith
              />
            </Grid>
          </Grid>

          <Grid container direction="row" columnSpacing={2} alignItems="center">
            <Grid item md={1.3}>
              <Typography variant="subtitle1" align="right">
                Queue Buffer Size:
              </Typography>
            </Grid>

            <Grid item md={2}>
              <TextField
                value={sourceSettings.queueBufferSize}
                variant="outlined"
                onChange={handleChangeQueueBufferSize}
                disabled={sourceSettings.respondAfterProcessing}
              />
            </Grid>
          </Grid>

          <Grid container direction="row" columnSpacing={2} alignItems="center">
            <Grid item md={1.3}>
              <Typography variant="subtitle1" align="right">
                Response:
              </Typography>
            </Grid>

            <Grid item md={2}>
              <MirthSelect
                value={sourceSettings.responseVariable}
                items={responses}
                onChange={handleChangeResponseVariable}
                fullWdith
              />
            </Grid>
          </Grid>

          <Grid container direction="row" columnSpacing={2} alignItems="center">
            <Grid item md={1.3}>
              <Typography variant="subtitle1" align="right">
                Process Batch:
              </Typography>
            </Grid>

            <Grid item md={2}>
              <FormControlLabel
                label="Yes"
                labelPlacement="end"
                control={
                  <Radio
                    checked={sourceSettings.processBatch}
                    onClick={handleEnableProcessBatch}
                  />
                }
                disabled={connectorType === 'DICOM Listener'}
              />
              <FormControlLabel
                label="No"
                labelPlacement="end"
                control={
                  <Radio
                    checked={!sourceSettings.processBatch}
                    onClick={handleDisableProcessBatch}
                  />
                }
                disabled={connectorType === 'DICOM Listener'}
              />
            </Grid>
          </Grid>

          <Grid container direction="row" columnSpacing={2} alignItems="center">
            <Grid item md={1.3}>
              <Typography variant="subtitle1" align="right" color="grey">
                Batch Response:
              </Typography>
            </Grid>

            <Grid item md={2}>
              <FormControlLabel
                label="First"
                labelPlacement="end"
                control={
                  <Radio
                    checked={sourceSettings.firstResponse}
                    onClick={handleFirstBatchResponse}
                  />
                }
                disabled={!sourceSettings.processBatch}
              />
              <FormControlLabel
                label="Last"
                labelPlacement="end"
                control={
                  <Radio
                    checked={!sourceSettings.firstResponse}
                    onClick={handleLastBatchResponse}
                  />
                }
                disabled={!sourceSettings.processBatch}
              />
            </Grid>
          </Grid>
          <Grid container direction="row" columnSpacing={2} alignItems="center">
            <Grid item md={1.3}>
              <Typography variant="subtitle1" align="right">
                Max Processing Threads:
              </Typography>
            </Grid>

            <Grid item md={2}>
              <TextField
                value={sourceSettings.processingThreads}
                variant="outlined"
                onChange={handleChangeProcessingThreads}
              />
            </Grid>
          </Grid>
        </Stack>
      </GroupBox>
    </div>
  );
};

export default SourceSettingsView;
