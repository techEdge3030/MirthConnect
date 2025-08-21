export interface CustomMetaData {
  name: string;
  type: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'TIMESTAMP';
  mappingName: string;
  id?: string; // Optional for grid
}

export interface Connector {
  int: number;
  string: string;
}

export interface Port {
  name: string;
  id: string;
  port: number;
}

export interface ChannelIdAndName {
  string: string[];
}

export interface Entry {
  string: string;
  list: {
    string: string | null;
  };
}

export interface AttachmentData {
  content?: string;
  mimeType?: string;
  name?: string;
}

export interface DestinationConnector {
  '@version': string;
  metaDataId: number;
  name: string;
  properties: {
    '@class': string;
    '@version': string;
    pluginProperties: string | null;
    destinationConnectorProperties: {
      '@version': string;
      queueEnabled: boolean;
      sendFirst: boolean;
      retryIntervalMillis: string;
      regenerateTemplate: boolean;
      retryCount: string;
      rotate: boolean;
      includeFilterTransformer: boolean;
      threadCount: string;
      threadAssignmentVariable: string | null;
      validateResponse: boolean;
      resourceIds: {
        '@class': string;
        entry: {
          string: string[];
        };
      };
      queueBufferSize: string;
      reattachAttachments: boolean;
    };
    channelId: string;
    channelTemplate: string | null;
    mapVariables: {
      string: string[];
    };
    host: string;
    port: number;
    applicationEntity: string | null;
    localHost: string | null;
    localPort: number | null;
    localApplicationEntity: string | null;
    template: string;
    acceptTo: number;
    async: number;
    bufSize: number;
    connectTo: number;
    priority: string;
    passcode: string | null;
    pdv1: boolean;
    rcvpdulen: number;
    reaper: number;
    releaseTo: number;
    rspTo: number;
    shutdownDelay: number;
    sndpdulen: number;
    soCloseDelay: number;
    sorcvbuf: number;
    sosndbuf: number;
    stgcmt: boolean;
    tcpDelay: boolean;
    ts1: boolean;
    uidnegrsp: boolean;
    username: string | null;
    keyPW: string | null;
    keyStore: string | null;
    keyStorePW: string | null;
    noClientAuth: boolean;
    nossl2: boolean;
    tls: string;
    trustStore: string | null;
    trustStorePW: string | null;
    driver: string | null;
    url: string | null;
    password: string | null;
    query: string | null;
    useScript: boolean;
    outputPattern: string;
    documentType: string;
    encrypt: boolean;
    output: string;
    pageWidth: number;
    pageHeight: number;
    pageUnit: string;
    scheme: string;
    schemeProperties: {
      '@class': 'com.mirth.connect.connectors.file.FTPSchemeProperties';
      initialCommands: string | null;
    };
    anonymous: boolean;
    timeout: number;
    keepConnectionOpen: boolean;
    maxIdleTime: number;
    secure: boolean;
    passive: boolean;
    validateConnection: boolean;
    outputAppend: boolean;
    errorOnExists: boolean;
    temporary: boolean;
    binary: boolean;
    charsetEncoding: string;
    useProxyServer: boolean;
    proxyAddress: string | null;
    proxyPort: number | null;
    method: string;
    headers: {
      '@class': 'linked-hash-map';
      entry: any;
    };
    parameters: {
      '@class': 'linked-hash-map';
      entry: Entry[];
    };
    useHeadersVariable: boolean;
    headersVariable: string | null;
    useParametersVariable: boolean;
    parametersVariable: string | null;
    responseXmlBody: boolean;
    responseParseMultipart: boolean;
    responseIncludeMetadata: boolean;
    responseBinaryMimeTypes: string;
    responseBinaryMimeTypesRegex: boolean;
    multipart: boolean;
    useAuthentication: boolean;
    authenticationType: string;
    usePreemptiveAuthentication: boolean;
    content: string | null;
    contentType: string;
    dataTypeBinary: boolean;
    charset: string;
    socketTimeout: number;
    script: string | null;
    smtpHost: string | null;
    smtpPort: number;
    overrideLocalBinding: boolean;
    localAddress: string;
    encryption: string;
    authentication: boolean;
    to: string | null;
    from: string | null;
    cc: string | null;
    bcc: string | null;
    replyTo: string | null;
    isUseHeadersVariable: boolean;
    subject: string | null;
    html: boolean;
    body: string | null;
    attachments: {
      'com.mirth.connect.connectors.smtp.Attachment': AttachmentData[];
    };
    attachmentsVariable: string | null;
    isUseAttachmentsVariable: boolean;
    transmissionModeProperties: {
      '@class': 'com.mirth.connect.plugins.mllpmode.MLLPModeProperties';
      pluginPointName: string;
      startOfMessageBytes: string;
      endOfMessageBytes: string;
      useMLLPv2: boolean;
      ackBytes: number;
      nackBytes: number;
      maxRetries: number;
    };
    serverMode: boolean;
    remoteAddress: string;
    remotePort: number;
    sendTimeout: number;
    bufferSize: number;
    maxConnections: number;
    checkRemoteHost: boolean;
    responseTimeout: number;
    ignoreResponse: boolean;
    queueOnResponseTimeout: boolean;
    wsdlUrl: string | null;
    service: string | null;
    operation: string;
    locationURI: string | null;
    envelope: string | null;
    oneWay: boolean;
    useMtom: boolean;
    attachmentNames: {
      string: string[];
    };
    attachmentContents: {
      string: string[];
    };
    attachmentTypes: {
      string: string[];
    };
    soapAction: string | null;
    wsdlDefinitionMap: {
      map: {
        '@class': 'linked-hash-map';
      };
    };
  };
  transformer: {
    '@version': string;
    elements: string | null;
    inboundTemplate: {
      '@encoding': string;
    };
    inboundDataType: string;
    outboundDataType: string;
    inboundProperties: {
      '@class': string;
      '@version': string;
      serializationProperties: {
        '@class': string;
        '@version': string;
        handleRepetitions: boolean;
        handleSubcomponents: boolean;
        useStrictParser: boolean;
        useStrictValidation: boolean;
        stripNamespaces: boolean;
        segmentDelimiter: string;
        convertLineBreaks: boolean;
      };
      deserializationProperties: {
        '@class': string;
        '@version': string;
        useStrictParser: boolean;
        useStrictValidation: boolean;
        segmentDelimiter: string;
      };
      batchProperties: {
        '@class': string;
        '@version': string;
        splitType: string;
        batchScript: string | null;
      };
      responseGenerationProperties: {
        '@class': string;
        '@version': string;
        segmentDelimiter: string;
        successfulACKCode: string;
        successfulACKMessage: string | null;
        errorACKCode: string;
        errorACKMessage: string;
        rejectedACKCode: string;
        rejectedACKMessage: string;
        msh15ACKAccept: boolean;
        dateFormat: string;
      };
      responseValidationProperties: {
        '@class': string;
        '@version': string;
        successfulACKCode: string;
        errorACKCode: string;
        rejectedACKCode: string;
        validateMessageControlId: boolean;
        originalMessageControlId: string;
        originalIdMapVariable: string | null;
      };
    };
    outboundProperties: {
      '@class': string;
      '@version': string;
      serializationProperties: {
        '@class': string;
        '@version': string;
        handleRepetitions: boolean;
        handleSubcomponents: boolean;
        useStrictParser: boolean;
        useStrictValidation: boolean;
        stripNamespaces: boolean;
        segmentDelimiter: string;
        convertLineBreaks: boolean;
      };
      deserializationProperties: {
        '@class': string;
        '@version': string;
        useStrictParser: boolean;
        useStrictValidation: boolean;
        segmentDelimiter: string;
      };
      batchProperties: {
        '@class': string;
        '@version': string;
        splitType: string;
        batchScript: string | null;
      };
      responseGenerationProperties: {
        '@class': string;
        '@version': string;
        segmentDelimiter: string;
        successfulACKCode: string;
        successfulACKMessage: string | null;
        errorACKCode: string;
        errorACKMessage: string;
        rejectedACKCode: string;
        rejectedACKMessage: string;
        msh15ACKAccept: boolean;
        dateFormat: string;
      };
      responseValidationProperties: {
        '@class': string;
        '@version': string;
        successfulACKCode: string;
        errorACKCode: string;
        rejectedACKCode: string;
        validateMessageControlId: boolean;
        originalMessageControlId: string;
        originalIdMapVariable: string | null;
      };
    };
  };
  responseTransformer: {
    '@version': string;
    elements: string | null;
    inboundTemplate: {
      '@encoding': string;
    };
    outboundTemplate: {
      '@encoding': string;
    };
    inboundDataType: string;
    outboundDataType: string;
    inboundProperties: {
      '@class': string;
      '@version': string;
      serializationProperties: {
        '@class': string;
        '@version': string;
        handleRepetitions: boolean;
        handleSubcomponents: boolean;
        useStrictParser: boolean;
        useStrictValidation: boolean;
        stripNamespaces: boolean;
        segmentDelimiter: string;
        convertLineBreaks: boolean;
      };
      deserializationProperties: {
        '@class': string;
        '@version': string;
        useStrictParser: boolean;
        useStrictValidation: boolean;
        segmentDelimiter: string;
      };
      batchProperties: {
        '@class': string;
        '@version': string;
        splitType: string;
        batchScript: string | null;
      };
      responseGenerationProperties: {
        '@class': string;
        '@version': string;
        segmentDelimiter: string;
        successfulACKCode: string;
        successfulACKMessage: string | null;
        errorACKCode: string;
        errorACKMessage: string;
        rejectedACKCode: string;
        rejectedACKMessage: string;
        msh15ACKAccept: boolean;
        dateFormat: string;
      };
      responseValidationProperties: {
        '@class': string;
        '@version': string;
        successfulACKCode: string;
        errorACKCode: string;
        rejectedACKCode: string;
        validateMessageControlId: boolean;
        originalMessageControlId: string;
        originalIdMapVariable: string | null;
      };
    };
    outboundProperties: {
      '@class': string;
      '@version': string;
      serializationProperties: {
        '@class': string;
        '@version': string;
        handleRepetitions: boolean;
        handleSubcomponents: boolean;
        useStrictParser: boolean;
        useStrictValidation: boolean;
        stripNamespaces: boolean;
        segmentDelimiter: string;
        convertLineBreaks: boolean;
      };
      deserializationProperties: {
        '@class': string;
        '@version': string;
        useStrictParser: boolean;
        useStrictValidation: boolean;
        segmentDelimiter: string;
      };
      batchProperties: {
        '@class': string;
        '@version': string;
        splitType: string;
        batchScript: string | null;
      };
      responseGenerationProperties: {
        '@class': string;
        '@version': string;
        segmentDelimiter: string;
        successfulACKCode: string;
        successfulACKMessage: string | null;
        errorACKCode: string;
        errorACKMessage: string;
        rejectedACKCode: string;
        rejectedACKMessage: string;
        msh15ACKAccept: boolean;
        dateFormat: string;
      };
      responseValidationProperties: {
        '@class': string;
        '@version': string;
        successfulACKCode: string;
        errorACKCode: string;
        rejectedACKCode: string;
        validateMessageControlId: boolean;
        originalMessageControlId: string;
        originalIdMapVariable: string | null;
      };
    };
  };
  filter: {
    '@version': string;
    elements: string | null;
  };
  transportName: string;
  mode: string;
  enabled: boolean;
  waitForPrevious: boolean;
}

