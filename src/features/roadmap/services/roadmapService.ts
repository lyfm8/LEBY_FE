import { apiClient } from '@/core/api/apiClient';
import type { ApiResponse } from '@/core/api/apiResponse';
import type { RoadmapData, ModuleDetailData } from '../types/roadmapTypes';

export const roadmapService = {
    async getRoadmap(): Promise<ApiResponse<RoadmapData>> {
        return apiClient.get<ApiResponse<RoadmapData>>('/api/v1/roadmap');
    },

    async getModuleDetail(moduleId: number | string): Promise<ApiResponse<ModuleDetailData>> {
        return apiClient.get<ApiResponse<ModuleDetailData>>(`/api/v1/modules/${moduleId}`);
    },
};
