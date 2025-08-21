import { getMirthApiClient } from '../utils/api';
import type { ConfigurationMapItem } from '../types/configurationMap.type';

export interface ConfigMapEntry {
  id: string;
  key: string;
  value: string;
  comment: string;
}

/**
 * Get all configuration map items from the API
 */
export const getAllConfigurationMapItems = async (): Promise<ConfigurationMapItem[]> => {
  try {
    const mirthApiClient = getMirthApiClient();
    console.log('=== API GET REQUEST START ===');
    const response = await mirthApiClient.get('/server/configurationMap');
    console.log('Raw server response:', response.data);
    console.log('Response structure:', JSON.stringify(response.data, null, 2));

    const map = response.data.map;
    if (map && map.entry) {
      const { entry } = map;
      console.log('Found map.entry:', entry);
      console.log('Entry type:', Array.isArray(entry) ? 'array' : 'single object');

      // Handle both single entry and array of entries
      let entries: ConfigurationMapItem[];
      if (Array.isArray(entry)) {
        entries = entry;
        console.log('Processing as array:', entries.length, 'items');
      } else {
        // Single entry case
        entries = [entry];
        console.log('Processing as single entry, converted to array');
      }

      console.log('Final processed entries:', entries);
      console.log('=== API GET REQUEST SUCCESS ===');
      return entries as ConfigurationMapItem[];
    }

    console.log('No map.entry found, returning empty array');
    console.log('=== API GET REQUEST COMPLETE (EMPTY) ===');
    return [] as ConfigurationMapItem[];
  } catch (error: any) {
    console.error('=== API GET REQUEST FAILED ===');
    console.error('API error:', error);
    console.error('Error details:', error.response?.data);
    throw new Error(error.response?.data?.message || 'Failed to fetch configuration map');
  }
};

/**
 * Save configuration map items to the API
 */
export const saveConfigurationMapItems = async (
  configurationMapItems: ConfigurationMapItem[]
): Promise<any> => {
  try {
    console.log('=== API SAVE REQUEST START ===');
    console.log('Items to save:', configurationMapItems.length, 'entries');
    console.log('Save data:', configurationMapItems);

    // Prepare payload
    const payload = {
      map: {
        entry: configurationMapItems
      }
    };

    console.log('API request payload:', JSON.stringify(payload, null, 2));
    console.log('Making PUT request to /server/configurationMap');
    const mirthApiClient = getMirthApiClient();
    const response = await mirthApiClient.put('/server/configurationMap', payload);

    console.log('Save response status:', response.status);
    console.log('Save response data:', response.data);
    console.log('=== API SAVE REQUEST SUCCESS ===');

    return response.data;
  } catch (error: any) {
    console.error('=== API SAVE REQUEST FAILED ===');
    console.error('Save error:', error);
    console.error('Error status:', error.response?.status);
    console.error('Error data:', error.response?.data);
    throw new Error(error.response?.data?.message || 'Failed to save configuration map');
  }
};

/**
 * Export configuration map as properties file
 */
