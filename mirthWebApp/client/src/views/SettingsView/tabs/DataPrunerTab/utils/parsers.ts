// Parsing utilities for DataPrunerTab component

import { mapServerContentTypeToUI, mapServerEncryptionTypeToUI, toBool } from './transformations';

// Parse polling properties XML to schedule settings
export const parsePollingProperties = (pollingPropertiesXML: string) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(pollingPropertiesXML, 'text/xml');

  // Extract basic polling settings
  const pollingType = doc.querySelector('pollingType')?.textContent || 'Interval';
  const pollingFrequency = doc.querySelector('pollingFrequency')?.textContent || '1';
  const pollingHour = doc.querySelector('pollingHour')?.textContent || '9';
  const pollingMinute = doc.querySelector('pollingMinute')?.textContent || '0';

  // Parse cron jobs
  const cronJobElements = doc.querySelectorAll('cronProperty');
  const cronJobs = Array.from(cronJobElements).map(element => ({
    expression: element.querySelector('expression')?.textContent || '',
    description: element.querySelector('description')?.textContent || ''
  }));

  // Parse advanced settings
  const weekly = toBool(doc.querySelector('weekly')?.textContent);
  const dayOfMonth = doc.querySelector('dayOfMonth')?.textContent || '1';
  const allDay = toBool(doc.querySelector('allDay')?.textContent);
  const startingHour = doc.querySelector('startingHour')?.textContent || '8';
  const startingMinute = doc.querySelector('startingMinute')?.textContent || '0';
  const endingHour = doc.querySelector('endingHour')?.textContent || '17';
  const endingMinute = doc.querySelector('endingMinute')?.textContent || '0';

  // Parse inactive days array - handle both comma-separated and XML boolean array formats
  let inactiveDaysArray: boolean[] = [];
  const inactiveDaysElement = doc.querySelector('inactiveDays');

  if (inactiveDaysElement) {
    const inactiveDaysStr = inactiveDaysElement.textContent || '';

    // Check if it's a comma-separated format
    if (inactiveDaysStr.includes(',')) {
      inactiveDaysArray = inactiveDaysStr.split(',').map(day => day.trim() === 'true');
    } else {
      // Check if it's an XML array format with <boolean> elements
      const booleanElements = inactiveDaysElement.querySelectorAll('boolean');
      if (booleanElements.length > 0) {
        inactiveDaysArray = Array.from(booleanElements).map(el => el.textContent?.trim() === 'true');
      } else {
        // Fallback: try to parse as single boolean value
        inactiveDaysArray = [inactiveDaysStr.trim() === 'true'];
      }
    }
  }
  
  // Skip first element and map remaining 7 elements to weekdays (Sunday-first)
  const dayOrder = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const weeklyDays = {
    sunday: true, // Default to active
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: true
  };

  if (inactiveDaysArray.length >= 8) {
    // Skip first element, process next 7
    for (let i = 0; i < 7; i++) {
      const dayName = dayOrder[i];
      const inactive = inactiveDaysArray[i + 1]; // Skip first element
      const active = !inactive; // Invert: inactive=true → active=false
      weeklyDays[dayName as keyof typeof weeklyDays] = active;
    }
  } else if (inactiveDaysArray.length >= 7) {
    // Handle case where there's no first element to skip
    for (let i = 0; i < 7; i++) {
      const dayName = dayOrder[i];
      const inactive = inactiveDaysArray[i];
      const active = !inactive; // Invert: inactive=true → active=false
      weeklyDays[dayName as keyof typeof weeklyDays] = active;
    }
  }

  return {
    pollingType,
    pollingFrequency,
    pollingHour,
    pollingMinute,
    cronJobs,
    weekly,
    dayOfMonth,
    allDay,
    startingHour,
    startingMinute,
    endingHour,
    endingMinute,
    weeklyDays
  };
};

