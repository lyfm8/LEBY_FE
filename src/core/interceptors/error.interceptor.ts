import axios from 'axios';
import { axiosInstance } from '../api/axios';

axiosInstance.interceptors.response.use(
    (response) => response,

    (error) => {
        if (axios.isAxiosError(error)) {
            const status = error.response?.status;
            const requestUrl = error.config?.url || '';

            if (status === 401 && !requestUrl.includes('/auth/login') && !requestUrl.includes('/auth/me')) {
                // Session hết hạn → chuyển về login
                window.location.href = '/login?reason=expired';
            }

            if (status === 403) {
                window.location.href = '/unauthorized';
            }
        }

        return Promise.reject(error);
    }
);
