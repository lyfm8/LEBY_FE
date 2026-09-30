import { apiClient } from '@/core/api/apiClient';
import type { ApiResponse } from '@/core/api/apiResponse';
import type { PartResponse, AbilityResponse, AbilityFormData } from '../types';

export const adminPartService = {
  /**
   * Lấy danh sách 7 Parts TOEIC
   */
  getParts(): Promise<ApiResponse<PartResponse[]>> {
    return apiClient.get<ApiResponse<PartResponse[]>>('/api/v1/admin/parts');
  },

  /**
   * Lấy danh sách Ability của 1 Part
   */
  getAbilities(partId: number): Promise<ApiResponse<AbilityResponse[]>> {
    return apiClient.get<ApiResponse<AbilityResponse[]>>(`/api/v1/admin/parts/${partId}/abilities`);
  },

  /**
   * Tạo mới Ability cho 1 Part
   */
  createAbility(partId: number, data: AbilityFormData): Promise<ApiResponse<AbilityResponse>> {
    return apiClient.post<ApiResponse<AbilityResponse>>(`/api/v1/admin/parts/${partId}/abilities`, data);
  },

  /**
   * Cập nhật thông tin Ability
   */
  updateAbility(id: number, data: AbilityFormData): Promise<ApiResponse<AbilityResponse>> {
    return apiClient.put<ApiResponse<AbilityResponse>>(`/api/v1/admin/abilities/${id}`, data);
  },

  /**
   * Xóa Ability (chỉ xóa được nếu chưa có câu hỏi nào)
   */
  deleteAbility(id: number): Promise<ApiResponse<null>> {
    return apiClient.delete<ApiResponse<null>>(`/api/v1/admin/abilities/${id}`);
  }
};
