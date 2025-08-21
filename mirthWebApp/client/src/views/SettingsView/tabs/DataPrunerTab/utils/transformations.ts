// Transformation utilities for DataPrunerTab component

interface ScheduleSettings {
  enabled: boolean;
  scheduleType: string;
  interval: string;
  intervalUnit: string;
  time: string;
  cronJobs: Array<{ expression: string; description: string }>;
  advancedSettings: {
    activeDaysType: string;
    weeklyDays: {
      sunday: boolean;
      monday: boolean;
      tuesday: boolean;
      wednesday: boolean;
      thursday: boolean;
      friday: boolean;
      saturday: boolean;
    };
    monthlyDay: string;
    activeTimeType: string;
    timeRangeStart: string;
    timeRangeEnd: string;
  };
}

interface ArchiveSettings {
  enableArchiving: boolean;
  archiveBlockSize: string;
  content: string;
  encrypt: boolean;
  includeAttachments: boolean;
  compression: string;
  passwordProtect: boolean;
  encryptionType: string;
  password: string;
  rootPath: string;
  filePattern: string;
}

// Transform schedule settings to polling properties XML format
export const transformScheduleToPollingProperties = (schedule: ScheduleSettings): string => {
  // Convert interval and unit back to milliseconds
  let pollingFrequency = 5000; // Default 5 seconds
  if (schedule.scheduleType === 'Interval') {
    const interval = parseInt(schedule.interval, 10);
    const unit = schedule.intervalUnit;

    switch (unit) {
      case 'milliseconds':
        pollingFrequency = interval;
        break;
      case 'seconds':
        pollingFrequency = interval * 1000;
        break;
      case 'minutes':
        pollingFrequency = interval * 60 * 1000;
        break;
      case 'hours':
        pollingFrequency = interval * 60 * 60 * 1000;
        break;
      default:
        pollingFrequency = interval * 60 * 60 * 1000; // Default to hours
    }
  }

  // Generate 8-element array with first element + 7 days (Sunday-first)
  const weeklyDays = schedule.advancedSettings.weeklyDays;
  const dayOrder = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

  // Generate 8-element array: [firstElement, ...7dayElements]
  const firstElement = false; // The first element that gets skipped in load
  const dayElements = dayOrder.map(day => {
    const active = weeklyDays[day as keyof typeof weeklyDays];
    const inactive = !active; // Invert: active=false → inactive=true
    return inactive;
  });

  const inactiveDaysArray = [firstElement, ...dayElements];

  // Generate Cron Jobs XML
  const cronJobsXML = schedule.cronJobs.length > 0
    ? schedule.cronJobs.map(job =>
        `    <cronProperty>
      <expression>${job.expression}</expression>
      <description>${job.description}</description>
    </cronProperty>`
      ).join('\n')
    : '';

  // Map UI schedule type to server format
  let pollingType = 'INTERVAL';
  if (schedule.scheduleType === 'Time') pollingType = 'TIME';
  else if (schedule.scheduleType === 'Cron') pollingType = 'CRON';
  else if (schedule.scheduleType === 'Interval') pollingType = 'INTERVAL';

  const xml = `<com.mirth.connect.donkey.model.channel.PollConnectorProperties version="4.5.2">
  <pollingType>${pollingType}</pollingType>
  <pollOnStart>false</pollOnStart>
  <pollingFrequency>${pollingFrequency}</pollingFrequency>
  <pollingHour>0</pollingHour>
  <pollingMinute>0</pollingMinute>
  ${cronJobsXML ? `<cronJobs>\n${cronJobsXML}\n  </cronJobs>` : '<cronJobs/>'}
  <pollConnectorPropertiesAdvanced>
    <weekly>${schedule.advancedSettings.activeDaysType === 'Weekly'}</weekly>
    <inactiveDays>
      ${inactiveDaysArray.map(inactive => `<boolean>${inactive}</boolean>`).join('\n      ')}
    </inactiveDays>
    <dayOfMonth>${parseInt(schedule.advancedSettings.monthlyDay) || 1}</dayOfMonth>
    <allDay>${schedule.advancedSettings.activeTimeType === 'All Day'}</allDay>
    <startingHour>${schedule.advancedSettings.timeRangeStart.split(':')[0]}</startingHour>
    <startingMinute>${schedule.advancedSettings.timeRangeStart.split(':')[1]}</startingMinute>
    <endingHour>${schedule.advancedSettings.timeRangeEnd.split(':')[0]}</endingHour>
    <endingMinute>${schedule.advancedSettings.timeRangeEnd.split(':')[1]}</endingMinute>
  </pollConnectorPropertiesAdvanced>
</com.mirth.connect.donkey.model.channel.PollConnectorProperties>`;

  return xml;
};

