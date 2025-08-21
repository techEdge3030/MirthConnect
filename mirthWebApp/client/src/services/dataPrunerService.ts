import { getMirthApiClient } from '../utils/api';

// Data Pruner Types
export interface DataPrunerStatus {
  enabled: boolean;
  running: boolean;
  lastRun?: string;
  nextRun?: string;
  itemsProcessed?: number;
  itemsPruned?: number;
}

export interface DataPrunerSettings {
  enabled: boolean;
  schedule?: string;
  pruneContentDays: number;
  pruneMetaDataDays: number;
  archiveEnabled: boolean;
  pruneErroredMessages: boolean;
}

// API Response Types
export interface ExtensionProperty {
  '@name': string;
  '$': string;
}

export interface ExtensionPropertiesResponse {
  properties: {
    property: ExtensionProperty[];
  };
}

export interface DataPrunerStatusResponse {
  map: {
    entry: Array<{
      string: [string, string | boolean];
    }>;
  };
}

/**
 * Get Data Pruner extension properties
 */
export const getDataPrunerProperties = async (propertyKeys?: string[]): Promise<ExtensionPropertiesResponse> => {
  const mirthApiClient = getMirthApiClient();

  const params = new URLSearchParams();
  if (propertyKeys && propertyKeys.length > 0) {
    propertyKeys.forEach(key => params.append('propertyKeys', key));
  }

  const url = `/extensions/${encodeURIComponent('Data Pruner')}/properties${params.toString() ? `?${params.toString()}` : ''}`;

  console.log('Loading Data Pruner properties from:', url);
  const response = await mirthApiClient.get(url, {
    headers: {
      'Accept': 'application/json',
      'X-Requested-With': 'OpenAPI'
    }
  });

  console.log('Data Pruner properties response:', response.data);
  return response.data;
};

/**
 * Get data pruner status
 */
export const getDataPrunerStatus = async (): Promise<DataPrunerStatusResponse> => {
  const mirthApiClient = getMirthApiClient();
  console.log('Loading Data Pruner status...');

  const response = await mirthApiClient.get('/extensions/datapruner/status', {
    headers: {
      'Accept': 'application/json',
      'X-Requested-With': 'OpenAPI'
    }
  });

  console.log('Data Pruner status response:', response.data);
  return response.data;
};

/**
 * Start data pruner
 */
export const startDataPruner = async () => {
  const mirthApiClient = getMirthApiClient();
  const response = await mirthApiClient.post('/extensions/datapruner/_start');
  return response.data;
};

/**
 * Stop data pruner
 */
export const stopDataPruner = async () => {
  const mirthApiClient = getMirthApiClient();
  const response = await mirthApiClient.post('/extensions/datapruner/_stop');
  return response.data;
};

/**
 * Save Data Pruner extension properties
 */
export const saveDataPrunerProperties = async (properties: ExtensionProperty[]): Promise<void> => {
  const mirthApiClient = getMirthApiClient();

  const requestBody = {
    properties: {
      property: properties
    }
  };

  console.log('Saving Data Pruner properties:', requestBody);

  const response = await mirthApiClient.put(
    `/extensions/${encodeURIComponent('Data Pruner')}/properties?mergeProperties=false`,
    requestBody,
    {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Requested-With': 'OpenAPI'
      }
    }
  );

  console.log('Save Data Pruner properties response:', response.data);
  return response.data;
};

/**
 * Transform extension properties response to key-value map
 */
export const transformPropertiesToMap = (response: ExtensionPropertiesResponse): Record<string, string> => {
  const propertyMap: Record<string, string> = {};

  if (response?.properties?.property) {
    const properties = Array.isArray(response.properties.property)
      ? response.properties.property
      : [response.properties.property];

    properties.forEach(prop => {
      if (prop['@name'] && prop['$'] !== undefined) {
        propertyMap[prop['@name']] = prop['$'];
      }
    });
  }

  console.log('Transformed properties map:', propertyMap);
  return propertyMap;
};

/**
 * Transform status response to key-value map
 */
export const transformStatusToMap = (response: DataPrunerStatusResponse): Record<string, string | boolean> => {
  const statusMap: Record<string, string | boolean> = {};

  if (response?.map?.entry) {
    response.map.entry.forEach(entry => {
      if (entry.string && entry.string.length === 2) {
        const [key, value] = entry.string;
        statusMap[key] = value;
      }
    });
  }

  console.log('Transformed status map:', statusMap);
  return statusMap;
};