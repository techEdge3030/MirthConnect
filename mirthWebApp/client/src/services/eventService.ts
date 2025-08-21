import type { IEvent, IEventEntry } from '../types/event.type';
import { getMirthApiClient } from '../utils/api';

export const getChannelFromEvent = (event: IEvent) => {
  const entry = event.attributes.entry;
  if (entry) {
    const entries: IEventEntry[] = (
      (entry as any).length ? entry : [entry]
    ) as any;
    const channelItem = entries.find(item => item.string[0] === 'channel');
    if (channelItem?.string[1]) {
      let str = channelItem.string[1];
      str = str.replace('Channel[', '');
      str = str.replace(']\n', '');
      str = str.replace('id=', '');
      str = str.replace('name=', '');
      const id = str.split(',')[0];
      const name = str.split(',')[1];
      return {
        id,
        name
      };
    }
  }
  return null;
};

export const getEvents = async (keyword: string) => {
  const mirthApiClient = getMirthApiClient();
  const response = await mirthApiClient.get(`/events?name=${keyword}`);
  return response.data;
};
