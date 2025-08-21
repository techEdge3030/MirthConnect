import { getMirthApiClient } from '../utils/api';

// Types for Administrator tab preferences
export interface UserPreferences {
  checkForNewNotificationsOnLogin: string;
  administratorBackgroundColor: string;
  customBackgroundColor: string;
}

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

// Default values for Administrator tab
export const DEFAULT_ADMIN_PREFERENCES = {
  userPrefs: {
    checkForNewNotificationsOnLogin: 'yes',
    administratorBackgroundColor: 'server-default',
    customBackgroundColor: '#4080c0'
  },
  systemPrefs: {
    dashboardRefreshInterval: '10',
    messageBrowserPageSize: '20',
    eventBrowserPageSize: '100',
    formatTextInMessageBrowser: 'yes',
    messageBrowserTextSearchConfirmation: 'yes',
    filterTransformerIteratorDialog: 'yes',
    messageBrowserAttachmentTypeDialog: 'yes',
    reprocessRemoveMessagesConfirmation: 'yes',
    importCodeTemplateLibrariesWithChannels: 'yes',
    exportCodeTemplateLibrariesWithChannels: 'yes'
  }
};

/**
 * Get current user info for API calls
 */
export const getCurrentUser = async () => {
  const mirthApiClient = getMirthApiClient();
  try {
    const response = await mirthApiClient.get('/users/current');

    // Debug: Log the actual response structure
    console.log('getCurrentUser response structure:', {
      status: response.status,
      data: response.data,
      dataType: typeof response.data,
      dataKeys: response.data ? Object.keys(response.data) : 'null',
      fullResponse: response
    });

    // Extract user data from nested response structure
    // Wireshark shows: {"user":{"id":1,"username":"admin",...}}
    const responseData = response.data;
    let userId = null;
    let userData = null;

    if (responseData) {
      // Handle nested user object structure from Wireshark data
      userData = responseData.user || responseData;
      userId = userData?.id;

      console.log('User ID extraction attempts:', {
        'responseData.user?.id': responseData.user?.id,
        'responseData.id': responseData.id,
        'userData.id': userData?.id,
        'finalUserId': userId
      });
    }

    return response.data;
  } catch (error) {
    console.warn('Failed to get current user:', error);
    throw new Error('Unable to get current user information');
  }
};

/**
 * Convert hex color to XML format for API
 */
export const hexToXmlColor = (hexColor: string): string => {
  // Remove # if present
  const hex = hexColor.replace('#', '');
  
  // Parse RGB values
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  return `<awt-color>
  <red>${r}</red>
  <green>${g}</green>
  <blue>${b}</blue>
  <alpha>255</alpha>
</awt-color>`;
};

/**
 * Convert XML color format to hex
 */
export const xmlColorToHex = (xmlColor: string): string => {
  try {
    // Extract RGB values from XML
    const redMatch = xmlColor.match(/<red>(\d+)<\/red>/);
    const greenMatch = xmlColor.match(/<green>(\d+)<\/green>/);
    const blueMatch = xmlColor.match(/<blue>(\d+)<\/blue>/);
    
    if (!redMatch || !greenMatch || !blueMatch) {
      console.warn('Invalid XML color format, using default');
      return '#4080c0';
    }
    
    const r = parseInt(redMatch[1]);
    const g = parseInt(greenMatch[1]);
    const b = parseInt(blueMatch[1]);
    
    // Convert to hex
    const toHex = (n: number) => n.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  } catch (error) {
    console.warn('Error parsing XML color, using default:', error);
    return '#4080c0';
  }
};

/**
 * Get user preferences from API
 * Uses individual preference endpoints as shown in Wireshark data
 */
