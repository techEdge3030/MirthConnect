// Constants for DataPrunerTab component

// Time conversion constants (milliseconds)
export const TIME_CONSTANTS = {
  SECOND_MS: 1000,
  MINUTE_MS: 60 * 1000,
  HOUR_MS: 60 * 60 * 1000,
  DAY_MS: 24 * 60 * 60 * 1000,
} as const;

// Default values
export const DEFAULT_VALUES = {
  POLLING_FREQUENCY_MS: 5000, // 5 seconds
  PRUNE_BLOCK_SIZE: '1000',
  ARCHIVE_BLOCK_SIZE: '50',
  PRUNE_EVENT_AGE: '3',
  POLLING_FREQUENCY_STR: '5000',
  POLLING_HOUR: '9',
  POLLING_MINUTE: '0',
  STARTING_HOUR: 8,
  STARTING_MINUTE: 0,
  ENDING_HOUR: 17,
  ENDING_MINUTE: 0,
  MONTHLY_DAY: '1',
  TIME_RANGE_START: '08:00',
  TIME_RANGE_END: '17:00',
  SCHEDULE_TIME: '09:00',
} as const;

// Validation limits
export const VALIDATION_LIMITS = {
  BLOCK_SIZE_MIN: 50,
  BLOCK_SIZE_MAX: 10000,
  RECOMMENDED_BLOCK_SIZE: 1000,
  INTERVAL_MIN_HOURS: 1,
  INTERVAL_MAX_HOURS: 24,
} as const;

// UI dimensions and styling
export const UI_CONSTANTS = {
  FIELD_BLUR_DELAY: 150,
  MODAL_MIN_WIDTH: 700,
  MODAL_MIN_HEIGHT: 500,
  TOKENS_PANEL_MIN_HEIGHT: 300,
  LABEL_WIDTH: {
    xs: '180px',
    md: '220px', 
    lg: '250px'
  },
  GRID_SPACING: 2,
  MARGIN_BOTTOM: 3,
} as const;

// Content type mappings
export const CONTENT_TYPE_MAPPINGS = {
  SERVER_TO_UI: {
    'SENT': 'Destination Sent',
    'RAW': 'Source Raw',
    'PROCESSED_RAW': 'Source Processed Raw',
    'TRANSFORMED': 'Source Transformed',
    'ENCODED': 'Source Encoded',
    'RESPONSE': 'Source Response',
    'PROCESSED_RESPONSE': 'Destination Processed Response', // Fixed: PROCESSED_RESPONSE maps to Destination Processed Response
    'DESTINATION_RAW': 'Destination Raw',
    'DESTINATION_TRANSFORMED': 'Destination Transformed',
    'DESTINATION_ENCODED': 'Destination Encoded',
    'DESTINATION_SENT': 'Destination Sent',
    'DESTINATION_RESPONSE': 'Destination Response',
    'SOURCE_MAP': 'Source Map',
    'CHANNEL_MAP': 'Channel Map',
    'RESPONSE_MAP': 'Response Map',
    'XML_SERIALIZED': 'XML serialized message'
  },
  UI_TO_SERVER: {
    'XML serialized message': { contentType: '', destinationContent: false },
    'Source Raw': { contentType: 'RAW', destinationContent: false },
    'Source Processed Raw': { contentType: 'PROCESSED_RAW', destinationContent: false },
    'Source Transformed': { contentType: 'TRANSFORMED', destinationContent: false },
    'Source Encoded': { contentType: 'ENCODED', destinationContent: false },
    'Source Response': { contentType: 'RESPONSE', destinationContent: false },
    'Destination Raw': { contentType: 'DESTINATION_RAW', destinationContent: true },
    'Destination Transformed': { contentType: 'DESTINATION_TRANSFORMED', destinationContent: true },
    'Destination Encoded': { contentType: 'DESTINATION_ENCODED', destinationContent: true },
    'Destination Sent': { contentType: 'DESTINATION_SENT', destinationContent: true },
    'Destination Response': { contentType: 'DESTINATION_RESPONSE', destinationContent: true },
    'Destination Processed Response': { contentType: 'PROCESSED_RESPONSE', destinationContent: true },
    'Source Map': { contentType: 'SOURCE_MAP', destinationContent: false },
    'Channel Map': { contentType: 'CHANNEL_MAP', destinationContent: false },
    'Response Map': { contentType: 'RESPONSE_MAP', destinationContent: true }
  }
} as const;

