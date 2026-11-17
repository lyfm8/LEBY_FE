import { useState, useEffect, useCallback } from 'react';
import { adminTargetService } from '../services/adminTargetService';
import type { TargetProfileResponse } from '../types';
import type { TargetProfileFormValues } from '../utils/schema';

interface UseTargetProfilesOptions {
  onProfileChanged?: () => void;
}

/**
 * Custom hook quản lý danh mục mốc điểm mục tiêu (Target Profiles - AIM 450, 650, 800...).
 * Xử lý toàn bộ logic: nạp danh sách, mở modal thêm/sửa, lưu và xóa profile.
 *
 * @param options Tùy chọn callback khi dữ liệu profile có thay đổi (thêm/sửa/xóa)
 */
export function useTargetProfiles(options?: UseTargetProfilesOptions) {
  const [profiles, setProfiles] = useState<TargetProfileResponse[]>([]);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState<boolean>(false);

  // State quản lý Modal thêm / chỉnh sửa Target Profile
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedProfile, setSelectedProfile] = useState<TargetProfileResponse | null>(null);
  const [isSubmittingProfile, setIsSubmittingProfile] = useState<boolean>(false);

  /**
   * Nạp danh sách toàn bộ Target Profiles từ API.
   */
  const fetchProfiles = useCallback(async () => {
    setIsLoadingProfiles(true);
    try {
      const res = await adminTargetService.getAllProfiles();
      if (res.success && res.data) {
        setProfiles(res.data);
      }
    } catch (error: unknown) {
      console.error('Failed to fetch target profiles:', error);
    } finally {
      setIsLoadingProfiles(false);
    }
  }, []);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  /**
   * Mở modal thêm mới Target Profile.
   */
  const handleAddProfile = useCallback(() => {
    setSelectedProfile(null);
    setIsModalOpen(true);
  }, []);

  /**
   * Mở modal chỉnh sửa một Target Profile hiện có.
   */
  const handleEditProfile = useCallback((profile: TargetProfileResponse) => {
    setSelectedProfile(profile);
    setIsModalOpen(true);
  }, []);

  /**
   * Đóng modal thêm/sửa Target Profile.
   */
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedProfile(null);
  }, []);

  /**
   * Xử lý xóa Target Profile.
   */
  const handleDeleteProfile = useCallback(
    async (id: number) => {
      if (!window.confirm('Bạn có chắc chắn muốn xóa Target Profile này? Sẽ lỗi nếu học viên đang theo mục tiêu này.')) {
        return;
      }
      try {
        await adminTargetService.deleteProfile(id);
        await fetchProfiles();
        options?.onProfileChanged?.();
      } catch (error: unknown) {
        console.error(error);
        alert('Không thể xóa Profile này do có dữ liệu liên kết.');
      }
    },
    [fetchProfiles, options]
  );

  /**
   * Xử lý submit form tạo mới hoặc cập nhật Target Profile.
   */
  const handleSubmitProfile = useCallback(
    async (data: TargetProfileFormValues) => {
      setIsSubmittingProfile(true);
      try {
        if (selectedProfile) {
          await adminTargetService.updateProfile(selectedProfile.id, data);
        } else {
          await adminTargetService.createProfile(data);
        }
        setIsModalOpen(false);
        setSelectedProfile(null);
        await fetchProfiles();
        options?.onProfileChanged?.();
      } catch (error: unknown) {
        console.error('Lưu Target Profile thất bại:', error);
        alert('Lưu Target Profile thất bại');
      } finally {
        setIsSubmittingProfile(false);
      }
    },
    [selectedProfile, fetchProfiles, options]
  );

  return {
    profiles,
    isLoadingProfiles,
    isModalOpen,
    selectedProfile,
    isSubmittingProfile,
    handleAddProfile,
    handleEditProfile,
    handleCloseModal,
    handleDeleteProfile,
    handleSubmitProfile,
    refetchProfiles: fetchProfiles,
  };
}
