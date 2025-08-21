export interface BaseObject {
  '@version': string;
  id: string;
  name: string;
  description?: string;
  revision: number;
}

export interface Identifier {
  string: string;
}

export interface BaseTime {
  time: number;
  timezone: string;
}
