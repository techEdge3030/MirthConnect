// Validation utilities for DataPrunerTab component

import { VALIDATION_LIMITS, ERROR_MESSAGES } from '../constants';

interface PruneSettings {
  blockSize: string;
  pruneEvents: boolean;
  pruneEventAge: number;
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

interface ScheduleSettings {
  enabled: boolean;
  scheduleType: string;
  interval: string;
  intervalUnit: string;
  time: string;
  cronJobs: Array<{ expression: string; description: string }>;
}

interface ValidationErrors {
  blockSize?: string;
  archiveBlockSize?: string;
  rootPath?: string;
  filePattern?: string;
  password?: string;
  interval?: string;
}

// Validate prune settings
export const validatePruneSettings = (pruneSettings: PruneSettings): { blockSize?: string } => {
  const errors: { blockSize?: string } = {};

  // Validate block size
  const blockSizeNum = parseInt(pruneSettings.blockSize);
  if (isNaN(blockSizeNum)) {
    errors.blockSize = ERROR_MESSAGES.BLOCK_SIZE_NOT_NUMBER;
  } else if (blockSizeNum < VALIDATION_LIMITS.BLOCK_SIZE_MIN || blockSizeNum > VALIDATION_LIMITS.BLOCK_SIZE_MAX) {
    errors.blockSize = ERROR_MESSAGES.BLOCK_SIZE_OUT_OF_RANGE;
  }

  return errors;
};

// Validate archive settings
export const validateArchiveSettings = (archiveSettings: ArchiveSettings): ValidationErrors => {
  const errors: ValidationErrors = {};

  if (archiveSettings.enableArchiving) {
    // Validate archive block size
    const archiveBlockSizeNum = parseInt(archiveSettings.archiveBlockSize);
    if (isNaN(archiveBlockSizeNum) || archiveBlockSizeNum < VALIDATION_LIMITS.BLOCK_SIZE_MIN || archiveBlockSizeNum > VALIDATION_LIMITS.BLOCK_SIZE_MAX) {
      errors.archiveBlockSize = ERROR_MESSAGES.ARCHIVE_BLOCK_SIZE_REQUIRED;
    }

    // Validate root path
    if (!archiveSettings.rootPath.trim()) {
      errors.rootPath = ERROR_MESSAGES.ROOT_PATH_REQUIRED;
    }

    // Validate file pattern
    if (!archiveSettings.filePattern.trim()) {
      errors.filePattern = ERROR_MESSAGES.FILE_PATTERN_REQUIRED;
    }

    // Validate password if password protection is enabled
    if (archiveSettings.compression === 'zip' && archiveSettings.passwordProtect && !archiveSettings.password.trim()) {
      errors.password = ERROR_MESSAGES.PASSWORD_REQUIRED;
    }
  }

  return errors;
};

// Validate schedule settings
export const validateScheduleSettings = (scheduleSettings: ScheduleSettings): { interval?: string } => {
  const errors: { interval?: string } = {};

  if (scheduleSettings.enabled && scheduleSettings.scheduleType === 'Interval') {
    const intervalNum = parseInt(scheduleSettings.interval);
    const intervalUnit = scheduleSettings.intervalUnit;

    if (isNaN(intervalNum) || intervalNum <= 0) {
      errors.interval = 'Interval must be a positive number';
      return errors;
    }

    // Convert to hours for validation
    let intervalInHours = intervalNum;
    switch (intervalUnit) {
      case 'milliseconds':
        intervalInHours = intervalNum / (1000 * 60 * 60);
        break;
      case 'seconds':
        intervalInHours = intervalNum / (60 * 60);
        break;
      case 'minutes':
        intervalInHours = intervalNum / 60;
        break;
      case 'hours':
        intervalInHours = intervalNum;
        break;
      default:
        intervalInHours = intervalNum;
    }

    if (intervalInHours < VALIDATION_LIMITS.INTERVAL_MIN_HOURS || intervalInHours > VALIDATION_LIMITS.INTERVAL_MAX_HOURS) {
      errors.interval = ERROR_MESSAGES.INTERVAL_OUT_OF_RANGE;
    }
  }

  return errors;
};

// Validate all settings before save
export const validateAllSettings = (
  pruneSettings: PruneSettings,
  archiveSettings: ArchiveSettings,
  scheduleSettings: ScheduleSettings
): ValidationErrors => {
  const pruneErrors = validatePruneSettings(pruneSettings);
  const archiveErrors = validateArchiveSettings(archiveSettings);
  const scheduleErrors = validateScheduleSettings(scheduleSettings);

  return {
    ...pruneErrors,
    ...archiveErrors,
    ...scheduleErrors
  };
};

// Check if there are any validation errors
export const hasValidationErrors = (errors: ValidationErrors): boolean => {
  return Object.values(errors).some(error => error && error.trim() !== '');
};

// Get first validation error message
export const getFirstValidationError = (errors: ValidationErrors): string => {
  const errorValues = Object.values(errors).filter(error => error && error.trim() !== '');
  return errorValues.length > 0 ? errorValues[0] : '';
};

// Validate cron expression format (basic validation)
export const validateCronExpression = (expression: string): boolean => {
  if (!expression || expression.trim() === '') {
    return false;
  }

  // Basic validation: should have at least 6 fields separated by spaces
  const fields = expression.trim().split(/\s+/);
  return fields.length >= 6;
};

// Validate time range (start time should be before end time)
export const validateTimeRange = (startTime: string, endTime: string): boolean => {
  if (!startTime || !endTime) {
    return false;
  }

  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);

  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;

  return startMinutes < endMinutes;
};

// Validate monthly day (1-31)
export const validateMonthlyDay = (day: string): boolean => {
  const dayNum = parseInt(day);
  return !isNaN(dayNum) && dayNum >= 1 && dayNum <= 31;
};

// Check if at least one day is selected for weekly schedule
export const validateWeeklyDays = (weeklyDays: Record<string, boolean>): boolean => {
  return Object.values(weeklyDays).some(day => day === true);
};
