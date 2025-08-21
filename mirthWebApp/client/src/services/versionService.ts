import { getMirthApiClient } from '../utils/api';

export interface VersionInfo {
  version: string;
  title: string;
  description: string;
}

export const getMirthVersion = async (): Promise<VersionInfo> => {
  const mirthApiClient = getMirthApiClient();
  const response = await mirthApiClient.get('/openapi.json');
  
  // Clean up title by removing 'Client API' if present
  const title = response.data.info.title.replace(/ Client API$/, '');
  
  return {
    version: response.data.info.version,
    title: title,
    description: response.data.info.description
  };
}; 