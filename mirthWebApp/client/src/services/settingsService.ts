import { getMirthApiClient } from '../utils/api';

// Types for different settings categories
export interface SystemPreferences {
  dashboardRefreshInterval: string;
  messageBrowserPageSize: string;
  eventBrowserPageSize: string;
  formatTextInMessageBrowser: string;
  messageBrowserTextSearchConfirmation: string;
  filterTransformerIteratorDialog: string;
  messageBrowserAttachmentTypeDialog: string;
  reprocessRemoveMessagesConfirmation: string;
  importCodeTemplateLibrariesWithChannels: string;
  exportCodeTemplateLibrariesWithChannels: string;
}

export interface UserPreferences {
  checkForNewNotificationsOnLogin: string;
  administratorBackgroundColor: string;
  customBackgroundColor: string;
}

export interface CodeEditorPreferences {
  theme: string;
  fontSize: string;
  wordWrap: boolean;
  autoComplete: boolean;
  showLineNumbers: boolean;
  showGutter: boolean;
  highlightActiveLine: boolean;
  showInvisibles: boolean;
}

export interface AllSettings {
  systemPrefs: SystemPreferences;
  userPrefs: UserPreferences;
  codeEditorPrefs: CodeEditorPreferences;
}

// Default settings values
export const DEFAULT_SETTINGS: AllSettings = {
  systemPrefs: {
    dashboardRefreshInterval: '1',
    messageBrowserPageSize: '20',
    eventBrowserPageSize: '100',
    formatTextInMessageBrowser: 'yes',
    messageBrowserTextSearchConfirmation: 'no',
    filterTransformerIteratorDialog: 'yes',
    messageBrowserAttachmentTypeDialog: 'no',
    reprocessRemoveMessagesConfirmation: 'no',
    importCodeTemplateLibrariesWithChannels: 'yes',
    exportCodeTemplateLibrariesWithChannels: 'ask'
  },
  userPrefs: {
    checkForNewNotificationsOnLogin: 'yes',
    administratorBackgroundColor: 'server-default',
    customBackgroundColor: '#ffffff'
  },
  codeEditorPrefs: {
    theme: 'eclipse',
    fontSize: '12',
    wordWrap: false,
    autoComplete: true,
    showLineNumbers: true,
    showGutter: true,
    highlightActiveLine: true,
    showInvisibles: false
  }
};

/**
 * Get server configuration/settings
 * This uses the configuration map endpoint to store/retrieve application settings
 */
export const getServerSettings = async (): Promise<AllSettings> => {
  const mirthApiClient = getMirthApiClient();
  try {

    // Try to get settings from configuration map
    const response = await mirthApiClient.get('/server/configurationMap');
    const configMap = response.data.map?.entry || [];

    // Parse settings from configuration map entries
    const settings: Partial<AllSettings> = {};

    configMap.forEach((entry: any) => {
      // Handle both new format (ConfigurationProperty) and legacy format (array)
      let key: string;
      let value: string;

      if (entry.string && entry['com.mirth.connect.util.ConfigurationProperty']) {
        // New ConfigurationProperty format
        key = entry.string;
        value = entry['com.mirth.connect.util.ConfigurationProperty'].value;
      } else if (entry.string && entry.string.length === 2) {
        // Legacy array format for backwards compatibility
        [key, value] = entry.string;
      } else {
        return; // Skip entries that don't match expected format
      }

      // Parse system preferences
      if (key.startsWith('system.')) {
        if (!settings.systemPrefs) settings.systemPrefs = {} as SystemPreferences;
        const settingKey = key.replace('system.', '') as keyof SystemPreferences;
        (settings.systemPrefs as any)[settingKey] = value;
      }

      // Parse user preferences
      else if (key.startsWith('user.')) {
        if (!settings.userPrefs) settings.userPrefs = {} as UserPreferences;
        const settingKey = key.replace('user.', '') as keyof UserPreferences;
        (settings.userPrefs as any)[settingKey] = value;
      }

      // Parse code editor preferences
      else if (key.startsWith('codeEditor.')) {
        if (!settings.codeEditorPrefs) settings.codeEditorPrefs = {} as CodeEditorPreferences;
        const settingKey = key.replace('codeEditor.', '') as keyof CodeEditorPreferences;
        const parsedValue = key.includes('wordWrap') || key.includes('autoComplete') ||
                            key.includes('showLineNumbers') || key.includes('showGutter') ||
                            key.includes('highlightActiveLine') || key.includes('showInvisibles')
                            ? value === 'true' : value;
        (settings.codeEditorPrefs as any)[settingKey] = parsedValue;
      }
    });

    // Merge with defaults for any missing settings
    return {
      systemPrefs: {
        ...DEFAULT_SETTINGS.systemPrefs,
        dashboardRefreshInterval: settings.dashboardRefreshInterval || DEFAULT_SETTINGS.systemPrefs.dashboardRefreshInterval,
        messageBrowserPageSize: settings.messageBrowserPageSize || DEFAULT_SETTINGS.systemPrefs.messageBrowserPageSize,
        eventBrowserPageSize: settings.eventBrowserPageSize || DEFAULT_SETTINGS.systemPrefs.eventBrowserPageSize
      },
      userPrefs: { ...DEFAULT_SETTINGS.userPrefs },
      codeEditorPrefs: { ...DEFAULT_SETTINGS.codeEditorPrefs }
    };
  } catch (error) {
    console.warn('Failed to load settings from server, using defaults:', error);
    return DEFAULT_SETTINGS;
  }
};

