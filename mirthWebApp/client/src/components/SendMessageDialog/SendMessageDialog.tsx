import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Alert, Box, Table, TableBody, TableCell, TableHead, TableRow, IconButton, Checkbox, Typography, Paper } from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { getConnectorNames } from '../../services/channelsService';
import type { Connector } from '../../types/channel.type';

// Inline types from Dev-Sean if not present in channelsService
interface SourceMapVar { key: string; value: string; }
interface AdvancedOptions { overwrite: boolean; imported: boolean; originalMessageId: string; }

interface SendMessageDialogProps {
  open: boolean;
  onClose: () => void;
  onSend: (message: string, destinationMetaDataIds: number[], sourceMapVars: SourceMapVar[], advancedOptions: AdvancedOptions) => void;
  selectedChannel?: { id: string; name: string } | null;
}

const defaultAdvancedOptions: AdvancedOptions = { overwrite: false, imported: false, originalMessageId: '' };

const SendMessageDialog = ({ open, onClose, onSend, selectedChannel }: SendMessageDialogProps) => {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [destinations, setDestinations] = useState<Connector[]>([]);
  const [selectedDestinations, setSelectedDestinations] = useState<number[]>([]);
  const [loadingDestinations, setLoadingDestinations] = useState(false);
  const [sourceMapVars, setSourceMapVars] = useState<SourceMapVar[]>([]);
  const [newVar, setNewVar] = useState<SourceMapVar>({ key: '', value: '' });
  const [result, setResult] = useState<string>('');
  const [sending, setSending] = useState(false);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open && selectedChannel) {
      setLoadingDestinations(true);
      getConnectorNames(selectedChannel.id)
        .then((connectors) => {
          setDestinations(connectors);
          setSelectedDestinations(connectors.map((c) => c.int));
        })
        .catch(() => {
          setDestinations([]);
          setSelectedDestinations([]);
        })
        .finally(() => setLoadingDestinations(false));
    } else {
      setDestinations([]);
      setSelectedDestinations([]);
    }
    if (open) {
      setSourceMapVars([]);
      setNewVar({ key: '', value: '' });
      setResult('');
      setError('');
      setMessage('');
      if (messageInputRef.current) {
        messageInputRef.current.focus();
      }
    }
  }, [open, selectedChannel]);

  const handleSend = async () => {
    if (!selectedChannel) {
      setError('No channel selected.');
      return;
    }
    if (!message.trim()) {
      setError('Message cannot be empty.');
      return;
    }
    if (!selectedDestinations.length) {
      setError('At least one destination must be selected.');
      return;
    }
    setError('');
    setSending(true);
    setResult('');
    try {
      await onSend(message, selectedDestinations, sourceMapVars, defaultAdvancedOptions);
      setResult('Message sent successfully!');
    } catch (err) {
      setResult(`Error sending message: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    setError('');
    setMessage('');
    setResult('');
    onClose();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, isBinary: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      if (isBinary) {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result;
          if (typeof result === 'string') {
            setMessage(result);
          } else if (result instanceof ArrayBuffer) {
            const base64 = btoa(String.fromCharCode(...new Uint8Array(result)));
            setMessage(base64);
          }
        };
        reader.readAsArrayBuffer(file);
      } else {
        const text = await file.text();
        setMessage(text);
      }
    } catch (err) {
      setError('Failed to load file.');
    }
  };

  const handleDestinationToggle = (metaDataId: number) => {
    setSelectedDestinations((prev) =>
      prev.includes(metaDataId)
        ? prev.filter((id) => id !== metaDataId)
        : [...prev, metaDataId]
    );
  };

  const handleAddVar = () => {
    if (!newVar.key.trim()) return;
    setSourceMapVars((prev) => [...prev, { ...newVar }]);
    setNewVar({ key: '', value: '' });
  };

  const handleDeleteVar = (idx: number) => {
    setSourceMapVars((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleVarChange = (idx: number, field: 'key' | 'value', value: string) => {
    setSourceMapVars((prev) => prev.map((v, i) => i === idx ? { ...v, [field]: value } : v));
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>Message</DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {result && (
          <Alert severity={result.includes('Error') ? 'error' : 'success'} sx={{ mb: 2 }}>{result}</Alert>
        )}
        <Box sx={{ mb: 1 }}>
          <textarea
            ref={messageInputRef}
            value={message}
            onChange={e => setMessage(e.target.value)}
            style={{
              width: '100%',
              minHeight: 180,
              minWidth: 500,
              fontFamily: 'monospace',
              fontSize: 15,
              overflowY: 'auto',
              overflowX: 'auto',
              resize: 'none',
              whiteSpace: 'pre',
              wordBreak: 'normal',
              border: '1px solid #ccc',
              borderRadius: 4,
              background: '#fff',
              boxSizing: 'border-box',
              padding: 8,
            }}
            wrap="off"
            spellCheck={false}
          />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mb: 2 }}>
          <Button variant="outlined" component="label" size="small">
            Open Text File...
            <input type="file" accept=".txt,text/plain" hidden onChange={e => handleFileChange(e, false)} />
          </Button>
          <Button variant="outlined" component="label" size="small">
            Open Binary File...
            <input type="file" hidden onChange={e => handleFileChange(e, true)} />
          </Button>
        </Box>
        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Send to the following destination(s):</Typography>
        <Paper variant="outlined" sx={{ mb: 2, p: 0 }}>
          <div style={{ maxHeight: 180, minWidth: 500, overflowY: 'auto', overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Destination</TableCell>
                  <TableCell align="center" sx={{ width: 100 }}>Included</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {destinations
                  .filter(dest => dest.string !== 'Source')
                  .map((dest) => (
                    <TableRow key={dest.int}>
                      <TableCell>{dest.string}</TableCell>
                      <TableCell align="center">
                        <Checkbox
                          checked={selectedDestinations.includes(dest.int)}
                          onChange={() => handleDestinationToggle(dest.int)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </Paper>
        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Source Map Variables:</Typography>
        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
          <TextField
            label="Key"
            size="small"
            value={newVar.key}
            onChange={e => setNewVar({ ...newVar, key: e.target.value })}
            sx={{ flex: 1 }}
          />
          <TextField
            label="Value"
            size="small"
            value={newVar.value}
            onChange={e => setNewVar({ ...newVar, value: e.target.value })}
            sx={{ flex: 2 }}
          />
          <IconButton onClick={handleAddVar} color="primary" size="small" sx={{ alignSelf: 'center' }}>
            <Add fontSize="small" />
          </IconButton>
        </Box>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Key</TableCell>
              <TableCell>Value</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sourceMapVars.map((v, idx) => (
              <TableRow key={idx}>
                <TableCell>
                  <TextField
                    value={v.key}
                    onChange={e => handleVarChange(idx, 'key', e.target.value)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    value={v.value}
                    onChange={e => handleVarChange(idx, 'value', e.target.value)}
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  <IconButton onClick={() => handleDeleteVar(idx)} color="error" size="small">
                    <Delete fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSend} variant="contained" disabled={sending}>
          Send
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SendMessageDialog; 