// Encryption type mappings
export const ENCRYPTION_TYPE_MAPPINGS = {
  SERVER_TO_UI: {
    'AES256': 'AES-256',
    'AES128': 'AES-128',
    'STANDARD': 'Standard'
  },
  UI_TO_SERVER: {
    'AES-256': 'AES256',
    'AES-128': 'AES128',
    'Standard': 'STANDARD'
  }
} as const;

// Compression format mappings
export const COMPRESSION_MAPPINGS = {
  COMPRESS_FORMAT: {
    'gzip': 'gz',
    'gz': 'gz',
    'bzip2': 'bz2',
    'bz2': 'bz2'
  },
  UI_TO_SERVER: {
    'gz': 'gz',
    'bz2': 'bzip2'
  }
} as const;

// Day order for weekly scheduling
export const DAY_ORDER = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;

// Draggable tokens for field insertion
export const DRAGGABLE_TOKENS = [
  { id: 'messageId', label: 'Message ID', value: '${message.messageId}' },
  { id: 'serverId', label: 'Server ID', value: '${message.serverId}' },
  { id: 'channelId', label: 'Channel ID', value: '${message.channelId}' },
  { id: 'originalFilename', label: 'Original File Name', value: '${originalFilename}' },
  { id: 'date', label: 'Date', value: '${DATE}' },
  { id: 'timestamp', label: 'Timestamp', value: '${SYSTIME}' },
  { id: 'uniqueId', label: 'Unique ID', value: '${UUID}' },
  { id: 'count', label: 'Count', value: '${COUNT}' }
] as const;

// Error messages
export const ERROR_MESSAGES = {
  BLOCK_SIZE_NOT_NUMBER: 'Block Size must be a number',
  BLOCK_SIZE_OUT_OF_RANGE: `Pruner Block size must be between ${VALIDATION_LIMITS.BLOCK_SIZE_MIN} and ${VALIDATION_LIMITS.BLOCK_SIZE_MAX}. The recommended value for most servers is ${VALIDATION_LIMITS.RECOMMENDED_BLOCK_SIZE}.`,
  INTERVAL_OUT_OF_RANGE: `Frequency must be between ${VALIDATION_LIMITS.INTERVAL_MIN_HOURS} and ${VALIDATION_LIMITS.INTERVAL_MAX_HOURS} hours when converted to milliseconds.`,
  ARCHIVE_BLOCK_SIZE_REQUIRED: 'Archive Block Size is required when archiving is enabled',
  ROOT_PATH_REQUIRED: 'Root Path is required when archiving is enabled',
  FILE_PATTERN_REQUIRED: 'File Pattern is required when archiving is enabled',
  PASSWORD_REQUIRED: 'Password is required when password protection is enabled'
} as const;

// Archive content options
export const ARCHIVE_CONTENT_OPTIONS = [
  'XML serialized message',
  'Source Raw',
  'Source Processed Raw',
  'Source Transformed',
  'Source Encoded',
  'Source Response',
  'Destination Raw',
  'Destination Transformed',
  'Destination Encoded',
  'Destination Sent',
  'Destination Response',
  'Destination Processed Response',
  'Source Map',
  'Channel Map',
  'Response Map'
] as const;

// Compression options
export const COMPRESSION_OPTIONS = [
  { value: 'none', label: 'none' },
  { value: 'zip', label: 'zip' },
  { value: 'tar.gz', label: 'tar.gz' },
  { value: 'tar.bz2', label: 'tar.bz2' }
] as const;

// Encryption options
export const ENCRYPTION_OPTIONS = [
  { value: 'Standard', label: 'Standard' },
  { value: 'AES-128', label: 'AES-128' },
  { value: 'AES-256', label: 'AES-256' }
] as const;
