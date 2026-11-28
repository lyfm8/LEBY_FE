import axios from 'axios';
import { ENV } from '@/core/config/env.config';
import type { ApiResponse } from '@/core/api/apiResponse';
import type { PublicCatalogData } from '../types/publicCatalogTypes';

/**
 * Service lấy dữ liệu chương trình học 7 Part TOEIC công khai cho Landing Page.
 * Gọi tách bằng axios với withCredentials=false để tránh gửi kèm cookie hết hạn gây redirect login.
 */
export const publicCatalogService = {
    async getPublicCatalog(): Promise<ApiResponse<PublicCatalogData>> {
        const response = await axios.get<ApiResponse<PublicCatalogData>>(
            `${ENV.API_URL}/api/public/catalog`,
            {
                timeout: ENV.API_TIMEOUT,
                withCredentials: false,
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
        return response.data;
    },
};
