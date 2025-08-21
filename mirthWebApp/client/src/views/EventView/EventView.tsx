import { Search } from '@mui/icons-material';
import { Box, Button, Grid, Paper, TextField, Typography } from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import { DataGrid } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';

import { getChannelFromEvent, getEvents } from '../../services/eventService';
import type { IEvent } from '../../types/event.type';

const columns: GridColDef[] = [
  { field: 'level', headerName: 'Level', width: 150 },
  { field: 'dateTime', headerName: 'Date & Time', width: 250 },
  { field: 'name', headerName: 'Name', width: 150 },
  { field: 'serverId', headerName: 'Server ID', width: 300 },
  { field: 'userId', headerName: 'User' },
  { field: 'outcome', headerName: 'Outcome' },
  { field: 'ipAddress', headerName: 'IP Address' },
  {
    field: 'channelId',
    headerName: 'Channel ID - Message ID',
    width: 150,
    renderCell: params => {
      const event = params.row as IEvent;
      const channel = getChannelFromEvent(event);
      return channel?.id || '';
    }
  },
  {
    field: 'channelName',
    headerName: 'Channel Name',
    width: 150,
    renderCell: params => {
      const event = params.row as IEvent;
      const channel = getChannelFromEvent(event);
      return channel?.name || '';
    }
  },
  { field: 'patientId', headerName: 'Patient ID' }
];

const EventView = () => {
  const [events, setEvents] = useState<IEvent[]>([]);
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    onSearch();
  }, []);

  const onSearch = async () => {
    const result = await getEvents(keyword);
    setEvents(result);
    console.log({ result });
  };

  return (
    <Grid
      container
      style={{ backgroundColor: 'white', height: '100%' }}
      direction="column"
    >
      <Paper
        elevation={5}
        sx={{ p: 2, display: 'flex', flexDirection: 'column', my: 3 }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography component="h1" variant="h5">
            Events
          </Typography>
          <Box sx={{ display: 'flex', gap: '10px', mt: 3, mb: 2 }}>
            <TextField
              type="text"
              placeholder="Search the Events"
              size="small"
              onChange={e => setKeyword(e.target.value)}
            />
            <Button type="submit" variant="contained" onClick={onSearch}>
              <Search /> Search
            </Button>
          </Box>
        </Box>
        <Grid item flexGrow={1}>
          <DataGrid
            rows={events}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 100
                }
              }
            }}
            pageSizeOptions={[50, 100]}
          />
        </Grid>
      </Paper>
    </Grid>
  );
};

export default EventView;
