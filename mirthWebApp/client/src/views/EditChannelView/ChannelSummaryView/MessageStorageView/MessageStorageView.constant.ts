export const CONTENT: Record<string, string> = {
  DEVELOPMENT: 'All',
  PRODUCTION: 'Raw, Encoded, Sent, Response, Maps',
  RAW: 'Raw',
  METADATA: 'None',
  DISABLED: 'None'
};

export const METADATA: Record<string, string> = {
  DEVELOPMENT: 'All',
  PRODUCTION: 'All',
  RAW: 'All',
  METADATA: 'All',
  DISABLED: 'None'
};

export const DELIVERY: Record<string, string> = {
  DEVELOPMENT: 'On',
  PRODUCTION: 'On',
  RAW: 'Reprocess only',
  METADATA: 'Off',
  DISABLED: 'Off'
};

export const MESSAGE_STORAGE_MODE = [
  { value: 'DEVELOPMENT', label: 'Development' },
  { value: 'PRODUCTION', label: 'Production' },
  { value: 'RAW', label: 'RAW' },
  { value: 'METADATA', label: 'Metadata' },
  { value: 'DISABLED', label: 'Disabled' }
];
