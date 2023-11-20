import axios from 'axios';
import { API_BASE_URL } from "./config";

export const refreshToken = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    const response = await axios.post(`${API_BASE_URL}/api/token/refresh`, { refresh_token: refreshToken });
    if (response.status === 200) {
        localStorage.setItem('session_token', response.data.session_token);
        return response.data.session_token;
    } else {
        throw new Error("Failed to refresh token");
    }
};