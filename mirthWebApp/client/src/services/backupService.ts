import { getMirthApiClient } from '../utils/api';

/**
 * Get server configuration data as XML
 */
export const getServerConfiguration = async (): Promise<string> => {
  const mirthApiClient = getMirthApiClient();
  try {
    console.log('Fetching server configuration as XML...');
    
    const response = await mirthApiClient.get('/server/configuration', {
      params: {
        pollingOnly: false,
        disableAlerts: false
      },
      headers: {
        'Accept': 'application/xml',
        'X-Requested-With': 'nextgen-connect-client'
      }
    });
    
    console.log('XML Response type:', typeof response.data);
    console.log('XML Response headers:', response.headers);
    
    // Received XML as a string
    if (typeof response.data !== 'string') {
      throw new Error('Server did not return XML format as expected');
    }
    
    console.log('XML configuration retrieved successfully');
    return response.data;
    
  } catch (error: any) {
    console.error('Failed to get server configuration:', error);
    throw new Error(error.response?.data?.message || 'Failed to retrieve server configuration');
  }
};

/**
 * Create and download backup file using server configuration XML
 */
export const createBackup = async (filename: string): Promise<void> => {
  try {
    console.log('backupService: createBackup called with filename:', filename);
    console.log('backupService: Starting backup creation...');
    
    // Get server configuration as XML directly
    const serverConfigXML = await getServerConfiguration();
    
    console.log('backupService: Server config type:', typeof serverConfigXML);
    console.log('backupService: Server config content preview:', serverConfigXML.substring(0, 100));
    
    // Ensure we have a string
    if (typeof serverConfigXML !== 'string') {
      throw new Error('Server configuration is not a string');
    }
    
    let xmlContent = serverConfigXML;
    
    // Ensure XML declaration if not present
    if (!xmlContent.startsWith('<?xml') && xmlContent.includes('<')) {
      xmlContent = `<?xml version="1.0" encoding="UTF-8"?>\n${xmlContent}`;
    }
    
    console.log('backupService: Creating blob and download link...');
    
    // Create blob and download
    const blob = new Blob([xmlContent], { type: 'application/xml' });
    const url = window.URL.createObjectURL(blob);
    
    // Create temporary download link
    const link = document.createElement('a');
    link.href = url;
    link.download = filename.endsWith('.xml') ? filename : `${filename}.xml`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    console.log('backupService: Backup created successfully:', filename);
    
  } catch (error: any) {
    console.error('backupService: Backup creation failed:', error);
    throw new Error(error.message || 'Failed to create backup');
  }
};

/**
 * Restore server configuration from XML file using 4-step API sequence
 */
export const restoreServerConfiguration = async (
  xmlContent: string,
  options: { deployAllChannels: boolean; overwriteConfigMap: boolean }
): Promise<void> => {
  const mirthApiClient = getMirthApiClient();
  
  try {
    // GET /alerts/statuses 
    await mirthApiClient.get('/alerts/statuses', {
      headers: {
        'Accept': 'application/xml',
        'X-Requested-With': 'nextgen-connect-client'
      }
    });
    
    // GET /server/settings
    await mirthApiClient.get('/server/settings', {
      headers: {
        'Accept': 'application/xml',
        'X-Requested-With': 'nextgen-connect-client'
      }
    });
    
    // GET /server/updateSettings
    await mirthApiClient.get('/server/updateSettings', {
      headers: {
        'Accept': 'application/xml',
        'X-Requested-With': 'nextgen-connect-client'
      }
    });
    
    // PUT /server/configuration
    console.log('Restoring configuration with options============>', options);
    await mirthApiClient.put('/server/configuration', xmlContent, {
      params: {
        deploy: options.deployAllChannels,
        overwriteConfigMap: options.overwriteConfigMap
      },
      headers: {
        'Content-Type': 'application/xml',
        'Accept': 'application/xml',
        'X-Requested-With': 'nextgen-connect-client'
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });
    
    console.log('Configuration restored successfully');
    
  } catch (error: any) {
    console.error('Failed to restore configuration:', error);
    throw new Error(error.response?.data?.message || 'Failed to restore server configuration');
  }
};
