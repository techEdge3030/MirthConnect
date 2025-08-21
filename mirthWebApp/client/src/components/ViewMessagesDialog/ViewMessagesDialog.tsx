import React, { useEffect, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { getChannelMessages } from '../../services/channelsService';

interface ViewMessagesDialogProps {
  open: boolean;
  onClose: () => void;
  channelId: string;
}

interface MessageRow {
  id: string;
  connector: string;
  status: string;
  receivedDate: string;
  responseDate: string;
  errors: string;
}

function formatMirthDate(dateObj: any): string {
  if (!dateObj || typeof dateObj !== 'object' || !dateObj.time) return '';
  try {
    return new Date(dateObj.time).toLocaleString();
  } catch {
    return '';
  }
}

const ViewMessagesDialog: React.FC<ViewMessagesDialogProps> = ({ open, onClose, channelId }) => {
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<MessageRow | null>(null);
  const [rawContent, setRawContent] = useState<string>('');
  const [rawLoading, setRawLoading] = useState(false);

  useEffect(() => {
    if (open && channelId) {
      setLoading(true);
      getChannelMessages(channelId)
        .then(data => {
          let msgs = [];
          if (data.list && data.list.message) {
            if (Array.isArray(data.list.message)) {
              msgs = data.list.message;
            } else if (data.list.message) {
              msgs = [data.list.message];
            }
          }
          setMessages(msgs);
        })
        .catch(() => setMessages([]))
        .finally(() => setLoading(false));
    }
    if (!open) {
      setMessages([]);
      setSelected(null);
      setRawContent('');
    }
  }, [open, channelId]);

  const handleRowClick = (row: any) => {
    setSelected(row);
    setRawLoading(true);
    let raw = '';
    try {
      if (row.connectorMessages && row.connectorMessages.entry) {
        let entry = row.connectorMessages.entry;
        if (Array.isArray(entry)) entry = entry[0];
        if (entry && entry.connectorMessage) {
          let candidate = entry.connectorMessage.raw || entry.connectorMessage.content || entry.connectorMessage.rawContent || entry.connectorMessage.encodedContent;
          if (candidate && typeof candidate === 'object' && candidate.content) {
            raw = candidate.content;
          } else if (typeof candidate === 'string') {
            raw = candidate;
          }
        }
      }
      if (!raw && row.raw) {
        if (typeof row.raw === 'object' && row.raw.content) {
          raw = row.raw.content;
        } else if (typeof row.raw === 'string') {
          raw = row.raw;
        }
      }
    } catch (e) {
      // ignore
    }
    setTimeout(() => {
      setRawContent(raw || 'No raw content found for this message.');
      setRawLoading(false);
    }, 100);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Channel Messages</DialogTitle>
      <DialogContent>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Connector</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Received Date</TableCell>
                  <TableCell>Response Date</TableCell>
                  <TableCell>Errors</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {messages.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">No messages found.</TableCell>
                  </TableRow>
                ) : (
                  messages.map((row: any) => (
                    <TableRow
                      key={row.id}
                      hover
                      selected={selected?.id === row.id}
                      onClick={() => handleRowClick(row)}
                      style={{ cursor: 'pointer' }}
                    >
                      <TableCell>{row.id}</TableCell>
                      <TableCell>{row.connector}</TableCell>
                      <TableCell>{row.status}</TableCell>
                      <TableCell>{formatMirthDate(row.receivedDate)}</TableCell>
                      <TableCell>{formatMirthDate(row.responseDate)}</TableCell>
                      <TableCell>{row.errors}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        <Box mt={2}>
          <strong>Raw Message:</strong>
          <Paper variant="outlined" sx={{ minHeight: 80, p: 2, mt: 1 }}>
            {rawLoading ? <CircularProgress size={20} /> : <pre style={{ margin: 0 }}>{rawContent || 'Select a message to view the raw message.'}</pre>}
          </Paper>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewMessagesDialog; 