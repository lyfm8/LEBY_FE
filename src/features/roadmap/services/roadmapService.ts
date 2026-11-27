import { apiClient } from '@/core/api/apiClient';
import type { ApiResponse } from '@/core/api/apiResponse';
import type { RoadmapData, ModuleDetailData } from '../types/roadmapTypes';

/**
 * Service giao tiếp trực tiếp với Backend thật cho Lộ trình học cá nhân và Chi tiết Module.
 * Toàn bộ endpoint thống nhất tiền tố /api/users/roadmap (không dùng /api/v1/).
 */
export const roadmapService = {
    /**
     * Gọi API lấy lộ trình học tập hiện hành của học viên đang đăng nhập.
     *
     * @returns Promise chứa ApiResponse bọc RoadmapData (hoặc null nếu học viên chưa có lộ trình)
     */
    async getRoadmap(): Promise<ApiResponse<RoadmapData | null>> {
        // Gửi yêu cầu GET lấy lộ trình cá nhân hóa của học viên hiện tại
        return apiClient.get<ApiResponse<RoadmapData | null>>('/api/users/roadmap');
    },

    /**
     * Gọi API lấy thông tin chi tiết của một mô-đun kèm danh sách bài học và bài kiểm tra vượt ải.
     *
     * @param moduleId ID của mô-đun cần xem chi tiết
     * @returns Promise chứa ApiResponse bọc ModuleDetailData
     */
    async getModuleDetail(moduleId: number | string): Promise<ApiResponse<ModuleDetailData>> {
        // Gửi yêu cầu GET tới endpoint chi tiết mô-đun kèm moduleId trên đường dẫn
        return apiClient.get<ApiResponse<ModuleDetailData>>(`/api/users/roadmap/modules/${moduleId}`);
    },
};
