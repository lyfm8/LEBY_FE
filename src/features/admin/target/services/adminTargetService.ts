import { apiClient } from '@/core/api/apiClient';
import type { ApiResponse } from '@/core/api/apiResponse';
import type { TargetProfileResponse, CreateTargetProfileRequest } from '../types';

/**
 * Service quản lý danh mục Mục tiêu điểm số (Target Profile - AIM).
 */
export const adminTargetService = {
  /**
   * Lấy danh sách toàn bộ các mốc mục tiêu điểm số (AIM).
   *
   * @returns ApiResponse chứa mảng TargetProfileResponse
   */
  getAllProfiles(): Promise<ApiResponse<TargetProfileResponse[]>> {
    // Gửi request GET lấy danh sách mục tiêu từ API quản trị
    return apiClient.get('/api/admin/target-profiles');
  },

  /**
   * Tạo mới một mốc mục tiêu điểm số (AIM).
   *
   * @param data Dữ liệu điểm mục tiêu và mô tả
   * @returns ApiResponse chứa TargetProfileResponse vừa tạo
   */
  createProfile(data: CreateTargetProfileRequest): Promise<ApiResponse<TargetProfileResponse>> {
    // Gửi request POST tạo mốc mục tiêu mới
    return apiClient.post('/api/admin/target-profiles', data);
  },

  /**
   * Cập nhật thông tin một mốc mục tiêu điểm số theo ID.
   *
   * @param id ID của mốc mục tiêu cần sửa
   * @param data Dữ liệu mới cần cập nhật
   * @returns ApiResponse chứa TargetProfileResponse sau khi cập nhật
   */
  updateProfile(id: number, data: CreateTargetProfileRequest): Promise<ApiResponse<TargetProfileResponse>> {
    // Gửi request PUT cập nhật mốc mục tiêu theo ID
    return apiClient.put(`/api/admin/target-profiles/${id}`, data);
  },

  /**
   * Xóa một mốc mục tiêu điểm số theo ID.
   * Backend sẽ từ chối xóa nếu đang có học viên sử dụng mốc mục tiêu này.
   *
   * @param id ID của mốc mục tiêu cần xóa
   * @returns ApiResponse xác nhận kết quả xóa
   */
  deleteProfile(id: number): Promise<ApiResponse<null>> {
    // Gửi request DELETE xóa mốc mục tiêu theo ID
    return apiClient.delete(`/api/admin/target-profiles/${id}`);
  },
};
