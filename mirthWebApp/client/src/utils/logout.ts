import { logout as logoutApi } from '../services';
import { getRuntimeConfig } from '../providers/ConfigProvider';

export async function logout() {
  try {
    // Call the logout API to invalidate the session on the server
    await logoutApi();
    console.log('Logout API call completed successfully');
  } catch (error) {
    console.error('Logout failed:', error);
  }
  
  // Try to clear the JSESSIONID cookie (only works for non-HttpOnly cookies)
  // HttpOnly cookies must be cleared by the server via Set-Cookie header
  try {
    document.cookie = 'JSESSIONID=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  } catch (error) {
    console.log('Could not clear JSESSIONID cookie (likely HttpOnly)');
  }
  
  // Get the configured base URL and redirect to login
  // Use the current path to detect the base URL if config isn't available
  const { UI_CONTEXT_PATH } = getRuntimeConfig();
  console.log('UI_CONTEXT_PATH from config:', UI_CONTEXT_PATH);
  
  // Fallback: try to detect base path from current URL
  const currentPath = window.location.pathname;
  let basePath = UI_CONTEXT_PATH;
  
  // If no context path configured, try to detect from current path
  if (!basePath && currentPath !== '/') {
    // Extract potential base path (everything before the last segment)
    const segments = currentPath.split('/').filter(segment => segment.length > 0);
    if (segments.length > 1) {
      basePath = '/' + segments.slice(0, -1).join('/');
    }
  }
  
  // Ensure no double slashes in the URL
  const loginUrl = basePath ? `${basePath.replace(/\/$/, '')}/` : '/';
  console.log('Redirecting to:', loginUrl);
  
  if (window.location.pathname !== loginUrl.replace(/\/$/, '') && 
      window.location.pathname !== loginUrl) {
    window.location.href = loginUrl;
  }
} 