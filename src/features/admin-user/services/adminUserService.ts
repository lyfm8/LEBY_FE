import { apiClient } from '@/core/api/apiClient';
import type { ApiResponse } from '@/core/api/apiResponse';
import type {
  UserFilterParams,
  UserListItemResponse,
  UserDetailResponse,
  CreateUserRequest,
  UpdateUserRequest
} from '../types';

export const adminUserService = {
  /**
   * Lấy danh sách người dùng có phân trang và filter
   */
  getUsers(params: UserFilterParams): Promise<ApiResponse<UserListItemResponse[]>> {
    return apiClient.get<ApiResponse<UserListItemResponse[]>>('/api/v1/admin/users', { params });
  },

  /**
   * Lấy chi tiết một người dùng
   */
  getById(id: number): Promise<ApiResponse<UserDetailResponse>> {
    return apiClient.get<ApiResponse<UserDetailResponse>>(`/api/v1/admin/users/${id}`);
  },

  /**
   * Tạo người dùng mới
   */
  create(data: CreateUserRequest): Promise<ApiResponse<UserDetailResponse>> {
    return apiClient.post<ApiResponse<UserDetailResponse>>('/api/v1/admin/users', data);
  },

  /**
   * Cập nhật thông tin người dùng (không bao gồm password)
   */
  update(id: number, data: UpdateUserRequest): Promise<ApiResponse<UserDetailResponse>> {
    return apiClient.put<ApiResponse<UserDetailResponse>>(`/api/v1/admin/users/${id}`, data);
  },

  /**
   * Bật/Tắt trạng thái hoạt động của người dùng (Soft deactivate)
   */
  toggleActive(id: number): Promise<ApiResponse<{ isActive: boolean }>> {
    return apiClient.patch<ApiResponse<{ isActive: boolean }>>(`/api/v1/admin/users/${id}/toggle-active`);
  }
};
