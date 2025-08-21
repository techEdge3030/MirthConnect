import {
  Checkbox,
  FormControlLabel,
  Grid,
  Stack,
  Typography
} from '@mui/material';
import { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { MirthSelect, MirthTable } from '../../../components';
import type { RootState } from '../../../states';
import { updateDestinations } from '../../../states/channelReducer';
import type { Column, Row } from '../../../types';
import ChannelWriter from './ChannelWriter';
import DatabaseWriter from './DatabaseWriter';
import { DESTINATION_CONNECTOR_TYPES } from './DestinationView.constant';
import DICOMSender from './DICOMSender';
import DocumentWriter from './DocumentWriter';
import FileWriter from './FileWriter';
import HTTPSender from './HTTPSender';
import JavaScriptWriter from './JavaScriptWriter/JavaScriptWriter';
import SMTPSender from './SMTPSender/SMTPSender';
import TCPSender from './TCPSender/TCPSender';
import WebServiceSender from './WebServiceSender';

const DestinationView = () => {
  const [current, setCurrent] = useState<number | null>(null);
  const dispatch = useDispatch();
  const destinations = useSelector(
    (state: RootState) => {
      const connector = state.channels.channel.destinationConnectors?.connector;
      // Ensure we always return an array
      return Array.isArray(connector) ? connector : (connector ? [connector] : []);
    }
  );
  const columns: Column[] = [
    { id: 'destinationId', title: 'Id', width: '10%' },
    { id: 'destination', title: 'Destination', width: '40%' },
    { id: 'status', title: 'Status', width: '10%' },
    { id: 'connectorType', title: 'Connector Type', width: '40%' }
  ];
  const rows = useMemo(() => {
    return destinations.map(
      destination =>
        ({
          id: destination.metaDataId.toString(),
          destinationId: {
            type: 'number',
            value: destination.metaDataId
          },
          destination: {
            type: 'text',
            value: destination.name
          },
          status: {
            type: 'text',
            value: destination.enabled ? 'Enabled' : 'Disabled'
          },
          connectorType: {
            type: 'text',
            value: destination.transportName
          }
        }) as Row
    );
  }, [destinations]);

  const transportName = useMemo(() => {
    if (current) {
      return destinations.find(d => d.metaDataId === current)!.transportName;
    }
    return undefined;
  }, [current, destinations]);

  const waitForPrevious = useMemo(() => {
    if (current) {
      return destinations.find(d => d.metaDataId === current)!.waitForPrevious;
    }
    return undefined;
  }, [current, destinations]);

  const handleRowClick = (data: Row) => {
    setCurrent(Number(data.id));
  };

  const handleClickWaitForPrevious = () => {
    const newDestinations = destinations.map(d => {
      if (d.metaDataId === current) {
        return {
          ...d,
          waitForPrevious: !d.waitForPrevious
        };
      }
      return { ...d };
    });
    dispatch(updateDestinations(newDestinations));
  };

  return (
    <Stack direction="column" spacing={0.5}>
      <div style={{ padding: '10px' }}>
        <MirthTable rows={rows} columns={columns} onRowClick={handleRowClick} />
      </div>

      <div>
        <Grid container direction="row" columnSpacing={2}>
          <Grid item md={1}>
            <Typography variant="subtitle1" textAlign="right">
              Connector Type:{' '}
            </Typography>
          </Grid>

          <Grid item md={1.5}>
            <MirthSelect
              value={transportName ?? ''}
              items={DESTINATION_CONNECTOR_TYPES}
              onChange={() => {}}
              fullWdith
            />
          </Grid>

          <Grid item>
            <FormControlLabel
              label="Wait for previous destination"
              labelPlacement="end"
              control={
                <Checkbox
                  checked={waitForPrevious ?? false}
                  onClick={handleClickWaitForPrevious}
                />
              }
              disabled={current === 1}
            />
          </Grid>
        </Grid>
      </div>

      <div>
        {transportName === 'Channel Writer' && (
          <ChannelWriter current={current} destinations={destinations} />
        )}
        {transportName === 'DICOM Sender' && (
          <DICOMSender current={current} destinations={destinations} />
        )}
        {transportName === 'Database Writer' && (
          <DatabaseWriter current={current} destinations={destinations} />
        )}
        {transportName === 'Document Writer' && (
          <DocumentWriter current={current} destinations={destinations} />
        )}
        {transportName === 'File Writer' && (
          <FileWriter current={current} destinations={destinations} />
        )}
        {transportName === 'HTTP Sender' && (
          <HTTPSender current={current} destinations={destinations} />
        )}
        {transportName === 'JavaScript Writer' && (
          <JavaScriptWriter current={current} destinations={destinations} />
        )}
        {transportName === 'SMTP Sender' && (
          <SMTPSender current={current} destinations={destinations} />
        )}
        {transportName === 'TCP Sender' && (
          <TCPSender current={current} destinations={destinations} />
        )}
        {transportName === 'Web Service Sender' && (
          <WebServiceSender current={current} destinations={destinations} />
        )}
      </div>
    </Stack>
  );
};

export default DestinationView;
