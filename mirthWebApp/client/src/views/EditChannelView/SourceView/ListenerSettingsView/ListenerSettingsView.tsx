import {
  Button,
  FormControlLabel,
  Grid,
  Radio,
  TextField,
  Typography
} from '@mui/material';
import type { ChangeEvent } from 'react';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { GroupBox } from '../../../../components';
import type { RootState } from '../../../../states';
import {
  updateListenerHost,
  updateListenerPort
} from '../../../../states/channelReducer';
import PortsInUseDialog from './PortsInUseDialog';

const ListenerSettingsView = () => {
  const listener = useSelector(
    (state: RootState) =>
      state.channels.channel.sourceConnector.properties
        .listenerConnectorProperties
  );
  const dispatch = useDispatch();
  const [allInterface, setAllInterface] = useState(listener.host === '0.0.0.0');
  const [portsInUseOpen, setPortsInUseOpen] = useState(false);

  const handleAllInterfaceClick = () => {
    dispatch(updateListenerHost('0.0.0.0'));
    setAllInterface(true);
  };
  const handleSpecificInterface = () => setAllInterface(false);
  const handleInterfaceChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => dispatch(updateListenerHost(event.target.value));
  const handlePortChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => dispatch(updateListenerPort(event.target.value));
  const handleOpenPortsInUseDialog = () => setPortsInUseOpen(true);
  const handleClosePortsInUseDialog = () => setPortsInUseOpen(false);

  return (
    <div>
      <GroupBox label="Listener Settings">
        <Grid
          container
          direction="row"
          columnSpacing={2}
          rowSpacing={0.5}
          alignItems="center"
        >
          <Grid item md={0.8} flexGrow={0}>
            <Typography variant="subtitle1" align="right">
              Local Address:
            </Typography>
          </Grid>

          <Grid item md={2.1}>
            <FormControlLabel
              label="All interfaces"
              labelPlacement="end"
              control={
                <Radio
                  checked={allInterface}
                  onClick={handleAllInterfaceClick}
                />
              }
            />

            <FormControlLabel
              label="Specific interface:"
              labelPlacement="end"
              control={
                <Radio
                  checked={!allInterface}
                  onClick={handleSpecificInterface}
                />
              }
            />
          </Grid>

          <Grid item md={9.1}>
            <TextField
              size="small"
              disabled={allInterface}
              value={listener.host}
              onChange={handleInterfaceChange}
            />
          </Grid>

          <Grid item md={0.8} flexGrow={0}>
            <Typography variant="subtitle1" align="right">
              Local Port:
            </Typography>
          </Grid>

          <Grid item flexGrow={0}>
            <TextField
              size="small"
              value={listener.port}
              onChange={handlePortChange}
            />
          </Grid>

          <Grid item flexGrow={1}>
            <Button
              variant="contained"
              size="small"
              onClick={handleOpenPortsInUseDialog}
            >
              Ports in Use
            </Button>
          </Grid>
        </Grid>
      </GroupBox>
      <PortsInUseDialog
        open={portsInUseOpen}
        onClose={handleClosePortsInUseDialog}
      />
    </div>
  );
};

export default ListenerSettingsView;
