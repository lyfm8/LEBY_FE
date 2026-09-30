import { apiClient } from '@/core/api/apiClient';
import type { ApiResponse } from '@/core/api/apiResponse';
import type { PartResponse, AbilityResponse, AbilityFormData } from '../types';

/**
 * Service quản lý gọi API liên quan đến Cấu trúc Đề thi (Part) và Năng lực (Ability) (UC-03).
 */
export const adminPartService = {
  /**
   * Lấy danh sách 7 phần thi (Parts) của bài thi TOEIC.
   */
  getParts(): Promise<ApiResponse<PartResponse[]>> {
    return apiClient.get<ApiResponse<PartResponse[]>>('/api/v1/admin/parts');
  },

  /**
   * Lấy danh sách các Năng lực (Abilities) thuộc về một phần thi (Part).
   * @param partId ID của phần thi cần lấy năng lực.
   */
  getAbilities(partId: number): Promise<ApiResponse<AbilityResponse[]>> {
    return apiClient.get<ApiResponse<AbilityResponse[]>>(`/api/v1/admin/parts/${partId}/abilities`);
  },

  /**
   * Tạo mới Năng lực đánh giá và gắn vào một Part.
   */
  createAbility(partId: number, data: AbilityFormData): Promise<ApiResponse<AbilityResponse>> {
    return apiClient.post<ApiResponse<AbilityResponse>>(`/api/v1/admin/parts/${partId}/abilities`, data);
  },

  /**
   * Cập nhật thông tin chi tiết (tên, mô tả) của Năng lực.
   */
  updateAbility(id: number, data: AbilityFormData): Promise<ApiResponse<AbilityResponse>> {
    return apiClient.put<ApiResponse<AbilityResponse>>(`/api/v1/admin/abilities/${id}`, data);
  },

  /**
   * Xóa Năng lực.
   * LƯU Ý NGHIỆP VỤ: Không cho phép xóa (Backend sẽ chặn 400) nếu Năng lực này đã được gắn vào các câu hỏi (Questions).
   */
  deleteAbility(id: number): Promise<ApiResponse<null>> {
    return apiClient.delete<ApiResponse<null>>(`/api/v1/admin/abilities/${id}`);
  }
};