export const getUserPreferences = async (): Promise<UserPreferences> => {
  const mirthApiClient = getMirthApiClient();
  
  try {
    const user = await getCurrentUser();

    // Extract user ID using same logic as getCurrentUser
    let userId = null;
    let userData = null;

    if (user) {
      // Handle nested user object structure
      userData = user.user || user;
      userId = userData?.id;

      // If still no ID, try to extract from username or other fields
      if (!userId && userData?.username) {
        console.warn('No user ID found, using default ID 1 for user:', userData.username);
        userId = '1';
      }
    }

    if (!userId) {
      throw new Error('No current user ID available');
    }

    console.log('Loading user preferences for user ID:', userId);

    // Call individual preference endpoints as shown in Wireshark data
    // Use text/plain Accept header as shown in Wireshark
    const [notificationsResponse, backgroundColorResponse] = await Promise.all([
      mirthApiClient.get(`/users/${userId}/preferences/checkForNotifications`, {
        headers: {
          'Accept': 'text/plain',
          'X-Requested-With': 'nextgen-connect-client'
        }
      }),
      mirthApiClient.get(`/users/${userId}/preferences/backgroundColor`, {
        headers: {
          'Accept': 'text/plain',
          'X-Requested-With': 'nextgen-connect-client'
        }
      })
    ]);

    console.log('Notifications response:', notificationsResponse.data);
    console.log('Background color response:', backgroundColorResponse.data);

    // Parse responses
    const checkForNotifications = notificationsResponse.data === 'true' || notificationsResponse.data === true ? 'yes' : 'no';
    
    // Handle background color - could be XML format or simple value
    let customBackgroundColor = DEFAULT_ADMIN_PREFERENCES.userPrefs.customBackgroundColor;
    let administratorBackgroundColor = 'server-default';
    
    if (backgroundColorResponse.data && typeof backgroundColorResponse.data === 'string') {
      if (backgroundColorResponse.data.includes('<awt-color>')) {
        // XML format - convert to hex
        customBackgroundColor = xmlColorToHex(backgroundColorResponse.data);
        administratorBackgroundColor = 'custom';
      } else if (backgroundColorResponse.data.startsWith('#')) {
        // Already hex format
        customBackgroundColor = backgroundColorResponse.data;
        administratorBackgroundColor = 'custom';
      }
    }

    return {
      checkForNewNotificationsOnLogin: checkForNotifications,
      administratorBackgroundColor,
      customBackgroundColor
    };

  } catch (error: any) {
    console.error('Failed to load user preferences:', error);
    
    // Return defaults on error to prevent UI breakage
    console.log('Using default user preferences due to API error');
    return DEFAULT_ADMIN_PREFERENCES.userPrefs;
  }
};

/**
 * Save user preferences to API
 * Uses individual preference endpoints with proper content types
 */
export const saveUserPreferences = async (preferences: UserPreferences): Promise<void> => {
  const mirthApiClient = getMirthApiClient();
  
  try {
    const user = await getCurrentUser();

    // Extract user ID using same logic as getCurrentUser
    let userId = null;
    let userData = null;

    if (user) {
      // Handle nested user object structure
      userData = user.user || user;
      userId = userData?.id;

      // If still no ID, try to extract from username or other fields
      if (!userId && userData?.username) {
        console.warn('No user ID found, using default ID 1 for user:', userData.username);
        userId = '1';
      }
    }

    if (!userId) {
      throw new Error('No current user ID available');
    }

    console.log('Saving user preferences for user ID:', userId, preferences);

    // Prepare data for API calls
    const notificationValue = preferences.checkForNewNotificationsOnLogin === 'yes' ? 'true' : 'false';

    // Prepare background color data based on Wireshark analysis
    let backgroundColorData: string;
    if (preferences.administratorBackgroundColor === 'custom') {
      // Convert hex to XML format as shown in Wireshark data
      backgroundColorData = hexToXmlColor(preferences.customBackgroundColor);
    } else {
      // Server default - send <null/> XML format as shown in Wireshark
      backgroundColorData = '<null/>';
    }

    // DEBUG: Log the prepared values
    console.log('DEBUG - Prepared API values:', {
      notificationValue,
      backgroundColorData,
      notificationValueType: typeof notificationValue,
      backgroundColorDataType: typeof backgroundColorData,
      originalPreferences: preferences
    });

    // Make individual API calls as shown in Wireshark data
    // ALWAYS save both checkForNotifications AND backgroundColor
    const savePromises = [
      mirthApiClient.put(`/users/${userId}/preferences/checkForNotifications`, notificationValue, {
        headers: {
          'Content-Type': 'text/plain',
          'Accept': 'application/xml',
          'X-Requested-With': 'nextgen-connect-client'
        }
      }),
      mirthApiClient.put(`/users/${userId}/preferences/backgroundColor`, backgroundColorData, {
        headers: {
          'Content-Type': 'text/plain',
          'Accept': 'application/xml',
          'X-Requested-With': 'nextgen-connect-client'
        }
      })
    ];

    await Promise.all(savePromises);
    console.log('User preferences saved successfully');

  } catch (error: any) {
    console.error('Failed to save user preferences:', error);
    throw new Error(`Failed to save user preferences: ${error.message}`);
  }
};

