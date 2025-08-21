import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Divider,
  Checkbox,
  FormGroup,
  TextField,
  Select,
  MenuItem,
  InputLabel
} from '@mui/material';
import { GroupBox } from '../../../../components';
import type { Channel } from '../../../../types/channel.type';

interface DataTypesDialogProps {
  open: boolean;
  onClose: () => void;
  channel: Channel;
}

interface ConnectorData {
  name: string;
  inboundDataType: string;
  outboundDataType: string;
}

const DATA_TYPES = [
  'HL7 v2.x',
  'HL7 v3',
  'XML',
  'JSON',
  'Delimited Text',
  'Raw',
  'DICOM',
  'EDI X12',
  'NCPDP',
  'Custom'
];

const DataTypesDialog: React.FC<DataTypesDialogProps> = ({ open, onClose, channel }) => {
  // Don't render if channel is not available
  if (!channel) {
    return null;
  }

  const [editMode, setEditMode] = useState<'single' | 'bulk'>('single');
  const [selectedConnector, setSelectedConnector] = useState<string>('source');
  const [connectors, setConnectors] = useState<ConnectorData[]>(() => {
    try {
      // Safely handle the destinationConnectors structure
      const destinationConnectors = channel?.destinationConnectors?.connector;
      let destinations: any[] = [];
      
      if (destinationConnectors) {
        if (Array.isArray(destinationConnectors)) {
          destinations = destinationConnectors;
        } else if (typeof destinationConnectors === 'object') {
          destinations = [destinationConnectors];
        }
      }

      return [
        {
          name: 'Source Connector',
          inboundDataType: channel?.sourceConnector?.transformer?.inboundDataType || 'HL7 v2.x',
          outboundDataType: channel?.sourceConnector?.transformer?.outboundDataType || 'HL7 v2.x'
        },
        ...destinations.map((dest, index) => ({
          name: `Destination ${index + 1}`,
          inboundDataType: dest?.transformer?.inboundDataType || 'HL7 v2.x',
          outboundDataType: dest?.transformer?.outboundDataType || 'HL7 v2.x'
        }))
      ];
    } catch (error) {
      console.error('Error initializing connectors:', error);
      return [
        {
          name: 'Source Connector',
          inboundDataType: 'HL7 v2.x',
          outboundDataType: 'HL7 v2.x'
        }
      ];
    }
  });

  const [inboundProperties, setInboundProperties] = useState({
    parseFieldRepetitions: true,
    parseSubcomponents: true,
    useStrictParser: false,
    validateInStrictParser: false,
    stripNamespaces: false,
    segmentDelimiter: '\\r',
    convertLineBreaks: true,
    splitBatchBy: 'MSH Segment'
  });

  const [outboundProperties, setOutboundProperties] = useState({
    useStrictParser: false,
    validateInStrictParser: false,
    segmentDelimiter: '\\r',
    parseFieldRepetitions: true,
    parseSubcomponents: true,
    stripNamespaces: false,
    convertLineBreaks: true
  });

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log('Saving data types configuration:', {
      editMode,
      connectors,
      inboundProperties,
      outboundProperties
    });
    onClose();
  };

  const handleConnectorDataTypeChange = (connectorIndex: number, field: 'inbound' | 'outbound', value: string) => {
    const updatedConnectors = [...connectors];
    if (field === 'inbound') {
      updatedConnectors[connectorIndex].inboundDataType = value;
    } else {
      updatedConnectors[connectorIndex].outboundDataType = value;
    }
    setConnectors(updatedConnectors);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Set Data Types</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          {/* Edit Mode Selection */}
          <Grid item xs={12}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Edit Mode</FormLabel>
              <RadioGroup
                row
                value={editMode}
                onChange={(e) => setEditMode(e.target.value as 'single' | 'bulk')}
              >
                <FormControlLabel value="single" control={<Radio />} label="Single Edit" />
                <FormControlLabel value="bulk" control={<Radio />} label="Bulk Edit" />
              </RadioGroup>
            </FormControl>
          </Grid>

          {/* Connector Table */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Connectors
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Connector</TableCell>
                    <TableCell>Inbound</TableCell>
                    <TableCell>Outbound</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {connectors.map((connector, index) => (
                    <TableRow key={index}>
                      <TableCell>{connector.name}</TableCell>
                      <TableCell>
                        <Select
                          value={connector.inboundDataType}
                          onChange={(e) => handleConnectorDataTypeChange(index, 'inbound', e.target.value)}
                          size="small"
                          fullWidth
                        >
                          {DATA_TYPES.map((type) => (
                            <MenuItem key={type} value={type}>{type}</MenuItem>
                          ))}
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={connector.outboundDataType}
                          onChange={(e) => handleConnectorDataTypeChange(index, 'outbound', e.target.value)}
                          size="small"
                          fullWidth
                        >
                          {DATA_TYPES.map((type) => (
                            <MenuItem key={type} value={type}>{type}</MenuItem>
                          ))}
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          {/* Properties Panels */}
          <Grid item xs={6}>
            <GroupBox label="Inbound Properties" border>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={inboundProperties.parseFieldRepetitions}
                      onChange={(e) => setInboundProperties(prev => ({ ...prev, parseFieldRepetitions: e.target.checked }))}
                    />
                  }
                  label="Parse Field Repetitions"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={inboundProperties.parseSubcomponents}
                      onChange={(e) => setInboundProperties(prev => ({ ...prev, parseSubcomponents: e.target.checked }))}
                    />
                  }
                  label="Parse Subcomponents"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={inboundProperties.useStrictParser}
                      onChange={(e) => setInboundProperties(prev => ({ ...prev, useStrictParser: e.target.checked }))}
                    />
                  }
                  label="Use Strict Parser"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={inboundProperties.validateInStrictParser}
                      onChange={(e) => setInboundProperties(prev => ({ ...prev, validateInStrictParser: e.target.checked }))}
                    />
                  }
                  label="Validate in Strict Parser"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={inboundProperties.stripNamespaces}
                      onChange={(e) => setInboundProperties(prev => ({ ...prev, stripNamespaces: e.target.checked }))}
                    />
                  }
                  label="Strip Namespaces"
                />
                <TextField
                  label="Segment Delimiter"
                  value={inboundProperties.segmentDelimiter}
                  onChange={(e) => setInboundProperties(prev => ({ ...prev, segmentDelimiter: e.target.value }))}
                  size="small"
                  fullWidth
                  margin="normal"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={inboundProperties.convertLineBreaks}
                      onChange={(e) => setInboundProperties(prev => ({ ...prev, convertLineBreaks: e.target.checked }))}
                    />
                  }
                  label="Convert Line Breaks"
                />
                <FormControl fullWidth margin="normal">
                  <InputLabel>Split Batch By</InputLabel>
                  <Select
                    value={inboundProperties.splitBatchBy}
                    onChange={(e) => setInboundProperties(prev => ({ ...prev, splitBatchBy: e.target.value }))}
                    size="small"
                  >
                    <MenuItem value="MSH Segment">MSH Segment</MenuItem>
                    <MenuItem value="Custom">Custom</MenuItem>
                  </Select>
                </FormControl>
              </FormGroup>
            </GroupBox>
          </Grid>

          <Grid item xs={6}>
            <GroupBox label="Outbound Properties" border>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={outboundProperties.useStrictParser}
                      onChange={(e) => setOutboundProperties(prev => ({ ...prev, useStrictParser: e.target.checked }))}
                    />
                  }
                  label="Use Strict Parser"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={outboundProperties.validateInStrictParser}
                      onChange={(e) => setOutboundProperties(prev => ({ ...prev, validateInStrictParser: e.target.checked }))}
                    />
                  }
                  label="Validate in Strict Parser"
                />
                <TextField
                  label="Segment Delimiter"
                  value={outboundProperties.segmentDelimiter}
                  onChange={(e) => setOutboundProperties(prev => ({ ...prev, segmentDelimiter: e.target.value }))}
                  size="small"
                  fullWidth
                  margin="normal"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={outboundProperties.parseFieldRepetitions}
                      onChange={(e) => setOutboundProperties(prev => ({ ...prev, parseFieldRepetitions: e.target.checked }))}
                    />
                  }
                  label="Parse Field Repetitions"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={outboundProperties.parseSubcomponents}
                      onChange={(e) => setOutboundProperties(prev => ({ ...prev, parseSubcomponents: e.target.checked }))}
                    />
                  }
                  label="Parse Subcomponents"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={outboundProperties.stripNamespaces}
                      onChange={(e) => setOutboundProperties(prev => ({ ...prev, stripNamespaces: e.target.checked }))}
                    />
                  }
                  label="Strip Namespaces"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={outboundProperties.convertLineBreaks}
                      onChange={(e) => setOutboundProperties(prev => ({ ...prev, convertLineBreaks: e.target.checked }))}
                    />
                  }
                  label="Convert Line Breaks"
                />
              </FormGroup>
            </GroupBox>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">OK</Button>
      </DialogActions>
    </Dialog>
  );
};

export default DataTypesDialog; 