/**
 * Save server settings
 * This saves settings to the configuration map
 */
export const saveServerSettings = async (settings: AllSettings): Promise<void> => {
  const mirthApiClient = getMirthApiClient();
  try {
    // Get current configuration map
    const response = await mirthApiClient.get('/server/configurationMap');
    const currentConfigMap = response.data.map?.entry || [];

    // Remove existing settings entries
    const nonSettingsEntries = currentConfigMap.filter((entry: any) => {
      let key: string;

      if (entry.string && entry['com.mirth.connect.util.ConfigurationProperty']) {
        // New ConfigurationProperty format
        key = entry.string;
      } else if (entry.string && entry.string.length === 2) {
        // Legacy array format
        [key] = entry.string;
      } else {
        return true; // Keep entries that don't match expected format
      }

      return !key.startsWith('system.') && !key.startsWith('user.') && !key.startsWith('codeEditor.');
    });

    // Convert settings to configuration map entries
    const settingsEntries: any[] = [];

    // System preferences
    Object.entries(settings.systemPrefs).forEach(([key, value]) => {
      settingsEntries.push({
        string: `system.${key}`,
        'com.mirth.connect.util.ConfigurationProperty': {
          value: value.toString(),
          comment: `System preference: ${key}`
        }
      });
    });

    // User preferences
    Object.entries(settings.userPrefs).forEach(([key, value]) => {
      settingsEntries.push({
        string: `user.${key}`,
        'com.mirth.connect.util.ConfigurationProperty': {
          value: value.toString(),
          comment: `User preference: ${key}`
        }
      });
    });

    // Code editor preferences
    Object.entries(settings.codeEditorPrefs).forEach(([key, value]) => {
      settingsEntries.push({
        string: `codeEditor.${key}`,
        'com.mirth.connect.util.ConfigurationProperty': {
          value: value.toString(),
          comment: `Code editor preference: ${key}`
        }
      });
    });

    // Combine all entries
    const allEntries = [...nonSettingsEntries, ...settingsEntries];

    // Save back to configuration map
    await mirthApiClient.put('/server/configurationMap', {
      map: {
        entry: allEntries
      }
    });

    console.log('Settings saved successfully');

  } catch (error) {
    console.error('Failed to save settings:', error);
    throw new Error('Failed to save settings. Please try again.');
  }
};

/**
 * Get server information (for additional context)
 */
export const getServerInfo = async () => {
  const mirthApiClient = getMirthApiClient();
  try {
    const response = await mirthApiClient.get('/server/info');
    return response.data;
  } catch (error: any) {
    // Silently return null for non-existent endpoints
    if (error.response?.status === 404 || error.response?.status === 406) {
      return null;
    }
    console.warn('Failed to get server info:', error);
    return null;
  }
};

/**
 * Get server version
 */
export const getServerVersion = async () => {
  const mirthApiClient = getMirthApiClient();
  try {
    const response = await mirthApiClient.get('/server/version');
    return response.data;
  } catch (error: any) {
    // Silently return null for non-existent endpoints
    if (error.response?.status === 404 || error.response?.status === 406) {
      return null;
    }
    console.warn('Failed to get server version:', error);
    return null;
  }
};

/**
 * Reset settings to default values
 */
export const resetSettingsToDefaults = async (): Promise<void> => {
  await saveServerSettings(DEFAULT_SETTINGS);
};

/**
 * Get current user info (for user-specific settings)
 */
