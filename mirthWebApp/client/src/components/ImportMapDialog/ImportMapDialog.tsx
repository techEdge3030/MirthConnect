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
  CheckCircle
} from '@mui/icons-material';

interface ImportMapDialogProps {
  open: boolean;
  onClose: () => void;
  onImport: (file: File, fileType: string, options: ImportOptions) => Promise<void>;
}

interface ImportOptions {
  overwriteExisting: boolean;
  mergeWithCurrent: boolean;
}

const ImportMapDialog: React.FC<ImportMapDialogProps> = ({
  open,
  onClose,
  onImport
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState('Properties files');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Import options
  const [overwriteExisting, setOverwriteExisting] = useState(true);
  const [mergeWithCurrent, setMergeWithCurrent] = useState(false);

  // File type options
  const fileTypeOptions = [
    { value: 'Properties files', label: 'Properties files', extension: '.properties' },
    { value: 'All files', label: 'All files', extension: '' }
  ];

  const handleFileSelect = async () => {
    try {
      // Try to use File System Access API for native open dialog
      if ('showOpenFilePicker' in window) {
        const selectedType = fileTypeOptions.find(type => type.value === fileType);

        let pickerOptions: any = {
          multiple: false
        };

        // Configure file type filtering for properties files
        if (selectedType?.extension) {
          pickerOptions.types = [{
            description: selectedType.label,
            accept: {
              'text/plain': [selectedType.extension]
            }
          }];
        }

        const [fileHandle] = await (window as any).showOpenFilePicker(pickerOptions);

        const file = await fileHandle.getFile();
        setSelectedFile(file);
        setError('');
      } else {
        // Fallback for browsers that don't support File System Access API
        const input = document.createElement('input');
        input.type = 'file';

        // Set accept attribute based on file type selection
        if (fileType === 'Properties files') {
          input.accept = '.properties';
        } else {
          input.accept = '*';
        }

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
      setError('Please select a configuration map file');
      return;
    }
    setShowConfirmation(true);
  };

  const handleConfirmImport = async () => {
    try {
      setLoading(true);
      setError('');
      
      const options: ImportOptions = {
        overwriteExisting,
        mergeWithCurrent
      };
      
      await onImport(selectedFile!, fileType, options);
      setShowConfirmation(false);
      setShowSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to import configuration map');
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

  // Helper function to format file date
  const formatFileDate = (file: File | null): string => {
    if (!file) return 'selected file';
    
    const lastModified = new Date(file.lastModified);
    const formattedDate = lastModified.toLocaleDateString();
    return `"${file.name}" (modified: ${formattedDate})`;
  };

  // Success Dialog
  if (showSuccess) {
    return (
      <Dialog 
        open={open} 
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
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <CheckCircle 
              sx={{ 
                fontSize: 40,
                color: 'success.main',
                backgroundColor: 'success.light',
                borderRadius: '50%',
                p: 1
              }} 
            />
          </Box>
          <Typography variant="h6" component="div" sx={{ mt: 1 }}>
            Import Successful
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ textAlign: 'center', pb: 2 }}>
          <Typography variant="body1">
            Configuration Map has been imported and saved successfully!
          </Typography>
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
  if (showConfirmation) {
    return (
      <Dialog 
        open={open} 
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
          <Typography variant="h6" component="div">
            Import Configuration Map
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
                Import configuration map from {formatFileDate(selectedFile)}?
              </Typography>
              <Typography variant="body2" color="warning.main" sx={{ fontWeight: 'bold' }}>
                WARNING: This will modify your current configuration map settings.
              </Typography>
            </Box>
          </Box>

          <Box sx={{ ml: 7 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={overwriteExisting}
                  onChange={(e) => setOverwriteExisting(e.target.checked)}
                />
              }
              label="Overwrite existing entries with same keys"
            />
            <br />
            <FormControlLabel
              control={
                <Checkbox
                  checked={mergeWithCurrent}
                  onChange={(e) => setMergeWithCurrent(e.target.checked)}
                />
              }
              label="Merge with current configuration map"
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
        Import Configuration Map
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
              Select Configuration Map File:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  flex: 1, 
                  p: 1, 
                  border: 1, 
                  borderColor: 'divider', 
                  borderRadius: 1,
                  backgroundColor: 'grey.50',
                  minHeight: '40px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {selectedFile ? selectedFile.name : 'No file selected'}
              </Typography>
              <Button
                variant="outlined"
                onClick={handleFileSelect}
                sx={{ minWidth: 100 }}
              >
                Browse...
              </Button>
            </Box>
          </Box>

          {/* Files of Type Section */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Files of Type:
            </Typography>
            <FormControl fullWidth>
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
          variant="outlined"
        >
          Cancel
        </Button>
        <Button
          onClick={handleOpenClick}
          variant="contained"
          startIcon={<Upload />}
          disabled={!selectedFile}
        >
          Open
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImportMapDialog;
