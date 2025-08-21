export interface IEventEntry {
  string: string[];
}

export interface IEvent {
  dateTime: number;
  nanoTime: number;
  id: number;
  eventTime: {
    time: number;
    timezone: string;
  };
  level: string;
  name: string;
  attributes: {
    '@class': string;
    entry?: IEventEntry | IEventEntry[];
  };
  outcome: string;
  userId: number;
  ipAddress: string;
  serverId: string;
}
