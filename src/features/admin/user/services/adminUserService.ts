import { apiClient } from '@/core/api/apiClient';
import { axiosInstance } from '@/core/api/axios';
import type { ApiResponse } from '@/core/api/apiResponse';
import type {
  AdminUserDetailResponse,
  TargetProfileOption,
  UpdateUserRoleRequest,
  UserActiveExamStatusResponse,
  UserFilterParams,
  UserListItemResponse,
} from '../types';

/**
 * Service gọi trực tiếp API Backend cho toàn bộ nghiệp vụ Quản lý tài khoản người dùng (UC A02).
 */
export const adminUserService = {
  /**
   * Lấy danh sách tài khoản người dùng có phân trang và lọc theo từ khóa, vai trò, trạng thái, mốc AIM.
   */
  getUsers(params: UserFilterParams): Promise<ApiResponse<UserListItemResponse[]>> {
    // Gửi GET kèm query params tới endpoint quản trị danh sách user
    return apiClient.get<ApiResponse<UserListItemResponse[]>>('/api/admin/users', { params });
  },

  /**
   * Lấy chi tiết tài khoản và toàn bộ tiến trình học tập (chẩn đoán, lộ trình, vượt ải, thi thử).
   */
  getDetail(id: number): Promise<ApiResponse<AdminUserDetailResponse>> {
    // Gọi endpoint chi tiết theo ID người dùng
    return apiClient.get<ApiResponse<AdminUserDetailResponse>>(`/api/admin/users/${id}`);
  },

  /**
   * Kiểm tra học viên có đang làm bài thi trực tuyến nào không trước khi thao tác khóa (Ngoại lệ 7d).
   */
  getActiveExamStatus(id: number): Promise<ApiResponse<UserActiveExamStatusResponse>> {
    // Gọi API kiểm tra phiên thi đang mở của user
    return apiClient.get<ApiResponse<UserActiveExamStatusResponse>>(`/api/admin/users/${id}/active-exam-status`);
  },

  /**
   * Khóa hoặc mở khóa tài khoản người dùng.
   * Tham số force = true xác nhận khóa ngay cả khi học viên đang trong phòng thi.
   */
  toggleActive(id: number, force = false): Promise<ApiResponse<UserListItemResponse>> {
    // Gửi PATCH đổi trạng thái kèm query param force
    return apiClient.patch<ApiResponse<UserListItemResponse>>(
      `/api/admin/users/${id}/status`,
      undefined,
      { params: { force } }
    );
  },

  /**
   * Nâng quyền hoặc hạ quyền qua lại giữa Học viên (STUDENT) và Giáo viên (TEACHER).
   */
  updateRole(id: number, payload: UpdateUserRoleRequest): Promise<ApiResponse<UserListItemResponse>> {
    // Gửi PATCH cập nhật vai trò mới trong body JSON
    return apiClient.patch<ApiResponse<UserListItemResponse>>(`/api/admin/users/${id}/role`, payload);
  },

  /**
   * Đặt lại mật khẩu ngẫu nhiên đạt chuẩn đăng ký và tự động gửi email thông báo cho người dùng.
   */
  resetPassword(id: number): Promise<ApiResponse<void>> {
    // Gửi POST kích hoạt sinh mật khẩu mới và gửi mail trong transaction
    return apiClient.post<ApiResponse<void>>(`/api/admin/users/${id}/reset-password`);
  },

  /**
   * Lấy danh sách các mốc điểm mục tiêu AIM để hiển thị trong bộ lọc.
   */
  getTargetProfiles(): Promise<ApiResponse<TargetProfileOption[]>> {
    // Tái sử dụng endpoint danh mục AIM quản trị có sẵn của Backend
    return apiClient.get<ApiResponse<TargetProfileOption[]>>('/api/admin/target-profiles');
  },

  /**
   * Tải xuống file Excel (.xlsx) chứa toàn bộ người dùng khớp bộ lọc hiện tại.
   */
  async exportUsersExcel(params: Omit<UserFilterParams, 'page' | 'size'>): Promise<Blob> {
    // Gọi trực tiếp axiosInstance với responseType 'blob' để nhận dữ liệu nhị phân file Excel
    const response = await axiosInstance.get<Blob>('/api/admin/users/export', {
      params,
      responseType: 'blob',
    });
    // Trả về dữ liệu Blob để hook kích hoạt tải tệp xuống trình duyệt
    return response.data;
  },
};
