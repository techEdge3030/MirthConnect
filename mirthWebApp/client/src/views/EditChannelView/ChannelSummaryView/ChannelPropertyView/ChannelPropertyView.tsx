import {
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  TextField,
  Typography
} from '@mui/material';
import type { ChangeEvent } from 'react';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../../../states/index';
import {
  updateChannelName,
  updateChannelEnabled,
  updateClearGlobalChannelMap,
  updateChannelInitialState,
  updateAttachmentType,
  updateStoreAttachments,
  updateChannelTags,
} from '../../../../states/channelReducer';
import { GroupBox, MirthSelect } from '../../../../components';
import { CHANNEL_INITIAL_STATES, ATTACHMENT_PROPERTIES } from './ChannelPropertyView.constant';
import AttachmentPropertyDialog from '../AttachmentPropertyDialog';
import DataTypesDialog from './DataTypesDialog';

const ChannelPropertyView = () => {
  const dispatch = useDispatch<AppDispatch>();
  const channel = useSelector((state: RootState) => state.channels.channel);
  const [attachmentPropertyOpen, setAttachmentPropertyOpen] = useState(false);
  const [dataTypesDialogOpen, setDataTypesDialogOpen] = useState(false);

  const handleChangeName = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => dispatch(updateChannelName(event.target.value));
  const handleChangeChannelEnabled = (
    _: ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => dispatch(updateChannelEnabled(checked));
  const handleChangeClearGlobalChannelMap = (
    _: ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => dispatch(updateClearGlobalChannelMap(checked));
  const handleChangeChannelInitialState = (value: string) =>
    dispatch(updateChannelInitialState(value));
  const handleChangeAttachmentType = (value: string) =>
    dispatch(updateAttachmentType(value));
  const handleChangeStoreAttachments = (
    _: ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => dispatch(updateStoreAttachments(checked));
  const handleChangeTags = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => dispatch(updateChannelTags(event.target.value));

  const handleCloseAttachmentPropertyDialog = () =>
    setAttachmentPropertyOpen(false);
  const handleOpenAttachmentPropertyDialog = () =>
    setAttachmentPropertyOpen(true);
  const handleOpenDataTypesDialog = () => setDataTypesDialogOpen(true);
  const handleCloseDataTypesDialog = () => setDataTypesDialogOpen(false);

  return (
    <div>
      <GroupBox label="Channel Properties" border>
        <Grid
          container
          direction="row"
          rowSpacing={0.5}
          columnSpacing={2}
          alignItems="center"
        >
          <Grid item md={0.8}>
            <Typography variant="subtitle1" textAlign="right">
              {' '}
              Name:{' '}
            </Typography>
          </Grid>

          <Grid item md={3}>
            <TextField
              variant="outlined"
              size="small"
              fullWidth
              value={channel.name}
              onChange={handleChangeName}
            />
          </Grid>

          <Grid item md={1}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={channel.exportData.metadata.enabled}
                  onChange={handleChangeChannelEnabled}
                />
              }
              label="Enabled"
              labelPlacement="end"
            />
          </Grid>

          <Grid item md={7.2}>
            <Typography variant="body1" textAlign="right">
              {' '}
              Id: {channel.id}{' '}
            </Typography>
          </Grid>

          <Grid item md={0.8}>
            <Typography variant="subtitle1" textAlign="right">
              {' '}
              Data Types:{' '}
            </Typography>
          </Grid>

          <Grid item md={2}>
            <Button variant="contained" size="small" fullWidth onClick={handleOpenDataTypesDialog}>
              {' '}
              Set Data Types{' '}
            </Button>
          </Grid>

          <Grid item md={1} />

          <Grid item md={3}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={channel.properties.clearGlobalChannelMap}
                  onChange={handleChangeClearGlobalChannelMap}
                />
              }
              label="Clear global channel map on deploy"
              labelPlacement="end"
            />
          </Grid>

          <Grid item md={5.2}>
            <Typography variant="body1" textAlign="right">
              {' '}
              Revision: {channel.revision}{' '}
            </Typography>
          </Grid>

          <Grid item md={0.8}>
            <Typography variant="subtitle1" textAlign="right">
              {' '}
              Dependencies:{' '}
            </Typography>
          </Grid>

          <Grid item md={2}>
            <Button variant="contained" size="small" fullWidth>
              {' '}
              Set Dependencies{' '}
            </Button>
          </Grid>

          <Grid item md={9.2}>
            <Typography variant="body1" textAlign="right">
              {' '}
              Last Modified:{' '}
              {new Date(
                channel.exportData.metadata.lastModified.time as number
              ).toISOString()}{' '}
            </Typography>
          </Grid>

          <Grid item md={0.8}>
            <Typography variant="subtitle1" textAlign="right">
              {' '}
              Initial State:{' '}
            </Typography>
          </Grid>

          <Grid item md={2}>
            <MirthSelect
              value={channel.properties.initialState}
              items={CHANNEL_INITIAL_STATES}
              onChange={handleChangeChannelInitialState}
              fullWdith
            />
          </Grid>

          <Grid item md={9.2} />

          <Grid item md={0.8}>
            <Typography variant="subtitle1" textAlign="right">
              {' '}
              Attachment:{' '}
            </Typography>
          </Grid>

          <Grid item md={2}>
            <MirthSelect
              value={channel.properties.attachmentProperties.type}
              items={ATTACHMENT_PROPERTIES}
              onChange={handleChangeAttachmentType}
              fullWdith
            />
          </Grid>

          <Grid item md={1}>
            <Button
              variant="contained"
              size="small"
              fullWidth
              disabled={channel.properties.attachmentProperties.type === 'None'}
              onClick={handleOpenAttachmentPropertyDialog}
            >
              Properties
            </Button>
          </Grid>

          <Grid item md={2}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={channel.properties.storeAttachments}
                  onChange={handleChangeStoreAttachments}
                />
              }
              label="Store Attachments"
              labelPlacement="end"
            />
          </Grid>

          <Grid item md={6.2}>
            {!channel.properties.storeAttachments && (
              <Typography variant="body1" color="red">
                Attachments will be extracted but not stord or reattached.
              </Typography>
            )}
          </Grid>

          <Grid item md={0.8}>
            <Typography variant="subtitle1" textAlign="right">
              {' '}
              Tags:{' '}
            </Typography>
          </Grid>

          <Grid item md={11.2}>
            <TextField
              variant="outlined"
              size="small"
              placeholder="Enter channel tag"
              fullWidth
              value={channel.exportData.channelTags || ''}
              onChange={handleChangeTags}
            />
          </Grid>
        </Grid>
      </GroupBox>

      <AttachmentPropertyDialog
        open={attachmentPropertyOpen}
        onClose={handleCloseAttachmentPropertyDialog}
      />
      {channel && (
        <DataTypesDialog
          open={dataTypesDialogOpen}
          onClose={handleCloseDataTypesDialog}
          channel={channel}
        />
      )}
    </div>
  );
};

export default ChannelPropertyView;
