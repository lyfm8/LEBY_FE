import { apiClient } from '@/core/api/apiClient';
import type { ApiResponse } from '@/core/api/apiResponse';
import type { DashboardSummary } from '../types/dashboardTypes';

/**
 * Service gọi trực tiếp API Backend thật cho màn hình Dashboard học tập cá nhân.
 */
export const dashboardService = {
    /**
     * Lấy toàn bộ dữ liệu tổng hợp Dashboard của học viên đang đăng nhập.
     *
     * @returns Promise chứa ApiResponse bọc dữ liệu DashboardSummary
     */
    async getSummary(): Promise<ApiResponse<DashboardSummary>> {
        // Gửi yêu cầu GET tới endpoint chuẩn /api/users/dashboard/summary (không dùng /api/v1/)
        return apiClient.get<ApiResponse<DashboardSummary>>('/api/users/dashboard/summary');
    },
};
