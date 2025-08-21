export const SOURCE_TYPES = [
  { value: 'Channel Reader', label: 'Channel Reader' },
  { value: 'DICOM Listener', label: 'DICOM Listener' },
  { value: 'Database Reader', label: 'Database Reader' },
  { value: 'File Reader', label: 'File Reader' },
  { value: 'HTTP Listener', label: 'HTTP Listener' },
  { value: 'JMS Listener', label: 'JMS Listener' },
  { value: 'JavaScript Reader', label: 'Javascript Reader' },
  { value: 'TCP Listener', label: 'TCP Listener' },
  { value: 'Web Service Listener', label: 'Web Service Listener' }
];

export const SOURCE_QUEUE = [
  { value: 'off', label: 'OFF (Respond after processing)' },
  { value: 'on', label: 'ON (Respond before processing)' }
];

export const SCHEDULE_TYPES = [
  { value: 'INTERVAL', label: 'Interval' },
  { value: 'TIME', label: 'Time' },
  { value: 'CRON', label: 'Cron' }
];

export const INTERVAL_TYPES = [
  { value: 'miliseconds', label: 'miliseconds' },
  { value: 'seconds', label: 'seconds' },
  { value: 'minutes', label: 'minutes' },
  { value: 'hours', label: 'hours' }
];

export const AUTHENTICATION_TYPES = [
  { value: 'None', label: 'None' },
  { value: 'Basic Authentication', label: 'Basic Authentication' },
  { value: 'Digest Authentication', label: 'Digest Authentication' },
  { value: 'Javascript', label: 'Javascript' },
  { value: 'Custom Java Class', label: 'Custom Java Class' },
  {
    value: 'OAuth 2.0 Token Verification',
    label: 'OAuth 2.0 Token Verification'
  }
];

export const CHANNEL_READER_INITIAL_VALUE = {
  '@class': 'com.mirth.connect.connectors.vm.VmReceiverProperties',
  '@version': '4.4.1',
  pluginProperties: null,
  sourceConnectorProperties: {
    '@version': '4.4.1',
    responseVariable: 'None',
    respondAfterProcessing: true,
    processBatch: false,
    firstResponse: false,
    processingThreads: 1,
    resourceIds: {
      '@class': 'linked-hash-map',
      entry: {
        string: ['Default Resource', '[Default Resource]']
      }
    },
    queueBufferSize: 1000
  }
};

export const DICOM_LSITENER_INITIAL_VALUE = {
  '@class': 'com.mirth.connect.connectors.dimse.DICOMReceiverProperties',
  '@version': '4.4.1',
  pluginProperties: null,
  listenerConnectorProperties: {
    '@version': '4.4.1',
    host: '0.0.0.0',
    port: 104
  },
  sourceConnectorProperties: {
    '@version': '4.4.1',
    responseVariable: 'None',
    respondAfterProcessing: true,
    processBatch: false,
    firstResponse: false,
    processingThreads: 1,
    resourceIds: {
      '@class': 'linked-hash-map',
      entry: {
        string: ['Default Resource', '[Default Resource]']
      }
    },
    queueBufferSize: 1000
  },
  applicationEntity: null,
  localHost: null,
  localPort: null,
  localApplicationEntity: null,
  soCloseDelay: 50,
  releaseTo: 5,
  requestTo: 5,
  idleTo: 60,
  reaper: 10,
  rspDelay: 0,
  pdv1: false,
  sndpdulen: 16,
  rcvpdulen: 16,
  async: 0,
  bigEndian: false,
  bufSize: 1,
  defts: false,
  dest: null,
  nativeData: false,
  sorcvbuf: 0,
  sosndbuf: 0,
  tcpDelay: true,
  keyPW: null,
  keyStore: null,
  keyStorePW: null,
  noClientAuth: true,
  nossl2: true,
  tls: 'notls',
  trustStore: null,
  trustStorePW: null
};

export const DATABASE_READER_INITIAL_VALUE = {
  '@class': 'com.mirth.connect.connectors.jdbc.DatabaseReceiverProperties',
  '@version': '4.4.1',
  pluginProperties: null,
  pollConnectorProperties: {
    '@version': '4.4.1',
    pollingType: 'INTERVAL',
    pollOnStart: false,
    pollingFrequency: 5000,
    pollingHour: 0,
    pollingMinute: 0,
    cronJobs: null,
    pollConnectorPropertiesAdvanced: {
      weekly: true,
      inactiveDays: {
        boolean: [false, false, false, false, false, false, false, false]
      },
      dayOfMonth: 1,
      allDay: true,
      startingHour: 8,
      startingMinute: 0,
      endingHour: 17,
      endingMinute: 0
    }
  },
  sourceConnectorProperties: {
    '@version': '4.4.1',
    responseVariable: 'None',
    respondAfterProcessing: true,
    processBatch: false,
    firstResponse: false,
    processingThreads: 1,
    resourceIds: {
      '@class': 'linked-hash-map',
      entry: {
        string: ['Default Resource', '[Default Resource]']
      }
    },
    queueBufferSize: 1000
  },
  driver: null,
  url: null,
  username: null,
  password: null,
  select: null,
  update: null,
  useScript: false,
  aggregateResults: false,
  cacheResults: true,
  keepConnectionOpen: true,
  updateMode: 1,
  retryCount: 3,
  retryInterval: 10000,
  fetchSize: 1000,
  encoding: 'DEFAULT_ENCODING'
};

