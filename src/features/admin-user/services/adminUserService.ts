import { apiClient } from '@/core/api/apiClient';
import type { ApiResponse } from '@/core/api/apiResponse';
import type {
  UserFilterParams,
  UserListItemResponse,
  UserDetailResponse,
  CreateUserRequest,
  UpdateUserRequest
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
    return apiClient.get<ApiResponse<UserListItemResponse[]>>('/api/v1/admin/users', { params });
  },

  /**
   * Lấy chi tiết thông tin một người dùng theo ID để hiển thị lên Form cập nhật.
   * 
   * @param id ID của người dùng.
   */
  getById(id: number): Promise<ApiResponse<UserDetailResponse>> {
    return apiClient.get<ApiResponse<UserDetailResponse>>(`/api/v1/admin/users/${id}`);
  },

  /**
   * Tạo tài khoản người dùng mới (Thường dùng cho Admin cấp tài khoản).
   * 
   * @param data Payload tạo mới (Bắt buộc chứa mật khẩu khởi tạo).
   */
  create(data: CreateUserRequest): Promise<ApiResponse<UserDetailResponse>> {
    return apiClient.post<ApiResponse<UserDetailResponse>>('/api/v1/admin/users', data);
  },

  /**
   * Cập nhật thông tin người dùng.
   * LƯU Ý NGHIỆP VỤ: Payload cập nhật không bao gồm mật khẩu.
   * Mật khẩu nếu đổi phải dùng API Reset Password riêng.
   * 
   * @param id ID người dùng cần cập nhật.
   * @param data Payload thông tin cần sửa.
   */
  update(id: number, data: UpdateUserRequest): Promise<ApiResponse<UserDetailResponse>> {
    return apiClient.put<ApiResponse<UserDetailResponse>>(`/api/v1/admin/users/${id}`, data);
  },

  /**
   * Bật/Tắt trạng thái hoạt động của người dùng (Soft deactivate).
   * Người dùng bị tắt (isActive = false) sẽ không thể đăng nhập.
   * 
   * @param id ID người dùng cần toggle.
   */
  toggleActive(id: number): Promise<ApiResponse<{ isActive: boolean }>> {
    return apiClient.patch<ApiResponse<{ isActive: boolean }>>(`/api/v1/admin/users/${id}/toggle-active`);
  }
};

