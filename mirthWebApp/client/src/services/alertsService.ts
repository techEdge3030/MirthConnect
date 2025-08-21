import { getMirthApiClient } from '../utils/api';
import { AlertStatus, AlertModel } from '../types/alert.type';

export const getAlertStatuses = async (): Promise<AlertStatus[]> => {
  const mirthApiClient = getMirthApiClient();
  const { data } = await mirthApiClient.get<AlertStatus[]>('/alerts/statuses');
  return data;
};

export const getAlerts = async (): Promise<AlertModel[]> => {
  const mirthApiClient = getMirthApiClient();
  const { data } = await mirthApiClient.get('/alerts');
  if (data?.list?.alertModel) {
    if (Array.isArray(data.list.alertModel)) {
      return data.list.alertModel;
    } else {
      return [data.list.alertModel];
    }
  }
  return [];
};

export const getAlert = async (alertId: string): Promise<AlertModel> => {
  const mirthApiClient = getMirthApiClient();
  const { data } = await mirthApiClient.get<AlertModel>(`/alerts/${alertId}`);
  return data;
};

export const createAlert = async (alert: AlertModel): Promise<void> => {
  const mirthApiClient = getMirthApiClient();
  await mirthApiClient.post('/alerts', alert);
};

export const updateAlert = async (alertId: string, alert: AlertModel): Promise<void> => {
  const mirthApiClient = getMirthApiClient();
  await mirthApiClient.put(`/alerts/${alertId}`, alert);
};

export const deleteAlert = async (alertId: string): Promise<void> => {
  const mirthApiClient = getMirthApiClient();
  await mirthApiClient.delete(`/alerts/${alertId}`);
};

export const enableAlert = async (alertId: string): Promise<void> => {
  const mirthApiClient = getMirthApiClient();
  await mirthApiClient.post(`/alerts/${alertId}/_enable`);
};

export const disableAlert = async (alertId: string): Promise<void> => {
  const mirthApiClient = getMirthApiClient();
  await mirthApiClient.post(`/alerts/${alertId}/_disable`);
};

export const getAlertProtocolOptions = async (): Promise<Record<string, Record<string, string> | null>> => {
  const mirthApiClient = getMirthApiClient();
  const { data } = await mirthApiClient.get('/alerts/options');
  const protocolOptions: Record<string, Record<string, string> | null> = {};
  const root = data['linked-hash-map'] || data;
  if (!root.entry) return protocolOptions;
  for (const entry of root.entry) {
    const key = Array.isArray(entry.string) ? entry.string[0] : entry.string;
    if ('null' in entry) {
      protocolOptions[key] = null;
    } else if ('map' in entry) {
      const map: Record<string, string> = {};
      for (const mapEntry of entry.map.entry) {
        if (Array.isArray(mapEntry.string) && mapEntry.string.length === 2) {
          map[mapEntry.string[0]] = mapEntry.string[1];
        }
      }
      protocolOptions[key] = map;
    }
  }
  return protocolOptions;
};
