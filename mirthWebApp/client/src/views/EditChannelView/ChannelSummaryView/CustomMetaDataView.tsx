// client/src/views/EditChannelView/ChannelSummaryView/CustomMetaDataView.tsx
import { Box, Button, Grid, IconButton, MenuItem, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { useState } from 'react';
import { useEffect } from 'react';
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../../states/index';
import { updateChannelAsync, updateMetaDataColumns } from '../../../states/channelReducer';
import type { CustomMetaData } from '../../../types/channel.type';

export default function CustomMetaDataView() {
  const dispatch = useDispatch<AppDispatch>();
  const channel = useSelector((state: RootState) => state.channels.channel);
  const [saveTimeout, setSaveTimeout] = useState<number | null>(null);
  const [metadata, setMetadata] = useState<CustomMetaData[]>(
    (channel.properties?.metaDataColumns?.metaDataColumn ?? []).map((item: any, index: number) => ({
      ...item,
      id: item.id ?? `existing-${index}`, // Add temp ID if missing
    }))
  );

  // Sync local metadata state with Redux state when channel changes
  useEffect(() => {
    const channelMetadata = channel.properties?.metaDataColumns?.metaDataColumn ?? [];
    setMetadata(channelMetadata.map((item: any, index: number) => ({
      ...item,
      id: item.id ?? `existing-${index}`,
    })));
  }, [channel.properties?.metaDataColumns?.metaDataColumn]);

  // Debounced save function
  const debouncedSave = useCallback((metadataToSave: CustomMetaData[]) => {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }
    const timeout = setTimeout(() => {
      handleSave(metadataToSave);
    }, 500); // Save after 500ms of no changes
    setSaveTimeout(timeout);
  }, [saveTimeout]);

  const handleAdd = () => {
    const newRow: CustomMetaData = { id: `new-${Date.now()}`, name: '', type: 'STRING', mappingName: '' };
    setMetadata([...metadata, newRow]);
  };

  const handleDelete = (id: string) => {
    const updatedMetadata = metadata.filter(row => row.id !== id);
    setMetadata(updatedMetadata);
    // Debounced auto-save when row is deleted
    debouncedSave(updatedMetadata);
  };

  const handleFieldChange = (id: string, field: keyof CustomMetaData, value: string) => {
    const updated = metadata.map(row =>
      row.id === id ? { ...row, [field]: value } : row
    );
    setMetadata(updated);
    // Debounced auto-save when field is changed
    debouncedSave(updated);
  };

  const handleSave = async (metadataToSave: CustomMetaData[]) => {
    try {
      // First update the Redux state with the new metadata
      const metadataWithoutIds = metadataToSave.map(({ id, ...rest }) => rest);
      dispatch(updateMetaDataColumns(metadataWithoutIds));
      
      // Then save the updated channel to the server
      const updatedChannel = { ...channel };
      updatedChannel.properties.metaDataColumns = { metaDataColumn: metadataWithoutIds };
      await dispatch(updateChannelAsync(updatedChannel)).unwrap();
      
      console.log('Metadata saved successfully');
    } catch (error) {
      console.error('Failed to save metadata:', error);
    }
  };

  return (
    <Box>
      <Grid container spacing={2} alignItems="center">
        <Grid item>
          <Button variant="contained" startIcon={<Add />} onClick={handleAdd}>
            Add Metadata
          </Button>
        </Grid>
      </Grid>
     <TableContainer component={Paper} sx={{ mt: 2 }}>
       <Table size="small">
         <TableHead>
           <TableRow>
             <TableCell>Column Name</TableCell>
             <TableCell>Type</TableCell>
             <TableCell>Variable Mapping</TableCell>
             <TableCell width={60}></TableCell>
           </TableRow>
         </TableHead>
         <TableBody>
           {metadata.map((row) => (
             <TableRow key={row.id || `row-${Math.random()}`}>
               <TableCell>
                 <TextField
                   fullWidth
                   size="small"
                   value={row.name ?? ''}
                   onChange={(e) => handleFieldChange(row.id || '', 'name', e.target.value)}
                   variant="outlined"
                 />
               </TableCell>
               <TableCell>
                 <TextField
                   fullWidth
                   size="small"
                   select
                   value={row.type ?? 'STRING'}
                   onChange={(e) => handleFieldChange(row.id || '', 'type', e.target.value)}
                   variant="outlined"
                 >
                   <MenuItem value="STRING">STRING</MenuItem>
                   <MenuItem value="NUMBER">NUMBER</MenuItem>
                   <MenuItem value="BOOLEAN">BOOLEAN</MenuItem>
                   <MenuItem value="TIMESTAMP">TIMESTAMP</MenuItem>
                 </TextField>
               </TableCell>
               <TableCell>
                 <TextField
                   fullWidth
                   size="small"
                   value={row.mappingName ?? ''}
                   onChange={(e) => handleFieldChange(row.id || '', 'mappingName', e.target.value)}
                   variant="outlined"
                 />
               </TableCell>
               <TableCell>
                 <IconButton onClick={() => handleDelete(row.id || '')} size="small">
                   <Delete />
                 </IconButton>
               </TableCell>
             </TableRow>
           ))}
         </TableBody>
       </Table>
     </TableContainer>
    </Box>
  );
} 