export const getCurrentUser = async () => {
  const mirthApiClient = getMirthApiClient();
  try {
    const response = await mirthApiClient.get('/users/current');

    // Handle nested user object structure from Wireshark data
    // Response format: {"user":{"id":1,"username":"admin",...}}
    const responseData = response.data;
    if (responseData?.user) {
      // Return the nested user object with id accessible as user.id
      return responseData.user;
    }

    // Fallback to direct response data if not nested
    return responseData;
  } catch (error) {
    console.warn('Failed to get current user:', error);
    return null;
  }
};

// Get all user preferences for the current user
export const getUserPreferences = async () => {
  const mirthApiClient = getMirthApiClient();
  const user = await getCurrentUser();
  if (!user?.id) throw new Error('No current user');
  const response = await mirthApiClient.get(`/users/${user.id}/preferences`);
  return response.data;
};

// Save all user preferences for the current user
export const saveUserPreferences = async (prefs: Record<string, string>) => {
  const mirthApiClient = getMirthApiClient();
  const user = await getCurrentUser();
  if (!user?.id) throw new Error('No current user');
  await mirthApiClient.put(`/users/${user.id}/preferences`, prefs);
};

// Server configuration API response types
export interface ServerSettingsResponse {
  serverSettings: {
    environmentName: string;
    serverName: string;
    clearGlobalMap: boolean;
    queueBufferSize?: number; // Corrected field name from XML
    defaultMetaDataColumns: {
      metaDataColumn: Array<{
        name: string;
        type: string;
        mappingName: string;
      }>;
    };
    defaultAdministratorBackgroundColor: {
      red: number;
      green: number;
      blue: number;
      alpha: number;
    };
    smtpHost: string | null;
    smtpPort: string | null;
    smtpTimeout: number;
    smtpFrom: string | null;
    smtpUsername: string | null;
    smtpPassword: string | null;
    smtpSecure?: string; // Corrected field name from XML
    smtpAuth?: boolean; // Corrected data type from XML
    loginNotificationEnabled: boolean;
    loginNotificationMessage: string | null;
    administratorAutoLogoutIntervalEnabled: boolean;
    administratorAutoLogoutIntervalField: number;
  };
}

export interface ServerUpdateSettingsResponse {
  updateSettings: {
    '@version': string;
    statsEnabled?: boolean; // Added field from XML for usage statistics
  };
}

// UI form data structure for ServerTab
export interface ServerFormData {
  environmentName: string;
  serverName: string;
  defaultBackgroundColor: string;
  provideUsageStatistics: string;
  enableAutoLogout: string;
  autoLogoutInterval: string;
  clearGlobalMapOnRedeploy: string;
  defaultQueueBufferSize: string;
  metadataColumns: {
    source: boolean;
    type: boolean;
    version: boolean;
  };
  smtpHost: string;
  smtpPort: string;
  sendTimeout: string;
  defaultFromAddress: string;
  secureConnection: string;
  requireAuthentication: string;
  username: string;
  password: string;
  requireLoginNotification: string;
  loginNotification: string;
}

/**
 * Convert RGBA color object to hex string
 */
