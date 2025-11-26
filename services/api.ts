import axios from "axios";

// Define the login response type
interface LoginResponse {
  message: string;
  token: string;
  user: {
    id: number;
    iemis_code: string;
    email: string | null;
    role: 'admin' | 'school';
    school_id: number | null;
  };
}

// Real API client configuration
const api = axios.create({
  baseURL: '/api', // Use relative URL to work with proxy
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor to add the auth token to every request
api.interceptors.request.use(config => {
  // Only run in browser environment where localStorage is available
  if (typeof window !== 'undefined' && window.localStorage) {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('API Request with token:', config.url, config.method);
    } else {
      console.log('API Request without token:', config.url, config.method);
    }
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// Response interceptor to handle token storage
api.interceptors.response.use(
  (response) => {
    // If login response contains token, store it
    const data = response.data as Partial<LoginResponse>;
    if (data.token) {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('authToken', data.token);
      }
    }
    return response;
  },
  error => {
    console.log('API Error:', error.response?.status, error.response?.data);
    // If unauthorized, remove auth tokens but don't automatically redirect
    // This prevents reload loops
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
      }
      // Let the application handle the redirect logic instead of forcing it here
      console.log('Unauthorized - token removed, application should handle redirect');
    }
    return Promise.reject(error);
  }
);

export default api;