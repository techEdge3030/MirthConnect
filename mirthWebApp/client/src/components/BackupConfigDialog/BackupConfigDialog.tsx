
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

interface BackupConfigDialogProps {
  open: boolean;
  onClose: () => void;
  onBackup: (filename: string, filePath: string, fileType: string) => Promise<void>;
}

const BackupConfigDialog: React.FC<BackupConfigDialogProps> = ({
  open,
  onClose,
  onBackup
}) => {
  const [filename, setFilename] = useState(() => {
    const today = new Date().toISOString().split('T')[0];
    return `${today} Mirth Backup.xml`;
  });
  const [fileType, setFileType] = useState('XML files');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // File type options
  const fileTypeOptions = [
    { value: 'XML files', label: 'XML files', extension: '.xml' },
    { value: 'All files', label: 'All files', extension: '' }
  ];

  const handleBackup = async () => {
    console.log('BackupConfigDialog: handleBackup called');
    console.log('BackupConfigDialog: filename:', filename);
    console.log('BackupConfigDialog: fileType:', fileType);
    
    if (!filename.trim()) {
      setError('Please enter a filename');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Ensure proper file extension based on type
      let finalFilename = filename.trim();
      const selectedType = fileTypeOptions.find(type => type.value === fileType);
      
      if (selectedType?.extension && !finalFilename.endsWith(selectedType.extension)) {
        finalFilename += selectedType.extension;
      }

      console.log('BackupConfigDialog: finalFilename:', finalFilename);

      // Try to use File System Access API for native save dialog
      if ('showSaveFilePicker' in window) {
        try {
          const fileHandle = await (window as any).showSaveFilePicker({
            suggestedName: finalFilename,
            types: [{
              description: selectedType?.label || 'XML files',
              accept: { 'application/xml': ['.xml'] }
            }]
          });
          
          console.log('BackupConfigDialog: File picker opened, getting backup data...');
          
          // Get the backup data using the backup service
          const { createBackup } = await import('../../services/backupService');
          
          // Create a temporary function to get the XML content without downloading
          const getBackupContent = async (): Promise<string> => {
            const { getServerConfiguration } = await import('../../services/backupService');
            return await getServerConfiguration();
          };
          
          const xmlContent = await getBackupContent();
          
          // Write to the selected file
          const writable = await fileHandle.createWritable();
          await writable.write(xmlContent);
          await writable.close();
          
          console.log('BackupConfigDialog: File saved successfully via File System Access API');
          onClose();
          return;
        } catch (saveError) {
          console.log('User cancelled save or File System Access API failed:', saveError);
          // Fall through to regular download
        }
      }
      
      console.log('BackupConfigDialog: Fallback to regular download, calling onBackup prop...');
      console.log('BackupConfigDialog: onBackup function:', onBackup);
      
      // Fallback to regular download
      await onBackup(finalFilename, '', fileType);
      onClose();
    } catch (err: any) {
      console.error('BackupConfigDialog: Error in handleBackup:', err);
      setError(err.message || 'Failed to create backup');
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
        Save Backup Configuration
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
              placeholder="Enter backup filename"
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
          onClick={handleBackup}
          variant="contained"
          startIcon={<Download />}
          disabled={loading || !filename.trim()}
        >
          {loading ? 'Creating Backup...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BackupConfigDialog;