const rgbaToHex = (color: { red: number; green: number; blue: number; alpha: number }): string => {
  const toHex = (n: number) => {
    const hex = Math.max(0, Math.min(255, Math.round(n))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(color.red)}${toHex(color.green)}${toHex(color.blue)}`;
};

/**
 * Transform metadata columns array to UI checkbox state
 */
const transformMetadataColumns = (metaDataColumns: any) => {
  // Handle null/undefined metaDataColumns
  if (!metaDataColumns) {
    console.warn('metaDataColumns is null/undefined, using defaults');
    return {
      source: false,
      type: false,
      version: false
    };
  }

  // Extract columns array with proper validation
  let columns = metaDataColumns?.metaDataColumn;

  // Handle case where metaDataColumn might not exist or not be an array
  if (!columns) {
    console.warn('metaDataColumn not found in metaDataColumns, using defaults');
    return {
      source: false,
      type: false,
      version: false
    };
  }

  // Ensure columns is an array
  if (!Array.isArray(columns)) {
    console.warn('metaDataColumn is not an array:', typeof columns, columns);
    // Try to convert single object to array
    if (typeof columns === 'object') {
      columns = [columns];
    } else {
      return {
        source: false,
        type: false,
        version: false
      };
    }
  }

  console.log('Processing metadata columns:', columns);

  return {
    source: columns.some((col: any) => col?.name === 'SOURCE'),
    type: columns.some((col: any) => col?.name === 'TYPE'),
    version: columns.some((col: any) => col?.name === 'VERSION')
  };
};

/**
 * Transform server settings API response to UI form data
 */
export const transformServerSettingsToFormData = (
  serverResponse: ServerSettingsResponse,
  updateResponse: ServerUpdateSettingsResponse
): ServerFormData => {
  const settings = serverResponse.serverSettings;
  const updateSettings = updateResponse.updateSettings;

  console.log('Transforming server settings to form data:', settings);
  console.log('Update settings data:', updateSettings);
  console.log('SMTP Secure value from API:', settings.smtpSecure);

  // Map API secure connection values to UI values
  const mapApiSecureConnectionToUI = (apiValue: string | null | undefined): string => {
    if (!apiValue) return 'none';

    const normalizedValue = apiValue.toLowerCase();
    switch (normalizedValue) {
      case 'tls':
        return 'starttls';
      case 'ssl':
        return 'ssl';
      default:
        return 'none';
    }
  };

  return {
    environmentName: settings.environmentName || '',
    serverName: settings.serverName || '',
    defaultBackgroundColor: rgbaToHex(settings.defaultAdministratorBackgroundColor),
    // Map from updateSettings.statsEnabled (boolean) to UI string
    provideUsageStatistics: updateSettings?.statsEnabled ? 'yes' : 'no',
    enableAutoLogout: settings.administratorAutoLogoutIntervalEnabled ? 'yes' : 'no',
    autoLogoutInterval: settings.administratorAutoLogoutIntervalField?.toString() || '5',
    clearGlobalMapOnRedeploy: settings.clearGlobalMap ? 'yes' : 'no',
    // Map from queueBufferSize (correct XML field name)
    defaultQueueBufferSize: settings.queueBufferSize?.toString() || '1000',
    metadataColumns: transformMetadataColumns(settings.defaultMetaDataColumns),
    smtpHost: settings.smtpHost || '',
    smtpPort: settings.smtpPort || '',
    sendTimeout: settings.smtpTimeout?.toString() || '5000',
    defaultFromAddress: settings.smtpFrom || '',
    // Map API secure connection value to UI value
    secureConnection: mapApiSecureConnectionToUI(settings.smtpSecure),
    // Map from smtpAuth (boolean) to UI string
    requireAuthentication: settings.smtpAuth ? 'yes' : 'no',
    username: settings.smtpUsername || '',
    password: settings.smtpPassword || '',
    requireLoginNotification: settings.loginNotificationEnabled ? 'yes' : 'no',
    loginNotification: settings.loginNotificationMessage || ''
  };
};

/**
 * Get server configuration settings
 */
export const getServerConfiguration = async (): Promise<ServerSettingsResponse> => {
  const mirthApiClient = getMirthApiClient();
  try {
    const response = await mirthApiClient.get('/server/settings', {
      headers: {
        'Accept': 'application/json'
      }
    });

    console.log('Server settings API response:', response.data);

    // Validate response structure
    if (!response.data || !response.data.serverSettings) {
      console.warn('Invalid server settings response structure:', response.data);
      throw new Error('Invalid server configuration response format');
    }

    return response.data;

  } catch (error: any) {
    console.error('Failed to load server configuration:', error);

    // Handle specific error cases
    if (error.response?.status === 404) {
      throw new Error('Server configuration endpoint not found');
    } else if (error.response?.status === 403) {
      throw new Error('Access denied. Please check your permissions.');
    } else if (error.response?.status >= 500) {
      throw new Error('Server error. Please try again later.');
    }

    throw new Error('Failed to load server configuration. Please try again.');
  }
};

/**
 * Get server update settings
 */
export const getServerUpdateSettings = async (): Promise<ServerUpdateSettingsResponse> => {
  const mirthApiClient = getMirthApiClient();
  try {
    const response = await mirthApiClient.get('/server/updateSettings', {
      headers: {
        'Accept': 'application/json'
      }
    });

    console.log('Server update settings API response:', response.data);

    // Ensure we have the expected structure
    if (!response.data || !response.data.updateSettings) {
      console.warn('Invalid update settings response structure, using defaults');
      return {
        updateSettings: {
          '@version': 'Unknown',
          statsEnabled: false
        }
      };
    }

    return response.data;

  } catch (error: any) {
    console.error('Failed to load server update settings:', error);

    // Silently handle missing endpoint - this is optional data
    if (error.response?.status === 404 || error.response?.status === 406) {
      console.warn('Server update settings endpoint not available, using defaults');
      return {
        updateSettings: {
          '@version': 'Unknown',
          statsEnabled: false
        }
      };
    }

    // For other errors, return default but log warning
    console.warn('Server update settings failed, using defaults:', error.message);
    return {
      updateSettings: {
        '@version': 'Unknown',
        statsEnabled: false
      }
    };
  }
};

/**
 * Load complete server configuration data
 */
export const loadServerConfigurationData = async (): Promise<ServerFormData> => {
  try {
    console.log('Loading server configuration data...');

    // Load both APIs in parallel
    const [serverSettings, updateSettings] = await Promise.all([
      getServerConfiguration(),
      getServerUpdateSettings()
    ]);

    // Validate server settings structure
    if (!serverSettings?.serverSettings) {
      console.error('Invalid server settings structure:', serverSettings);
      throw new Error('Invalid server configuration data received');
    }

    // Transform API responses to UI form data
    const formData = transformServerSettingsToFormData(serverSettings, updateSettings);

    console.log('Server configuration loaded and transformed:', formData);
    return formData;

  } catch (error: any) {
    console.error('Failed to load server configuration data:', error);

    // Provide more specific error messages
    if (error.message?.includes('Invalid server configuration')) {
      throw new Error('Server returned invalid configuration data. Please contact administrator.');
    }

    throw error;
  }
};

/**
 * Transform UI form data back to server settings API format
 */
export const transformFormDataToServerSettings = (formData: ServerFormData) => {
  // Convert hex color back to RGBA
  const hexToRgba = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      red: parseInt(result[1], 16),
      green: parseInt(result[2], 16),
      blue: parseInt(result[3], 16),
      alpha: 255
    } : { red: 240, green: 240, blue: 240, alpha: 255 };
  };

  // Transform metadata columns back to API format
  const transformMetadataColumnsToApi = (metadataColumns: { source: boolean; type: boolean; version: boolean }) => {
    const columns = [];
    if (metadataColumns.source) {
      columns.push({ name: 'SOURCE', type: 'STRING', mappingName: 'mirth_source' });
    }
    if (metadataColumns.type) {
      columns.push({ name: 'TYPE', type: 'STRING', mappingName: 'mirth_type' });
    }
    if (metadataColumns.version) {
      columns.push({ name: 'VERSION', type: 'STRING', mappingName: 'mirth_version' });
    }
    return { metaDataColumn: columns };
  };

  // Map UI secure connection values to API values
  const mapUISecureConnectionToApi = (uiValue: string): string | null => {
    switch (uiValue) {
      case 'starttls':
        return 'TLS';
      case 'ssl':
        return 'SSL';
      case 'none':
      default:
        return null;
    }
  };

  return {
    serverSettings: {
      environmentName: formData.environmentName,
      serverName: formData.serverName,
      clearGlobalMap: formData.clearGlobalMapOnRedeploy === 'yes',
      queueBufferSize: parseInt(formData.defaultQueueBufferSize) || 1000,
      defaultMetaDataColumns: transformMetadataColumnsToApi(formData.metadataColumns),
      defaultAdministratorBackgroundColor: hexToRgba(formData.defaultBackgroundColor),
      smtpHost: formData.smtpHost || null,
      smtpPort: formData.smtpPort || null,
      smtpTimeout: parseInt(formData.sendTimeout) || 5000,
      smtpFrom: formData.defaultFromAddress || null,
      // Map UI secure connection value to API value
      smtpSecure: mapUISecureConnectionToApi(formData.secureConnection),
      smtpAuth: formData.requireAuthentication === 'yes',
      smtpUsername: formData.username || null,
      smtpPassword: formData.password || null,
      loginNotificationEnabled: formData.requireLoginNotification === 'yes',
      loginNotificationMessage: formData.loginNotification || null,
      administratorAutoLogoutIntervalEnabled: formData.enableAutoLogout === 'yes',
      administratorAutoLogoutIntervalField: parseInt(formData.autoLogoutInterval) || 5
    },
    updateSettings: {
      '@version': '4.5.2',
      statsEnabled: formData.provideUsageStatistics === 'yes'
    }
  };
};

/**
 * Save server configuration settings
 */
export const saveServerConfiguration = async (formData: ServerFormData): Promise<void> => {
  try {
    const { serverSettings, updateSettings } = transformFormDataToServerSettings(formData);
    const mirthApiClient = getMirthApiClient();
    console.log('Saving server settings:', serverSettings);
    console.log('Saving update settings:', updateSettings);

    // Save both endpoints as shown in Wireshark capture
    await Promise.all([
      mirthApiClient.put('/server/settings', { serverSettings }),
      mirthApiClient.put('/server/updateSettings', { updateSettings })
    ]);

    console.log('Server configuration saved successfully');

  } catch (error: any) {
    console.error('Failed to save server configuration:', error);
    throw new Error('Failed to save server configuration. Please try again.');
  }
};
