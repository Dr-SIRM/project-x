import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:3000/';

axios.interceptors.response.use(
    response => response,
    error => {
        const originalRequest = error.config;
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            window.dispatchEvent(new Event('refreshToken')); // Trigger token refresh
            return axios(originalRequest); // Retry request after token refresh
        }
        return Promise.reject(error);
    }
);