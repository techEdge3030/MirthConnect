import {
  Checkbox,
  FormControlLabel,
  OutlinedInput,
  Radio,
  Stack
} from '@mui/material';
import type { ChangeEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { GroupBox } from '../../../../components';
import type { RootState } from '../../../../states';
import {
  updateArchiveEnabled,
  updatePruneContentDays,
  updatePruneErroredMessages,
  updatePruneMetaDataDays
} from '../../../../states/channelReducer';

const MessagePrunningView = () => {
  const channel = useSelector((state: RootState) => state.channels.channel);
  const dispatch = useDispatch();

  const handleClickMetadataIndefinitely = () =>
    dispatch(updatePruneMetaDataDays());
  const handleClickMetadataCustom = () =>
    dispatch(updatePruneMetaDataDays('0'));
  const handleChangePruneMetaDataDays = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => dispatch(updatePruneMetaDataDays(event.target.value));
  const handleClickContentMetadata = () => dispatch(updatePruneContentDays());
  const handleClickContentCustom = () => dispatch(updatePruneContentDays('0'));
  const handleChangePruneContentDays = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => dispatch(updatePruneContentDays(event.target.value));
  const handleChangeArchiveEnabled = (
    _: ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => dispatch(updateArchiveEnabled(checked));
  const handleChangePruneErroredMessages = (
    _: ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => dispatch(updatePruneErroredMessages(checked));

  return (
    <div>
      <GroupBox label="Message Prunning" border>
        <Stack direction="column" spacing={0}>
          <div>Metadata:</div>

          <div>
            {' '}
            <Radio
              checked={
                channel.exportData.metadata.pruningSettings
                  .pruneMetaDataDays === undefined
              }
              onClick={handleClickMetadataIndefinitely}
            />{' '}
            Store indefinitely{' '}
          </div>

          <div>
            <Radio
              checked={
                channel.exportData.metadata.pruningSettings
                  .pruneMetaDataDays !== undefined
              }
              onClick={handleClickMetadataCustom}
            />
            Prune metadata older than{' '}
            <OutlinedInput
              size="small"
              value={
                channel.exportData.metadata.pruningSettings.pruneMetaDataDays ??
                ''
              }
              onChange={handleChangePruneMetaDataDays}
              readOnly={
                channel.exportData.metadata.pruningSettings
                  .pruneMetaDataDays === undefined
              }
            />{' '}
            days
          </div>

          <div>Content:</div>

          <div>
            <Radio
              checked={
                channel.exportData.metadata.pruningSettings.pruneContentDays ===
                undefined
              }
              onClick={handleClickContentMetadata}
            />
            Prune when messagge metadata is removed
          </div>

          <div>
            <Radio
              checked={
                channel.exportData.metadata.pruningSettings.pruneContentDays !==
                undefined
              }
              onClick={handleClickContentCustom}
            />
            Prune content older than{' '}
            <OutlinedInput
              size="small"
              value={
                channel.exportData.metadata.pruningSettings.pruneContentDays ??
                ''
              }
              onChange={handleChangePruneContentDays}
              readOnly={
                channel.exportData.metadata.pruningSettings.pruneContentDays ===
                undefined
              }
            />{' '}
            days
          </div>

          <div>
            <FormControlLabel
              label="Allow message archiving"
              control={
                <Checkbox
                  checked={
                    channel.exportData.metadata.pruningSettings.archiveEnabled
                  }
                  onChange={handleChangeArchiveEnabled}
                />
              }
              disabled={
                channel.exportData.metadata.pruningSettings.pruneContentDays ===
                  undefined &&
                channel.exportData.metadata.pruningSettings
                  .pruneMetaDataDays === undefined
              }
            />
          </div>

          <div>
            <FormControlLabel
              label="Prune Errored Messages"
              control={
                <Checkbox
                  checked={
                    channel.exportData.metadata.pruningSettings
                      .pruneErroredMessages
                  }
                  onChange={handleChangePruneErroredMessages}
                />
              }
              disabled={
                channel.exportData.metadata.pruningSettings.pruneContentDays ===
                  undefined &&
                channel.exportData.metadata.pruningSettings
                  .pruneMetaDataDays === undefined
              }
            />
          </div>
        </Stack>
      </GroupBox>
    </div>
  );
};

export default MessagePrunningView;
