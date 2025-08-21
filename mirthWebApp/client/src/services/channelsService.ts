import type { ChannelIdAndName, Connector, Port } from '../types';
import { getMirthApiClient } from '../utils/api';

// Helper function to format date exactly like API example: "1985-10-26T09:00:00.000-0700"
const formatDateForMirthConnect = (date: Date): string => {
  // Get timezone offset in minutes and convert to +/-HHMM format
  const timezoneOffset = date.getTimezoneOffset();
  const offsetHours = Math.floor(Math.abs(timezoneOffset) / 60);
  const offsetMinutes = Math.abs(timezoneOffset) % 60;
  const offsetSign = timezoneOffset <= 0 ? '+' : '-';
  const timezoneString = `${offsetSign}${offsetHours.toString().padStart(2, '0')}${offsetMinutes.toString().padStart(2, '0')}`;

  // Format the date part with milliseconds
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  const milliseconds = date.getMilliseconds().toString().padStart(3, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}${timezoneString}`;
};

// Helper function to clean and validate channel data before saving
const prepareChannelForSave = (channel: any) => {
  // Create a deep copy to avoid modifying the original
  const cleanedChannel = JSON.parse(JSON.stringify(channel));

  // Ensure required fields exist
  if (!cleanedChannel.properties) {
    throw new Error('Channel properties are missing');
  }

  if (!cleanedChannel.sourceConnector) {
    throw new Error('Source connector is missing');
  }

  if (!cleanedChannel.destinationConnectors?.connector) {
    throw new Error('Destination connectors are missing');
  }

  // Ensure exportData.metadata exists
  if (!cleanedChannel.exportData?.metadata) {
    throw new Error('Channel export metadata is missing');
  }

  // Remove any undefined values that might cause issues
  const removeUndefined = (obj: any): any => {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(removeUndefined);
    }

    if (typeof obj === 'object') {
      const cleaned: any = {};
      Object.keys(obj).forEach(key => {
        const value = obj[key];
        if (value !== undefined) {
          cleaned[key] = removeUndefined(value);
        }
      });
      return cleaned;
    }

    return obj;
  };

  return removeUndefined(cleanedChannel);
};

export const getAllChannels = async () => {
  const mirthApiClient = getMirthApiClient();
  const response = await mirthApiClient.get('/channels');
  const list = response.data.list;
  if (list) {
    const { channel } = list;
    return channel.length ? channel : [channel];
  }
  return [];
};

export const getChannel = async (id: string) => {
  const mirthApiClient = getMirthApiClient();
  const response = await mirthApiClient.get(`/channels/${id}`);
  return response.data.channel;
};

// New function to get full channel summary (like Java client)
export const getChannelSummary = async () => {
  const mirthApiClient = getMirthApiClient();
  try {
    // First get channel IDs and names
    const idsResponse = await mirthApiClient.get('/channels/idsAndNames');
    const channelIds = Object.keys(idsResponse.data.map.entry || {});

    // Create the request body for _getSummary (like Java client)
    const summaryRequestBody: Record<string, any> = {};
    channelIds.forEach(id => {
      summaryRequestBody[id] = {
        channelHeader: {
          revision: 0,
          deployedDate: { time: 0, timezone: 'UTC' },
          codeTemplatesChanged: false
        }
      };
    });

    // Get full channel summary
    const response = await mirthApiClient.post('/channels/_getSummary?ignoreNewChannels=false', summaryRequestBody);

    // Extract the channel data from the response
    if (response.data.list && response.data.list.channelSummary) {
      const summaries = Array.isArray(response.data.list.channelSummary)
        ? response.data.list.channelSummary
        : [response.data.list.channelSummary];

      // Return the first channel that matches the expected structure
      return summaries.find((summary: any) => summary.channelStatus?.channel)?.channelStatus.channel || null;
    }

    return null;
  } catch (error: any) {
    console.error('Error getting channel summary:', error);
    throw error;
  }
};

// Function to get a specific channel's full details
export const getChannelFullDetails = async (channelId: string) => {
  const mirthApiClient = getMirthApiClient();
  try {
    // Use the simpler GET endpoint instead of the problematic _getSummary endpoint
    const response = await mirthApiClient.get(`/channels/${channelId}`);
    return response.data.channel || null;
  } catch (error: any) {
    console.error('Error getting channel full details:', error);
    throw error;
  }
};

export const createChannel = async (channel: any) => {
  try {
    console.log('Attempting to create new channel:', {
      id: channel.id,
      name: channel.name
    });

    // Send the channel object exactly as provided - no validation or cleaning
    const response = await getMirthApiClient().post('/channels', channel);
    console.log('Channel created successfully:', channel.name);
    return response;
  } catch (error: any) {
    console.error('Error creating channel:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });

    throw new Error(`Creation failed: ${error.message}`);
  }
};

export const updateChannel = async (channel: any) => {
  try {
    // Generate timestamp for startEdit parameter (matching Java client format)
    // Java uses: SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ssZ", Locale.getDefault())
    const now = new Date();
    const startEdit = formatDateForMirthConnect(now);

    console.log('Attempting to save channel:', {
      id: channel.id,
      name: channel.name,
      startEdit: startEdit,
      hasRequiredFields: {
        id: !!channel.id,
        name: !!channel.name,
        properties: !!channel.properties,
        sourceConnector: !!channel.sourceConnector,
        destinationConnectors: !!channel.destinationConnectors
      }
    });

    // Validate required fields
    if (!channel.id) {
      throw new Error('Channel ID is required');
    }
    if (!channel.name) {
      throw new Error('Channel name is required');
    }

    // Clean and validate the channel data
    const cleanedChannel = prepareChannelForSave(channel);

    console.log('Cleaned channel data ready for save:', {
      id: cleanedChannel.id,
      name: cleanedChannel.name,
      hasExportData: !!cleanedChannel.exportData,
      hasMetadata: !!cleanedChannel.exportData?.metadata
    });

    // Log the exact API call being made
    const apiUrl = `/channels/${channel.id}?override=true&startEdit=${encodeURIComponent(startEdit)}`;
    console.log('Making API call:', {
      method: 'PUT',
      url: apiUrl,
      startEditFormatted: startEdit,
      startEditEncoded: encodeURIComponent(startEdit),
      channelDataSize: JSON.stringify(cleanedChannel).length
    });

    // Use the correct API structure based on Java client analysis
    const response = await getMirthApiClient().put(
      apiUrl,
      cleanedChannel // Send the cleaned channel object
    );

    console.log('Channel saved successfully:', channel.name);
    return response;
  } catch (error: any) {
    console.error('Error saving channel:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method
    });

    // Log the full error for debugging
    console.error('Full error object:', error);

    throw new Error(`Save failed: ${error.message}`);
  }
};

// Unified save method that follows the Java client pattern
// This method tries to update first, then falls back to create if the channel doesn't exist
export const saveChannel = async (channel: any, existingChannelIds: string[] = []) => {
  try {
    const isExisting = existingChannelIds.includes(channel.id);

    console.log('Saving channel with strategy:', {
      id: channel.id,
      name: channel.name,
      isExisting: isExisting,
      strategy: isExisting ? 'update' : 'create'
    });

    if (isExisting) {
      // Channel exists, try to update it
      return await updateChannel(channel);
    } else {
      // Channel doesn't exist, create it
      return await createChannel(channel);
    }
  } catch (error: any) {
    console.error('Error in saveChannel:', {
      channelId: channel.id,
      channelName: channel.name,
      error: error.message
    });
    throw error;
  }
};

// Alternative method that tries update first, then create (like Java client)
export const saveChannelWithUpdateFirst = async (channel: any) => {
  const mirthApiClient = getMirthApiClient();
  try {
    console.log('Attempting to save channel (update first strategy):', {
      id: channel.id,
      name: channel.name
    });

    // Try to update first (override = false)
    try {
      const response = await mirthApiClient.put(
        `/channels/${channel.id}?override=false`,
        prepareChannelForSave(channel)
      );
      console.log('Channel updated successfully:', channel.name);
      return response;
    } catch (updateError: any) {
      console.log('Update failed, trying create:', updateError.message);

      // If update fails, try to create
      try {
        const response = await mirthApiClient.post(
          '/channels',
          prepareChannelForSave(channel)
        );
        console.log('Channel created successfully:', channel.name);
        return response;
      } catch (createError: any) {
        console.error('Both update and create failed:', {
          updateError: updateError.message,
          createError: createError.message
        });
        throw createError;
      }
    }
  } catch (error: any) {
    console.error('Error in saveChannelWithUpdateFirst:', error);
    throw error;
  }
};

// Test method with XML content type
export const saveChannelWithXML = async (channel: any) => {
  try {
    console.log('Attempting to save channel with XML content type:', {
      id: channel.id,
      name: channel.name
    });

    const cleanedChannel = prepareChannelForSave(channel);

    // Try to create with XML content type
    const response = await getMirthApiClient().post(
      '/channels',
      cleanedChannel,
      {
        headers: {
          'Content-Type': 'application/xml',
          'Accept': 'application/xml'
        }
      }
    );
    console.log('Channel created with XML successfully:', channel.name);
    return response;
  } catch (error: any) {
    console.error('Error in saveChannelWithXML:', error);
    throw error;
  }
};

export const getConnectorNames = async (id: string): Promise<Connector[]> => {
  const mirthApiClient = getMirthApiClient();
  const response = await mirthApiClient.get(
    `/channels/${id}/connectorNames`
  );
  return response.data['linked-hash-map'].entry;
};

export const getPortsInUse = async (): Promise<Port[]> => {
  const mirthApiClient = getMirthApiClient();
  const response = await mirthApiClient.get(`/channels/portsInUse`);
  return response.data.list['com.mirth.connect.donkey.model.channel.Ports'];
};

export const getChannelIdsAndNames = async (): Promise<ChannelIdAndName[]> => {
  const mirthApiClient = getMirthApiClient();
  const response = await mirthApiClient.get(`/channels/idsAndNames`);
  return response.data.map.entry;
};

export const getChannelStatistics = async () => {
  // Use the correct statistics endpoint based on the API reference
  const mirthApiClient = getMirthApiClient();
  try {
    const response = await mirthApiClient.get('/channels/statistics');
    console.log('Statistics found at endpoint: /channels/statistics');
    return response.data;
  } catch (error: any) {
    console.error('Failed to get statistics from /channels/statistics:', error.response?.status || error.message);

    // Fallback to other possible endpoints if the main one fails
    const fallbackEndpoints = [
      '/channels/status',
      '/dashboard/statistics'
    ];

    for (const endpoint of fallbackEndpoints) {
      try {
        const response = await mirthApiClient.get(endpoint);
        console.log(`Statistics found at fallback endpoint: ${endpoint}`);
        return response.data;
      } catch (fallbackError: any) {
        if (fallbackError.response?.status === 404) {
          console.log(`Fallback endpoint ${endpoint} not found, trying next...`);
          continue;
        }
        console.error(`Error with fallback endpoint ${endpoint}:`, fallbackError.response?.status || fallbackError.message);
      }
    }

    // If no statistics endpoint works, return null
    console.warn('No statistics endpoint found, returning null');
    return null;
  }
};

export const getChannelStatuses = async () => {
  // Get detailed channel status information
  try {
    const response = await getMirthApiClient().get('/channels/statuses');
    console.log('Channel statuses found at endpoint: /channels/statuses');
    return response.data;
  } catch (error: any) {
    console.error('Failed to get channel statuses from /channels/statuses:', error.response?.status || error.message);
    return null;
  }
};

export const getChannelStatus = async (channelId: string) => {
  // Get status for a specific channel
  try {
    const response = await getMirthApiClient().get(`/channels/${channelId}/status`);
    console.log(`Channel status found for ${channelId} at endpoint: /channels/${channelId}/status`);
    return response.data;
  } catch (error: any) {
    console.error(`Failed to get channel status for ${channelId}:`, error.response?.status || error.message);
    return null;
  }
};

export const startChannel = async (channelId: string) => {
  const response = await getMirthApiClient().post(`/channels/${channelId}/_start`);
  return response;
};

export const stopChannel = async (channelId: string) => {
  const response = await getMirthApiClient().post(`/channels/${channelId}/_stop`);
  return response;
};

export const pauseChannel = async (channelId: string) => {
  const response = await getMirthApiClient().post(`/channels/${channelId}/_pause`);
  return response;
};

export const resumeChannel = async (channelId: string) => {
  const response = await getMirthApiClient().post(`/channels/${channelId}/_resume`);
  return response;
};

export const pauseAllChannels = async () => {
  // Pause all channels using the bulk pause endpoint
  const response = await getMirthApiClient().post('/channels/_pause');
  return response;
};

export const stopAllChannels = async () => {
  // Stop all channels using the bulk stop endpoint
  const response = await getMirthApiClient().post('/channels/_stop');
  return response;
};

export const pauseSelectedChannels = async (channelIds: string[]) => {
  // Try different formats for bulk pause operation
  try {
    // Try sending as JSON array
    const response = await getMirthApiClient().post('/channels/_pause', channelIds);
    return response;
  } catch (error) {
    console.log('Failed with JSON array, trying query parameters...');
    try {
      // Try with query parameters
      const queryParams = channelIds.map(id => `channelId=${id}`).join('&');
      const response = await getMirthApiClient().post(`/channels/_pause?${queryParams}`);
      return response;
    } catch (error2) {
      console.log('Failed with query parameters, trying empty body...');
      // Try with no body (affects all channels)
      const response = await getMirthApiClient().post('/channels/_pause');
      return response;
    }
  }
};

export const stopSelectedChannels = async (channelIds: string[]) => {
  // Try different formats for bulk stop operation
  try {
    // Try sending as JSON array
    const response = await getMirthApiClient().post('/channels/_stop', channelIds);
    return response;
  } catch (error) {
    console.log('Failed with JSON array, trying query parameters...');
    try {
      // Try with query parameters
      const queryParams = channelIds.map(id => `channelId=${id}`).join('&');
      const response = await getMirthApiClient().post(`/channels/_stop?${queryParams}`);
      return response;
    } catch (error2) {
      console.log('Failed with query parameters, trying empty body...');
      // Try with no body (affects all channels)
      const response = await getMirthApiClient().post('/channels/_stop');
      return response;
    }
  }
};

export const undeployChannel = async (channelId: string) => {
  const response = await getMirthApiClient().post(`/channels/${channelId}/_undeploy`);
  return response;
};

export const deployChannel = async (
  channelId: string,
  options?: { returnErrors?: boolean; debugOptions?: string }
) => {
  const params = new URLSearchParams();
  if (options?.returnErrors) params.append('returnErrors', 'true');
  if (options?.debugOptions) params.append('debugOptions', options.debugOptions);
  const url = `/channels/${channelId}/_deploy${params.toString() ? '?' + params.toString() : ''}`;
  const response = await getMirthApiClient().post(url);
  return response;
};

export const getChannelGroups = async () => {
  const response = await getMirthApiClient().get('/channelgroups');
  if (!response.data.list)
    return [];
  return response.data.list.channelGroup
    ? Array.isArray(response.data.list.channelGroup)
      ? response.data.list.channelGroup
      : [response.data.list.channelGroup]
    : [];
};

export const clearStatistics = async (
  channelIds: string[],
  received: boolean,
  filtered: boolean,
  sent: boolean,
  errored: boolean
) => {
  const channelConnectorMap: Record<string, null> = {};
  channelIds.forEach(id => { channelConnectorMap[id] = null; });
  const params = new URLSearchParams();
  if (received) params.append('received', 'true');
  if (filtered) params.append('filtered', 'true');
  if (sent) params.append('sent', 'true');
  if (errored) params.append('error', 'true');
  return getMirthApiClient().post(`/channels/_clearStatistics?${params.toString()}`, channelConnectorMap);
};

export const sendMessage = async (
  channelId: string,
  message: string,
  destinationMetaDataIds: number[] = [],
  sourceMapVars: { key: string; value: string }[] = [],
  advancedOptions: { overwrite: boolean; imported: boolean; originalMessageId: string } = { overwrite: false, imported: false, originalMessageId: '' }
) => {
  const params = new URLSearchParams();
  destinationMetaDataIds.forEach(id => {
    params.append('destinationMetaDataId', id.toString());
  });
  sourceMapVars.forEach(variable => {
    params.append('sourceMapEntry', `${variable.key}=${variable.value}`);
  });
  if (advancedOptions.overwrite) {
    params.append('overwrite', 'true');
  }
  if (advancedOptions.imported) {
    params.append('imported', 'true');
  }
  if (advancedOptions.originalMessageId) {
    params.append('originalMessageId', advancedOptions.originalMessageId);
  }
  return getMirthApiClient().post(`/channels/${channelId}/messages`, message, {
    params,
    headers: {
      'Content-Type': 'text/plain'
    }
  });
};

export const removeAllMessages = async (
  channelId: string,
  restartRunningChannels: boolean = false,
  clearStatistics: boolean = true
) => {
  const params = new URLSearchParams();
  if (restartRunningChannels) {
    params.append('restartRunningChannels', 'true');
  }
  if (clearStatistics) {
    params.append('clearStatistics', 'true');
  }
  const response = await getMirthApiClient().delete(
    `/channels/${channelId}/messages/_removeAll?${params.toString()}`
  );
  return response;
};

export const getChannelMessages = async (channelId: string, limit = 20) => {
  const response = await getMirthApiClient().get(`/channels/${channelId}/messages`, {
    params: { limit, includeContent: true }
  });
  return response.data;
};
