import { apiClient } from '@/core/api/apiClient';
import type { ApiResponse } from '@/core/api/apiResponse';
import type {
    ProfileResponse,
    UpdateProfileRequest,
    ChangePasswordRequest,
} from '../types/profileTypes';
import { mockProfileData } from '@/mocks/mockData';

/**
 * Service giao tiếp với Backend cho các tính năng Hồ sơ cá nhân (UC15 & UC16).
 */
export const profileService = {
    /**
     * Lấy toàn bộ thông tin hồ sơ cá nhân và ma trận năng lực của người dùng hiện tại (UC15).
     */
    async getProfile(): Promise<ApiResponse<ProfileResponse>> {
        if (import.meta.env.VITE_USE_MOCK === 'true') {
            return {
                success: true,
                message: 'Thành công (Mock)',
                data: mockProfileData,
            };
        }
        return apiClient.get<ApiResponse<ProfileResponse>>('/api/users/profile');
    },

    /**
     * Cập nhật thông tin hồ sơ cá nhân (UC16).
     *
     * @param data Dữ liệu cập nhật bao gồm fullName, dob, avatar, learnerType
     */
    async updateProfile(data: UpdateProfileRequest): Promise<ApiResponse<ProfileResponse>> {
        if (import.meta.env.VITE_USE_MOCK === 'true') {
            mockProfileData.user = {
                ...mockProfileData.user,
                fullName: data.fullName,
                dob: data.dob,
                avatar: data.avatar !== undefined ? data.avatar : mockProfileData.user.avatar,
                learnerType: data.learnerType !== undefined ? data.learnerType : mockProfileData.user.learnerType,
            };
            return {
                success: true,
                message: 'Cập nhật thành công (Mock)',
                data: mockProfileData,
            };
        }
        return apiClient.put<ApiResponse<ProfileResponse>>('/api/users/profile', data);
    },

    /**
     * Đổi mật khẩu tài khoản người dùng (UC16).
     *
     * @param data Mật khẩu hiện tại, mật khẩu mới và xác nhận mật khẩu
     */
    async changePassword(data: ChangePasswordRequest): Promise<ApiResponse<null>> {
        if (import.meta.env.VITE_USE_MOCK === 'true') {
            return {
                success: true,
                message: 'Đổi mật khẩu thành công (Mock)',
                data: null,
            };
        }
        return apiClient.post<ApiResponse<null>>('/api/users/change-password', data);
    },
};
