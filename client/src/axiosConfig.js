import axios from 'axios';
import { refreshToken } from './tokenUtils';

axios.defaults.baseURL = 'http://yourapi.com'; // Set your base URL here

axios.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const newToken = await refreshToken();
                axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
                originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                return axios(originalRequest);
            } catch (refreshError) {
                // Handle token refresh failure (e.g., redirect to login)
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);