/**
 * Get system preferences from localStorage
 */
export const getSystemPreferences = (): SystemPreferences => {
  try {
    const stored = localStorage.getItem('mirth-admin-system-prefs');
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_ADMIN_PREFERENCES.systemPrefs, ...parsed };
    }
  } catch (error) {
    console.warn('Failed to load system preferences from localStorage:', error);
  }
  
  return DEFAULT_ADMIN_PREFERENCES.systemPrefs;
};

/**
 * Save system preferences to localStorage
 */
export const saveSystemPreferences = (preferences: SystemPreferences): void => {
  try {
    localStorage.setItem('mirth-admin-system-prefs', JSON.stringify(preferences));
    console.log('System preferences saved to localStorage');
  } catch (error) {
    console.error('Failed to save system preferences to localStorage:', error);
    throw new Error('Failed to save system preferences');
  }
};

/**
 * Restore Administrator preferences to default values
 * Based on Wireshark analysis - sends default values to API and refreshes
 */
export const restoreAdministratorDefaults = async (): Promise<{ systemPrefs: SystemPreferences; userPrefs: UserPreferences }> => {
  const mirthApiClient = getMirthApiClient();

  try {
    console.log('Restoring Administrator preferences to defaults...');

    // Get current user for API calls
    const user = await getCurrentUser();

    // Extract user ID using same logic as other functions
    let userId = null;
    let userData = null;

    if (user) {
      userData = user.user || user;
      userId = userData?.id;

      if (!userId && userData?.username) {
        console.warn('No user ID found, using default ID 1 for user:', userData.username);
        userId = '1';
      }
    }

    if (!userId) {
      throw new Error('No current user ID available');
    }

    console.log('Restoring defaults for user ID:', userId);

    // Step 1: PUT default values to user preferences API (as shown in Wireshark)
    const defaultUserPrefs = DEFAULT_ADMIN_PREFERENCES.userPrefs;

    // Prepare default values for API calls
    const defaultNotificationValue = defaultUserPrefs.checkForNewNotificationsOnLogin === 'yes' ? 'true' : 'false';
    const defaultBackgroundColorValue = '<null/>'; // Server Default as shown in Wireshark

    console.log('Sending default values to API:', {
      checkForNotifications: defaultNotificationValue,
      backgroundColor: defaultBackgroundColorValue
    });

    // Send default values to API (PUT operations)
    await Promise.all([
      mirthApiClient.put(`/users/${userId}/preferences/checkForNotifications`, defaultNotificationValue, {
        headers: {
          'Content-Type': 'text/plain',
          'Accept': 'application/xml',
          'X-Requested-With': 'nextgen-connect-client'
        }
      }),
      mirthApiClient.put(`/users/${userId}/preferences/backgroundColor`, defaultBackgroundColorValue, {
        headers: {
          'Content-Type': 'text/plain',
          'Accept': 'application/xml',
          'X-Requested-With': 'nextgen-connect-client'
        }
      })
    ]);

    console.log('Default values sent to API successfully');

    // Step 2: GET updated values from API to refresh UI
    console.log('Fetching updated values from API...');
    const updatedUserPrefs = await getUserPreferences();

    // Step 3: Reset system preferences to defaults in localStorage
    const defaultSystemPrefs = DEFAULT_ADMIN_PREFERENCES.systemPrefs;
    saveSystemPreferences(defaultSystemPrefs);

    console.log('Administrator preferences restored to defaults successfully');

    return {
      systemPrefs: defaultSystemPrefs,
      userPrefs: updatedUserPrefs
    };

  } catch (error: any) {
    console.error('Failed to restore Administrator defaults:', error);
    throw new Error(`Failed to restore defaults: ${error.message}`);
  }
};
