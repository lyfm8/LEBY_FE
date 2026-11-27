import { apiClient } from '@/core/api/apiClient';
import type { ApiResponse } from '@/core/api/apiResponse';
import type { DashboardSummary, TimeRangeFilter } from '../types';

/**
 * Service quản lý gọi API liên quan đến thống kê Dashboard (A01).
 * Tuân thủ chuẩn URL tiền tố /api/admin/... (CẤM tiền tố /v1/).
 */
export const adminDashboardService = {
  /**
   * Lấy tổng quan dữ liệu hệ thống hiển thị trên Admin Dashboard theo bộ lọc thời gian.
   *
   * @param {TimeRangeFilter} timeRange - Mốc thời gian lọc ('all' | 'this_month' | '30d' | '7d')
   * @returns {Promise<ApiResponse<DashboardSummary>>} Object chứa các khối dữ liệu thống kê tổng hợp.
   */
  getSummary(timeRange: TimeRangeFilter = 'all'): Promise<ApiResponse<DashboardSummary>> {
    return apiClient.get<ApiResponse<DashboardSummary>>('/api/admin/dashboard/summary', {
      params: { timeRange },
    });
  },
};
