import { apiClient } from '@/core/api/apiClient';
import type { ApiResponse } from '@/core/api/apiResponse';
import type {
    ProfileResponse,
    UpdateProfileRequest,
    ChangePasswordRequest,
} from '../types/profileTypes';

/**
 * Service giao tiếp trực tiếp với Backend cho các tính năng Hồ sơ cá nhân (UC15 & UC16).
 */
export const profileService = {
    /**
     * Lấy toàn bộ thông tin hồ sơ cá nhân và ma trận năng lực của người dùng hiện tại (UC15).
     *
     * @returns Phản hồi chuẩn ApiResponse chứa thông tin ProfileResponse từ Backend
     */
    async getProfile(): Promise<ApiResponse<ProfileResponse>> {
        // Gọi trực tiếp endpoint hồ sơ người dùng đang đăng nhập (xác thực qua JWT cookie/header)
        return apiClient.get<ApiResponse<ProfileResponse>>('/api/users/profile');
    },

    /**
     * Cập nhật thông tin hồ sơ cá nhân (UC16).
     *
     * @param data Dữ liệu cập nhật bao gồm fullName, dob, avatar, learnerType
     * @returns Phản hồi chuẩn ApiResponse chứa thông tin ProfileResponse sau khi lưu
     */
    async updateProfile(data: UpdateProfileRequest): Promise<ApiResponse<ProfileResponse>> {
        // Gửi payload cập nhật hồ sơ lên Backend để lưu xuống cơ sở dữ liệu
        return apiClient.put<ApiResponse<ProfileResponse>>('/api/users/profile', data);
    },

    /**
     * Đổi mật khẩu tài khoản người dùng (UC16).
     *
     * @param data Mật khẩu hiện tại, mật khẩu mới và xác nhận mật khẩu
     * @returns Phản hồi chuẩn ApiResponse thông báo kết quả đổi mật khẩu
     */
    async changePassword(data: ChangePasswordRequest): Promise<ApiResponse<null>> {
        // Gọi API đổi mật khẩu; Backend sẽ tự tăng tokenVersion để vô hiệu hóa các phiên đăng nhập cũ
        return apiClient.post<ApiResponse<null>>('/api/users/change-password', data);
    },
};
