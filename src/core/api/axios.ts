import axios from 'axios';
import { ENV } from '../config/env.config';

export const axiosInstance = axios.create({
    baseURL: ENV.API_URL,
    timeout: ENV.API_TIMEOUT,
    withCredentials: true, // Bắt buộc: BE dùng HTTP-Only Cookie
    headers: {
        'Content-Type': 'application/json',
    },
});
