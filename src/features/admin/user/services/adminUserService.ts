import { apiClient } from '@/core/api/apiClient';
import type { ApiResponse } from '@/core/api/apiResponse';
import type {
  UserFilterParams,
  UserListItemResponse,
  UserDetailResponse
} from '../types';

/**
 * Service quản lý gọi API liên quan đến người dùng (UC-02).
 */
export const adminUserService = {
  /**
   * Lấy danh sách người dùng.
   * Có hỗ trợ phân trang (Pagination) và bộ lọc (Search keyword, Role, Status).
   * 
   * @param params Bộ lọc truyền lên Backend (page, pageSize, keyword...)
   * @returns {Promise<ApiResponse<UserListItemResponse[]>>} Danh sách User kèm metadata phân trang.
   */
  getUsers(params: UserFilterParams): Promise<ApiResponse<UserListItemResponse[]>> {
    return apiClient.get<ApiResponse<UserListItemResponse[]>>('/api/admin/users', { params });
  },

  getById(id: number): Promise<ApiResponse<UserDetailResponse>> {
    return apiClient.get<ApiResponse<UserDetailResponse>>(`/api/admin/users/${id}`);
  },

  toggleActive(id: number): Promise<ApiResponse<{ isActive: boolean }>> {
    return apiClient.patch<ApiResponse<{ isActive: boolean }>>(`/api/admin/users/${id}/status`);
  }
};

