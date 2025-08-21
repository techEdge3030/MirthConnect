import type { ConfigurationMapItem } from '../types/configurationMap.type';
import { getMirthApiClient } from '../utils/api';

export const getAllConfigurationMapItems = async () => {
  const mirthApiClient = getMirthApiClient();
  const response = await mirthApiClient.get('/server/configurationMap');
  const map = response.data.map;
  if (map) {
    const { entry } = map;
    return (entry.length ? entry : [entry]) as ConfigurationMapItem[];
  }
  return [] as ConfigurationMapItem[];
};

export const createConfigurationMapItem = async (
  configurationMapItem: Partial<ConfigurationMapItem>
) => {
  const existingMapItems = await getAllConfigurationMapItems();
  const mirthApiClient = getMirthApiClient();
  const response = await mirthApiClient.put('/server/configurationMap', {
    map: {
      entry: [...existingMapItems, configurationMapItem]
    }
  });
  return response.data;
};

export const saveConfigurationMapItems = async (
  configurationMapItems: ConfigurationMapItem[]
) => {
  const mirthApiClient = getMirthApiClient();
  const response = await mirthApiClient.put('/server/configurationMap', {
    map: {
      entry: configurationMapItems
    }
  });
  return response.data;
};

export const updateConfigurationMap = async (items: ConfigurationMapItem[]) => {
  const mirthApiClient = getMirthApiClient();
  const response = await mirthApiClient.put('/server/configurationMap', {
    map: { entry: items }
  });
  return response.data;
};
