const API_BASE_URL = process.env.REACT_APP_API_URL;

export const authenticatedFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem('authToken');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include', // Still try session cookies as fallback
  });

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