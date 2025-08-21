import { FormControlLabel, Grid, Radio, Typography } from '@mui/material';
import { useMemo } from 'react';
import { useDispatch } from 'react-redux';

import { GroupBox, SettingsButton } from '../../../../components';
import {
  updateDestinationQueueMessage,
  updateDestinationReattachAttachments,
  updateDestinationValidateResponse
} from '../../../../states/channelReducer';
import type { DestinationSettingsProps } from '../DestinationView.type';

const DestinationSettings = ({
  current,
  destinations
}: DestinationSettingsProps) => {
  const settings = useMemo(() => {
    if (current) {
      return destinations.find(d => d.metaDataId === current)!.properties
        .destinationConnectorProperties;
    }
    return undefined;
  }, [current, destinations]);
  const dispatch = useDispatch();

  const handleClickQueueMessageNever = () => {
    dispatch(
      updateDestinationQueueMessage({
        current,
        queueEnabled: false,
        sendFirst: false
      })
    );
  };

  const handleClickQueueMessageOnFailure = () => {
    dispatch(
      updateDestinationQueueMessage({
        current,
        queueEnabled: true,
        sendFirst: true
      })
    );
  };

  const handleClickQueueMessageAlways = () => {
    dispatch(
      updateDestinationQueueMessage({
        current,
        queueEnabled: true,
        sendFirst: false
      })
    );
  };

  const handleClickValidateResponseYes = () => {
    dispatch(
      updateDestinationValidateResponse({
        current,
        data: true
      })
    );
  };

  const handleClickValidateResponseNo = () => {
    dispatch(
      updateDestinationValidateResponse({
        current,
        data: false
      })
    );
  };

  const handleClickReattachAttachmentsYes = () => {
    dispatch(
      updateDestinationReattachAttachments({
        current,
        data: true
      })
    );
  };

  const handleClickReattachAttachmentsNo = () => {
    dispatch(
      updateDestinationReattachAttachments({
        current,
        data: false
      })
    );
  };

  return (
    <div>
      <GroupBox label="Destination Settings">
        <Grid container rowSpacing={0.5} columnSpacing={2} alignItems="center">
          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Queue Messages:
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <FormControlLabel
              label="Never"
              labelPlacement="end"
              control={
                <Radio
                  checked={settings?.queueEnabled === false}
                  onClick={handleClickQueueMessageNever}
                />
              }
            />
            <FormControlLabel
              label="On Failure"
              labelPlacement="end"
              control={
                <Radio
                  checked={
                    settings?.queueEnabled === true &&
                    settings?.sendFirst === true
                  }
                  onClick={handleClickQueueMessageOnFailure}
                />
              }
            />
            <FormControlLabel
              label="Always"
              labelPlacement="end"
              control={
                <Radio
                  checked={
                    settings?.queueEnabled === true &&
                    settings?.sendFirst === false
                  }
                  onClick={handleClickQueueMessageAlways}
                />
              }
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Advanced Queue Settings:
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <SettingsButton />
            {settings?.retryCount} Retries
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Validate Response:
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <FormControlLabel
              label="Yes"
              labelPlacement="end"
              control={
                <Radio
                  checked={settings?.validateResponse === true}
                  onClick={handleClickValidateResponseYes}
                />
              }
            />
            <FormControlLabel
              label="No"
              labelPlacement="end"
              control={
                <Radio
                  checked={settings?.validateResponse === false}
                  onClick={handleClickValidateResponseNo}
                />
              }
            />
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              Reattach Attachments:
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <FormControlLabel
              label="Yes"
              labelPlacement="end"
              control={
                <Radio
                  checked={settings?.reattachAttachments === true}
                  onClick={handleClickReattachAttachmentsYes}
                />
              }
            />
            <FormControlLabel
              label="No"
              labelPlacement="end"
              control={
                <Radio
                  checked={settings?.reattachAttachments === false}
                  onClick={handleClickReattachAttachmentsNo}
                />
              }
            />
          </Grid>
        </Grid>
      </GroupBox>
    </div>
  );
};

export default DestinationSettings;
