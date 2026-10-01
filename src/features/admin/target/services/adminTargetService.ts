import { apiClient } from '@/core/api/apiClient';
import type { ApiResponse } from '@/core/api/apiResponse';
import type { 
  TargetProfileResponse, 
  CreateTargetProfileRequest, 
  ThresholdMatrixResponse, 
  BatchUpdateThresholdRequest 
} from '../types';

/**
 * Service quản lý Mục tiêu học tập (Target Profile - AIM) và Ma trận Ngưỡng (Threshold Matrix).
 */
export const adminTargetService = {
  // =====================================
  // TARGET PROFILES
  // =====================================

  /**
   * Lấy danh sách toàn bộ các Mục tiêu học tập (AIM).
   */
  getAllProfiles(): Promise<ApiResponse<TargetProfileResponse[]>> {
    return apiClient.get('/api/admin/target-profiles');
  },

  /**
   * Tạo mới một AIM (Ví dụ: TOEIC 450+).
   */
  createProfile(data: CreateTargetProfileRequest): Promise<ApiResponse<TargetProfileResponse>> {
    return apiClient.post('/api/admin/target-profiles', data);
  },

  updateProfile(id: number, data: CreateTargetProfileRequest): Promise<ApiResponse<TargetProfileResponse>> {
    return apiClient.put(`/api/admin/target-profiles/${id}`, data);
  },

  /**
   * Xóa AIM.
   * LƯU Ý: Backend sẽ chặn xóa nếu đang có user tham chiếu (mã lỗi 400).
   */
  deleteProfile(id: number): Promise<ApiResponse<null>> {
    return apiClient.delete(`/api/admin/target-profiles/${id}`);
  },

  // =====================================
  // MODULE TARGET THRESHOLDS
  // =====================================

  /**
   * Lấy dữ liệu ma trận ngưỡng cho tất cả Module × AIM.
   * Dùng để render bảng spreadsheet nhập liệu nhanh.
   */
  getThresholdMatrix(): Promise<ApiResponse<ThresholdMatrixResponse>> {
    return apiClient.get('/api/v1/admin/module-target-thresholds');
  },

  /**
   * Cập nhật đồng loạt các ngưỡng bị thay đổi từ bảng spreadsheet.
   * @param data Chứa danh sách các ô (moduleId, profileId, passThreshold) bị sửa.
   */
  batchUpdateThresholds(data: BatchUpdateThresholdRequest): Promise<ApiResponse<null>> {
    return apiClient.put('/api/v1/admin/module-target-thresholds', data);
  }
};

