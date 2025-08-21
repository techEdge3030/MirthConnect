import { Grid, Stack, Typography } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';

import { MirthSelect } from '../../../components';
import type { RootState } from '../../../states';
import { setChannel } from '../../../states/channelReducer';
import type { Channel } from '../../../types';
import ChannelReaderView from './ChannelReaderView';
import DatabaseReaderView from './DatabaseReaderView';
import DicomListenerView from './DicomListenerView';
import FileReaderView from './FileReaderView';
import HttpListenerView from './HttpListenerView';
import JavascriptReaderView from './JavascriptReaderView';
import JMSListenerView from './JMSListenerView';
import { SOURCE_INITAL_VALUES, SOURCE_TYPES } from './SourceView.constant';
import TCPListenerView from './TCPListenerView';
import WebServiceListenerView from './WebServiceListenerView';

const SourceView = () => {
  const channel = useSelector((state: RootState) => state.channels.channel);
  const dispatch = useDispatch();

  const handleChange = (value: string) => {
    const data: Channel = {
      ...channel,
      sourceConnector: {
        ...channel.sourceConnector,
        transportName: value,
        properties: { ...SOURCE_INITAL_VALUES[value] }
      }
    };
    dispatch(setChannel(data));
  };

  return (
    <Stack direction="column" marginTop="10px" spacing={0.55}>
      <div>
        <Grid container direction="row" spacing={2} alignItems="center">
          <Grid item md={1}>
            <Typography variant="subtitle1" align="right">
              Connector Type:
            </Typography>
          </Grid>
          <Grid item md={2}>
            <MirthSelect
              value={channel.sourceConnector.transportName}
              items={SOURCE_TYPES}
              onChange={handleChange}
              fullWdith
            />
          </Grid>
        </Grid>
      </div>

      <div>
        {channel.sourceConnector.transportName === 'Channel Reader' && (
          <ChannelReaderView />
        )}
        {channel.sourceConnector.transportName === 'DICOM Listener' && (
          <DicomListenerView />
        )}
        {channel.sourceConnector.transportName === 'Database Reader' && (
          <DatabaseReaderView />
        )}
        {channel.sourceConnector.transportName === 'File Reader' && (
          <FileReaderView />
        )}
        {channel.sourceConnector.transportName === 'HTTP Listener' && (
          <HttpListenerView />
        )}
        {channel.sourceConnector.transportName === 'JMS Listener' && (
          <JMSListenerView />
        )}
        {channel.sourceConnector.transportName === 'JavaScript Reader' && (
          <JavascriptReaderView />
        )}
        {channel.sourceConnector.transportName === 'TCP Listener' && (
          <TCPListenerView />
        )}
        {channel.sourceConnector.transportName === 'Web Service Listener' && (
          <WebServiceListenerView />
        )}
      </div>
    </Stack>
  );
};

export default SourceView;
