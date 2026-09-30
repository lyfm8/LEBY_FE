import { apiClient } from '@/core/api/apiClient';
import type { ApiResponse } from '@/core/api/apiResponse';
import type { DashboardSummary } from '../types';

/**
 * Service quản lý gọi API liên quan đến thống kê Dashboard (UC-01).
 */
export const adminDashboardService = {
  /**
   * Lấy tổng quan dữ liệu hệ thống hiển thị trên Admin Dashboard.
   * API này tập hợp các chỉ số: số lượng học viên, tăng trưởng, phân bố mục tiêu,
   * tỷ lệ đỗ Module Test và các hoạt động gần nhất.
   *
   * @returns {Promise<ApiResponse<DashboardSummary>>} Object chứa các mảng dữ liệu thống kê (stats, charts, recent activities).
   */
  getSummary(): Promise<ApiResponse<DashboardSummary>> {
    return apiClient.get<ApiResponse<DashboardSummary>>('/api/v1/admin/dashboard/summary');
  },
};

