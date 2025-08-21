import {
  Button,
  Grid,
  TextareaAutosize,
  TextField,
  Typography
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';

import { GroupBox, MirthSelect, MirthTable } from '../../../../../components';
import { getChannelIdsAndNames } from '../../../../../services/channelsService';
import { updateDestinationChannelId } from '../../../../../states/channelReducer';
import type { Column, Row, SelectItem } from '../../../../../types';
import type { DestinationSettingsProps } from '../../DestinationView.type';

const ChannelWriterSettings = ({
  current,
  destinations
}: DestinationSettingsProps) => {
  const [channels, setChannels] = useState<SelectItem[]>([]);
  const dispatch = useDispatch();

  const settings = useMemo(() => {
    if (current) {
      return destinations.find(d => d.metaDataId === current)!.properties;
    }
    return undefined;
  }, [current, destinations]);

  const columns: Column[] = [{ id: 'mapVariable', title: 'Map Variable' }];
  const rows: Row[] = useMemo(() => {
    return (
      settings?.mapVariables.string.map(
        data =>
          ({
            id: data,
            mapVariable: {
              type: 'text',
              value: data
            }
          }) as Row
      ) ?? []
    );
  }, [settings]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await getChannelIdsAndNames();
      const data = response.map(
        d =>
          ({
            value: d.string[0],
            label: d.string[1]
          }) as SelectItem
      );
      setChannels([{ value: 'none', label: '<None>' }, ...data]);
    };
    fetchData();
  }, []);

  const handleChangeChannel = (value: string) => {
    dispatch(
      updateDestinationChannelId({
        current,
        data: value
      })
    );
  };

  return (
    <div>
      <GroupBox label="Channel Writer Settings">
        <Grid container rowSpacing={2} columnSpacing={2}>
          <Grid item md={1.5}>
            {' '}
            <Typography variant="subtitle1" textAlign="right">
              {' '}
              Channel Id:{' '}
            </Typography>{' '}
          </Grid>

          <Grid item md={2.5}>
            {' '}
            <TextField value={settings?.channelId} disabled fullWidth />{' '}
          </Grid>

          <Grid item md={2}>
            {' '}
            <MirthSelect
              value={settings?.channelId ?? ''}
              items={channels}
              onChange={handleChangeChannel}
              fullWdith
            />{' '}
          </Grid>

          <Grid item md={6} />

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              {' '}
              Message Metadata:{' '}
            </Typography>
          </Grid>

          <Grid item md={9.5}>
            <MirthTable rows={rows} columns={columns} />
          </Grid>

          <Grid item md={1}>
            <Button size="small" variant="contained" fullWidth>
              New
            </Button>
            <Button
              size="small"
              variant="contained"
              fullWidth
              style={{ marginTop: '5px' }}
            >
              Delete
            </Button>
          </Grid>

          <Grid item md={1.5}>
            <Typography variant="subtitle1" textAlign="right">
              {' '}
              Template:{' '}
            </Typography>
          </Grid>

          <Grid item md={10.5}>
            <TextareaAutosize
              style={{ width: '100%' }}
              minRows={5}
              maxRows={5}
              value={settings?.channelTemplate ?? ''}
            />
          </Grid>
        </Grid>
      </GroupBox>
    </div>
  );
};

export default ChannelWriterSettings;
