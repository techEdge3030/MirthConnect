import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  Select,
  MenuItem,
  FormControl,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import { 
  Upload, 
  FolderOpen,
  Help,
  Lightbulb
} from '@mui/icons-material';

interface RestoreConfigDialogProps {
  open: boolean;
  onClose: () => void;
  onRestore: (file: File, fileType: string, options: ImportOptions) => Promise<void>;
}

interface ImportOptions {
  deployAllChannels: boolean;
  overwriteConfigMap: boolean;
}

const RestoreConfigDialog: React.FC<RestoreConfigDialogProps> = ({
  open,
  onClose,
  onRestore
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState('XML files');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Import options
  const [deployAllChannels, setDeployAllChannels] = useState(true);
  const [overwriteConfigMap, setOverwriteConfigMap] = useState(false);

  // File type options
  const fileTypeOptions = [
    { value: 'XML files', label: 'XML files', extension: '.xml' },
    { value: 'All files', label: 'All files', extension: '' }
  ];

  const handleFileSelect = async () => {
    try {
      // Try to use File System Access API for native open dialog
      if ('showOpenFilePicker' in window) {
        const selectedType = fileTypeOptions.find(type => type.value === fileType);
        
        const [fileHandle] = await (window as any).showOpenFilePicker({
          types: [{
            description: selectedType?.label || 'All files',
            accept: selectedType?.extension ? { 'application/xml': [selectedType.extension] } : {}
          }],
          multiple: false
        });
        
        const file = await fileHandle.getFile();
        setSelectedFile(file);
        setError('');
      } else {
        // Fallback for browsers that don't support File System Access API
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = fileType === 'XML files' ? '.xml' : '*';
        input.onchange = (e) => {
          const files = (e.target as HTMLInputElement).files;
          if (files && files.length > 0) {
            setSelectedFile(files[0]);
            setError('');
          }
        };
        input.click();
      }
    } catch (error) {
      console.log('User cancelled file selection');
    }
  };

  const handleOpenClick = () => {
    if (!selectedFile) {
      setError('Please select a configuration file');
      return;
    }
    setShowConfirmation(true);
  };

  const handleConfirmImport = async () => {
    try {
      setLoading(true);
      setError('');
      
      const options: ImportOptions = {
        deployAllChannels,
        overwriteConfigMap
      };
      
      await onRestore(selectedFile!, fileType, options);
      setShowConfirmation(false);
      setShowSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to restore configuration');
      setShowConfirmation(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessOk = () => {
    setShowSuccess(false);
    handleClose();
  };

  const handleClose = () => {
    if (!loading) {
      setError('');
      setSelectedFile(null);
      setShowConfirmation(false);
      setShowSuccess(false);
      onClose();
    }
  };

  const formatFileDate = (file: File) => {
    const date = new Date(file.lastModified);
    return date.toISOString().slice(0, 19).replace('T', ' ');
  };

  // Success Dialog
  if (showSuccess) {
    return (
      <Dialog 
        open={true} 
        onClose={handleSuccessOk}
        maxWidth="sm"
        PaperProps={{
          sx: { 
            minWidth: 400,
            textAlign: 'center'
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6">
            Information
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ textAlign: 'center', pb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
            <Lightbulb 
              sx={{ 
                fontSize: 40,
                color: 'info.main',
                backgroundColor: 'info.light',
                borderRadius: '50%',
                p: 1
              }} 
            />
            <Typography variant="body1">
              Your configuration was successfully restored.
            </Typography>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Button
            onClick={handleSuccessOk}
            variant="contained"
            sx={{ minWidth: 80 }}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  // Confirmation Dialog
  if (showConfirmation && selectedFile) {
    return (
      <Dialog 
        open={true} 
        onClose={() => setShowConfirmation(false)}
        maxWidth="sm"
        PaperProps={{
          sx: { 
            minWidth: 500,
            textAlign: 'center'
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6">
            Select an Option
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ textAlign: 'left', pb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
            <Help 
              sx={{ 
                fontSize: 40,
                color: 'success.main',
                backgroundColor: 'success.light',
                borderRadius: '50%',
                p: 1,
                mt: 0.5
              }} 
            />
            <Box>
              <Typography variant="body1" sx={{ mb: 1 }}>
                Import configuration from {formatFileDate(selectedFile)}?
              </Typography>
              <Typography variant="body2" color="error" sx={{ fontWeight: 'bold' }}>
                WARNING: This will overwrite all current channels, alerts, server properties, and plugin properties.
              </Typography>
            </Box>
          </Box>

          <Box sx={{ ml: 7 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={deployAllChannels}
                  onChange={(e) => setDeployAllChannels(e.target.checked)}
                />
              }
              label="Deploy all channels after import"
            />
            <br />
            <FormControlLabel
              control={
                <Checkbox
                  checked={overwriteConfigMap}
                  onChange={(e) => setOverwriteConfigMap(e.target.checked)}
                />
              }
              label="Overwrite Configuration Map"
            />
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ justifyContent: 'center', gap: 2, pb: 2 }}>
          <Button
            onClick={handleConfirmImport}
            variant="contained"
            sx={{ minWidth: 80 }}
            disabled={loading}
          >
            {loading ? 'Importing...' : 'Yes'}
          </Button>
          <Button
            onClick={() => setShowConfirmation(false)}
            variant="outlined"
            sx={{ minWidth: 80 }}
            disabled={loading}
          >
            No
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  // Main File Selection Dialog
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
        <FolderOpen color="primary" />
        Restore Configuration
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mt: 1 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* File Selection Section */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Select Configuration File:
            </Typography>
            
            <Box sx={{ 
              border: '1px solid #ccc',
              borderRadius: 1,
              p: 3,
              minHeight: 120,
              backgroundColor: '#fafafa',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {selectedFile ? (
                <Box sx={{ textAlign: 'center', width: '100%' }}>
                  <Upload sx={{ fontSize: 48, color: '#1976d2', mb: 1 }} />
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    {selectedFile.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Size: {(selectedFile.size / 1024).toFixed(1)} KB
                  </Typography>
                  <Button 
                    variant="outlined" 
                    startIcon={<Upload />}
                    onClick={handleFileSelect}
                  >
                    Choose Different File
                  </Button>
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center' }}>
                  <Upload sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                    No file selected
                  </Typography>
                  <Button 
                    variant="contained" 
                    startIcon={<Upload />}
                    onClick={handleFileSelect}
                  >
                    Browse Files
                  </Button>
                </Box>
              )}
            </Box>
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
          onClick={handleOpenClick}
          variant="contained"
          startIcon={<FolderOpen />}
          disabled={loading || !selectedFile}
        >
          Open
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RestoreConfigDialog;