export const exportConfigurationMap = async (
  filename: string,
  configData: ConfigMapEntry[]
): Promise<void> => {
  try {
    // Convert config data to properties format
    const propertiesContent = generatePropertiesContent(configData);

    // Create blob and download
    const blob = new Blob([propertiesContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);

    // Create temporary download link
    const link = document.createElement('a');
    link.href = url;
    link.download = filename.endsWith('.properties') ? filename : `${filename}.properties`;

    // Trigger download
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

  } catch (error: any) {
    console.error('Export failed:', error);
    throw new Error(error.response?.data?.message || 'Failed to export configuration map');
  }
};

/**
 * Generate properties file content from configuration data
 */
export const generatePropertiesContent = (configData: ConfigMapEntry[]): string => {
  const lines: string[] = [];

  // Add header comment
  lines.push('# Configuration Map Export');
  lines.push(`# Generated on: ${new Date().toISOString()}`);
  lines.push('# Format: key=value');
  lines.push('');

  // Handle empty configuration data
  if (!configData || configData.length === 0) {
    lines.push('# No configuration entries found');
    return lines.join('\n');
  }

  // Add each configuration entry
  configData.forEach(entry => {
    // Skip entries with empty keys
    if (!entry.key || !entry.key.trim()) {
      return;
    }

    // Add comment if present
    if (entry.comment && entry.comment.trim()) {
      lines.push(`# ${entry.comment}`);
    }

    // Add key=value pair with spaces around equals sign for readability
    const escapedKey = escapePropertiesString(entry.key);
    const escapedValue = escapePropertiesString(entry.value || '');
    lines.push(`${escapedKey} = ${escapedValue}`);
    lines.push(''); // Empty line for readability
  });

  return lines.join('\n');
};

/**
 * Escape special characters for properties file format
 */
const escapePropertiesString = (str: string): string => {
  return str
    .replace(/\\/g, '\\\\')  // Escape backslashes
    .replace(/=/g, '\\=')    // Escape equals signs
    .replace(/:/g, '\\:')    // Escape colons
    .replace(/\n/g, '\\n')   // Escape newlines
    .replace(/\r/g, '\\r')   // Escape carriage returns
    .replace(/\t/g, '\\t');  // Escape tabs
};

/**
 * Alternative: Export via API endpoint (if backend supports it)
 */
export const exportConfigurationMapViaAPI = async (filename: string): Promise<void> => {
  const mirthApiClient = getMirthApiClient();
  try {
    // Get configuration map data from API
    const response = await mirthApiClient.get('/configuration/export', {
      responseType: 'blob' // Important for file download
    });

    // Create blob and download
    const blob = new Blob([response.data], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);

    // Create temporary download link
    const link = document.createElement('a');
    link.href = url;
    link.download = filename.endsWith('.properties') ? filename : `${filename}.properties`;

    // Trigger download
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

  } catch (error: any) {
    console.error('API export failed:', error);
    throw new Error(error.response?.data?.message || 'Failed to export configuration map');
  }
};

/**
 * Import configuration map from properties file
 */
export const importConfigurationMap = async (
  file: File,
  options: { overwriteExisting: boolean; mergeWithCurrent: boolean }
): Promise<ConfigMapEntry[]> => {
  try {
    // Read file content
    const fileContent = await readFileAsText(file);

    // Parse properties file
    const parsedEntries = parsePropertiesFile(fileContent);

    // Apply import options logic here
    // For now, just return the parsed entries
    // In a real implementation, you'd merge with existing data based on options

    return parsedEntries;

  } catch (error: any) {
    console.error('Import failed:', error);
    throw new Error(error.message || 'Failed to import configuration map');
  }
};

/**
 * Read file as text
 */
const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      resolve(content);
    };
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    reader.readAsText(file);
  });
};

/**
 * Parse properties file content into ConfigMapEntry array
 */
const parsePropertiesFile = (content: string): ConfigMapEntry[] => {
  const lines = content.split('\n');
  const entries: ConfigMapEntry[] = [];
  let currentComment = '';
  let entryId = 1;

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Skip empty lines
    if (!trimmedLine) {
      currentComment = '';
      continue;
    }

    // Handle comments
    if (trimmedLine.startsWith('#')) {
      const comment = trimmedLine.substring(1).trim();
      // Skip header comments
      if (!comment.startsWith('Configuration Map Export') &&
          !comment.startsWith('Generated on:') &&
          !comment.startsWith('Format:') &&
          !comment.startsWith('No configuration entries found')) {
        currentComment = comment;
      }
      continue;
    }

    // Handle key=value pairs (with or without spaces around equals)
    const equalIndex = trimmedLine.indexOf('=');
    if (equalIndex > 0) {
      const key = unescapePropertiesString(trimmedLine.substring(0, equalIndex).trim());
      const value = unescapePropertiesString(trimmedLine.substring(equalIndex + 1).trim());

      if (key) { // Only add entries with non-empty keys
        entries.push({
          id: `parsed-${entryId}`,
          key,
          value,
          comment: currentComment
        });

        entryId++;
      }
      currentComment = '';
    }
  }

  console.log('Parsed properties file:', entries.length, 'entries');
  return entries;
};

/**
 * Unescape special characters from properties file format
 */
const unescapePropertiesString = (str: string): string => {
  return str
    .replace(/\\n/g, '\n')   // Unescape newlines
    .replace(/\\r/g, '\r')   // Unescape carriage returns
    .replace(/\\t/g, '\t')   // Unescape tabs
    .replace(/\\:/g, ':')    // Unescape colons
    .replace(/\\=/g, '=')    // Unescape equals signs
    .replace(/\\\\/g, '\\'); // Unescape backslashes (must be last)
};