// Transform archive settings to archiver options XML format
export const transformArchiveToArchiverOptions = (archive: ArchiveSettings): string => {

  // Map UI compression format back to server format (exact match to original)
  const mapUICompressionToServer = (uiValue: string): { archiveFormat: string; compressFormat: string } => {
    if (uiValue === 'none') {
      return { archiveFormat: 'none', compressFormat: '' };
    }

    if (uiValue === 'zip') {
      return { archiveFormat: 'zip', compressFormat: '' };
    }

    // Handle combined formats like "tar.gz", "tar.bz2"
    const parts = uiValue.split('.');
    if (parts.length === 2) {
      const [archiveFormat, compressFormat] = parts;
      // Map UI compression names back to server names
      const compressMapping: Record<string, string> = {
        'gz': 'gz',
        'bz2': 'bzip2'
      };
      return {
        archiveFormat,
        compressFormat: compressMapping[compressFormat] || compressFormat
      };
    }

    return { archiveFormat: uiValue, compressFormat: '' };
  };

  const compressionMapping = mapUICompressionToServer(archive.compression);
  const archiveFormat = compressionMapping.archiveFormat;
  const compressFormat = compressionMapping.compressFormat;

  // Map UI content type back to server format (exact match to original)
  const mapUIContentTypeToServer = (uiValue: string): { contentType: string; destinationContent: boolean } => {
    const mapping: Record<string, { contentType: string; destinationContent: boolean }> = {
      'XML serialized message': { contentType: '', destinationContent: false },
      'Source Raw': { contentType: 'RAW', destinationContent: false },
      'Source Processed Raw': { contentType: 'PROCESSED_RAW', destinationContent: false },
      'Source Transformed': { contentType: 'TRANSFORMED', destinationContent: false },
      'Source Encoded': { contentType: 'ENCODED', destinationContent: false },
      'Source Response': { contentType: 'RESPONSE', destinationContent: false },
      'Source Processed Response': { contentType: 'PROCESSED_RESPONSE', destinationContent: false },
      'Destination Raw': { contentType: 'RAW', destinationContent: true },
      'Destination Transformed': { contentType: 'TRANSFORMED', destinationContent: true },
      'Destination Encoded': { contentType: 'ENCODED', destinationContent: true },
      'Destination Sent': { contentType: 'SENT', destinationContent: true },
      'Destination Response': { contentType: 'RESPONSE', destinationContent: true },
      'Destination Processed Response': { contentType: 'PROCESSED_RESPONSE', destinationContent: true },
      'Source Map': { contentType: 'SOURCE_MAP', destinationContent: false },
      'Channel Map': { contentType: 'CHANNEL_MAP', destinationContent: false },
      'Response Map': { contentType: 'RESPONSE_MAP', destinationContent: false }
    };

    return mapping[uiValue] || { contentType: '', destinationContent: false };
  };

  const contentMapping = mapUIContentTypeToServer(archive.content);

  // Map UI encryption type back to server format (exact match to original)
  const mapUIEncryptionTypeToServer = (uiValue: string): string => {
    const mapping: Record<string, string> = {
      'AES-256': 'AES256',
      'AES-128': 'AES128',
      'Standard': 'STANDARD'
    };
    return mapping[uiValue] || 'AES256';
  };

  const encryptionType = mapUIEncryptionTypeToServer(archive.encryptionType);

  const xml = `<com.mirth.connect.util.messagewriter.MessageWriterOptions>
  ${contentMapping.contentType ? `<contentType>${contentMapping.contentType}</contentType>` : ''}
  <destinationContent>${contentMapping.destinationContent ? 'true' : 'false'}</destinationContent>
  <encrypt>${archive.encrypt ? 'true' : 'false'}</encrypt>
  <includeAttachments>${archive.includeAttachments ? 'true' : 'false'}</includeAttachments>
  <rootFolder>${archive.rootPath}</rootFolder>
  <filePattern>${archive.filePattern}</filePattern>
  <archiveFormat>${archiveFormat}</archiveFormat>
  ${compressFormat ? `<compressFormat>${compressFormat}</compressFormat>` : ''}
  <passwordEnabled>${archive.passwordProtect ? 'true' : 'false'}</passwordEnabled>
  <password>${archive.password || ''}</password>
  <encryptionType>${encryptionType}</encryptionType>
</com.mirth.connect.util.messagewriter.MessageWriterOptions>`;

  return xml;
};

// Helper function to convert string to boolean
export const toBool = (value: string | boolean | undefined): boolean => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true';
  }
  return false;
};

// Content type mapping functions
export const mapServerContentTypeToUI = (serverValue: string): string => {
  const mapping: Record<string, string> = {
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
  };

  return mapping[serverValue] || 'XML serialized message';
};

export const mapUIContentTypeToServer = (uiValue: string): string => {
  const mapping: Record<string, string> = {
    'Source Raw': 'RAW',
    'Source Processed Raw': 'PROCESSED_RAW',
    'Source Transformed': 'TRANSFORMED',
    'Source Encoded': 'ENCODED',
    'Source Response': 'RESPONSE',
    'Destination Raw': 'DESTINATION_RAW',
    'Destination Transformed': 'DESTINATION_TRANSFORMED',
    'Destination Encoded': 'DESTINATION_ENCODED',
    'Destination Sent': 'DESTINATION_SENT',
    'Destination Response': 'DESTINATION_RESPONSE',
    'Destination Processed Response': 'PROCESSED_RESPONSE', // Fixed: Maps to PROCESSED_RESPONSE
    'Source Map': 'SOURCE_MAP',
    'Channel Map': 'CHANNEL_MAP',
    'Response Map': 'RESPONSE_MAP',
    'XML serialized message': 'XML_SERIALIZED'
  };

  return mapping[uiValue] || 'XML_SERIALIZED';
};

export const mapServerEncryptionTypeToUI = (serverValue: string): string => {
  const mapping: Record<string, string> = {
    'AES256': 'AES-256',
    'AES128': 'AES-128',
    'STANDARD': 'Standard'
  };
  
  return mapping[serverValue] || 'AES-256';
};
