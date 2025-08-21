import { Grid, TextareaAutosize, Typography } from '@mui/material';
import type { FocusEvent } from 'react';
import { useMemo } from 'react';
import { useDispatch } from 'react-redux';

import { GroupBox } from '../../../../../components';
import { updateDestinationScript } from '../../../../../states/channelReducer';
import type { DestinationSettingsProps } from '../../DestinationView.type';

const JavaScriptWriterSettings = ({
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

  const handleChangeScript = (event: FocusEvent<HTMLTextAreaElement>) =>
    dispatch(updateDestinationScript({ current, data: event.target.value }));
  return (
    <div>
      <GroupBox label="JavaScript Writer Settings">
        <Grid container>
          <Grid item md={1}>
            <Typography variant="subtitle1" textAlign="right">
              JavaScript:
            </Typography>
          </Grid>

          <Grid item md={11}>
            <TextareaAutosize
              value={settings?.script ?? ''}
              onBlur={handleChangeScript}
              style={{ width: '100%' }}
              minRows={25}
              maxRows={25}
            />
          </Grid>
        </Grid>
      </GroupBox>
    </div>
  );
};

export default JavaScriptWriterSettings;
