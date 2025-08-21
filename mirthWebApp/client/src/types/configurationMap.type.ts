export interface ConfigurationMap {
  map: {
    entry: ConfigurationMapItem[];
  };
}

export interface ConfigurationMapItem {
  string: string;
  'com.mirth.connect.util.ConfigurationProperty': {
    value: string;
    comment: string;
  };
}
