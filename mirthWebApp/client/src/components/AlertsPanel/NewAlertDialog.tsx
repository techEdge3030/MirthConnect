import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Typography,
  Box,
  Paper,
  Divider,
  Select,
  MenuItem,
  IconButton
} from '@mui/material';
import { TreeView, TreeItem } from '@mui/x-tree-view';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DeleteIcon from '@mui/icons-material/Delete';
import { AlertModel, AlertAction } from '../../types/alert.type';
import { getAllChannels } from '../../services/channelsService';
import { getAlertProtocolOptions } from '../../services/alertsService';
import { Channel } from '../../types/channel.type';
import { getMirthApiClient } from '../../utils/api';

const ERROR_EVENT_TYPES = [
  { key: 'SOURCE_ERROR', label: 'Source Error' },
  { key: 'DESTINATION_ERROR', label: 'Destination Error' },
  { key: 'POSTPROCESSOR_ERROR', label: 'Postprocessor Error' },
  { key: 'RESPONSE_ERROR', label: 'Response Error' },
  { key: 'PROCESSING_ERROR', label: 'Processing Error' },
  { key: 'OTHER_ERROR', label: 'Other Error' }
];
const VARIABLES = [
  'alertId', 'alertName', 'serverId', 'globalMapVariable', 'date',
  'systemTime', 'error', 'errorMessage', 'errorType',
  'channelId', 'channelName', 'connectorName', 'connectorType', 'messageId'
];

interface NewAlertDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (alert: AlertModel) => void;
}

