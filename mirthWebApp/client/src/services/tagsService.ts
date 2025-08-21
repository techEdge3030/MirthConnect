import { getMirthApiClient } from '../utils/api';

// Types for API responses
export interface ChannelIdAndName {
  string: [string, string]; // [channelId, channelName]
}

export interface ChannelTagApiResponse {
  id: string;
  name: string;
  channelIds: {
    string: string[];
  };
  backgroundColor: {
    red: number;
    green: number;
    blue: number;
    alpha: number;
  };
}

export interface ChannelTagsResponse {
  set: {
    channelTag: ChannelTagApiResponse | ChannelTagApiResponse[];
  };
}

export interface ChannelsResponse {
  map: {
    entry: ChannelIdAndName[];
  };
}

// Types for UI components
export interface Tag {
  id: string;
  name: string;
  color: string;
  channelCount: number;
  channelIds: string[]; // Add channel IDs for association tracking
  isEditing: boolean;
  originalName: string;
  originalColor: string;
}

export interface ChannelData {
  id: string;
  name: string;
  group: string;
  status: string;
  type: string;
}

/**
 * Color conversion utilities
 */
export const rgbToHex = (r: number, g: number, b: number): string => {
  const toHex = (n: number) => {
    const hex = Math.max(0, Math.min(255, Math.round(n))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

export const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 128, g: 128, b: 128 }; // Default gray if invalid hex
};

/**
 * Validate and normalize channel IDs from API response
 */
const validateChannelIds = (channelIdsData: any): string[] => {
  if (!channelIdsData) {
    return [];
  }

  try {
    // Handle different possible structures
    if (channelIdsData.string) {
      if (Array.isArray(channelIdsData.string)) {
        return channelIdsData.string.filter(id => id && typeof id === 'string');
      } else if (typeof channelIdsData.string === 'string') {
        return [channelIdsData.string];
      }
    }

    // Handle direct array
    if (Array.isArray(channelIdsData)) {
      return channelIdsData.filter(id => id && typeof id === 'string');
    }

    // Handle single string
    if (typeof channelIdsData === 'string') {
      return [channelIdsData];
    }

    return [];
  } catch (error) {
    console.warn('Error validating channel IDs:', error);
    return [];
  }
};

/**
 * Enhanced logging for API response debugging
 */
const logApiResponseStructure = (apiTag: ChannelTagApiResponse, index: number) => {
  console.log(`API Tag ${index + 1} structure:`, {
    id: apiTag.id,
    name: apiTag.name,
    channelIds: apiTag.channelIds,
    channelIdsType: typeof apiTag.channelIds,
    channelIdsString: apiTag.channelIds?.string,
    channelIdsStringType: typeof apiTag.channelIds?.string,
    isChannelIdsStringArray: Array.isArray(apiTag.channelIds?.string)
  });
};

/**
 * Transform API channel tags to UI format
 */
export const transformApiTagsToUI = (apiTags: ChannelTagApiResponse[]): Tag[] => {
  console.log('Transforming API tags to UI format:', apiTags.length, 'tags');

  return apiTags.map(apiTag => {
    const hexColor = rgbToHex(
      apiTag.backgroundColor.red,
      apiTag.backgroundColor.green,
      apiTag.backgroundColor.blue
    );

    // Use validation helper for robust channel ID extraction
    const channelIds = validateChannelIds(apiTag.channelIds);
    const channelCount = channelIds.length;

    const uiTag: Tag = {
      id: apiTag.id,
      name: apiTag.name,
      color: hexColor,
      channelCount: channelCount,
      channelIds: channelIds,
      isEditing: false,
      originalName: apiTag.name,
      originalColor: hexColor
    };

    // Safe console logging
    const channelIdsList = channelIds.length > 0 ? channelIds.join(', ') : 'none';
    console.log(`Transformed tag: ${apiTag.name} -> ${hexColor} (${channelCount} channels: ${channelIdsList})`);

    return uiTag;
  });
};

/**
 * Transform UI tags to API format
 */
export const transformUITagsToApi = (uiTags: Tag[]): ChannelTagApiResponse[] => {
  console.log('Transforming UI tags to API format:', uiTags.length, 'tags');

  return uiTags.map(uiTag => {
    const rgb = hexToRgb(uiTag.color);

    // Ensure channelIds is always a valid array
    const channelIds = Array.isArray(uiTag.channelIds) ? uiTag.channelIds.filter(id => id && typeof id === 'string') : [];

    const apiTag: ChannelTagApiResponse = {
      id: uiTag.id,
      name: uiTag.name,
      channelIds: {
        string: channelIds // Preserve channel associations with validated array
      },
      backgroundColor: {
        red: rgb.r,
        green: rgb.g,
        blue: rgb.b,
        alpha: 255
      }
    };

    // Safe console logging
    const channelCount = channelIds.length;
    console.log(`Transformed tag: ${uiTag.name} -> RGB(${rgb.r},${rgb.g},${rgb.b}) with ${channelCount} channels`);

    return apiTag;
  });
};

/**
 * Transform API channels to UI format
 */
export const transformApiChannelsToUI = (apiChannels: ChannelIdAndName[]): ChannelData[] => {
  console.log('Transforming API channels to UI format:', apiChannels.length, 'channels');
  console.log('Sample API channel structure:', apiChannels[0]);

  return apiChannels.map(apiChannel => {
    // Handle different possible structures
    let channelId: string;
    let channelName: string;

    if (apiChannel.string && Array.isArray(apiChannel.string)) {
      [channelId, channelName] = apiChannel.string;
    } else if (apiChannel.string && typeof apiChannel.string === 'string') {
      // Handle case where string might be a single value
      channelId = apiChannel.string;
      channelName = apiChannel.string;
    } else {
      // Fallback
      channelId = String(apiChannel.id || apiChannel.string || '');
      channelName = String(apiChannel.name || apiChannel.string || '');
    }

    // Ensure both are strings
    channelId = String(channelId || '');
    channelName = String(channelName || '');

    const uiChannel: ChannelData = {
      id: channelId,
      name: channelName,
      group: 'Default Group', // TODO: Get actual group from channel details API
      status: 'Unknown', // TODO: Get actual status from channel status API
      type: 'Unknown' // TODO: Get actual type from channel details API
    };

    return uiChannel;
  });
};

/**
 * Get channel tags from server
 */
export const getChannelTags = async (): Promise<Tag[]> => {
  try {
    const mirthApiClient = getMirthApiClient();
    console.log('Fetching channel tags from server...');
    const response = await mirthApiClient('/server/channelTags');

    console.log('Channel tags API response:', response.data);

    const tagsData = response.data as ChannelTagsResponse;

    // Handle both single tag and array of tags
    let apiTags: ChannelTagApiResponse[] = [];
    if (tagsData.set?.channelTag) {
      if (Array.isArray(tagsData.set.channelTag)) {
        apiTags = tagsData.set.channelTag;
      } else {
        apiTags = [tagsData.set.channelTag];
      }
    }

    console.log('Parsed API tags:', apiTags.length, 'tags');

    // Debug log each tag structure
    apiTags.forEach((apiTag, index) => {
      logApiResponseStructure(apiTag, index);
    });

    const uiTags = transformApiTagsToUI(apiTags);
    console.log('Transformed to UI tags:', uiTags.length, 'tags');

    // Log channel association summary
    const totalChannelAssociations = uiTags.reduce((sum, tag) => sum + tag.channelCount, 0);
    console.log('Total channel associations:', totalChannelAssociations);

    return uiTags;

  } catch (error) {
    console.error('Failed to fetch channel tags:', error);
    throw new Error('Failed to load channel tags from server');
  }
};

/**
 * Get channel IDs and names from server
 */
export const getChannelIdsAndNames = async (): Promise<ChannelData[]> => {
  try {
    const mirthApiClient = getMirthApiClient();
    console.log('Fetching channel IDs and names from server...');
    const response = await mirthApiClient('/channels/idsAndNames');

    console.log('Channels API response:', response.data);

    const channelsData = response.data as ChannelsResponse;
    const apiChannels = channelsData.map?.entry || [];

    console.log('Parsed API channels:', apiChannels.length, 'channels');

    const uiChannels = transformApiChannelsToUI(apiChannels);
    console.log('Transformed to UI channels:', uiChannels.length, 'channels');

    return uiChannels;
  } catch (error) {
    console.error('Failed to fetch channel IDs and names:', error);
    throw new Error('Failed to load channels from server');
  }
};

/**
 * Save channel tags to server
 */
export const saveChannelTags = async (uiTags: Tag[]): Promise<void> => {
  try {
    console.log('Saving channel tags to server:', uiTags.length, 'tags');

    const apiTags = transformUITagsToApi(uiTags);
    console.log('Transformed API tags for save:', apiTags);

    // Prepare the request payload in the expected format
    const payload = {
      set: {
        channelTag: apiTags.length === 1 ? apiTags[0] : apiTags
      }
    };

    console.log('Channel tags save payload:', JSON.stringify(payload, null, 2));
    const mirthApiClient = getMirthApiClient();
    const response = await mirthApiClient.put('/server/channelTags', payload);
    console.log('Channel tags save response:', response.data);

    console.log('Channel tags saved successfully');
  } catch (error) {
    console.error('Failed to save channel tags:', error);
    throw new Error('Failed to save channel tags to server');
  }
};
