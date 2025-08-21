import { getMirthApiClient } from '../utils/api';

// Database Task Types
export interface DatabaseTask {
  id: string;
  name: string;
  description: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  lastRun?: string;
  duration?: number;
  progress?: number;
  result?: string;
  confirmationMessage?: string;
  affectedChannels?: any;
}

/**
 * Get all database tasks
 */
export const getDatabaseTasks = async (): Promise<DatabaseTask[]> => {
  const mirthApiClient = getMirthApiClient();
  try {
    const response = await mirthApiClient.get('/databaseTasks');
    
    // Handle the response format: { map: { entry: ... } }
    const data = response.data;
    
    if (!data?.map?.entry) {
      console.log('No database tasks found in response');
      return [];
    }
    
    const entries = data.map.entry;
    const tasks: DatabaseTask[] = [];
    
    // Handle both single entry and array of entries
    const entryArray = Array.isArray(entries) ? entries : [entries];
    
    entryArray.forEach((entry: any) => {
      if (entry['com.mirth.connect.model.DatabaseTask']) {
        const taskData = entry['com.mirth.connect.model.DatabaseTask'];
        tasks.push({
          id: taskData.id,
          name: taskData.name,
          description: taskData.description,
          status: taskData.status?.toLowerCase() || 'idle',
          confirmationMessage: taskData.confirmationMessage,
          affectedChannels: taskData.affectedChannels
        });
      }
    });
    
    console.log('Parsed database tasks:', tasks);
    return tasks;
    
  } catch (error) {
    console.warn('Failed to get database tasks:', error);
    return [];
  }
};

/**
 * Get specific database task
 */
export const getDatabaseTask = async (taskId: string): Promise<DatabaseTask | null> => {
  const mirthApiClient = getMirthApiClient();
  try {
    const response = await mirthApiClient.get(`/databaseTasks/${taskId}`);
    return response.data;
  } catch (error) {
    console.warn(`Failed to get database task ${taskId}:`, error);
    return null;
  }
};

/**
 * Execute database task
 */
export const runDatabaseTask = async (taskId: string) => {
  const mirthApiClient = getMirthApiClient();
  try {
    const response = await mirthApiClient.post(`/databaseTasks/${taskId}/_run`);
    return response.data;
  } catch (error) {
    console.error(`Failed to run database task ${taskId}:`, error);
    throw error;
  }
};

/**
 * Cancel database task
 */
export const cancelDatabaseTask = async (taskId: string) => {
  const mirthApiClient = getMirthApiClient();
  try {
    const response = await mirthApiClient.post(`/databaseTasks/${taskId}/_cancel`);
    return response.data;
  } catch (error) {
    console.error(`Failed to cancel database task ${taskId}:`, error);
    throw error;
  }
}; 
