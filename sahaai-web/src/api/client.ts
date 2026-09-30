import axios, { AxiosError } from 'axios';
import type { ApiResponse, ApiErrorResponse, RateLimitResponse } from '../types/api.types';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Bearer Token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('sahaai_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Error extraction and 401 handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError<ApiErrorResponse | ApiResponse<any> | RateLimitResponse | string>) => {
    if (error.response) {
      const status = error.response.status;

      // Extract user-friendly error message
      const data = error.response.data;
      let message = 'An unexpected error occurred';

      if (typeof data === 'string') {
        message = data;
      } else if (data && typeof data === 'object') {
        if ('statusMessage' in data && data.statusMessage) {
          message = data.statusMessage;
        } else if ('message' in data && data.message) {
          message = data.message;
        }
      }

      // Handle 401 Unauthorized
      if (status === 401) {
        localStorage.removeItem('sahaai_token');
        localStorage.removeItem('sahaai_user');
        // Only redirect if not already on an auth page
        if (!window.location.pathname.startsWith('/login') &&
            !window.location.pathname.startsWith('/register') &&
            !window.location.pathname.startsWith('/verify-otp') &&
            !window.location.pathname.startsWith('/forgot-password')) {
          const isDeactivated = message?.toLowerCase().includes('deactivated');
          window.location.href = isDeactivated ? '/login?deactivated=true' : '/login?expired=true';
        }
      }

      return Promise.reject(new Error(message));
    } else if (error.request) {
      return Promise.reject(new Error('Unable to connect to the Sahaai backend server. Please verify your connection.'));
    }

    return Promise.reject(error);
  }
);

export default apiClient;

