import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  CircularProgress,
  Alert
} from '@mui/material';
import { v4 as uuidv4 } from 'uuid';
import { createChannel } from '../../services/channelsService';

interface ChannelCreationDialogProps {
  open: boolean;
  onClose: () => void;
  onCreateChannel: (channel: any) => Promise<void>;
  existingChannels?: any[];
}

const ChannelCreationDialog: React.FC<ChannelCreationDialogProps> = ({
  open,
  onClose,
  onCreateChannel,
  existingChannels = []
}) => {
  const [channelName, setChannelName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setChannelName('');
      setError(null);
      setIsCreating(false);
    }
  }, [open]);

  const validateChannelName = (): boolean => {
    if (!channelName.trim()) {
      setError('Channel name is required');
      return false;
    }
    
    if (existingChannels.some(ch => ch.name === channelName.trim())) {
      setError('Channel name already exists');
      return false;
    }
    
    if (channelName.length > 40) {
      setError('Channel name must be 40 characters or less');
      return false;
    }
    
    if (!/^[a-zA-Z0-9_\-\s]+$/.test(channelName)) {
      setError('Channel name contains invalid characters');
      return false;
    }
    
    setError(null);
    return true;
  };

  const createChannelObject = () => {
    const channelId = uuidv4();
    
    return {
      channel: {
        "@version": "4.5.2",
        "id": channelId,
        "nextMetaDataId": 2,
        "name": channelName.trim(),
        "description": "Example description.",
        "revision": 0,
        "sourceConnector": {
          "@version": "4.5.2",
          "metaDataId": 0,
          "name": "sourceConnector",
          "properties": {
            "@class": "com.mirth.connect.connectors.vm.VmReceiverProperties",
            "@version": "4.5.2",
            "sourceConnectorProperties": {
              "@version": "4.5.2",
              "responseVariable": "None",
              "respondAfterProcessing": true,
              "processBatch": false,
              "firstResponse": false,
              "processingThreads": 1,
              "resourceIds": {
                "@class": "linked-hash-map",
                "entry": {
                  "string": [
                    "Default Resource",
                    "[Default Resource]"
                  ]
                }
              },
              "queueBufferSize": 0
            }
          },
          "transformer": {
            "@version": "4.5.2",
            "elements": null,
            "inboundTemplate": {
              "@encoding": "base64"
            },
            "outboundTemplate": {
              "@encoding": "base64"
            },
            "inboundDataType": "RAW",
            "outboundDataType": "RAW",
            "inboundProperties": {
              "@class": "com.mirth.connect.plugins.datatypes.raw.RawDataTypeProperties",
              "@version": "4.5.2",
              "batchProperties": {
                "@class": "com.mirth.connect.plugins.datatypes.raw.RawBatchProperties",
                "@version": "4.5.2",
                "splitType": "JavaScript",
                "batchScript": null
              }
            },
            "outboundProperties": {
              "@class": "com.mirth.connect.plugins.datatypes.raw.RawDataTypeProperties",
              "@version": "4.5.2",
              "batchProperties": {
                "@class": "com.mirth.connect.plugins.datatypes.raw.RawBatchProperties",
                "@version": "4.5.2",
                "splitType": "JavaScript",
                "batchScript": null
              }
            }
          },
          "filter": {
            "@version": "4.5.2",
            "elements": null
          },
          "transportName": "Channel Reader",
          "mode": "SOURCE",
          "enabled": true,
          "waitForPrevious": true
        },
        "destinationConnectors": {
          "connector": {
            "@version": "4.5.2",
            "metaDataId": 1,
            "name": "Destination 1",
            "properties": {
              "@class": "com.mirth.connect.connectors.vm.VmDispatcherProperties",
              "@version": "4.5.2",
              "destinationConnectorProperties": {
                "@version": "4.5.2",
                "queueEnabled": false,
                "sendFirst": false,
                "retryIntervalMillis": 10000,
                "regenerateTemplate": false,
                "retryCount": 0,
                "rotate": false,
                "includeFilterTransformer": false,
                "threadCount": 1,
                "threadAssignmentVariable": null,
                "validateResponse": false,
                "resourceIds": {
                  "@class": "linked-hash-map",
                  "entry": {
                    "string": [
                      "Default Resource",
                      "[Default Resource]"
                    ]
                  }
                },
                "queueBufferSize": 0,
                "reattachAttachments": true
              },
              "channelId": "none",
              "channelTemplate": "${message.encodedData}",
              "mapVariables": null
            },
            "transformer": {
              "@version": "4.5.2",
              "elements": null,
              "inboundTemplate": {
                "@encoding": "base64"
              },
              "outboundTemplate": {
                "@encoding": "base64"
              },
              "inboundDataType": "RAW",
              "outboundDataType": "RAW",
              "inboundProperties": {
                "@class": "com.mirth.connect.plugins.datatypes.raw.RawDataTypeProperties",
                "@version": "4.5.2",
                "batchProperties": {
                  "@class": "com.mirth.connect.plugins.datatypes.raw.RawBatchProperties",
                  "@version": "4.5.2",
                  "splitType": "JavaScript",
                  "batchScript": null
                }
              },
              "outboundProperties": {
                "@class": "com.mirth.connect.plugins.datatypes.raw.RawDataTypeProperties",
                "@version": "4.5.2",
                "batchProperties": {
                  "@class": "com.mirth.connect.plugins.datatypes.raw.RawBatchProperties",
                  "@version": "4.5.2",
                  "splitType": "JavaScript",
                  "batchScript": null
                }
              }
            },
            "responseTransformer": {
              "@version": "4.5.2",
              "elements": null,
              "inboundTemplate": {
                "@encoding": "base64"
              },
              "outboundTemplate": {
                "@encoding": "base64"
              },
              "inboundDataType": "RAW",
              "outboundDataType": "RAW",
              "inboundProperties": {
                "@class": "com.mirth.connect.plugins.datatypes.raw.RawDataTypeProperties",
                "@version": "4.5.2",
                "batchProperties": {
                  "@class": "com.mirth.connect.plugins.datatypes.raw.RawBatchProperties",
                  "@version": "4.5.2",
                  "splitType": "JavaScript",
                  "batchScript": null
                }
              },
              "outboundProperties": {
                "@class": "com.mirth.connect.plugins.datatypes.raw.RawDataTypeProperties",
                "@version": "4.5.2",
                "batchProperties": {
                  "@class": "com.mirth.connect.plugins.datatypes.raw.RawBatchProperties",
                  "@version": "4.5.2",
                  "splitType": "JavaScript",
                  "batchScript": null
                }
              }
            },
            "filter": {
              "@version": "4.5.2",
              "elements": null
            },
            "transportName": "Channel Writer",
            "mode": "DESTINATION",
            "enabled": true,
            "waitForPrevious": true
          }
        },
        "preprocessingScript": null,
        "postprocessingScript": null,
        "deployScript": null,
        "undeployScript": null,
        "properties": {
          "@version": "4.5.2",
          "clearGlobalChannelMap": true,
          "messageStorageMode": "DEVELOPMENT",
          "encryptData": false,
          "encryptAttachments": false,
          "encryptCustomMetaData": false,
          "removeContentOnCompletion": false,
          "removeOnlyFilteredOnCompletion": false,
          "removeAttachmentsOnCompletion": false,
          "initialState": "STARTED",
          "storeAttachments": true,
          "metaDataColumns": null,
          "attachmentProperties": {
            "@version": "4.5.2",
            "type": "None",
            "properties": null
          },
          "resourceIds": {
            "@class": "linked-hash-map",
            "entry": {
              "string": [
                "Default Resource",
                "[Default Resource]"
              ]
            }
          }
        }
      }
    };
  };

  const handleCreate = async () => {
    if (!validateChannelName()) {
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const channelObject = createChannelObject();
      
      // Call the API directly using the service
      await createChannel(channelObject);
      
      // Show spinner for 1.5 seconds
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Call the parent's onCreateChannel to handle success flow
      await onCreateChannel(channelObject.channel);
      
      // Close the dialog
      onClose();
    } catch (error) {
      console.error('Error creating channel:', error);
      setError(error instanceof Error ? error.message : 'Error creating channel');
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    if (!isCreating) {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        Create New Channel
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <TextField
            fullWidth
            label="Channel Name"
            value={channelName}
            onChange={(e) => {
              setChannelName(e.target.value);
              if (error) setError(null);
            }}
            error={!!error}
            helperText={error || 'Enter a unique name for the channel (max 40 characters)'}
            required
            inputProps={{ maxLength: 40 }}
            disabled={isCreating}
            autoFocus
          />
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button 
          onClick={handleClose} 
          disabled={isCreating}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleCreate}
          disabled={isCreating || !channelName.trim()}
          startIcon={isCreating ? <CircularProgress size={20} /> : undefined}
        >
          {isCreating ? 'Creating...' : 'Create Channel'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ChannelCreationDialog;
