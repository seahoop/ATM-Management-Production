const API_BASE_URL = process.env.REACT_APP_API_URL;

export const authenticatedFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem('authToken');
  
  console.log('API call to:', `${API_BASE_URL}${endpoint}`);
  console.log('Token present:', !!token);
  console.log('Token value:', token ? token.substring(0, 20) + '...' : 'None');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  console.log('Request headers:', headers);

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include', // Still try session cookies as fallback
  });

  console.log('Response status:', response.status);
  console.log('Response ok:', response.ok);

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      // Clear invalid token
      localStorage.removeItem('authToken');
      throw new Error('Authentication failed');
    }
    throw new Error(`API call failed: ${response.status}`);
  }

  return response.json();
};

export const getUserInfo = () => {
  return authenticatedFetch('/api/user');
};

export const logout = () => {
  localStorage.removeItem('authToken');
  window.location.href = `${API_BASE_URL}/auth/logout`;
}; 