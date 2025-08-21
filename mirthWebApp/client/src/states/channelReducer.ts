import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import type {
  Channel,
  ConnectionPropertyEntry,
  CronProperty,
  CustomMetaData,
  DestinationConnector,
  DestinationStateData,
  ResponseHeaderEntry,
  StaticResource
} from '../types';
import type { ChannelStatus } from '../types/channel.type';
import { getAllChannels, getChannelStatistics, getChannelStatuses, updateChannel, getChannelFullDetails } from '../services/channelsService';

export interface ChannelState {
  channel: Channel;
  channels: ChannelStatus[];
  loading: boolean;
  error: string | null;
}

const initialState: ChannelState = {
  channel: {} as Channel,
  channels: [],
  loading: false,
  error: null
};

// Async thunk for fetching channels
export const fetchChannels = createAsyncThunk(
  'channels/fetchChannels',
  async () => {
    try {
      const channels = await getAllChannels();
      
      // Try to fetch statistics, but don't fail if it's not available
      let statistics = null;
      try {
        statistics = await getChannelStatistics();
      } catch (error: any) {
        console.warn('Statistics API not available, continuing without statistics:', error.message);
      }
      
      // Try to fetch detailed channel statuses
      let channelStatuses = null;
      try {
        channelStatuses = await getChannelStatuses();
      } catch (error: any) {
        console.warn('Channel statuses API not available, continuing without detailed status:', error.message);
      }
      
      // Create a map of channel statistics by channel ID
      const statsMap = new Map();
      if (statistics && statistics.list && statistics.list.channelStatistics) {
        const statsList = Array.isArray(statistics.list.channelStatistics) 
          ? statistics.list.channelStatistics 
          : [statistics.list.channelStatistics];
        
        statsList.forEach((stat: any) => {
          statsMap.set(stat.channelId, stat);
        });
      }
      
      // Create a map of channel statuses by channel ID
      const statusMap = new Map();
      if (channelStatuses && channelStatuses.list && channelStatuses.list.dashboardStatus) {
        const statusList = Array.isArray(channelStatuses.list.dashboardStatus) 
          ? channelStatuses.list.dashboardStatus 
          : [channelStatuses.list.dashboardStatus];
        
        statusList.forEach((status: any) => {
          statusMap.set(status.channelId, status);
        });
      }
      
      // Transform the channel data to match ChannelStatus interface
      return channels.map((channel: any) => {
        const channelStats = statsMap.get(channel.id);
        const channelStatus = statusMap.get(channel.id);
        
        return {
          id: channel.id,
          name: channel.name,
          description: channel.description,
          state: channelStatus?.state || channel.state || 'STOPPED',
          revision: channel.revision,
          lastModified: channel.exportData?.metadata?.lastModified?.time || channel.lastModified,
          // deployed: true if deployedRevisionDelta === 0
          deployed: channelStatus ? channelStatus.deployedRevisionDelta === 0 : false,
          queued: channelStatus?.queued || 0,
          statistics: channelStats ? {
            received: channelStats.received || 0,
            filtered: channelStats.filtered || 0,
            queued: channelStats.queued || 0,
            sent: channelStats.sent || 0,
            error: channelStats.error || 0,
            lifetimeReceived: channelStats.lifetimeReceived || 0,
            lifetimeFiltered: channelStats.lifetimeFiltered || 0,
            lifetimeSent: channelStats.lifetimeSent || 0,
            lifetimeError: channelStats.lifetimeError || 0
          } : {
            received: 0,
            filtered: 0,
            queued: 0,
            sent: 0,
            error: 0,
            lifetimeReceived: 0,
            lifetimeFiltered: 0,
            lifetimeSent: 0,
            lifetimeError: 0
          },
          tags: []
        };
      });
    } catch (error) {
      console.error('Error fetching channels:', error);
      throw error;
    }
  }
);

// Async thunk for updating a channel
export const updateChannelAsync = createAsyncThunk(
  'channels/updateChannel',
  async (channel: any) => {
    try {
      const response = await updateChannel(channel);
      // After successful update, fetch the updated channel data to ensure metadata is current
      const updatedChannel = await getChannelFullDetails(channel.id);
      return updatedChannel || response.data;
    } catch (error: any) {
      console.error('Error updating channel:', error);
      throw error;
    }
  }
);

