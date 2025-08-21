import type { GlobalScript } from '../types';
import { getMirthApiClient } from '../utils/api';

export const getGlobalScripts = async (): Promise<GlobalScript> => {
  const mirthApiClient = getMirthApiClient();
  const response = await mirthApiClient.get('/server/globalScripts');
  return response.data;
};

export const saveGloalScripts = async (globalScripts: GlobalScript) => {
  const mirthApiClient = getMirthApiClient();
  const response = await mirthApiClient.put(
    `/server/globalScripts`,
    globalScripts
  );
  return response.data;
};

export const clearAllStatistics = async () => {
  const mirthApiClient = getMirthApiClient();
  const response = await mirthApiClient.post('/channels/_clearAllStatistics');
  return response;
};
