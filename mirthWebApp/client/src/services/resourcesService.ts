import { getMirthApiClient } from '../utils/api';

// Resource Types
export interface Resource {
  id: string;
  name: string;
  type: string;
  description?: string;
  content?: string;
  lastModified?: string;
  properties?: {
    directory?: string;
    directoryRecursion?: boolean;
    includeWithGlobalScripts?: boolean;
    loadParentFirst?: boolean;
  };
}

export interface ChannelDependency {
  channelId: string;
  dependencies: string[];
}

export interface ChannelMetadata {
  channelId: string;
  metadata: { [key: string]: any };
}

const parseApiResponse = (
  response: any,
  dataType: 'resources' | 'libraries'
): any[] => {
  let data = response.data;
  console.log(`Parsing ${dataType} response:`, {
    dataStructure: typeof data,
    hasListProperty: !!data.list,
    isArray: Array.isArray(data),
    dataKeys: data ? Object.keys(data) : []
  });

  // Handle different response formats
  if (dataType === 'resources') {
    // Handle JSON format with DirectoryResourceProperties
    if (
      data.list?.[
        'com.mirth.connect.plugins.directoryresource.DirectoryResourceProperties'
      ]
    ) {
      const jsonResources =
        data.list[
          'com.mirth.connect.plugins.directoryresource.DirectoryResourceProperties'
        ];
      const resourceArray = Array.isArray(jsonResources)
        ? jsonResources
        : [jsonResources];

      // Convert JSON structure to expected format
      return resourceArray.map((jsonResource: any) => ({
        id: jsonResource.id,
        name: jsonResource.name,
        type: jsonResource.type,
        description: jsonResource.description,
        properties: {
          directory: jsonResource.directory,
          directoryRecursion: jsonResource.directoryRecursion,
          includeWithGlobalScripts: jsonResource.includeWithGlobalScripts,
          loadParentFirst: jsonResource.loadParentFirst
        }
      }));
    }
    // Handle other JSON format fallbacks
    else if (data.list?.resource) {
      return Array.isArray(data.list.resource)
        ? data.list.resource
        : [data.list.resource];
    } else if (Array.isArray(data)) {
      return data;
    } else if (data.resource) {
      return Array.isArray(data.resource) ? data.resource : [data.resource];
    }
  } else if (dataType === 'libraries') {
    // Handle JSON format for libraries
    if (data.list?.string) {
      return Array.isArray(data.list.string)
        ? data.list.string
        : [data.list.string];
    } else if (Array.isArray(data)) {
      return data;
    } else if (data.list && Array.isArray(data.list)) {
      return data.list;
    } else if (data.library) {
      return Array.isArray(data.library) ? data.library : [data.library];
    }
  }

  // Fallback: empty array
  console.warn(`Unexpected ${dataType} response format:`, data);
  return [];
};

export const getResources = async (): Promise<Resource[]> => {
  const mirthApiClient = getMirthApiClient();
  try {
    const response = await mirthApiClient.get('/server/resources', {
      headers: {
        Accept: 'application/json',
        'X-Requested-With': 'nextgen-connect-client'
      }
    });

    // Use helper function to parse response
    const resources = parseApiResponse(response, 'resources');
    console.log(`Parsed ${resources.length} resources from API response`);

    return resources;
  } catch (error) {
    console.warn('Failed to get resources:', error);
    return [];
  }
};

export const updateResources = async (resources: Resource[]) => {
  const mirthApiClient = getMirthApiClient();
  try {
    const payload = {
      list: {
        'com.mirth.connect.plugins.directoryresource.DirectoryResourceProperties':
          resources.map(resource => ({
            '@version': '4.5.2',
            pluginPointName: 'Directory Resource',
            type: resource.type || 'Directory',
            id: resource.id,
            name: resource.name,
            description: resource.description || '',
            includeWithGlobalScripts:
              resource.properties?.includeWithGlobalScripts || false,
            loadParentFirst: resource.properties?.loadParentFirst || false,
            directory: resource.properties?.directory || '',
            directoryRecursion:
              resource.properties?.directoryRecursion !== false // Default to true
          }))
      }
    };

    const response = await mirthApiClient.put('/server/resources', payload, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Requested-With': 'nextgen-connect-client'
      }
    });

    console.log('Resources save response:', response.status);
    return response;
  } catch (error) {
    console.error('Failed to update resources:', error);
    throw error;
  }
};