export interface CronProperty {
  description: string;
  expression: string;
}

interface CronJobs {
  cronProperity: CronProperty | CronProperty[];
}

export interface StaticResource {
  contextPath: string;
  resourceType: string;
  value: string;
  contentType: string;
}

export interface ResponseHeaderEntry {
  string: string;
  list: {
    string: string;
  };
}

export interface ConnectionPropertyEntry {
  string: string[];
}

export interface FilterExternalScriptRule {
  '@version': string;
  name: string;
  sequenceNumber: number;
  enabled: boolean;
  scriptPath: string;
}

export interface FilterRuleBuilder {
  '@version': string;
  name: string;
  sequenceNumber: number;
  enabled: boolean;
  operator: string;
  field: string;
  condition: string;
  values: {
    string: string[];
  };
}

export interface FilterJavascriptRule {
  '@version': string;
  name: string | null;
  sequenceNumber: number;
  enabled: boolean;
  operator: string;
  script: string;
}

export interface TransformerJavascriptStep {
  '@version': string;
  name: string;
  sequenceNumber: number;
  enabled: boolean;
  script: string | null;
}

export interface Channel {
  '@version': string;
  id: string;
  nextMetaDataId: string;
  name: string;
  description: string;
  revision: string;
  sourceConnector: {
    '@version': string;
    metaDataId: string;
    name: string;
    properties: {
      '@class': string;
      '@version': string;
      pluginProperties: string | null;
      listenerConnectorProperties: {
        '@version': string;
        host: string;
        port: string;
      };
      pollConnectorProperties: {
        '@version': string;
        pollingType: string;
        pollOnStart: boolean;
        pollingFrequency: number;
        pollingHour: number;
        pollingMinute: number;
        cronJobs: CronJobs | null;
        pollConnectorPropertiesAdvanced: {
          weekly: boolean;
          inactiveDays: {
            boolean: [
              boolean,
              boolean,
              boolean,
              boolean,
              boolean,
              boolean,
              boolean,
              boolean
            ];
          };
          dayOfMonth: number;
          allDay: boolean;
          startingHour: number;
          startingMinute: number;
          endingHour: number;
          endingMinute: number;
        };
      };
      sourceConnectorProperties: {
        '@version': string;
        responseVariable: string;
        respondAfterProcessing: boolean;
        processBatch: boolean;
        firstResponse: boolean;
        processingThreads: string;
        resourceIds: {
          '@class': string;
          entry: {
            string: string[];
          };
        };
        queueBufferSize: string;
      };
      aggregateResults: boolean;
      cacheResults: boolean;
      driver: string;
      encoding: string;
      fetchSize: number;
      keepConnectionOpen: boolean;
      password: string;
      retryCount: number;
      retryInterval: number;
      select: string;
      update: string;
      updateMode: number;
      url: string;
      useScript: boolean;
      username: string;
      applicationEntity: string;
      localHost: string | null;
      localPort: string | null;
      localApplicationEntity: string | null;
      soCloseDelay: string;
      releaseTo: string;
      requestTo: string;
      idleTo: string;
      reaper: string;
      rspDelay: string;
      pdv1: boolean;
      sndpdulen: string;
      rcvpdulen: string;
      async: string;
      bigEndian: boolean;
      bufSize: string;
      defts: boolean;
      dest: string | null;
      nativeData: boolean;
      sorcvbuf: string;
      sosndbuf: string;
      tcpDelay: boolean;
      keyPW: string;
      keyStore: string;
      keyStorePW: string;
      noClientAuth: boolean;
      nossl2: boolean;
      tls: string;
      trustStore: string;
      trustStorePW: string;
      scheme: string;
      host: string | null;
      fileFilter: string;
      regex: boolean;
      directoryRecursion: boolean;
      ignoreDot: boolean;
      anonymous: boolean;
      timeout: number;
      secure: boolean;
      passive: boolean;
      validateConnection: boolean;
      afterProcessingAction: string | null;
      moveToDirectory: string | null;
      moveToFileName: string | null;
      errorReadingAction: string;
      errorResponseAction: string;
      errorMoveToDirectory: string | null;
      errorMoveToFileName: string | null;
      checkFileAge: boolean;
      fileAge: number;
      fileSizeMinimum: number;
      fileSizeMaximum: number | null;
      ignoreFileSizeMaximum: boolean;
      sortBy: string;
      binary: boolean;
      charsetEncoding: string;
      xmlBody: boolean;
      parseMultipart: boolean;
      includeMetadata: boolean;
      binaryMimeTypes: string;
      binaryMimeTypesRegex: boolean;
      responseContentType: string;
      responseDataTypeBinary: boolean;
      responseStatusCode: string | null;
      responseHeaders: {
        '@class': string;
        entry: ResponseHeaderEntry[];
      };
      responseHeadersVariable: string | null;
      useResponseHeadersVariable: boolean;
      charset: string;
      contextPath: string | null;
      staticResources: {
        'com.mirth.connect.connectors.http.HttpStaticResource':
          | StaticResource[]
          | null;
      };
      useJndi: boolean;
      jndiProviderUrl: string;
      jndiInitialContextFactory: string;
      jndiConnectionFactoryName: string;
      connectionFactoryClass: string | null;
      connectionProperties: {
        '@class': string;
        entry: ConnectionPropertyEntry[];
      };
      destinationName: string;
      topic: boolean;
      clientId: string;
      selector: string;
      reconnectIntervalMillis: number;
      durableTopic: boolean;
      script: string;
      transmissionModeProperties: {
        '@class': string;
        pluginPointName: string;
        startOfMessageBytes: string;
        endOfMessageBytes: string;
        useMLLPv2: boolean;
        ackBytes: string;
        nackBytes: number;
        maxRetries: number;
      };
      serverMode: boolean;
      remoteAddress: string | null;
      remotePort: number;
      overrideLocalBinding: boolean;
      reconnectInterval: number;
      receiveTimeout: number;
      bufferSize: number;
      maxConnections: number;
      dataTypeBinary: boolean;
      respondOnNewConnection: number;
      responseAddress: string | null;
      responsePort: number | null;
      className: string;
      serviceName: string;
      soapBinding: string;
    };
    transformer: {
      '@version': string;
      elements: {
        'com.mirth.connect.plugins.javascriptstep.JavaScriptStep': TransformerJavascriptStep[];
      };
      inboundTemplate: {
        '@encoding': string;
      };
      inboundDataType: string;
      outboundDataType: string;
      inboundProperties: {
        '@class': string;
        '@version': string;
        serializationProperties: {
          '@class': string;
          '@version': string;
          stripNamespaces: boolean;
        };
        batchProperties: {
          '@class': string;
          '@version': string;
          splitType: string;
          elementName: string | null;
          level: string;
          query: string | null;
          batchScript: string | null;
        };
      };
      outboundProperties: {
        '@class': string;
        '@version': string;
        serializationProperties: {
          '@class': string;
          '@version': string;
          handleRepetitions: boolean;
          handleSubcomponents: boolean;
          useStrictParser: boolean;
          useStrictValidation: boolean;
          stripNamespaces: boolean;
          segmentDelimiter: string;
          convertLineBreaks: boolean;
        };
        deserializationProperties: {
          '@class': string;
          '@version': string;
          useStrictParser: boolean;
          useStrictValidation: boolean;
          segmentDelimiter: string;
        };
        batchProperties: {
          '@class': string;
          '@version': string;
          splitType: string;
          batchScript: string | null;
        };
        responseGenerationProperties: {
          '@class': string;
          '@version': string;
          segmentDelimiter: string;
          successfulACKCode: string;
          successfulACKMessage: string | null;
          errorACKCode: string;
          errorACKMessage: string;
          rejectedACKCode: string;
          rejectedACKMessage: string;
          msh15ACKAccept: boolean;
          dateFormat: string;
        };
        responseValidationProperties: {
          '@class': string;
          '@version': string;
          successfulACKCode: string;
          errorACKCode: string;
          rejectedACKCode: string;
          validateMessageControlId: boolean;
          originalMessageControlId: string;
          originalIdMapVariable: string | null;
        };
      };
    };
    filter: {
      '@version': '4.4.1';
      elements: {
        'com.mirth.connect.plugins.scriptfilerule.ExternalScriptRule': FilterExternalScriptRule[];
        'com.mirth.connect.plugins.rulebuilder.RuleBuilderRule': FilterRuleBuilder[];
        'com.mirth.connect.plugins.javascriptrule.JavaScriptRule': FilterJavascriptRule[];
      };
    };
    transportName: string;
    mode: string;
    enabled: boolean;
    waitForPrevious: boolean;
  };
  destinationConnectors: {
    connector: DestinationConnector[];
  };
  preprocessingScript: string;
  postprocessingScript: string;
  deployScript: string;
  undeployScript: string;
  properties: {
    '@version': string;
    clearGlobalChannelMap: boolean;
    messageStorageMode: string;
    encryptData: boolean;
    encryptAttachments: boolean;
    encryptCustomMetaData: boolean;
    removeContentOnCompletion: boolean;
    removeOnlyFilteredOnCompletion: boolean;
    removeAttachmentsOnCompletion: boolean;
    initialState: string;
    storeAttachments: boolean;
    metaDataColumns: {
      metaDataColumn: CustomMetaData[];
    };
    attachmentProperties: {
      '@version': string;
      className: string;
      type: string;
      properties: {
        entry: {
          string: string[];
        };
      };
    };
    resourceIds: {
      '@class': string;
      entry: {
        string: string[];
      };
    };
  };
  exportData: {
    metadata: {
      enabled: boolean;
      lastModified: {
        time: number;
        timezone: string;
      };
      pruningSettings: {
        pruneContentDays?: string;
        archiveEnabled: boolean;
        pruneErroredMessages: boolean;
        pruneMetaDataDays?: string;
      };
      userId: 1;
    };
    dependentIds: string | null;
    dependencyIds: {
      string: string;
    };
    channelTags: string | null;
  };
}

export interface ChannelStatistics {
  received: number;
  filtered: number;
  queued: number;
  sent: number;
  error: number;
  lifetimeReceived: number;
  lifetimeFiltered: number;
  lifetimeSent: number;
  lifetimeError: number;
}

export interface ChannelStatus {
  id: string;
  name: string;
  description?: string;
  state: string;
  revision?: string;
  lastModified?: number;
  deployed?: boolean;
  queued?: number;
  statistics?: ChannelStatistics;
  tags?: string[];
}