const NewAlertDialog: React.FC<NewAlertDialogProps> = ({ open, onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [errorTypes, setErrorTypes] = useState<string[]>([]);
  const [regex, setRegex] = useState('');
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannels, setSelectedChannels] = useState<Record<string, { enabled: boolean; connectors: Record<string, boolean> }>>({});
  const [actions, setActions] = useState<AlertAction[]>([{ protocol: 'Email', recipient: '' }]);
  const [subject, setSubject] = useState('');
  const [template, setTemplate] = useState('');
  const [protocols, setProtocols] = useState<Record<string, Record<string, string> | null>>({});

  // Add logging after protocols are loaded
  useEffect(() => {
    if (open) {
      getAllChannels().then(setChannels);
      getAlertProtocolOptions().then(protocols => {
        const mirthApiClient = getMirthApiClient();
        // Print the raw XML response for debugging
        mirthApiClient.get('alerts/options', { responseType: 'text' }).then(({ data }: { data: string }) => {
          console.log('Raw /api/alerts/options XML:', data);
        });
        setProtocols(protocols);
        console.log('Parsed protocols:', protocols);
      });
    }
  }, [open]);

  // Set default protocol for new actions robustly
  useEffect(() => {
    if (open && Object.keys(protocols).length > 0) {
      setActions(prev => prev.map((a, i) => ({
        ...a,
        protocol: Object.keys(protocols)[0] || ''
      })));
    }
  }, [open, protocols]);

  const handleChannelToggle = (channelId: string) => {
    setSelectedChannels(prev => ({ ...prev, [channelId]: { ...prev[channelId], enabled: !prev[channelId]?.enabled } }));
  };
  const handleConnectorToggle = (channelId: string, connectorId: string) => {
    setSelectedChannels(prev => ({
      ...prev,
      [channelId]: {
        ...prev[channelId],
        connectors: { ...prev[channelId]?.connectors, [connectorId]: !prev[channelId]?.connectors?.[connectorId] }
      }
    }));
  };
  const handleErrorTypeChange = (type: string) => setErrorTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  const handleActionChange = (idx: number, field: keyof AlertAction, value: string) => setActions(prev => prev.map((a, i) => i === idx ? { ...a, [field]: value } : a));
  const handleAddAction = () => setActions(prev => [...prev, { protocol: 'Email', recipient: '' }]);
  const handleRemoveAction = (idx: number) => setActions(prev => prev.filter((_, i) => i !== idx));
  const handleSave = () => {
    onSubmit({
      name,
      enabled,
      trigger: { type: 'DefaultTrigger', errorEventTypes: errorTypes, regex, alertChannels: selectedChannels },
      actionGroups: [{ subject, template, actions }]
    });
  };

  const protocolLabel = (key: string) => {
    switch (key.toLowerCase()) {
      case 'email':
        return 'Email';
      case 'channel':
      case 'sendtochannel':
      case 'send_channel':
      case 'sendto_channel':
        return 'Send to Channel';
      default:
        // Try to prettify common Java map keys
        if (key.toLowerCase().includes('email')) return 'Email';
        if (key.toLowerCase().includes('channel')) return 'Send to Channel';
        return key;
    }
  };

  // Helper for drag-and-drop insertion
  function insertAtCursor(input: HTMLInputElement | HTMLTextAreaElement, text: string) {
    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;
    const value = input.value;
    input.value = value.slice(0, start) + text + value.slice(end);
    input.selectionStart = input.selectionEnd = start + text.length;
    input.focus();
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>New Alert</DialogTitle>
      <DialogContent>
        <TextField label="Alert Name" value={name} onChange={e => setName(e.target.value)} fullWidth margin="normal" required />
        <FormControlLabel control={<Checkbox checked={enabled} onChange={e => setEnabled(e.target.checked)} />} label="Enabled" />
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6">Trigger</Typography>
        <FormGroup row>{ERROR_EVENT_TYPES.map(type => <FormControlLabel key={type.key} control={<Checkbox checked={errorTypes.includes(type.key)} onChange={() => handleErrorTypeChange(type.key)} />} label={type.label} />)}</FormGroup>
        <TextField label="Regex (optional)" value={regex} onChange={e => setRegex(e.target.value)} fullWidth margin="normal" />
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6">Channels</Typography>
        <Paper sx={{ p: 2, maxHeight: 300, overflow: 'auto' }} variant="outlined">
          <TreeView>
            {channels.map(channel => {
              // Normalize connector to always be an array
              const connectors = Array.isArray(channel.destinationConnectors.connector)
                ? channel.destinationConnectors.connector
                : [channel.destinationConnectors.connector];
              return (
                <TreeItem key={channel.id} nodeId={channel.id} label={<FormControlLabel control={<Checkbox checked={!!selectedChannels[channel.id]?.enabled} onChange={() => handleChannelToggle(channel.id)} />} label={channel.name} />}>
                  {connectors.map(connector => (
                    <TreeItem key={connector.metaDataId} nodeId={`${channel.id}-${connector.metaDataId}`} label={<FormControlLabel control={<Checkbox checked={!!selectedChannels[channel.id]?.connectors?.[connector.metaDataId]} onChange={() => handleConnectorToggle(channel.id, String(connector.metaDataId))} />} label={connector.name} />} />
                  ))}
                </TreeItem>
              );
            })}
          </TreeView>
        </Paper>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6">Actions</Typography>
        {actions.map((action, idx) => (
          <Box key={idx} sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 1 }}>
            {Object.keys(protocols).length > 0 ? (
              <Select
                value={Object.keys(protocols).includes(action.protocol) ? action.protocol : ''}
                onChange={e => handleActionChange(idx, 'protocol', e.target.value)}
                size="small"
                style={{ width: 120 }}
                displayEmpty
              >
                {Object.keys(protocols).map(p => (
                  <MenuItem key={p} value={p}>{protocolLabel(p)}</MenuItem>
                ))}
              </Select>
            ) : (
              <Select value="" disabled>
                <MenuItem value="">No protocols available</MenuItem>
              </Select>
            )}
            {/* Recipient field logic */}
            {action.protocol === 'Channel' && protocols['Channel'] ? (
              <Select
                value={action.recipient}
                onChange={e => handleActionChange(idx, 'recipient', e.target.value)}
                size="small"
                style={{ flex: 1 }}
                displayEmpty
              >
                <MenuItem value="">Select Channel</MenuItem>
                {Object.entries(protocols['Channel'] as Record<string, string>).map(([id, name]) => (
                  <MenuItem key={id} value={id}>{name}</MenuItem>
                ))}
              </Select>
            ) : action.protocol === 'User' && protocols['User'] ? (
              <Select
                value={action.recipient}
                onChange={e => handleActionChange(idx, 'recipient', e.target.value)}
                size="small"
                style={{ flex: 1 }}
                displayEmpty
              >
                <MenuItem value="">Select User</MenuItem>
                {Object.entries(protocols['User'] as Record<string, string>).map(([id, name]) => (
                  <MenuItem key={id} value={id}>{name}</MenuItem>
                ))}
              </Select>
            ) : (
              <TextField label="Recipient" value={action.recipient} onChange={e => handleActionChange(idx, 'recipient', e.target.value)} size="small" style={{ flex: 1 }} />
            )}
            <IconButton onClick={() => handleRemoveAction(idx)} color="error"><DeleteIcon /></IconButton>
          </Box>
        ))}
        <Button onClick={handleAddAction} size="small" sx={{ mt: 1 }}>Add Action</Button>
        <TextField
          label="Subject (for email)"
          value={subject}
          onChange={e => setSubject(e.target.value)}
          fullWidth
          margin="normal"
          inputProps={{
            onDrop: (e: React.DragEvent<HTMLInputElement>) => {
              e.preventDefault();
              const variable = e.dataTransfer.getData('text/plain');
              insertAtCursor(e.target as HTMLInputElement, ` ${variable} `);
              setSubject((prev) => {
                const input = e.target as HTMLInputElement;
                return input.value;
              });
            },
            onDragOver: (e: React.DragEvent<HTMLInputElement>) => e.preventDefault(),
          }}
        />
        <TextField
          label="Template"
          value={template}
          onChange={e => setTemplate(e.target.value)}
          fullWidth
          margin="normal"
          multiline
          minRows={3}
          inputProps={{
            onDrop: (e: React.DragEvent<HTMLInputElement>) => {
              e.preventDefault();
              const variable = e.dataTransfer.getData('text/plain');
              insertAtCursor(e.target as HTMLInputElement, ` ${variable} `);
              setTemplate((prev) => {
                const input = e.target as HTMLInputElement;
                return input.value;
              });
            },
            onDragOver: (e: React.DragEvent<HTMLInputElement>) => e.preventDefault(),
          }}
        />
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6">Alert Variables</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {VARIABLES.map(v => (
            <Paper
              key={v}
              sx={{ p: 0.5, px: 1, fontSize: 13, cursor: 'grab' }}
              variant="outlined"
              draggable
              onDragStart={e => e.dataTransfer.setData('text/plain', ` ${v} `)}
            >
              {` ${v} `}
            </Paper>
          ))}
        </Box>
      </DialogContent>
      <DialogActions><Button onClick={onClose}>Cancel</Button><Button onClick={handleSave} variant="contained">Save</Button></DialogActions>
    </Dialog>
  );
};

export default NewAlertDialog;
