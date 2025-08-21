import { getMirthApiClient } from '../utils/api';

export const login = async (username: string, password: string) => {
  const mirthApiClient = getMirthApiClient();
  const formData = new URLSearchParams();
  formData.append('username', username);
  formData.append('password', password);

  const response = await mirthApiClient.post(
    '/users/_login',
    formData.toString(),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
  );
  
  // The browser will automatically handle the session cookie
  return response.data;
};

export const isAuthenticated = async () => {
  const mirthApiClient = getMirthApiClient();
  try {
    await mirthApiClient.get('/users/current');
    return true;
  } catch (err) {
    return false;
  }
};

export const listUsers = async () => {
  const mirthApiClient = getMirthApiClient();
  const response = await mirthApiClient.get('/users');
  return response.data.list && response.data.list.user
    ? Array.isArray(response.data.list.user)
      ? response.data.list.user
      : [response.data.list.user]
    : [];
};

export const createUser = async (user: any, password?: string) => {
  const mirthApiClient = getMirthApiClient();
  const response = await mirthApiClient.post('/users', { user });
  return response.data;
};

export const updateUser = async (user: any, password?: string) => {
  const mirthApiClient = getMirthApiClient();
  const response = await mirthApiClient.put(`/users/${user.id}`, { user });
  return response.data;
};

export const setUserPassword = async (userId: string | number, password: string) => {
  const mirthApiClient = getMirthApiClient();
  const response = await mirthApiClient.put(
    `/users/${userId}/password`,
    password,
    {
      headers: { 'Content-Type': 'text/plain' }
    }
  );
  return response.data;
};

export const deleteUser = async (userId: string) => {
  const mirthApiClient = getMirthApiClient();
  const response = await mirthApiClient.delete(`/users/${userId}`);
  return response.data;
};

export const logout = async () => {
  const mirthApiClient = getMirthApiClient();
  try {
    // Match the working request exactly:
    // POST /api/users/_logout with empty body and XMLHttpRequest header
    await mirthApiClient.post('/users/_logout', '', {
      headers: {
        'Accept': '*/*',
        'X-Requested-With': 'XMLHttpRequest'
      }
    });
  } catch (error) {
    // Even if the logout call fails, we still want to clear the client-side state
    console.error('Logout API call failed:', error);
  }
};
