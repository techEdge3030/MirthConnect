import axios from 'axios';
import { getRuntimeConfig } from '../providers/ConfigProvider';
import { logout } from './logout';

// Separate function for auth error logout to avoid recursion
async function handleAuthErrorLogout() {
  try {
    // Call logout API directly without going through the main logout function
    const { logout: logoutApi } = await import('../services');
    await logoutApi();
    console.log('Auth error logout completed successfully');
  } catch (error) {
    console.error('Auth error logout failed:', error);
  }
  
  // Get the configured base URL and redirect to login
  const { UI_CONTEXT_PATH } = getRuntimeConfig();
  const loginUrl = UI_CONTEXT_PATH ? `${UI_CONTEXT_PATH.replace(/\/$/, '')}/` : '/';
  window.location.href = loginUrl;
}

export function getMirthApiClient() {
  const { MIRTH_API_URL } = getRuntimeConfig();
  const mirthApiClient = axios.create({ 
    baseURL: MIRTH_API_URL,
    withCredentials: true
  });

  mirthApiClient.interceptors.request.use(config => {
    const headers: any = {};

    // Only use defaults if not specified - preserve explicitly set headers
    headers.Accept = config.headers?.Accept || 'application/json';
    headers['X-Requested-With'] = config.headers?.['X-Requested-With'] || 'OpenAPI';

    // IMPORTANT: Only set default Content-Type if not explicitly provided
    // This preserves text/plain for user preferences API calls
    if (config.headers?.['Content-Type']) {
      headers['Content-Type'] = config.headers['Content-Type'];
    } else {
      headers['Content-Type'] = 'application/json';
    }

    headers.multipart = config.headers?.multipart;

    for (const key of Object.keys(headers)) {
      config.headers[key] = headers[key];
    }
    config.headers.Headers = JSON.stringify(headers);

    // Enhanced logging for debugging
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    if (config.url?.includes('/preferences/')) {
      console.log('DEBUG - Preferences API call:', {
        url: config.url,
        method: config.method,
        headers: headers,
        data: config.data,
        dataType: typeof config.data
      });
    }

    return config;
  });

  mirthApiClient.interceptors.response.use(
    (response) => {
      // Log successful responses for debugging
      console.log(`API Response: ${response.status} ${response.config.url}`);
      return response;
    },
    async (error) => {
      // Log error responses for debugging
      console.error(`API Error: ${error.response?.status || 'Network Error'} ${error.config?.url}`, {
        message: error.message,
        data: error.response?.data
      });
      
      // Handle authentication errors (401, 403) but skip logout endpoint itself
      // Also skip if we're already on the login page to prevent infinite loops
      const currentPath = window.location.pathname;
      const isLoginPage = currentPath === '/' || 
                         currentPath.endsWith('/') || 
                         currentPath.includes('/login');
      
      if ((error.response?.status === 401 || error.response?.status === 403) && 
          !error.config?.url?.includes('/_logout') &&
          !isLoginPage) {
        console.log('Authentication error detected, logging out...');
        // Use separate function to avoid recursion
        handleAuthErrorLogout();
      }
      
      return Promise.reject(error);
    }
  );

  return mirthApiClient;
}
