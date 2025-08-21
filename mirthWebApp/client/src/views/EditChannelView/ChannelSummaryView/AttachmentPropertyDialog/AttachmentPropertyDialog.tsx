import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField
} from '@mui/material';

import { GroupBox } from '../../../../components';
import type { AttachmentPropertyModalProps } from './AttachmentPropertyDialog.type';

const AttachmentPropertyDialog = ({
  open,
  onClose
}: AttachmentPropertyModalProps) => {
  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Set Attachment Properties</DialogTitle>

      <DialogContent>
        <GroupBox label="Properties" border>
          <Grid
            container
            rowSpacing={0.5}
            columnSpacing={2}
            alignItems="center"
          >
            <Grid item flexGrow={0}>
              {' '}
              MIME Type:{' '}
            </Grid>

            <Grid item flexGrow={1}>
              {' '}
              <TextField fullWidth />{' '}
            </Grid>
          </Grid>
        </GroupBox>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AttachmentPropertyDialog;
