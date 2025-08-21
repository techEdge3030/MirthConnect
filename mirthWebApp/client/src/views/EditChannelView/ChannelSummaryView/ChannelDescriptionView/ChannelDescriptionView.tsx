import { TextareaAutosize } from '@mui/material';
import type { ChangeEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { GroupBox } from '../../../../components';
import type { RootState } from '../../../../states';
import { updateChannelDescription } from '../../../../states/channelReducer';

const ChannelDescriptionView = () => {
  const channel = useSelector((state: RootState) => state.channels.channel);
  const dispatch = useDispatch();

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    dispatch(updateChannelDescription(event.target.value));
  };

  return (
    <div>
      <GroupBox label="Channel Description" border>
        <TextareaAutosize
          style={{ width: '100%' }}
          minRows={10}
          onChange={handleChange}
          value={channel.description}
        />
      </GroupBox>
    </div>
  );
};

export default ChannelDescriptionView;
