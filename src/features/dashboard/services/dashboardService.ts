import { apiClient } from '@/core/api/apiClient';
import type { ApiResponse } from '@/core/api/apiResponse';
import type { DashboardSummary } from '../types/dashboardTypes';

export const dashboardService = {
    async getSummary(): Promise<ApiResponse<DashboardSummary>> {
        return apiClient.get<ApiResponse<DashboardSummary>>('/api/v1/dashboard/summary');
    },
};