export const FILE_READER_INITIAL_VALUE = {
  '@class': 'com.mirth.connect.connectors.file.FileReceiverProperties',
  '@version': '4.4.1',
  pluginProperties: null,
  pollConnectorProperties: {
    '@version': '4.4.1',
    pollingType: 'INTERVAL',
    pollOnStart: false,
    pollingFrequency: 5000,
    pollingHour: 0,
    pollingMinute: 0,
    cronJobs: null,
    pollConnectorPropertiesAdvanced: {
      weekly: true,
      inactiveDays: {
        boolean: [false, false, false, false, false, false, false, false]
      },
      dayOfMonth: 1,
      allDay: true,
      startingHour: 8,
      startingMinute: 0,
      endingHour: 17,
      endingMinute: 0
    }
  },
  sourceConnectorProperties: {
    '@version': '4.4.1',
    responseVariable: 'None',
    respondAfterProcessing: true,
    processBatch: false,
    firstResponse: false,
    processingThreads: 1,
    resourceIds: {
      '@class': 'linked-hash-map',
      entry: {
        string: ['Default Resource', '[Default Resource]']
      }
    },
    queueBufferSize: 1000
  },
  scheme: 'FILE',
  host: null,
  fileFilter: '*',
  regex: false,
  directoryRecursion: false,
  ignoreDot: true,
  anonymous: true,
  username: 'anonymous',
  password: 'anonymous',
  timeout: 10000,
  secure: true,
  passive: true,
  validateConnection: true,
  afterProcessingAction: 'NONE',
  moveToDirectory: null,
  moveToFileName: null,
  errorReadingAction: 'NONE',
  errorResponseAction: 'AFTER_PROCESSING',
  errorMoveToDirectory: null,
  errorMoveToFileName: null,
  checkFileAge: true,
  fileAge: 1000,
  fileSizeMinimum: 0,
  fileSizeMaximum: null,
  ignoreFileSizeMaximum: true,
  sortBy: 'date',
  binary: false,
  charsetEncoding: 'DEFAULT_ENCODING'
};

export const HTTP_LISTENER_INITIAL_VALUE = {
  '@class': 'com.mirth.connect.connectors.http.HttpReceiverProperties',
  '@version': '4.4.1',
  pluginProperties: {
    'com.mirth.connect.plugins.httpauth.NoneHttpAuthProperties': {
      '@version': '4.4.1',
      authType: 'NONE'
    }
  },
  listenerConnectorProperties: {
    '@version': '4.4.1',
    host: '0.0.0.0',
    port: 80
  },
  sourceConnectorProperties: {
    '@version': '4.4.1',
    responseVariable: 'None',
    respondAfterProcessing: true,
    processBatch: false,
    firstResponse: false,
    processingThreads: 1,
    resourceIds: {
      '@class': 'linked-hash-map',
      entry: {
        string: ['Default Resource', '[Default Resource]']
      }
    },
    queueBufferSize: 1000
  },
  xmlBody: false,
  parseMultipart: true,
  includeMetadata: false,
  binaryMimeTypes: 'application/.*(?<!json|xml)$|image/.*|video/.*|audio/.*',
  binaryMimeTypesRegex: true,
  responseContentType: 'text/plain',
  responseDataTypeBinary: false,
  responseStatusCode: null,
  responseHeaders: {
    '@class': 'linked-hash-map'
  },
  responseHeadersVariable: null,
  useResponseHeadersVariable: false,
  charset: 'UTF-8',
  contextPath: null,
  timeout: 30000,
  staticResources: null
};

export const JMS_LISTENER_INITIAL_VALUE = {
  '@class': 'com.mirth.connect.connectors.jms.JmsReceiverProperties',
  '@version': '4.4.1',
  pluginProperties: null,
  useJndi: false,
  jndiProviderUrl: null,
  jndiInitialContextFactory: null,
  jndiConnectionFactoryName: null,
  connectionFactoryClass: null,
  connectionProperties: {
    '@class': 'linked-hash-map'
  },
  username: null,
  password: null,
  destinationName: null,
  topic: false,
  clientId: null,
  sourceConnectorProperties: {
    '@version': '4.4.1',
    responseVariable: 'None',
    respondAfterProcessing: true,
    processBatch: false,
    firstResponse: false,
    processingThreads: 1,
    resourceIds: {
      '@class': 'linked-hash-map',
      entry: {
        string: ['Default Resource', '[Default Resource]']
      }
    },
    queueBufferSize: 1000
  },
  selector: null,
  reconnectIntervalMillis: 10000,
  durableTopic: false
};

