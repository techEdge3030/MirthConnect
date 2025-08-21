import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  Select,
  MenuItem,
  FormControl
} from '@mui/material';
import { 
  Download, 
  Folder
} from '@mui/icons-material';

interface ExportMapDialogProps {
  open: boolean;
  onClose: () => void;
  onExport: (filename: string, filePath: string, fileType: string) => Promise<void>;
  onGetContent?: () => string; // Add optional prop to get content without downloading
}

const ExportMapDialog: React.FC<ExportMapDialogProps> = ({
  open,
  onClose,
  onExport,
  onGetContent
}) => {
  const [filename, setFilename] = useState(() => {
    const today = new Date().toISOString().split('T')[0];
    return `${today} Configuration Map.properties`;
  });
  const [fileType, setFileType] = useState('Properties files');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // File type options
  const fileTypeOptions = [
    { value: 'Properties files', label: 'Properties files', extension: '.properties' },
    { value: 'All files', label: 'All files', extension: '' }
  ];

  const handleExport = async () => {
    if (!filename.trim()) {
      setError('Please enter a filename');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Always ensure .properties extension for configuration map exports
      let finalFilename = filename.trim();
      if (!finalFilename.endsWith('.properties')) {
        finalFilename += '.properties';
      }

      // Try to use File System Access API for native save dialog
      if ('showSaveFilePicker' in window) {
        try {
          let pickerOptions: any = {
            suggestedName: finalFilename,
            types: [{
              description: 'Properties files',
              accept: {
                'text/plain': ['.properties']
              }
            }]
          };

          const fileHandle = await (window as any).showSaveFilePicker(pickerOptions);
          
          // Get the properties content from the parent component
          if (onGetContent) {
            const propertiesContent = onGetContent();
            
            // Write the actual properties content to the selected file
            const writable = await fileHandle.createWritable();
            await writable.write(propertiesContent);
            await writable.close();
            
            onClose();
            return;
          } else {
            // Fallback: call onExport but this will trigger download
            await onExport(finalFilename, '', fileType);
            onClose();
            return;
          }
        } catch (saveError) {
          console.log('User cancelled save or error occurred:', saveError);
          return; // User cancelled, don't show error
        }
      }
      
      // Fallback to regular download
      await onExport(finalFilename, '', fileType);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to export configuration map');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError('');
      onClose();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: { minHeight: 300, minWidth: 500 }
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Folder color="primary" />
        Export Configuration Map
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mt: 1 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* File Name Section */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              File Name:
            </Typography>
            <TextField
              fullWidth
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="Enter export filename"
              disabled={loading}
              autoFocus
            />
          </Box>

          {/* Files of Type Section */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Files of Type:
            </Typography>
            <FormControl fullWidth disabled={loading}>
              <Select
                value={fileType}
                onChange={(e) => setFileType(e.target.value)}
                size="small"
              >
                {fileTypeOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button 
          onClick={handleClose}
          disabled={loading}
          variant="outlined"
        >
          Cancel
        </Button>
        <Button
          onClick={handleExport}
          variant="contained"
          startIcon={<Download />}
          disabled={loading || !filename.trim()}
        >
          {loading ? 'Exporting...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExportMapDialog;