// Parse archiver options XML to archive settings
export const parseArchiverOptions = (archiverOptionsXML: string) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(archiverOptionsXML, 'text/xml');

  // Extract basic archiver settings
  const baseFolder = doc.querySelector('baseFolder')?.textContent || '';
  const rootFolder = doc.querySelector('rootFolder')?.textContent || '';
  const filePattern = doc.querySelector('filePattern')?.textContent || '';
  const contentType = doc.querySelector('contentType')?.textContent || '';
  const destinationContent = toBool(doc.querySelector('destinationContent')?.textContent);
  const encrypt = toBool(doc.querySelector('encrypt')?.textContent);
  const includeAttachments = toBool(doc.querySelector('includeAttachments')?.textContent);
  const compressFormat = doc.querySelector('compressFormat')?.textContent || '';
  const archiveFormat = doc.querySelector('archiveFormat')?.textContent || '';
  const passwordEnabled = toBool(doc.querySelector('passwordEnabled')?.textContent);
  const password = doc.querySelector('password')?.textContent || '';
  const encryptionType = doc.querySelector('encryptionType')?.textContent || 'AES256';

  // Combine compression format
  const combineCompressionFormat = (archiveFormat: string, compressFormat: string): string => {
    if (!archiveFormat || archiveFormat === 'none') {
      return 'none';
    }

    if (!compressFormat) {
      return archiveFormat; // Just the archive format (e.g., "zip")
    }

    // Map server compression format names to UI display names
    const compressFormatMapping: Record<string, string> = {
      'gzip': 'gz',
      'gz': 'gz',
      'bzip2': 'bz2',
      'bz2': 'bz2'
    };

    const mappedCompressFormat = compressFormatMapping[compressFormat] || compressFormat;

    // Combine formats (e.g., "tar" + "bzip2" = "tar.bz2")
    const combined = `${archiveFormat}.${mappedCompressFormat}`;
    return combined;
  };

  const compression = combineCompressionFormat(archiveFormat, compressFormat);

  // Map content type to UI format
  const content = mapServerContentTypeToUI(contentType);

  // Map encryption type to UI format
  const encryptionTypeUI = mapServerEncryptionTypeToUI(encryptionType);

  return {
    baseFolder,
    rootFolder,
    filePattern,
    contentType,
    destinationContent,
    encrypt,
    includeAttachments,
    compressFormat,
    archiveFormat,
    compression,
    passwordEnabled,
    password,
    encryptionType,
    content,
    encryptionTypeUI
  };
};

// Parse schedule settings from polling config
export const parseScheduleSettings = (pollingConfig: any, properties: any) => {
  // Convert pollingFrequency (milliseconds) to interval value and unit
  const frequencyMs = parseInt(pollingConfig.pollingFrequency || '3600000', 10);
  let interval = '1';
  let intervalUnit = 'hours';

  // Enhanced conversion logic to prefer seconds for values like 7266000ms
  // Only convert to higher units if it results in clean whole numbers
  if (frequencyMs >= 86400000 && frequencyMs % 86400000 === 0) { // 1 day or more, exact days
    interval = Math.floor(frequencyMs / 86400000).toString();
    intervalUnit = 'days';
  } else if (frequencyMs >= 3600000 && frequencyMs % 3600000 === 0) { // 1 hour or more, exact hours
    interval = Math.floor(frequencyMs / 3600000).toString();
    intervalUnit = 'hours';
  } else if (frequencyMs >= 60000 && frequencyMs % 60000 === 0) { // 1 minute or more, exact minutes
    interval = Math.floor(frequencyMs / 60000).toString();
    intervalUnit = 'minutes';
  } else { // seconds (including non-exact conversions like 7266000ms)
    interval = Math.floor(frequencyMs / 1000).toString();
    intervalUnit = 'seconds';
  }

  // Map polling type to UI values
  let scheduleType = 'Interval';
  if (pollingConfig.pollingType === 'TIME') scheduleType = 'Time';
  else if (pollingConfig.pollingType === 'CRON') scheduleType = 'Cron';
  else if (pollingConfig.pollingType === 'INTERVAL') scheduleType = 'Interval';

  const scheduleSettings = {
    enabled: toBool(properties.enabled),
    scheduleType,
    interval,
    intervalUnit,
    time: `${String(pollingConfig.pollingHour || '9').padStart(2, '0')}:${String(pollingConfig.pollingMinute || '0').padStart(2, '0')}`,
    cronJobs: pollingConfig.cronJobs || [],
    advancedSettings: {
      activeDaysType: pollingConfig.weekly ? 'Weekly' : 'Monthly',
      weeklyDays: pollingConfig.weeklyDays || {
        sunday: true,
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: true
      },
      monthlyDay: pollingConfig.dayOfMonth || '1',
      activeTimeType: pollingConfig.allDay ? 'All Day' : 'Range',
      timeRangeStart: `${String(pollingConfig.startingHour || '8').padStart(2, '0')}:${String(pollingConfig.startingMinute || '0').padStart(2, '0')}`,
      timeRangeEnd: `${String(pollingConfig.endingHour || '17').padStart(2, '0')}:${String(pollingConfig.endingMinute || '0').padStart(2, '0')}`
    }
  };

  return scheduleSettings;
};

// Parse archive settings from archiver config
export const parseArchiveSettings = (archiverConfig: any, properties: any) => {
  const archiveSettings = {
    enableArchiving: toBool(properties.archiveEnabled),
    archiveBlockSize: String(properties.archiverBlockSize || '50'),
    content: archiverConfig.content || 'XML serialized message',
    encrypt: archiverConfig.encrypt || false,
    includeAttachments: archiverConfig.includeAttachments || false,
    compression: archiverConfig.compression || 'zip',
    passwordProtect: archiverConfig.passwordEnabled || false,
    encryptionType: archiverConfig.encryptionTypeUI || 'AES-256',
    password: archiverConfig.password || '',
    rootPath: archiverConfig.rootFolder || '',
    filePattern: archiverConfig.filePattern || ''
  };

  return archiveSettings;
};
