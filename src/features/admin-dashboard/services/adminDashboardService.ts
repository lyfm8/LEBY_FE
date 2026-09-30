import { apiClient } from '@/core/api/apiClient';
import type { ApiResponse } from '@/core/api/apiResponse';
import type { DashboardSummary } from '../types';

export const adminDashboardService = {
  /**
   * Gọi API lấy tổng quan dữ liệu cho Admin Dashboard
   */
  getSummary(): Promise<ApiResponse<DashboardSummary>> {
    return apiClient.get<ApiResponse<DashboardSummary>>('/api/v1/admin/dashboard/summary');
  },
};
