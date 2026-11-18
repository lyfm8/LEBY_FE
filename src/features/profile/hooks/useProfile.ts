import { useState, useEffect, useCallback } from 'react';
import { profileService } from '../services/profileService';
import type {
    ProfileResponse,
    UpdateProfileRequest,
    ChangePasswordRequest,
} from '../types/profileTypes';

/**
 * Custom Hook quản lý dữ liệu và nghiệp vụ cho trang Hồ sơ cá nhân (UC15 & UC16).
 * Đóng gói state, data fetching, và các action handlers tách biệt khỏi UI components.
 */
export function useProfile() {
    const [data, setData] = useState<ProfileResponse | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [isUpdating, setIsUpdating] = useState<boolean>(false);
    const [updateError, setUpdateError] = useState<string | null>(null);
    const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);

    /**
     * Tải thông tin hồ sơ người dùng từ Backend.
     */
    const fetchProfile = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await profileService.getProfile();
            if (res.success && res.data) {
                setData(res.data);
            } else {
                setError(res.message || 'Không thể tải thông tin hồ sơ');
            }
        } catch (err: unknown) {
            console.error('Failed to fetch profile:', err);
            setError('Đã xảy ra lỗi khi tải hồ sơ cá nhân');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    /**
     * Cập nhật thông tin cơ bản của hồ sơ.
     */
    const handleUpdateProfile = useCallback(async (updated: UpdateProfileRequest): Promise<boolean> => {
        setIsUpdating(true);
        setUpdateError(null);
        setUpdateSuccess(null);
        try {
            const res = await profileService.updateProfile(updated);
            if (res.success && res.data) {
                setData(res.data);
                setUpdateSuccess('Cập nhật thông tin cá nhân thành công!');
                return true;
            } else {
                setUpdateError(res.message || 'Cập nhật thông tin thất bại');
                return false;
            }
        } catch (err: unknown) {
            console.error('Failed to update profile:', err);
            setUpdateError('Đã xảy ra lỗi khi cập nhật thông tin cá nhân');
            return false;
        } finally {
            setIsUpdating(false);
        }
    }, []);

    /**
     * Cập nhật ảnh đại diện mới sau khi đã upload lên Cloudinary.
     */
    const handleUpdateAvatar = useCallback(async (avatarUrl: string): Promise<boolean> => {
        if (!data) return false;
        return handleUpdateProfile({
            fullName: data.user.fullName,
            dob: data.user.dob,
            avatar: avatarUrl,
            learnerType: data.user.learnerType,
        });
    }, [data, handleUpdateProfile]);

    /**
     * Đổi mật khẩu tài khoản người dùng.
     */
    const handleChangePassword = useCallback(async (req: ChangePasswordRequest): Promise<{ success: boolean; message: string }> => {
        try {
            const res = await profileService.changePassword(req);
            if (res.success) {
                return { success: true, message: 'Đổi mật khẩu tài khoản thành công!' };
            }
            return { success: false, message: res.message || 'Đổi mật khẩu thất bại' };
        } catch (err: unknown) {
            console.error('Failed to change password:', err);
            return { success: false, message: 'Đã xảy ra lỗi khi đổi mật khẩu' };
        }
    }, []);

    return {
        data,
        isLoading,
        error,
        isUpdating,
        updateError,
        updateSuccess,
        refetch: fetchProfile,
        handleUpdateProfile,
        handleUpdateAvatar,
        handleChangePassword,
    };
}
