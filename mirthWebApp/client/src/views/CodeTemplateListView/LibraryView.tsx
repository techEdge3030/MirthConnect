import {
  Button,
  Grid,
  Stack,
  TextareaAutosize,
  TextField,
  Typography
} from '@mui/material';
import type { GridColDef, GridRowModel } from '@mui/x-data-grid';
import { DataGridPro } from '@mui/x-data-grid-pro';
import { useEffect, useState } from 'react';

import { getAllChannels } from '../../services';
import type { Channel } from '../../types';

interface Row {
  id: string;
  name: string;
}

const columns: GridColDef[] = [{ field: 'name', headerName: 'Name', flex: 1 }];

interface ILibraryViewProps {
  name: string;
  description: string;
  selectedChannelIds: string[];
  onSave: (
    name: string,
    description: string,
    selectedChannelIds: string[]
  ) => void;
}

const LibraryView = (props: ILibraryViewProps) => {
  const [rows, setRows] = useState<GridRowModel<Row>[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedChannelIds, setSelectedChannelIds] = useState<string[]>(
    props.selectedChannelIds
  );

  useEffect(() => {
    setSelectedChannelIds(props.selectedChannelIds);
  }, [props.selectedChannelIds]);

  useEffect(() => {
    setName(props.name);
    setDescription(props.description);
  }, [props.name, props.description]);

  useEffect(() => {
    getAllChannels().then(channels => {
      setRows(generateRowData(channels));
    });
  }, []);

  const generateRowData = (channels: Channel[]): GridRowModel<Row>[] => {
    const data: GridRowModel<Row>[] = [];
    for (const channel of channels) {
      data.push({
        id: channel.id,
        name: channel.name
      });
    }
    return data;
  };

  const onSelectChannel = (ids: string[]) => {
    setSelectedChannelIds(ids);
  };

  return (
    <Stack direction="column">
      <Stack direction="row" spacing={0.5}>
        <Grid
          container
          direction="row"
          rowSpacing={0.5}
          columnSpacing={2}
          alignItems="center"
          flex={4}
        >
          <Grid item md={2}>
            <Typography variant="h6">Summary:</Typography>
          </Grid>
          <Grid item md={10}>
            <Typography variant="subtitle1">
              1 Function, 1 Drag-and-Drop Code Block, 0 Compiled Code Blocks
            </Typography>
          </Grid>
          <Grid item md={2}>
            <Typography variant="h6">Name:</Typography>
          </Grid>
          <Grid item md={10}>
            <TextField
              variant="outlined"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </Grid>
          <Grid item md={2}>
            <Typography variant="h6">Description:</Typography>
          </Grid>
          <Grid item md={10}>
            <TextareaAutosize
              minRows={20}
              style={{ width: '95%' }}
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </Grid>
        </Grid>
        <Grid container direction="column" paddingTop={1} flex={1}>
          <Typography variant="h6">Channels</Typography>
          <DataGridPro
            columns={columns}
            rows={rows}
            checkboxSelection
            onRowSelectionModelChange={(ids: any) => onSelectChannel(ids)}
            rowSelectionModel={selectedChannelIds}
          />
        </Grid>
      </Stack>
      <Grid
        item
        flexGrow={0}
        style={{ marginTop: '10px', marginBottom: '10px' }}
      >
        <Stack direction="row" justifyContent="space-evenly">
          <Button
            variant="contained"
            color="success"
            onClick={() => props.onSave(name, description, selectedChannelIds)}
          >
            Save
          </Button>
        </Stack>
      </Grid>
    </Stack>
  );
};

export default LibraryView;
