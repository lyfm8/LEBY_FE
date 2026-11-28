import { apiClient } from '@/core/api/apiClient';
import type { ApiResponse } from '@/core/api/apiResponse';
import type { CourseCatalogData } from '../types/catalogTypes';

/**
 * Service giao tiếp trực tiếp với Backend thật cho tính năng Thư viện khóa học 7 Part TOEIC.
 * Thống nhất dùng tiền tố /api/users/catalog (không dùng /api/v1/, không mock dữ liệu).
 */
export const catalogService = {
    /**
     * Gọi API lấy toàn bộ cấu trúc 7 Part TOEIC kèm đề cương bài học và trạng thái đối chiếu lộ trình cá nhân.
     *
     * @returns Promise chứa ApiResponse bọc CourseCatalogData
     */
    async getCourseCatalog(): Promise<ApiResponse<CourseCatalogData>> {
        // Gửi yêu cầu GET tới endpoint thư viện khóa học của học viên đang đăng nhập
        return apiClient.get<ApiResponse<CourseCatalogData>>('/api/users/catalog');
    },
};
