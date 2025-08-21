import { Checkbox, FormControlLabel, Stack } from '@mui/material';
import type { ChangeEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { GroupBox, MirthSelect } from '../../../../components';
import type { RootState } from '../../../../states';
import {
  updateEncryptAttachments,
  updateEncryptCustomMetaData,
  updateEncryptData,
  updateMessageStorageMode,
  updateRemoveAttachmentsOnCompletion,
  updateRemoveContentOnCompletion,
  updateRemoveOnlyFilteredOnCompletion
} from '../../../../states/channelReducer';
import {
  CONTENT,
  DELIVERY,
  MESSAGE_STORAGE_MODE,
  METADATA
} from './MessageStorageView.constant';

const MessageStorageView = () => {
  const channel = useSelector((state: RootState) => state.channels.channel);
  const dispatch = useDispatch();

  const handleChangeMessageStroageMode = (value: string) =>
    dispatch(updateMessageStorageMode(value));
  const handleChangeEncryptData = (
    _: ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => dispatch(updateEncryptData(checked));
  const handleChangeEncryptAttachments = (
    _: ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => dispatch(updateEncryptAttachments(checked));
  const handleChangeEncryptCustomMetaData = (
    _: ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => dispatch(updateEncryptCustomMetaData(checked));
  const handleChangeRemoveContentOnCompletion = (
    _: ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => dispatch(updateRemoveContentOnCompletion(checked));
  const handleChangeRemoveOnlyFilteredOnCompletion = (
    _: ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => dispatch(updateRemoveOnlyFilteredOnCompletion(checked));
  const handleChangeRemoveAttachmentsOnCompletion = (
    _: ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => dispatch(updateRemoveAttachmentsOnCompletion(checked));

  return (
    <div>
      <GroupBox label="Message Storage" border>
        <Stack direction="column" spacing={1}>
          <div style={{ width: '50%' }}>
            <MirthSelect
              value={channel.properties.messageStorageMode}
              items={MESSAGE_STORAGE_MODE}
              onChange={handleChangeMessageStroageMode}
              fullWdith
            />
          </div>

          <div>Content: {CONTENT[channel.properties.messageStorageMode]}</div>

          <div>Metadata: {METADATA[channel.properties.messageStorageMode]}</div>

          <div>
            Durable Message Delivery:{' '}
            {DELIVERY[channel.properties.messageStorageMode]}
          </div>

          <div>
            <FormControlLabel
              label="Encrypt message content"
              labelPlacement="end"
              control={
                <Checkbox
                  checked={channel.properties.encryptData}
                  onChange={handleChangeEncryptData}
                />
              }
              disabled={
                channel.properties.messageStorageMode === 'METADATA' ||
                channel.properties.messageStorageMode === 'DISABLED'
              }
            />
            <FormControlLabel
              label="Attachments"
              labelPlacement="end"
              control={
                <Checkbox
                  checked={channel.properties.encryptAttachments}
                  onChange={handleChangeEncryptAttachments}
                />
              }
              disabled={
                channel.properties.messageStorageMode === 'METADATA' ||
                channel.properties.messageStorageMode === 'DISABLED'
              }
            />
            <FormControlLabel
              label="Custom metadata"
              labelPlacement="end"
              control={
                <Checkbox
                  checked={channel.properties.encryptCustomMetaData}
                  onChange={handleChangeEncryptCustomMetaData}
                />
              }
              disabled={channel.properties.messageStorageMode === 'DISABLED'}
            />
          </div>

          <div>
            <FormControlLabel
              label="Remove content on completion"
              labelPlacement="end"
              control={
                <Checkbox
                  checked={channel.properties.removeContentOnCompletion}
                  onChange={handleChangeRemoveContentOnCompletion}
                />
              }
              disabled={
                channel.properties.messageStorageMode === 'METADATA' ||
                channel.properties.messageStorageMode === 'DISABLED'
              }
            />
            <FormControlLabel
              label="Filtered only"
              labelPlacement="end"
              control={
                <Checkbox
                  checked={channel.properties.removeOnlyFilteredOnCompletion}
                  onChange={handleChangeRemoveOnlyFilteredOnCompletion}
                />
              }
              disabled={
                channel.properties.messageStorageMode === 'METADATA' ||
                channel.properties.messageStorageMode === 'DISABLED' ||
                channel.properties.removeContentOnCompletion === false
              }
            />
          </div>

          <div>
            <FormControlLabel
              label="Remove attachments on completion"
              labelPlacement="end"
              control={
                <Checkbox
                  checked={channel.properties.removeAttachmentsOnCompletion}
                  onChange={handleChangeRemoveAttachmentsOnCompletion}
                />
              }
              disabled={
                channel.properties.messageStorageMode === 'METADATA' ||
                channel.properties.messageStorageMode === 'DISABLED'
              }
            />
          </div>
        </Stack>
      </GroupBox>
    </div>
  );
};

export default MessageStorageView;
