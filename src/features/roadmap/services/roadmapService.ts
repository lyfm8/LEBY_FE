import { apiClient } from '@/core/api/apiClient';
import type { ApiResponse } from '@/core/api/apiResponse';
import type { RoadmapData, ModuleDetailData } from '../types/roadmapTypes';

/**
 * Service giao tiếp trực tiếp với Backend thật cho Lộ trình học thích ứng và Chi tiết Module.
 * Tuân thủ chuẩn endpoint /api/users/... (không dùng tiền tố /api/v1/).
 */
export const roadmapService = {
    /**
     * Lấy lộ trình học tập đang hoạt động (ACTIVE) của học viên hiện tại.
     */
    async getRoadmap(): Promise<ApiResponse<RoadmapData | null>> {
        return apiClient.get<ApiResponse<RoadmapData | null>>('/api/users/roadmap');
    },

    /**
     * Lấy chi tiết một Module kèm danh sách bài học và điều kiện mở khóa bài thi vượt ải.
     *
     * @param moduleId ID của Module cần xem
     */
    async getModuleDetail(moduleId: number | string): Promise<ApiResponse<ModuleDetailData>> {
        return apiClient.get<ApiResponse<ModuleDetailData>>(`/api/users/roadmap/modules/${moduleId}`);
    },
};