export const channelSlice = createSlice({
  name: 'channel',
  initialState,
  reducers: {
    setChannel: (state, action: PayloadAction<any>) => {
      state.channel = { ...action.payload };
    },
    updateChannelDescription: (state, action: PayloadAction<string>) => {
      state.channel.description = action.payload;
    },
    updateChannelName: (state, action: PayloadAction<string>) => {
      state.channel.name = action.payload;
    },
    updateChannelEnabled: (state, action: PayloadAction<boolean>) => {
      state.channel.exportData.metadata.enabled = action.payload;
    },
    updateClearGlobalChannelMap: (state, action: PayloadAction<boolean>) => {
      state.channel.properties.clearGlobalChannelMap = action.payload;
    },
    updateChannelInitialState: (state, action: PayloadAction<string>) => {
      state.channel.properties.initialState = action.payload;
    },
    updateAttachmentType: (state, action: PayloadAction<string>) => {
      state.channel.properties.attachmentProperties.type = action.payload;
    },
    updateStoreAttachments: (state, action: PayloadAction<boolean>) => {
      state.channel.properties.storeAttachments = action.payload;
    },
    updateMessageStorageMode: (state, action: PayloadAction<string>) => {
      state.channel.properties.messageStorageMode = action.payload;
    },
    updateEncryptData: (state, action: PayloadAction<boolean>) => {
      state.channel.properties.encryptData = action.payload;
    },
    updateEncryptAttachments: (state, action: PayloadAction<boolean>) => {
      state.channel.properties.encryptAttachments = action.payload;
    },
    updateEncryptCustomMetaData: (state, action: PayloadAction<boolean>) => {
      state.channel.properties.encryptCustomMetaData = action.payload;
    },
    updateRemoveContentOnCompletion: (
      state,
      action: PayloadAction<boolean>
    ) => {
      state.channel.properties.removeContentOnCompletion = action.payload;
    },
    updateRemoveOnlyFilteredOnCompletion: (
      state,
      action: PayloadAction<boolean>
    ) => {
      state.channel.properties.removeOnlyFilteredOnCompletion = action.payload;
    },
    updateRemoveAttachmentsOnCompletion: (
      state,
      action: PayloadAction<boolean>
    ) => {
      state.channel.properties.removeAttachmentsOnCompletion = action.payload;
    },
    updatePruneMetaDataDays: (
      state,
      action: PayloadAction<string | undefined>
    ) => {
      state.channel.exportData.metadata.pruningSettings.pruneMetaDataDays =
        action.payload;
    },
    updatePruneContentDays: (
      state,
      action: PayloadAction<string | undefined>
    ) => {
      state.channel.exportData.metadata.pruningSettings.pruneContentDays =
        action.payload;
    },
    updateArchiveEnabled: (state, action: PayloadAction<boolean>) => {
      state.channel.exportData.metadata.pruningSettings.archiveEnabled =
        action.payload;
    },
    updatePruneErroredMessages: (state, action: PayloadAction<boolean>) => {
      state.channel.exportData.metadata.pruningSettings.pruneErroredMessages =
        action.payload;
    },
    updateMetaDataColumns: (state, action: PayloadAction<CustomMetaData[]>) => {
      state.channel.properties.metaDataColumns.metaDataColumn = [
        ...action.payload
      ];
    },
    updateRespondAfterProcessing: (state, action: PayloadAction<boolean>) => {
      state.channel.sourceConnector.properties.sourceConnectorProperties.respondAfterProcessing =
        action.payload;
    },
    updateResponseVariable: (state, action: PayloadAction<string>) => {
      state.channel.sourceConnector.properties.sourceConnectorProperties.responseVariable =
        action.payload;
    },
    updateProcessBatch: (state, action: PayloadAction<boolean>) => {
      state.channel.sourceConnector.properties.sourceConnectorProperties.processBatch =
        action.payload;
    },
    updateFirstResponse: (state, action: PayloadAction<boolean>) => {
      state.channel.sourceConnector.properties.sourceConnectorProperties.firstResponse =
        action.payload;
    },
    updateProcessingThreads: (state, action: PayloadAction<string>) => {
      state.channel.sourceConnector.properties.sourceConnectorProperties.processingThreads =
        action.payload;
    },
    updateQueueBufferSize: (state, action: PayloadAction<string>) => {
      state.channel.sourceConnector.properties.sourceConnectorProperties.queueBufferSize =
        action.payload;
    },
    updateListenerHost: (state, action: PayloadAction<string>) => {
      state.channel.sourceConnector.properties.listenerConnectorProperties.host =
        action.payload;
    },
    updateListenerPort: (state, action: PayloadAction<string>) => {
      state.channel.sourceConnector.properties.listenerConnectorProperties.port =
        action.payload;
    },
    updateApplicationEntity: (state, action: PayloadAction<string>) => {
      state.channel.sourceConnector.properties.applicationEntity =
        action.payload;
    },
    updateMaxAsyncOperations: (state, action: PayloadAction<string>) => {
      state.channel.sourceConnector.properties.async = action.payload;
    },
    updatePackPDV: (state, action: PayloadAction<boolean>) => {
      state.channel.sourceConnector.properties.pdv1 = action.payload;
    },
    updateDIMSEIntervalPeriod: (state, action: PayloadAction<string>) => {
      state.channel.sourceConnector.properties.reaper = action.payload;
    },
    updateSendPDULen: (state, action: PayloadAction<string>) => {
      state.channel.sourceConnector.properties.sndpdulen = action.payload;
    },
    updateReleaseTo: (state, action: PayloadAction<string>) => {
      state.channel.sourceConnector.properties.releaseTo = action.payload;
    },
    updateReceivePDULen: (state, action: PayloadAction<string>) => {
      state.channel.sourceConnector.properties.rcvpdulen = action.payload;
    },
    updateSocketCloseDelay: (state, action: PayloadAction<string>) => {
      state.channel.sourceConnector.properties.soCloseDelay = action.payload;
    },
    updateSocketSendBuffer: (state, action: PayloadAction<string>) => {
      state.channel.sourceConnector.properties.sosndbuf = action.payload;
    },
    updateRequestTimeout: (state, action: PayloadAction<string>) => {
      state.channel.sourceConnector.properties.requestTo = action.payload;
    },
    updateSocketReceiveBuffer: (state, action: PayloadAction<string>) => {
      state.channel.sourceConnector.properties.sorcvbuf = action.payload;
    },
    updateIdelTimeout: (state, action: PayloadAction<string>) => {
      state.channel.sourceConnector.properties.idleTo = action.payload;
    },
    updateTranscodeBufferSize: (state, action: PayloadAction<string>) => {
      state.channel.sourceConnector.properties.bufSize = action.payload;
    },
    updateRspDelay: (state, action: PayloadAction<string>) => {
      state.channel.sourceConnector.properties.rspDelay = action.payload;
    },
    updateBigEndian: (state, action: PayloadAction<boolean>) => {
      state.channel.sourceConnector.properties.bigEndian = action.payload;
    },
    updateDefaultTransferSyntax: (state, action: PayloadAction<boolean>) => {
      state.channel.sourceConnector.properties.defts = action.payload;
    },
    updateNativeData: (state, action: PayloadAction<boolean>) => {
      state.channel.sourceConnector.properties.nativeData = action.payload;
    },
    updateTcpDelay: (state, action: PayloadAction<boolean>) => {
      state.channel.sourceConnector.properties.tcpDelay = action.payload;
    },
    updateTls: (state, action: PayloadAction<string>) => {
      state.channel.sourceConnector.properties.tls = action.payload;
    },
    updateClientAuthentication: (state, action: PayloadAction<boolean>) => {
      state.channel.sourceConnector.properties.noClientAuth = action.payload;
    },
    updateSslHandshake: (state, action: PayloadAction<boolean>) => {
      state.channel.sourceConnector.properties.nossl2 = action.payload;
    },
    updateKeyStore: (state, action: PayloadAction<string>) => {
      state.channel.sourceConnector.properties.keyStore = action.payload;
    },
    updateKeyStorePassword: (state, action: PayloadAction<string>) => {
      state.channel.sourceConnector.properties.keyStorePW = action.payload;
    },
    updateTrustStore: (state, action: PayloadAction<string>) => {
      state.channel.sourceConnector.properties.trustStore = action.payload;
    },
    updateTrustStorePassword: (state, action: PayloadAction<string>) => {
      state.channel.sourceConnector.properties.trustStorePW = action.payload;
    },
    updateKeyPassword: (state, action: PayloadAction<string>) => {
      state.channel.sourceConnector.properties.keyPW = action.payload;
    },
    updateStoreObjects: (state, action: PayloadAction<string>) => {
      state.channel.sourceConnector.properties.dest = action.payload;
    },
    updatePollingType: (state, action: PayloadAction<string>) => {
      state.channel.sourceConnector.properties.pollConnectorProperties.pollingType =
        action.payload;
    },
    updatePollingFrequency: (state, action: PayloadAction<number>) => {
      state.channel.sourceConnector.properties.pollConnectorProperties.pollingFrequency =
        action.payload;
    },
    updatePollingMinute: (state, action: PayloadAction<number>) => {
      state.channel.sourceConnector.properties.pollConnectorProperties.pollingMinute =
        action.payload;
    },
    updatePollingHour: (state, action: PayloadAction<number>) => {
      state.channel.sourceConnector.properties.pollConnectorProperties.pollingHour =
        action.payload;
    },
    updatePollingOnStart: (state, action: PayloadAction<boolean>) => {
      state.channel.sourceConnector.properties.pollConnectorProperties.pollOnStart =
        action.payload;
    },
    updateCronJobs: (state, action: PayloadAction<CronProperty[]>) => {
      state.channel.sourceConnector.properties.pollConnectorProperties.cronJobs!.cronProperity =
        action.payload.length > 1
          ? [...action.payload]
          : { ...action.payload[0] };
    },
    updateAggregateResults: (state, action: PayloadAction<boolean>) => {
      state.channel.sourceConnector.properties.aggregateResults =
        action.payload;
    },
    updateCacheResults: (state, action: PayloadAction<boolean>) => {
      state.channel.sourceConnector.properties.cacheResults = action.payload;
    },
    updateDriver: (state, action: PayloadAction<string>) => {
      state.channel.sourceConnector.properties.driver = action.payload;
    },
    updateEncoding: (state, action: PayloadAction<string>) => {
      state.channel.sourceConnector.properties.encoding = action.payload;
    },
    updateFetchSize: (state, action: PayloadAction<number>) => {
      state.channel.sourceConnector.properties.fetchSize = action.payload;
    },
    updateKeepConnectionOpen: (state, action: PayloadAction<boolean>) => {
      state.channel.sourceConnector.properties.keepConnectionOpen =
        action.payload;
    },
    updatePassword: (state, action: PayloadAction<string>) => {
      state.channel.sourceConnector.properties.password = action.payload;
    },
    updateRetryCount: (state, action: PayloadAction<number>) => {
      state.channel.sourceConnector.properties.retryCount = action.payload;
    },
    updateRetryInterval: (state, action: PayloadAction<number>) => {
      state.channel.sourceConnector.properties.retryInterval = action.payload;
    },
    updateSelectCode: (state, action: PayloadAction<string>) => {
      state.channel.sourceConnector.properties.select = action.payload;
    },
    updateUpdateCode: (state, action: PayloadAction<string>) => {
      state.channel.sourceConnector.properties.update = action.payload;
    },
    updateUpdateMode: (state, action: PayloadAction<number>) => {
      state.channel.sourceConnector.properties.updateMode = action.payload;
    },
    updateUrl: (state, action: PayloadAction<string>) => {
      state.channel.sourceConnector.properties.url = action.payload;
    },
    updateUseScript: (state, action: PayloadAction<boolean>) => {
      state.channel.sourceConnector.properties.useScript = action.payload;
    },
    updateUsername: (state, action: PayloadAction<string>) => {
      state.channel.sourceConnector.properties.username = action.payload;
    },
    updateScheme: (state, action: PayloadAction<string>) => {
      state.channel.sourceConnector.properties.scheme = action.payload;
    },
    updateHost: (state, action: PayloadAction<string>) => {
      state.channel.sourceConnector.properties.host = action.payload;
    },
    updateFileFilter: (state, action: PayloadAction<string>) => {
      state.channel.sourceConnector.properties.fileFilter = action.payload;
    },
    updateRegex: (state, action: PayloadAction<boolean>) => {
      state.channel.sourceConnector.properties.regex = action.payload;
    },
    updateDirectoryRecursion: (state, action: PayloadAction<boolean>) => {
      state.channel.sourceConnector.properties.directoryRecursion =
        action.payload;
    },
    updateIgnoreDot: (state, action: PayloadAction<boolean>) => {
      state.channel.sourceConnector.properties.ignoreDot = action.payload;
    },
    updateAnonymous: (state, action: PayloadAction<boolean>) => {
      state.channel.sourceConnector.properties.anonymous = action.payload;
    },
    updateTimeout: (state, action: PayloadAction<number>) => {
      state.channel.sourceConnector.properties.timeout = action.payload;
    },
    updateSecure: (state, action: PayloadAction<boolean>) => {
      state.channel.sourceConnector.properties.secure = action.payload;
    },
    updatePassive: (state, action: PayloadAction<boolean>) => {
      state.channel.sourceConnector.properties.passive = action.payload;
    },
    updateValidateConnection: (state, action: PayloadAction<boolean>) => {
      state.channel.sourceConnector.properties.validateConnection =
        action.payload;
    },
    updateAfterProcessingAction: (state, action: PayloadAction<string>) => {
      state.channel.sourceConnector.properties.afterProcessingAction =
        action.payload;
    },
    updateMoveToDirectory: (state, action: PayloadAction<string>) => {
      state.channel.sourceConnector.properties.moveToDirectory = action.payload;
    },
    updateMoveToFileName: (state, action: PayloadAction<string>) => {
      state.channel.sourceConnector.properties.moveToFileName = action.payload;
    },
    updateErrorReadingAction: (state, action: PayloadAction<string>) => {
      state.channel.sourceConnector.properties.errorReadingAction =
        action.payload;
    },
    updateErrorResponseAction: (state, action: PayloadAction<string>) => {
      state.channel.sourceConnector.properties.errorResponseAction =
        action.payload;
    },
    updateErrorMoveToDirectory: (state, action: PayloadAction<string>) => {
      state.channel.sourceConnector.properties.errorMoveToDirectory =
        action.payload;
    },
    updateErrorMoveToFileName: (state, action: PayloadAction<string>) => {
      state.channel.sourceConnector.properties.errorMoveToDirectory =
        action.payload;
    },
    updateCheckFileAge: (state, action: PayloadAction<boolean>) => {
      state.channel.sourceConnector.properties.checkFileAge = action.payload;
    },
    updateFileAge: (state, action: PayloadAction<number>) => {
      state.channel.sourceConnector.properties.fileAge = action.payload;
    },
    updateFileSizeMinimum: (state, action: PayloadAction<number>) => {
      state.channel.sourceConnector.properties.fileSizeMinimum = action.payload;
    },
    updateFileSizeMaximum: (state, action: PayloadAction<number>) => {
      state.channel.sourceConnector.properties.fileSizeMaximum = action.payload;
    },
    updateIgnoreFileSizeMaximum: (state, action: PayloadAction<boolean>) => {
      state.channel.sourceConnector.properties.ignoreFileSizeMaximum =
        action.payload;
    },
    updateSortBy: (state, action: PayloadAction<string>) => {
      state.channel.sourceConnector.properties.sortBy = action.payload;
    },
    updateBinary: (state, action: PayloadAction<boolean>) => {
      state.channel.sourceConnector.properties.binary = action.payload;
    },
    updateCharsetEncoding: (state, action: PayloadAction<string>) => {
      state.channel.sourceConnector.properties.charsetEncoding = action.payload;
    },
    updateXmlBody: (state, action: PayloadAction<boolean>) => {
      state.channel.sourceConnector.properties.xmlBody = action.payload;
    },
    updateParseMultipart: (state, action: PayloadAction<boolean>) => {
      state.channel.sourceConnector.properties.parseMultipart = action.payload;
    },
    updateIncludeMetadata: (state, action: PayloadAction<boolean>) => {
      state.channel.sourceConnector.properties.includeMetadata = action.payload;
    },
    updateBinaryMimeTypes: (state, action: PayloadAction<string>) => {
      state.channel.sourceConnector.properties.binaryMimeTypes = action.payload;
    },
    updateBinaryMimeTypesRegex: (state, action: PayloadAction<boolean>) => {
      state.channel.sourceConnector.properties.binaryMimeTypesRegex =
        action.payload;
    },
    updateResponseContentType: (state, action: PayloadAction<string>) => {
      state.channel.sourceConnector.properties.responseContentType =
        action.payload;
    },
    updateResponseDataTypeBinary: (state, action: PayloadAction<boolean>) => {
      state.channel.sourceConnector.properties.responseDataTypeBinary =
        action.payload;
    },
    updateResponseStatusCode: (state, action: PayloadAction<string>) => {
      state.channel.sourceConnector.properties.responseStatusCode =
        action.payload;
    },
    updateResponseHeaders: (
      state,
      action: PayloadAction<ResponseHeaderEntry[]>
    ) => {
      state.channel.sourceConnector.properties.responseHeaders.entry = [
        ...action.payload
      ];
    },
    updateResponseHeadersVariable: (state, action: PayloadAction<string>) => {
      state.channel.sourceConnector.properties.responseHeadersVariable =
        action.payload;
    },
    updateUseResponseHeadersVariable: (
      state,
      action: PayloadAction<boolean>
    ) => {
      state.channel.sourceConnector.properties.useResponseHeadersVariable =
        action.payload;
    },
    updateCharset: (state, action: PayloadAction<string>) => {
      state.channel.sourceConnector.properties.charset = action.payload;
    },
    updateContextPath: (state, action: PayloadAction<string>) => {
      state.channel.sourceConnector.properties.contextPath = action.payload;
    },
    updateStaticResources: (state, action: PayloadAction<StaticResource[]>) => {
      state.channel.sourceConnector.properties.staticResources[
        'com.mirth.connect.connectors.http.HttpStaticResource'
      ] = [...action.payload];
    },
    updateUseJndi: (state, action: PayloadAction<boolean>) => {
      state.channel.sourceConnector.properties.useJndi = action.payload;
    },
    updateProviderUrl: (state, action: PayloadAction<string>) => {
      state.channel.sourceConnector.properties.jndiProviderUrl = action.payload;
    },
    updateContextFactory: (state, action: PayloadAction<string>) => {
      state.channel.sourceConnector.properties.jndiInitialContextFactory =
        action.payload;
    },
    updateConnectionFacotryName: (state, action: PayloadAction<string>) => {
      state.channel.sourceConnector.properties.jndiConnectionFactoryName =
        action.payload;
    },
    updateConnectionFactoryClass: (state, action: PayloadAction<string>) => {
      state.channel.sourceConnector.properties.jndiConnectionFactoryName =
        action.payload;
    },
    updateConnectionProperties: (
      state,
      action: PayloadAction<ConnectionPropertyEntry[]>
    ) => {
      state.channel.sourceConnector.properties.connectionProperties.entry = [
        ...action.payload
      ];
    },
    updateDestinationType: (state, action: PayloadAction<boolean>) => {
      state.channel.sourceConnector.properties.topic = action.payload;
    },
    updateDuralbeTopic: (state, action: PayloadAction<boolean>) => {
      state.channel.sourceConnector.properties.durableTopic = action.payload;
    },
    updateDestinationName: (state, action: PayloadAction<string>) => {
      state.channel.sourceConnector.properties.destinationName = action.payload;
    },
    updateClientId: (state, action: PayloadAction<string>) => {
      state.channel.sourceConnector.properties.clientId = action.payload;
    },
    updateReconnectIntervalMillis: (state, action: PayloadAction<number>) => {
      state.channel.sourceConnector.properties.reconnectIntervalMillis =
        action.payload;
    },
    updateSelector: (state, action: PayloadAction<string>) => {
      state.channel.sourceConnector.properties.selector = action.payload;
    },
    updateScript: (state, action: PayloadAction<string>) => {
      state.channel.sourceConnector.properties.script = action.payload;
    },
    updateTransmissionMode: (state, action: PayloadAction<string>) => {
      state.channel.sourceConnector.properties.transmissionModeProperties.pluginPointName =
        action.payload;
    },
    updateServerMode: (state, action: PayloadAction<boolean>) => {
      state.channel.sourceConnector.properties.serverMode = action.payload;
    },
    updateRemoteAddress: (state, action: PayloadAction<string>) => {
      state.channel.sourceConnector.properties.remoteAddress = action.payload;
    },
    updateRemotePort: (state, action: PayloadAction<number>) => {
      state.channel.sourceConnector.properties.remotePort = action.payload;
    },
    updateOverrideLocalBinding: (state, action: PayloadAction<boolean>) => {
      state.channel.sourceConnector.properties.overrideLocalBinding =
        action.payload;
    },
    updateReconnectInterval: (state, action: PayloadAction<number>) => {
      state.channel.sourceConnector.properties.reconnectInterval =
        action.payload;
    },
    updateMaxConnection: (state, action: PayloadAction<number>) => {
      state.channel.sourceConnector.properties.maxConnections = action.payload;
    },
    updateReceiveTimeout: (state, action: PayloadAction<number>) => {
      state.channel.sourceConnector.properties.receiveTimeout = action.payload;
    },
    updateBufferSize: (state, action: PayloadAction<number>) => {
      state.channel.sourceConnector.properties.bufferSize = action.payload;
    },
    updateDataTypeBinary: (state, action: PayloadAction<boolean>) => {
      state.channel.sourceConnector.properties.dataTypeBinary = action.payload;
    },
    updateRespondOnNewConnection: (state, action: PayloadAction<number>) => {
      state.channel.sourceConnector.properties.respondOnNewConnection =
        action.payload;
    },
    updateResponseAddress: (state, action: PayloadAction<string>) => {
      state.channel.sourceConnector.properties.responseAddress = action.payload;
    },
    updateResponsePort: (state, action: PayloadAction<number>) => {
      state.channel.sourceConnector.properties.responsePort = action.payload;
    },
    updateClassName: (state, action: PayloadAction<string>) => {
      state.channel.sourceConnector.properties.className = action.payload;
    },
    updateServiceName: (state, action: PayloadAction<string>) => {
      state.channel.sourceConnector.properties.serviceName = action.payload;
    },
    updateSoapBinding: (state, action: PayloadAction<string>) => {
      state.channel.sourceConnector.properties.soapBinding = action.payload;
    },
    updateFilterRule: (state, action: PayloadAction<any>) => {
      state.channel.sourceConnector.filter.elements = { ...action.payload };
    },
    updateDestinations: (
      state,
      action: PayloadAction<DestinationConnector[]>
    ) => {
      state.channel.destinationConnectors.connector = [...action.payload];
    },
    updateDestinationQueueMessage: (state, action: PayloadAction<any>) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          if (d.metaDataId === action.payload.current) {
            return {
              ...d,
              properties: {
                ...d.properties,
                destinationConnectorProperties: {
                  ...d.properties.destinationConnectorProperties,
                  sendFirst: action.payload.sendFirst,
                  queueEnabled: action.payload.queueEnabled
                }
              }
            };
          }
          return { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationValidateResponse: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          if (d.metaDataId === action.payload.current) {
            return {
              ...d,
              properties: {
                ...d.properties,
                destinationConnectorProperties: {
                  ...d.properties.destinationConnectorProperties,
                  validateResponse: action.payload.data
                }
              }
            };
          }
          return { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationReattachAttachments: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          if (d.metaDataId === action.payload.current) {
            return {
              ...d,
              properties: {
                ...d.properties,
                destinationConnectorProperties: {
                  ...d.properties.destinationConnectorProperties,
                  reattachAttachments: action.payload.data
                }
              }
            };
          }
          return { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationChannelId: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          if (d.metaDataId === action.payload.current) {
            return {
              ...d,
              properties: {
                ...d.properties,
                channelId: action.payload.data
              }
            };
          }
          return { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationHost: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: { ...d.properties, host: action.payload.data }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationLocalHost: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: { ...d.properties, localHost: action.payload.data }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationPort: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: { ...d.properties, port: action.payload.data }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationLocalPort: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: { ...d.properties, localPort: action.payload.data }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationApplicationEntity: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: {
                  ...d.properties,
                  applicationEntity: action.payload.data
                }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationLocalApplicationEntity: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: {
                  ...d.properties,
                  localApplicationEntity: action.payload.data
                }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationAsync: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: { ...d.properties, async: action.payload.data }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationPriority: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: { ...d.properties, priority: action.payload.data }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationStgcmt: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: { ...d.properties, stgcmt: action.payload.data }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationUsername: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: { ...d.properties, username: action.payload.data }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationPasscode: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: { ...d.properties, passcode: action.payload.data }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationUidnegrsp: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: { ...d.properties, uidnegrsp: action.payload.data }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationPdv1: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: { ...d.properties, pdv1: action.payload.data }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationReaper: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: { ...d.properties, reaper: action.payload.data }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationSndpdulen: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: { ...d.properties, sndpdulen: action.payload.data }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationReleaseTo: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: { ...d.properties, releaseTo: action.payload.data }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationRcvpdulen: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: { ...d.properties, rcvpdulen: action.payload.data }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationRspTo: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: { ...d.properties, rspTo: action.payload.data }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationSosndbuf: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: { ...d.properties, sosndbuf: action.payload.data }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationShutdownDelay: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: {
                  ...d.properties,
                  shutdownDelay: action.payload.data
                }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationSorcvbuf: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: { ...d.properties, sorcvbuf: action.payload.data }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationSoCloseDelay: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: {
                  ...d.properties,
                  soCloseDelay: action.payload.data
                }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationBufSize: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: { ...d.properties, bufSize: action.payload.data }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationAcceptTo: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: { ...d.properties, acceptTo: action.payload.data }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationConnectTo: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: { ...d.properties, connectTo: action.payload.data }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationTcpDelay: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: { ...d.properties, tcpDelay: action.payload.data }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationTs1: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: { ...d.properties, ts1: action.payload.data }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationTls: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: { ...d.properties, tls: action.payload.data }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationNoClientAuth: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: {
                  ...d.properties,
                  noClientAuth: action.payload.data
                }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationNossl2: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: { ...d.properties, nossl2: action.payload.data }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationKeyStore: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: { ...d.properties, keyStore: action.payload.data }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationKeyStorePW: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: { ...d.properties, keyStorePW: action.payload.data }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationTrustStore: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: { ...d.properties, trustStore: action.payload.data }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationTrustStorePW: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: {
                  ...d.properties,
                  trustStorePW: action.payload.data
                }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationKeyPW: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: { ...d.properties, keyPW: action.payload.data }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationTemplate: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: { ...d.properties, template: action.payload.data }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationDriver: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: { ...d.properties, driver: action.payload.data }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationUrl: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: { ...d.properties, url: action.payload.data }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationPassword: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: { ...d.properties, password: action.payload.data }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationQuery: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: { ...d.properties, query: action.payload.data }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationUseScript: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: { ...d.properties, useScript: action.payload.data }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationOutputPattern: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: {
                  ...d.properties,
                  outputPattern: action.payload.data
                }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationDocumentType: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: {
                  ...d.properties,
                  documentType: action.payload.data
                }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationEncrypt: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: { ...d.properties, encrypt: action.payload.data }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationOutput: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: { ...d.properties, output: action.payload.data }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationPageWidth: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: { ...d.properties, pageWidth: action.payload.data }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationPageHeight: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: { ...d.properties, pageHeight: action.payload.data }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationPageUnit: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: { ...d.properties, pageUnit: action.payload.data }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationScheme: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: { ...d.properties, scheme: action.payload.data }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationAnonymous: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: { ...d.properties, anonymous: action.payload.data }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationTimeout: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: { ...d.properties, timeout: action.payload.data }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationKeepConnectionOpen: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: {
                  ...d.properties,
                  keepConnectionOpen: action.payload.data
                }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationMaxIdleTime: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: {
                  ...d.properties,
                  maxIdleTime: action.payload.data
                }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationSecure: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: { ...d.properties, secure: action.payload.data }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationPassive: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: { ...d.properties, passive: action.payload.data }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationValidateConnection: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: {
                  ...d.properties,
                  validateConnection: action.payload.data
                }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationOutputAppend: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: {
                  ...d.properties,
                  outputAppend: action.payload.data
                }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationErrorOnExists: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: {
                  ...d.properties,
                  errorOnExists: action.payload.data
                }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationTemporary: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: { ...d.properties, temporary: action.payload.data }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationBinary: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: { ...d.properties, binary: action.payload.data }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationCharsetEncoding: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: {
                  ...d.properties,
                  charsetEncoding: action.payload.data
                }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationUseProxyServer: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: {
                  ...d.properties,
                  useProxyServer: action.payload.data
                }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationProxyAddress: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: {
                  ...d.properties,
                  proxyAddress: action.payload.data
                }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationProxyPort: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: { ...d.properties, proxyPort: action.payload.data }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationMethod: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: { ...d.properties, method: action.payload.data }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationUseHeadersVariable: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: {
                  ...d.properties,
                  useHeadersVariable: action.payload.data
                }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationHeadersVariable: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: {
                  ...d.properties,
                  headersVariable: action.payload.data
                }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationUseParametersVariable: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: {
                  ...d.properties,
                  useParametersVariable: action.payload.data
                }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationParametersVariable: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: {
                  ...d.properties,
                  useParametersVariable: action.payload.data
                }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationResponseXmlBody: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: {
                  ...d.properties,
                  responseXmlBody: action.payload.data
                }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationResponseParseMultipart: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: {
                  ...d.properties,
                  responseParseMultipart: action.payload.data
                }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationResponseIncludeMetadata: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: {
                  ...d.properties,
                  responseIncludeMetadata: action.payload.data
                }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationResponseBinaryMimeTypes: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: {
                  ...d.properties,
                  responseBinaryMimeTypes: action.payload.data
                }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationResponseBinaryMimeTypesRegex: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: {
                  ...d.properties,
                  responseBinaryMimeTypesRegex: action.payload.data
                }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationMultipart: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: { ...d.properties, multipart: action.payload.data }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationUseAuthentication: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: {
                  ...d.properties,
                  useAuthentication: action.payload.data
                }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationAuthenticationType: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: {
                  ...d.properties,
                  authenticationType: action.payload.data
                }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationUsePreemptiveAuthentication: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: {
                  ...d.properties,
                  usePreemptiveAuthentication: action.payload.data
                }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationContent: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: { ...d.properties, content: action.payload.data }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationContentType: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: {
                  ...d.properties,
                  contentType: action.payload.data
                }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationDataTypeBinary: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: {
                  ...d.properties,
                  dataTypeBinary: action.payload.data
                }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationCharset: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: { ...d.properties, charset: action.payload.data }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationSocketTimeout: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: {
                  ...d.properties,
                  socketTimeout: action.payload.data
                }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationScript: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: { ...d.properties, script: action.payload.data }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationSmtpHost: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: { ...d.properties, smtpHost: action.payload.data }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationSmtpPort: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: { ...d.properties, smtpPort: action.payload.data }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationOverrideLocalBinding: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: {
                  ...d.properties,
                  overrideLocalBinding: action.payload.data
                }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationLocalAddress: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: {
                  ...d.properties,
                  localAddress: action.payload.data
                }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationEncryption: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: { ...d.properties, encryption: action.payload.data }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationAuthentication: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: {
                  ...d.properties,
                  authentication: action.payload.data
                }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationTo: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? { ...d, properties: { ...d.properties, to: action.payload.data } }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationFrom: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: { ...d.properties, from: action.payload.data }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationCc: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? { ...d, properties: { ...d.properties, cc: action.payload.data } }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationBcc: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: { ...d.properties, bcc: action.payload.data }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationReplyTo: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: { ...d.properties, replyTo: action.payload.data }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationIsUseHeadersVariable: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: {
                  ...d.properties,
                  isUseHeadersVariable: action.payload.data
                }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationSubject: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: { ...d.properties, subject: action.payload.data }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationHtml: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: { ...d.properties, html: action.payload.data }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationBody: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: { ...d.properties, body: action.payload.data }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationAttachments: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: {
                  ...d.properties,
                  attachments: action.payload.data
                }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationAttachmentsVariable: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: {
                  ...d.properties,
                  attachmentsVariable: action.payload.data
                }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationIsUseAttachmentsVariable: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: {
                  ...d.properties,
                  isUseAttachmentsVariable: action.payload.data
                }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationServerMode: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: { ...d.properties, serverMode: action.payload.data }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationRemoteAddress: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: {
                  ...d.properties,
                  remoteAddress: action.payload.data
                }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationRemotePort: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: { ...d.properties, remotePort: action.payload.data }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationSendTimeout: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: {
                  ...d.properties,
                  sendTimeout: action.payload.data
                }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationBufferSize: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: { ...d.properties, bufferSize: action.payload.data }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationMaxConnections: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: {
                  ...d.properties,
                  maxConnections: action.payload.data
                }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationCheckRemoteHost: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: {
                  ...d.properties,
                  checkRemoteHost: action.payload.data
                }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationResponseTimeout: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: {
                  ...d.properties,
                  responseTimeout: action.payload.data
                }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationIgnoreResponse: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: {
                  ...d.properties,
                  ignoreResponse: action.payload.data
                }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationQueueOnResponseTimeout: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: {
                  ...d.properties,
                  queueOnResponseTimeout: action.payload.data
                }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationWsdlUrl: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: { ...d.properties, wsdlUrl: action.payload.data }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationService: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: { ...d.properties, service: action.payload.data }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationOperation: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: { ...d.properties, operation: action.payload.data }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationLocationURI: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: {
                  ...d.properties,
                  locationURI: action.payload.data
                }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationEnvelope: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: { ...d.properties, envelope: action.payload.data }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationOneWay: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: { ...d.properties, oneWay: action.payload.data }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationUseMtom: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: { ...d.properties, useMtom: action.payload.data }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationSoapAction: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: { ...d.properties, soapAction: action.payload.data }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateDestinationTransmissionMode: (
      state,
      action: PayloadAction<DestinationStateData>
    ) => {
      const newDestinations = state.channel.destinationConnectors.connector.map(
        d => {
          return d.metaDataId === action.payload.current
            ? {
                ...d,
                properties: {
                  ...d.properties,
                  transmissionModeProperties: {
                    ...d.properties.transmissionModeProperties,
                    pluginPointName: action.payload.data
                  }
                }
              }
            : { ...d };
        }
      );
      state.channel.destinationConnectors.connector = [...newDestinations];
    },
    updateChannelPreprocessingScript: (
      state,
      action: PayloadAction<string>
    ) => {
      state.channel.preprocessingScript = action.payload;
    },
    updateChannelPostprocessingScript: (
      state,
      action: PayloadAction<string>
    ) => {
      state.channel.postprocessingScript = action.payload;
    },
    updateChannelDeployScript: (state, action: PayloadAction<string>) => {
      state.channel.deployScript = action.payload;
    },
    updateChannelUndeployScript: (state, action: PayloadAction<string>) => {
      state.channel.undeployScript = action.payload;
    },
    updateChannelTags: (state, action: PayloadAction<string>) => {
      state.channel.exportData.channelTags = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChannels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChannels.fulfilled, (state, action) => {
        state.loading = false;
        state.channels = action.payload;
      })
      .addCase(fetchChannels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch channels';
      })
      .addCase(updateChannelAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateChannelAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.channel = action.payload;
      })
      .addCase(updateChannelAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update channel';
      });
  }
});

export const {
  setChannel,
  updateChannelDescription,
  updateChannelName,
  updateChannelEnabled,
  updateClearGlobalChannelMap,
  updateChannelInitialState,
  updateAttachmentType,
  updateStoreAttachments,
  updateMessageStorageMode,
  updateEncryptData,
  updateEncryptAttachments,
  updateEncryptCustomMetaData,
  updateRemoveContentOnCompletion,
  updateRemoveOnlyFilteredOnCompletion,
  updateRemoveAttachmentsOnCompletion,
  updatePruneMetaDataDays,
  updatePruneContentDays,
  updateArchiveEnabled,
  updatePruneErroredMessages,
  updateMetaDataColumns,
  updateRespondAfterProcessing,
  updateResponseVariable,
  updateProcessBatch,
  updateFirstResponse,
  updateProcessingThreads,
  updateQueueBufferSize,
  updateListenerHost,
  updateListenerPort,
  updateApplicationEntity,
  updateMaxAsyncOperations,
  updatePackPDV,
  updateDIMSEIntervalPeriod,
  updateSendPDULen,
  updateReleaseTo,
  updateReceivePDULen,
  updateSocketCloseDelay,
  updateSocketSendBuffer,
  updateRequestTimeout,
  updateSocketReceiveBuffer,
  updateIdelTimeout,
  updateTranscodeBufferSize,
  updateRspDelay,
  updateBigEndian,
  updateDefaultTransferSyntax,
  updateNativeData,
  updateTcpDelay,
  updateTls,
  updateClientAuthentication,
  updateSslHandshake,
  updateKeyStore,
  updateKeyStorePassword,
  updateTrustStore,
  updateTrustStorePassword,
  updateKeyPassword,
  updateStoreObjects,
  updatePollingType,
  updatePollingOnStart,
  updateDriver,
  updateEncoding,
  updateFetchSize,
  updateKeepConnectionOpen,
  updatePassword,
  updateRetryCount,
  updateRetryInterval,
  updateSelectCode,
  updateUpdateCode,
  updateUpdateMode,
  updateUrl,
  updateUseScript,
  updateUsername,
  updateAggregateResults,
  updateCacheResults,
  updateScheme,
  updateHost,
  updateFileFilter,
  updateRegex,
  updateDirectoryRecursion,
  updateIgnoreDot,
  updateAnonymous,
  updateTimeout,
  updateSecure,
  updatePassive,
  updateValidateConnection,
  updateAfterProcessingAction,
  updateMoveToDirectory,
  updateMoveToFileName,
  updateErrorReadingAction,
  updateErrorResponseAction,
  updateErrorMoveToDirectory,
  updateErrorMoveToFileName,
  updateCheckFileAge,
  updateFileAge,
  updateFileSizeMinimum,
  updateFileSizeMaximum,
  updateIgnoreFileSizeMaximum,
  updateSortBy,
  updateBinary,
  updateCharsetEncoding,
  updateXmlBody,
  updateParseMultipart,
  updateIncludeMetadata,
  updateBinaryMimeTypes,
  updateBinaryMimeTypesRegex,
  updateResponseContentType,
  updateResponseDataTypeBinary,
  updateResponseStatusCode,
  updateResponseHeaders,
  updateResponseHeadersVariable,
  updateUseResponseHeadersVariable,
  updateCharset,
  updateContextPath,
  updateStaticResources,
  updateUseJndi,
  updateProviderUrl,
  updateContextFactory,
  updateConnectionFacotryName,
  updateConnectionFactoryClass,
  updateConnectionProperties,
  updateDestinationType,
  updateDuralbeTopic,
  updateDestinationName,
  updateClientId,
  updateReconnectIntervalMillis,
  updateSelector,
  updateScript,
  updateTransmissionMode,
  updateServerMode,
  updateRemoteAddress,
  updateRemotePort,
  updateOverrideLocalBinding,
  updateReconnectInterval,
  updateMaxConnection,
  updateReceiveTimeout,
  updateBufferSize,
  updateDataTypeBinary,
  updateRespondOnNewConnection,
  updateResponseAddress,
  updateResponsePort,
  updateClassName,
  updateServiceName,
  updateSoapBinding,
  updateFilterRule,
  updateDestinations,
  updateDestinationQueueMessage,
  updateDestinationValidateResponse,
  updateDestinationReattachAttachments,
  updateDestinationChannelId,
  updateDestinationHost,
  updateDestinationLocalHost,
  updateDestinationPort,
  updateDestinationLocalPort,
  updateDestinationApplicationEntity,
  updateDestinationLocalApplicationEntity,
  updateDestinationAsync,
  updateDestinationPriority,
  updateDestinationStgcmt,
  updateDestinationUsername,
  updateDestinationPasscode,
  updateDestinationUidnegrsp,
  updateDestinationPdv1,
  updateDestinationReaper,
  updateDestinationSndpdulen,
  updateDestinationReleaseTo,
  updateDestinationRcvpdulen,
  updateDestinationRspTo,
  updateDestinationSosndbuf,
  updateDestinationShutdownDelay,
  updateDestinationSorcvbuf,
  updateDestinationSoCloseDelay,
  updateDestinationBufSize,
  updateDestinationAcceptTo,
  updateDestinationConnectTo,
  updateDestinationTcpDelay,
  updateDestinationTs1,
  updateDestinationTls,
  updateDestinationNoClientAuth,
  updateDestinationNossl2,
  updateDestinationKeyStore,
  updateDestinationKeyStorePW,
  updateDestinationTrustStore,
  updateDestinationTrustStorePW,
  updateDestinationKeyPW,
  updateDestinationTemplate,
  updateDestinationDriver,
  updateDestinationUrl,
  updateDestinationPassword,
  updateDestinationQuery,
  updateDestinationUseScript,
  updateDestinationOutputPattern,
  updateDestinationDocumentType,
  updateDestinationEncrypt,
  updateDestinationOutput,
  updateDestinationPageWidth,
  updateDestinationPageHeight,
  updateDestinationPageUnit,
  updateDestinationScheme,
  updateDestinationAnonymous,
  updateDestinationTimeout,
  updateDestinationKeepConnectionOpen,
  updateDestinationMaxIdleTime,
  updateDestinationSecure,
  updateDestinationPassive,
  updateDestinationValidateConnection,
  updateDestinationOutputAppend,
  updateDestinationErrorOnExists,
  updateDestinationTemporary,
  updateDestinationBinary,
  updateDestinationCharsetEncoding,
  updateDestinationUseProxyServer,
  updateDestinationProxyAddress,
  updateDestinationProxyPort,
  updateDestinationMethod,
  updateDestinationUseHeadersVariable,
  updateDestinationHeadersVariable,
  updateDestinationUseParametersVariable,
  updateDestinationParametersVariable,
  updateDestinationResponseXmlBody,
  updateDestinationResponseParseMultipart,
  updateDestinationResponseIncludeMetadata,
  updateDestinationResponseBinaryMimeTypes,
  updateDestinationResponseBinaryMimeTypesRegex,
  updateDestinationMultipart,
  updateDestinationUseAuthentication,
  updateDestinationAuthenticationType,
  updateDestinationUsePreemptiveAuthentication,
  updateDestinationContent,
  updateDestinationContentType,
  updateDestinationDataTypeBinary,
  updateDestinationCharset,
  updateDestinationSocketTimeout,
  updateDestinationScript,
  updateDestinationSmtpHost,
  updateDestinationSmtpPort,
  updateDestinationOverrideLocalBinding,
  updateDestinationLocalAddress,
  updateDestinationEncryption,
  updateDestinationAuthentication,
  updateDestinationTo,
  updateDestinationFrom,
  updateDestinationCc,
  updateDestinationBcc,
  updateDestinationReplyTo,
  updateDestinationIsUseHeadersVariable,
  updateDestinationSubject,
  updateDestinationHtml,
  updateDestinationBody,
  updateDestinationAttachments,
  updateDestinationAttachmentsVariable,
  updateDestinationIsUseAttachmentsVariable,
  updateDestinationTransmissionMode,
  updateDestinationServerMode,
  updateDestinationRemoteAddress,
  updateDestinationRemotePort,
  updateDestinationSendTimeout,
  updateDestinationBufferSize,
  updateDestinationMaxConnections,
  updateDestinationCheckRemoteHost,
  updateDestinationResponseTimeout,
  updateDestinationIgnoreResponse,
  updateDestinationQueueOnResponseTimeout,
  updateDestinationWsdlUrl,
  updateDestinationService,
  updateDestinationOperation,
  updateDestinationLocationURI,
  updateDestinationEnvelope,
  updateDestinationOneWay,
  updateDestinationUseMtom,
  updateDestinationSoapAction,
  updateChannelPreprocessingScript,
  updateChannelPostprocessingScript,
  updateChannelDeployScript,
  updateChannelUndeployScript,
  updateChannelTags,
} = channelSlice.actions;
export default channelSlice.reducer;
