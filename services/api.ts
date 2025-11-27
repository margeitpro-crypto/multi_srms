import axios from "axios";

// Define the login response type
interface LoginResponse {
  message: string;
  token: string;
  user: {
    id: number;
    email: string | null;
    role: 'admin' | 'school';
    school_id: number | null;
  };
}

// Determine the base URL based on environment
const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    // Client-side - use relative URL for proxy in development, absolute URL in production
    if (process.env.NODE_ENV === 'production') {
      return window.location.origin;
    }
    return ''; // Use relative URL for proxy
  }
  // Server-side - use backend URL
  return process.env.BACKEND_URL || 'http://localhost:3002';
};

// Real API client configuration
const api = axios.create({
  baseURL: getBaseURL() + '/api',
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
  (error) => {
    // Handle unauthorized access
    if (error.response?.status === 401) {
      // Clear auth data on unauthorized access
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
      }
      // Redirect to login page
      if (typeof window !== 'undefined' && window.location) {
        window.location.href = '/#/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;