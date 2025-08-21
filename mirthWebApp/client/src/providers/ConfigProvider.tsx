import React, { createContext, useContext, useEffect, useState } from 'react';

interface Config {
  MIRTH_API_URL: string;
  UI_CONTEXT_PATH: string;
}

const defaultConfig: Config = {
  MIRTH_API_URL: '',
  UI_CONTEXT_PATH: '',
};

let runtimeConfig: Config = defaultConfig;
export function getRuntimeConfig() {
  return runtimeConfig;
}

const ConfigContext = createContext<Config>(defaultConfig);

export const useConfig = () => useContext(ConfigContext);

function getDefaultContextPath() {
  // Default to empty string when UI_CONTEXT_PATH is not specified
  // This means the app will be served from the root of the domain
  return '';
}

function getDefaultMirthApiUrl() {
  // During development, use the same protocol as the current page
  if (import.meta.env.DEV) {
    const protocol = window.location.protocol;
    return `${protocol}//localhost:8081/api`;
  }
  
  // Use the same host, scheme, and port as the current location
  const { protocol, hostname, port } = window.location;
  
  // Just use the current host with /api
  let url = `${protocol}//${hostname}`;
  if (port) url += `:${port}`;
  const result = url + '/api';
  
  return result;
}

export const ConfigProvider = ({ children }: { children: React.ReactNode }) => {
  const [config, setConfig] = useState<Config | null>(null);

  useEffect(() => {
    fetch('config.json')
      .then(res => res.json())
      .then(cfg => {
        // Apply defaults if values are empty
        let contextPath = cfg.UI_CONTEXT_PATH;
        if (!contextPath || contextPath === '') {
          contextPath = getDefaultContextPath();
        }
        
        let mirthApiUrl = cfg.MIRTH_API_URL;
        if (!mirthApiUrl || mirthApiUrl === '') {
          mirthApiUrl = getDefaultMirthApiUrl();
        }
        
        const mergedConfig = {
          ...cfg,
          UI_CONTEXT_PATH: contextPath,
          MIRTH_API_URL: mirthApiUrl,
        };
        
        runtimeConfig = mergedConfig;
        setConfig(mergedConfig);
      })
      .catch(() => {
        // Fallback to defaults
        const contextPath = getDefaultContextPath();
        const mirthApiUrl = getDefaultMirthApiUrl();
        const fallbackConfig = {
          MIRTH_API_URL: mirthApiUrl,
          UI_CONTEXT_PATH: contextPath,
        };
        runtimeConfig = fallbackConfig;
        setConfig(fallbackConfig);
      });
  }, []);

  if (!config) return <div>Loading configuration...</div>;

  return (
    <ConfigContext.Provider value={config}>
      {children}
    </ConfigContext.Provider>
  );
}; 