export const JAVASCRIPT_READER_INITIAL_VALUE = {
  '@class': 'com.mirth.connect.connectors.js.JavaScriptReceiverProperties',
  '@version': '4.4.1',
  pluginProperties: null,
  pollConnectorProperties: {
    '@version': '4.4.1',
    pollingType: 'INTERVAL',
    pollOnStart: false,
    pollingFrequency: 5000,
    pollingHour: 0,
    pollingMinute: 0,
    cronJobs: null,
    pollConnectorPropertiesAdvanced: {
      weekly: true,
      inactiveDays: {
        boolean: [false, false, false, false, false, false, false, false]
      },
      dayOfMonth: 1,
      allDay: true,
      startingHour: 8,
      startingMinute: 0,
      endingHour: 17,
      endingMinute: 0
    }
  },
  sourceConnectorProperties: {
    '@version': '4.4.1',
    responseVariable: 'None',
    respondAfterProcessing: true,
    processBatch: false,
    firstResponse: false,
    processingThreads: 1,
    resourceIds: {
      '@class': 'linked-hash-map',
      entry: {
        string: ['Default Resource', '[Default Resource]']
      }
    },
    queueBufferSize: 1000
  },
  script: null
};

export const TCP_LISTENER_INITIAL_VALUE = {
  '@class': 'com.mirth.connect.connectors.tcp.TcpReceiverProperties',
  '@version': '4.4.1',
  pluginProperties: null,
  listenerConnectorProperties: {
    '@version': '4.4.1',
    host: '0.0.0.0',
    port: 6661
  },
  sourceConnectorProperties: {
    '@version': '4.4.1',
    responseVariable: 'Auto-generate (After source transformer)',
    respondAfterProcessing: true,
    processBatch: false,
    firstResponse: true,
    processingThreads: 1,
    resourceIds: {
      '@class': 'linked-hash-map',
      entry: {
        string: ['Default Resource', '[Default Resource]']
      }
    },
    queueBufferSize: 1000
  },
  transmissionModeProperties: {
    '@class': 'com.mirth.connect.plugins.mllpmode.MLLPModeProperties',
    pluginPointName: 'MLLP',
    startOfMessageBytes: '0B',
    endOfMessageBytes: '1C0D',
    useMLLPv2: false,
    ackBytes: '06',
    nackBytes: 15,
    maxRetries: 2
  },
  serverMode: true,
  remoteAddress: null,
  remotePort: null,
  overrideLocalBinding: false,
  reconnectInterval: 5000,
  receiveTimeout: 0,
  bufferSize: 65536,
  maxConnections: 10,
  keepConnectionOpen: true,
  dataTypeBinary: false,
  charsetEncoding: 'DEFAULT_ENCODING',
  respondOnNewConnection: 0,
  responseAddress: null,
  responsePort: null
};

export const WEB_SERVICE_LISTENER_INITIAL_VALUE = {
  '@class': 'com.mirth.connect.connectors.ws.WebServiceReceiverProperties',
  '@version': '4.4.1',
  pluginProperties: {
    'com.mirth.connect.plugins.httpauth.NoneHttpAuthProperties': {
      '@version': '4.4.1',
      authType: 'NONE'
    }
  },
  listenerConnectorProperties: {
    '@version': '4.4.1',
    host: '0.0.0.0',
    port: 8081
  },
  sourceConnectorProperties: {
    '@version': '4.4.1',
    responseVariable: 'None',
    respondAfterProcessing: true,
    processBatch: false,
    firstResponse: false,
    processingThreads: 1,
    resourceIds: {
      '@class': 'linked-hash-map',
      entry: {
        string: ['Default Resource', '[Default Resource]']
      }
    },
    queueBufferSize: 1000
  },
  className: 'com.mirth.connect.connectors.ws.DefaultAcceptMessage',
  serviceName: 'Mirth',
  soapBinding: 'DEFAULT'
};

export const SOURCE_INITAL_VALUES: Record<string, any> = {
  'Channel Reader': CHANNEL_READER_INITIAL_VALUE,
  'DICOM Listener': DICOM_LSITENER_INITIAL_VALUE,
  'Database Reader': DATABASE_READER_INITIAL_VALUE,
  'File Reader': FILE_READER_INITIAL_VALUE,
  'HTTP Listener': HTTP_LISTENER_INITIAL_VALUE,
  'JMS Listener': JMS_LISTENER_INITIAL_VALUE,
  'JavaScript Reader': JAVASCRIPT_READER_INITIAL_VALUE,
  'TCP Listener': TCP_LISTENER_INITIAL_VALUE,
  'Web Service Listener': WEB_SERVICE_LISTENER_INITIAL_VALUE
};
