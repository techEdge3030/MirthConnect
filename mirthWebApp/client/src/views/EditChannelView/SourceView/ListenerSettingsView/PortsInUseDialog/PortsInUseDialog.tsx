import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle
} from '@mui/material';
import { useEffect, useState } from 'react';

import { MirthTable } from '../../../../../components';
import { getPortsInUse } from '../../../../../services';
import type { Column, Row } from '../../../../../types';
import type { PortsInUseDialogProps } from './PortsInUseDialog.type';

const PortsInUseDialog = ({ open, onClose }: PortsInUseDialogProps) => {
  const [rows, setRows] = useState<Row[]>([]);
  const columns: Column[] = [
    { id: 'port', title: 'Port', width: '100px' },
    { id: 'channelName', title: 'Channel Name', width: '300px' }
  ];

  useEffect(() => {
    const fetchData = async () => {
      const data = await getPortsInUse();
      const rowData = data.map(
        val =>
          ({
            id: val.id,
            port: {
              type: 'number',
              value: val.port
            },
            channelName: {
              type: 'text',
              value: val.name
            }
          }) as Row
      );
      setRows(rowData);
    };
    fetchData();
  }, []);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Ports In Use</DialogTitle>
      <DialogContent>
        <MirthTable columns={columns} rows={rows} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default PortsInUseDialog;
