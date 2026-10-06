import { apiClient } from '@/core/api/apiClient';
import type { ApiResponse } from '@/core/api/apiResponse';
import type { PartResponse, PartRequest, AbilityResponse, AbilityRequest } from '../types';

/**
 * Service quản lý gọi API liên quan đến Cấu trúc Đề thi (Part) và Năng lực (Ability)
 * Chuẩn endpoint: /api/admin/...
 */
export const adminPartService = {
  // ===============================
  // PART MANAGEMENT
  // ===============================

  /**
   * Lấy danh sách toàn bộ Parts.
   */
  getParts(): Promise<ApiResponse<PartResponse[]>> {
    return apiClient.get<ApiResponse<PartResponse[]>>('/api/admin/parts');
  },

  /**
   * Lấy chi tiết một Part theo ID.
   */
  getPartById(id: number): Promise<ApiResponse<PartResponse>> {
    return apiClient.get<ApiResponse<PartResponse>>(`/api/admin/parts/${id}`);
  },

  /**
   * Tạo mới một Part.
   */
  createPart(data: PartRequest): Promise<ApiResponse<PartResponse>> {
    return apiClient.post<ApiResponse<PartResponse>>('/api/admin/parts', data);
  },

  /**
   * Cập nhật thông tin một Part.
   */
  updatePart(id: number, data: PartRequest): Promise<ApiResponse<PartResponse>> {
    return apiClient.put<ApiResponse<PartResponse>>(`/api/admin/parts/${id}`, data);
  },

  /**
   * Xóa một Part (Chặn xóa nếu còn Ability hoặc Question liên kết).
   */
  deletePart(id: number): Promise<ApiResponse<null>> {
    return apiClient.delete<ApiResponse<null>>(`/api/admin/parts/${id}`);
  },

  // ===============================
  // ABILITY MANAGEMENT
  // ===============================

  /**
   * Lấy danh sách các Năng lực (Abilities) thuộc về một phần thi (Part).
   */
  getAbilities(partId: number): Promise<ApiResponse<AbilityResponse[]>> {
    return apiClient.get<ApiResponse<AbilityResponse[]>>(`/api/admin/parts/${partId}/abilities`);
  },

  /**
   * Tạo mới Năng lực đánh giá và gắn vào một Part.
   */
  createAbility(partId: number, data: AbilityRequest): Promise<ApiResponse<AbilityResponse>> {
    return apiClient.post<ApiResponse<AbilityResponse>>(`/api/admin/parts/${partId}/abilities`, data);
  },

  /**
   * Cập nhật thông tin chi tiết (tên, mô tả) của Năng lực.
   */
  updateAbility(id: number, data: AbilityRequest): Promise<ApiResponse<AbilityResponse>> {
    return apiClient.put<ApiResponse<AbilityResponse>>(`/api/admin/abilities/${id}`, data);
  },

  /**
   * Xóa Năng lực (Chặn xóa nếu còn Question liên kết).
   */
  deleteAbility(id: number): Promise<ApiResponse<null>> {
    return apiClient.delete<ApiResponse<null>>(`/api/admin/abilities/${id}`);
  }
};
