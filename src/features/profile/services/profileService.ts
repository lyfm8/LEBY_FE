import { apiClient } from '@/core/api/apiClient';
import type { ApiResponse } from '@/core/api/apiResponse';
import type { ProfileData, UpdateProfileRequest, ChangePasswordRequest } from '../types/profileTypes';

export const profileService = {
    async getProfile(): Promise<ApiResponse<ProfileData>> {
        return apiClient.get<ApiResponse<ProfileData>>('/api/v1/users/profile');
    },

    async updateProfile(data: UpdateProfileRequest): Promise<ApiResponse<ProfileData>> {
        return apiClient.put<ApiResponse<ProfileData>>('/api/v1/users/profile', data);
    },

    async changePassword(data: ChangePasswordRequest): Promise<ApiResponse<{ message: string }>> {
        return apiClient.post<ApiResponse<{ message: string }>>('/api/v1/users/change-password', data);
    },
};
