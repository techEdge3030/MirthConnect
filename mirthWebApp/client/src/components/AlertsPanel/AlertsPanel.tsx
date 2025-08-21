import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Tooltip,
  CircularProgress,
  Menu,
  MenuItem,
  Checkbox
} from '@mui/material';
import {
  Notifications,
  Edit,
  Delete,
  PlayArrow,
  Stop,
  MoreVert
} from '@mui/icons-material';
import {
  getAlerts,
  enableAlert,
  disableAlert,
  deleteAlert
} from '../../services/alertsService';
import { AlertModel } from '../../types/alert.type';

const columns = [
  { id: 'status', label: 'Status', minWidth: 60 },
  { id: 'name', label: 'Name', minWidth: 150 },
  { id: 'id', label: 'Id', minWidth: 215 },
  { id: 'actions', label: 'Actions', minWidth: 60 }
];

interface AlertsPanelProps {
  selected: string[];
  setSelected: React.Dispatch<React.SetStateAction<string[]>>;
  refreshFlag: number;
}

const AlertsPanel: React.FC<AlertsPanelProps> = ({ selected, setSelected, refreshFlag }) => {
  const [alerts, setAlerts] = useState<AlertModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ mouseX: number; mouseY: number; alertId: string | null } | null>(null);

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAlerts();
      console.log('getAlerts response:', data);
      setAlerts(Array.isArray(data) ? data : []);
    } catch (e) {
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts, refreshFlag]);

  const handleSelect = (alertId: string) => {
    setSelected(prev =>
      prev.includes(alertId) ? prev.filter(id => id !== alertId) : [...prev, alertId]
    );
  };

  const handleSelectAll = (checked: boolean) => {
    setSelected(checked ? alerts.map(a => a.id || '') : []);
  };

  const handleContextMenu = (event: React.MouseEvent, alertId: string) => {
    event.preventDefault();
    setContextMenu(
      contextMenu === null
        ? { mouseX: event.clientX - 2, mouseY: event.clientY - 4, alertId }
        : null
    );
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  const handleEnable = async (alertId: string) => {
    await enableAlert(alertId);
    fetchAlerts();
    handleCloseContextMenu();
  };

  const handleDisable = async (alertId: string) => {
    await disableAlert(alertId);
    fetchAlerts();
    handleCloseContextMenu();
  };

  const handleDelete = async (alertId: string) => {
    await deleteAlert(alertId);
    fetchAlerts();
    handleCloseContextMenu();
  };

  const handleRowDoubleClick = (alertId: string) => {
    // TODO: Open edit dialog for alertId
  };

  const isSelected = (alertId: string) => selected.includes(alertId);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Paper sx={{ flex: 1, overflow: 'hidden', minHeight: 0 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer sx={{ height: '100%' }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={selected.length > 0 && selected.length < alerts.length}
                      checked={alerts.length > 0 && selected.length === alerts.length}
                      onChange={e => handleSelectAll(e.target.checked)}
                    />
                  </TableCell>
                  {columns.map(col => (
                    <TableCell key={col.id} align="left" style={{ minWidth: col.minWidth }}>
                      {col.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.isArray(alerts) && alerts.map(alert => (
                  <TableRow
                    key={alert.id}
                    hover
                    selected={isSelected(alert.id || '')}
                    onClick={() => handleSelect(alert.id || '')}
                    onDoubleClick={() => handleRowDoubleClick(alert.id || '')}
                    onContextMenu={e => handleContextMenu(e, alert.id || '')}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox checked={isSelected(alert.id || '')} />
                    </TableCell>
                    <TableCell>
                      {alert.enabled ? (
                        <Tooltip title="Enabled"><PlayArrow color="success" /></Tooltip>
                      ) : (
                        <Tooltip title="Disabled"><Stop color="disabled" /></Tooltip>
                      )}
                    </TableCell>
                    <TableCell>{alert.name}</TableCell>
                    <TableCell>{alert.id}</TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={e => handleContextMenu(e, alert.id || '')}>
                        <MoreVert />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Menu
              open={contextMenu !== null}
              onClose={handleCloseContextMenu}
              anchorReference="anchorPosition"
              anchorPosition={
                contextMenu !== null
                  ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                  : undefined
              }
            >
              <MenuItem onClick={() => handleEnable(contextMenu?.alertId!)} disabled={!contextMenu?.alertId || alerts.find(a => a.id === contextMenu?.alertId)?.enabled}>
                <PlayArrow fontSize="small" /> Enable
              </MenuItem>
              <MenuItem onClick={() => handleDisable(contextMenu?.alertId!)} disabled={!contextMenu?.alertId || !alerts.find(a => a.id === contextMenu?.alertId)?.enabled}>
                <Stop fontSize="small" /> Disable
              </MenuItem>
              <MenuItem onClick={() => handleRowDoubleClick(contextMenu?.alertId!)} disabled={!contextMenu?.alertId}>
                <Edit fontSize="small" /> Edit
              </MenuItem>
              <MenuItem onClick={() => handleDelete(contextMenu?.alertId!)} disabled={!contextMenu?.alertId}>
                <Delete fontSize="small" /> Delete
              </MenuItem>
            </Menu>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
};

export default AlertsPanel; 