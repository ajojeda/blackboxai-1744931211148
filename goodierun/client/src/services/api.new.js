import mockApi from './mockApi';

// Use mock API for development
const api = mockApi;

// Helper to set auth token
api.setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

// Helper to get auth token
api.getAuthToken = () => {
  return localStorage.getItem('token');
};

export default api;
