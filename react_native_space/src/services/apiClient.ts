import axios from 'axios';
import { Platform } from 'react-native';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://58d7eb92c.na115.preview.abacusai.app';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  transformRequest: [
    (data, headers) => {
      if (data && typeof data === 'object' && !(data instanceof FormData)) {
        return JSON.stringify(data);
      }
      return data;
    },
  ],
});

// 401 interceptor
apiClient.interceptors.response.use(
  response => response,
  error => {
    // Don't try to handle if no response
    return Promise.reject(error);
  }
);

export default apiClient;
