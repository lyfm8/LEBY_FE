import { apiClient } from '@/core/api/apiClient';
import type { ApiResponse } from '@/core/api/apiResponse';
import type { TargetProfile, SelectTargetRequest, SelectTargetResponse } from '../types/targetTypes';

export const targetService = {
    async getTargets(): Promise<ApiResponse<TargetProfile[]>> {
        return apiClient.get<ApiResponse<TargetProfile[]>>('/api/v1/targets');
    },

    async selectTarget(data: SelectTargetRequest): Promise<ApiResponse<SelectTargetResponse>> {
        return apiClient.post<ApiResponse<SelectTargetResponse>>('/api/v1/targets/select', data);
    },
};