export const reloadResource = async (resourceId: string) => {
  const mirthApiClient = getMirthApiClient();
  try {
    // Properly encode the resource ID for the URL
    const encodedResourceId = encodeURIComponent(resourceId);
    console.log(
      `Reloading resource: ${resourceId} (encoded: ${encodedResourceId})`
    );

    // POST to reload the specific resource (empty body as per API spec)
    const response = await mirthApiClient.post(
      `/server/resources/${encodedResourceId}/_reload`,
      undefined,
      {
        headers: {
          Accept: 'application/json',
          'X-Requested-With': 'nextgen-connect-client'
        }
      }
    );

    console.log(
      `Resource ${resourceId} reloaded successfully:`,
      response.status
    );
    return response.data;
  } catch (error) {
    console.error(`Failed to reload resource ${resourceId}:`, error);
    throw error;
  }
};

export const getResourceLibraries = async (resourceId: string) => {
  const mirthApiClient = getMirthApiClient();
  try {
    // Properly encode the resource ID for the URL
    const encodedResourceId = encodeURIComponent(resourceId);
    console.log(
      `Getting libraries for resource: ${resourceId} (encoded: ${encodedResourceId})`
    );

    const response = await mirthApiClient.get(
      `/extensions/directoryresource/resources/${encodedResourceId}/libraries`,
      {
        headers: {
          Accept: 'application/json',
          'X-Requested-With': 'nextgen-connect-client'
        }
      }
    );

    // Use helper function to parse response
    const libraries = parseApiResponse(response, 'libraries');
    console.log(
      `Parsed ${libraries.length} libraries for resource ${resourceId}`
    );

    return libraries;
  } catch (error) {
    console.warn(`Failed to get libraries for resource ${resourceId}:`, error);
    return [];
  }
};

/**
 * Get channel dependencies
 */
export const getChannelDependencies = async (): Promise<
  ChannelDependency[]
> => {
  const mirthApiClient = getMirthApiClient();
  try {
    const response = await mirthApiClient.get('/server/channelDependencies', {
      headers: {
        Accept: 'application/json'
      }
    });
    return response.data.list?.channelDependency || [];
  } catch (error) {
    console.warn('Failed to get channel dependencies:', error);
    return [];
  }
};

/**
 * Update channel dependencies
 */
export const updateChannelDependencies = async (
  dependencies: ChannelDependency[]
) => {
  const mirthApiClient = getMirthApiClient();
  try {
    await mirthApiClient.put(
      '/server/channelDependencies',
      {
        list: { channelDependency: dependencies }
      },
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Failed to update channel dependencies:', error);
    throw error;
  }
};

/**
 * Get channel metadata
 */
export const getChannelMetadata = async (): Promise<ChannelMetadata[]> => {
  const mirthApiClient = getMirthApiClient();
  try {
    const response = await mirthApiClient.get('/server/channelMetadata', {
      headers: {
        Accept: 'application/json'
      }
    });
    return response.data.list?.channelMetadata || [];
  } catch (error) {
    console.warn('Failed to get channel metadata:', error);
    return [];
  }
};

/**
 * Update channel metadata
 */
export const updateChannelMetadata = async (metadata: ChannelMetadata[]) => {
  const mirthApiClient = getMirthApiClient();
  try {
    await mirthApiClient.put(
      '/server/channelMetadata',
      {
        list: { channelMetadata: metadata }
      },
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Failed to update channel metadata:', error);
    throw error;
  }
};
