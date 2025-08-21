import React, { useState } from 'react';
import { Box, Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, TextField, Typography, Divider } from '@mui/material';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import DeleteIcon from '@mui/icons-material/Delete';

const LOG_TABS = [
  { label: 'Server Log', value: 'server' },
  { label: 'Connection Log', value: 'connection' },
  { label: 'Global Maps', value: 'global' },
];

const STATIC_LOGS = [
  { id: 1, info: '[2025-06-27 18:46:07.028] INFO  Web server running at http://172.23.33.179:8080/ and https://172.23.33.179:8443/' },
  { id: 2, info: '[2025-06-27 18:46:07.007] INFO  Running OpenJDK 64-Bit Server VM 17.0.14 on Windows 11 (10.0, amd64), derby, with charset windows-1252.' },
  { id: 3, info: '[2025-06-27 18:46:07.006] INFO  This product was developed by NextGen Healthcare (https://www.nextgen.com) and its contributors (c)2005-2024.' },
  { id: 4, info: '[2025-06-27 18:46:06.999] INFO  Mirth Connect 4.5.2 (Built on September 6, 2024) server successfully started.' },
];

export default function LogPanel() {
  const [tab, setTab] = useState('server');
  const [paused, setPaused] = useState(false);
  const [logSize, setLogSize] = useState(50);

  return (
    <Paper elevation={2} sx={{ p: 0, borderRadius: 2, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Tabs for log selection */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', background: '#f7f7f7' }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          {LOG_TABS.map(t => <Tab key={t.value} label={t.label} value={t.value} />)}
        </Tabs>
      </Box>
      {/* Log Table */}
      <TableContainer sx={{ flex: 1, minHeight: 0, background: '#fff' }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 60, color: '#888', fontWeight: 600 }}>ID</TableCell>
              <TableCell sx={{ color: '#888', fontWeight: 600 }}>Log Information</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {STATIC_LOGS.slice(0, logSize).map(row => (
              <TableRow key={row.id} hover>
                <TableCell>{row.id}</TableCell>
                <TableCell style={{ fontFamily: 'monospace', fontSize: 13 }}>{row.info}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Divider />
      {/* Controls at the bottom */}
      <Box sx={{ display: 'flex', alignItems: 'center', p: 1.5, gap: 2, background: '#fafafa', borderTop: '1px solid #eee' }}>
        <Button
          variant="outlined"
          size="small"
          startIcon={paused ? <PlayArrowIcon /> : <PauseIcon />}
          onClick={() => setPaused(p => !p)}
        >
          {paused ? 'Resume' : 'Pause'}
        </Button>
        <Button
          variant="outlined"
          size="small"
          startIcon={<DeleteIcon />}
          color="error"
          sx={{ ml: 1 }}
        >
          Clear Log
        </Button>
        <Box sx={{ flex: 1 }} />
        <Typography variant="body2" sx={{ color: '#555', mr: 1 }}>Log Size:</Typography>
        <TextField
          size="small"
          type="number"
          value={logSize}
          onChange={e => setLogSize(Number(e.target.value))}
          inputProps={{ min: 1, style: { width: 60, padding: 4 } }}
          sx={{ mr: 1 }}
        />
        <Button variant="outlined" size="small">Change</Button>
      </Box>
    </Paper>
  );
}
