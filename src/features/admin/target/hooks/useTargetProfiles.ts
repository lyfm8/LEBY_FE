import { useState, useEffect, useCallback } from 'react';
import { useConfirm, useToast } from '@/core/ui';
import { adminTargetService } from '../services/adminTargetService';
import { extractTargetErrorMessage, type TargetProfileFormValues } from '../utils/schema';
import type { TargetProfileResponse } from '../types';

/**
 * Custom hook quản lý toàn bộ state và thao tác CRUD cho danh mục Mục tiêu điểm số (AIM).
 *
 * @returns Danh sách profiles, trạng thái loading/error, trạng thái modal và các hàm thao tác
 */
export function useTargetProfiles() {
  // Hook hiển thị thông báo Toast góc màn hình
  const toast = useToast();
  // Hook mở hộp thoại xác nhận trước khi xóa
  const confirm = useConfirm();

  // State lưu danh sách các mốc mục tiêu AIM từ Backend
  const [profiles, setProfiles] = useState<TargetProfileResponse[]>([]);
  // State đánh dấu đang tải danh sách từ server
  const [isLoadingProfiles, setIsLoadingProfiles] = useState<boolean>(true);
  // State lưu thông báo lỗi khi tải danh sách thất bại để hiển thị trạng thái Error + nút Thử lại
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // State điều khiển đóng/mở Modal thêm hoặc sửa mục tiêu
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  // State lưu thông tin mốc mục tiêu đang được chọn để sửa (null nếu đang tạo mới)
  const [selectedProfile, setSelectedProfile] = useState<TargetProfileResponse | null>(null);
  // State đánh dấu đang gửi request tạo mới hoặc cập nhật
  const [isSubmittingProfile, setIsSubmittingProfile] = useState<boolean>(false);

  /**
   * Tải danh sách toàn bộ mốc mục tiêu AIM từ API Backend.
   */
  const fetchProfiles = useCallback(async () => {
    try {
      // Bật cờ loading và xóa thông báo lỗi cũ trước khi gọi API
      setIsLoadingProfiles(true);
      setErrorMessage(null);
      // Gọi API lấy toàn bộ danh sách Target Profile
      const res = await adminTargetService.getAllProfiles();
      // Kiểm tra phản hồi thành công và cập nhật danh sách vào state
      if (res.success && res.data) {
        setProfiles(res.data);
      } else {
        // Ghi nhận lỗi nghiệp vụ nếu API trả success = false
        setErrorMessage(res.message || 'Không thể tải danh sách mục tiêu điểm số');
      }
    } catch (error: unknown) {
      // Lưu thông báo lỗi thân thiện để giao diện hiển thị nút Thử lại
      setErrorMessage(extractTargetErrorMessage(error, 'Mất kết nối hoặc không thể tải danh sách mục tiêu điểm số'));
    } finally {
      // Luôn tắt trạng thái loading khi request kết thúc
      setIsLoadingProfiles(false);
    }
  }, []);

  // Tự động nạp dữ liệu danh sách mục tiêu ngay khi component mount
  useEffect(() => {
    // Kích hoạt gọi hàm tải dữ liệu bất đồng bộ
    void fetchProfiles();
  }, [fetchProfiles]);

  /**
   * Mở modal ở chế độ tạo mới mốc mục tiêu AIM.
   */
  const handleAddProfile = useCallback(() => {
    // Đặt selectedProfile về null để form hiểu là thêm mới
    setSelectedProfile(null);
    // Mở modal nhập liệu
    setIsModalOpen(true);
  }, []);

  /**
   * Mở modal ở chế độ chỉnh sửa cho một mốc mục tiêu đã chọn.
   *
   * @param profile Đối tượng mục tiêu cần chỉnh sửa
   */
  const handleEditProfile = useCallback((profile: TargetProfileResponse) => {
    // Gán mục tiêu đang chọn vào state để điền sẵn lên form
    setSelectedProfile(profile);
    // Mở modal chỉnh sửa
    setIsModalOpen(true);
  }, []);

  /**
   * Đóng modal và đặt lại trạng thái mục tiêu đang chọn.
   */
  const handleCloseModal = useCallback(() => {
    // Đóng modal
    setIsModalOpen(false);
    // Xóa mục tiêu đang chọn để tránh rò rỉ dữ liệu sang lần mở sau
    setSelectedProfile(null);
  }, []);

  /**
   * Xử lý xóa mốc mục tiêu sau khi xác nhận với người dùng.
   *
   * @param profile Mốc mục tiêu cần xóa
   */
  const handleDeleteProfile = useCallback(
    async (profile: TargetProfileResponse) => {
      // Mở hộp thoại xác nhận thao tác xóa một cách rõ ràng
      const isConfirmed = await confirm({
        title: 'Xác nhận xóa mục tiêu',
        message: `Bạn có chắc chắn muốn xóa mốc AIM ${profile.aimScore}? Thao tác này không thể thực hiện nếu đang có học viên theo học mục tiêu này.`,
        confirmText: 'Xóa mục tiêu',
        cancelText: 'Hủy',
      });
      // Dừng lại nếu người dùng chọn Hủy
      if (!isConfirmed) {
        return;
      }

      try {
        // Gọi API xóa mốc mục tiêu theo ID
        await adminTargetService.deleteProfile(profile.id);
        // Thông báo xóa thành công
        toast.success(`Đã xóa mốc mục tiêu AIM ${profile.aimScore}`);
        // Tải lại danh sách mới nhất từ Backend
        await fetchProfiles();
      } catch (error: unknown) {
        // Hiển thị thông báo lỗi cụ thể nếu Backend từ chối (ví dụ đang có user tham chiếu)
        toast.error(
          extractTargetErrorMessage(error, 'Không thể xóa mốc mục tiêu này do đang có dữ liệu liên kết')
        );
      }
    },
    [confirm, fetchProfiles, toast]
  );

  /**
   * Xử lý submit form tạo mới hoặc cập nhật mốc mục tiêu AIM.
   *
   * @param data Dữ liệu hợp lệ đã qua kiểm tra bởi Zod schema
   */
  const handleSubmitProfile = useCallback(
    async (data: TargetProfileFormValues) => {
      // Chuẩn hóa mô tả: loại bỏ khoảng trắng thừa ở hai đầu
      const trimmedDescription = data.description?.trim();
      // Đóng gói payload đúng hợp đồng Request DTO của Backend
      const payload = {
        aimScore: data.aimScore,
        description: trimmedDescription && trimmedDescription.length > 0 ? trimmedDescription : undefined,
      };

      try {
        // Bật cờ đang lưu để vô hiệu hóa nút submit tránh gửi trùng
        setIsSubmittingProfile(true);
        // Phân nhánh gọi API cập nhật nếu đang sửa, ngược lại gọi API tạo mới
        if (selectedProfile) {
          await adminTargetService.updateProfile(selectedProfile.id, payload);
          toast.success(`Cập nhật mốc mục tiêu AIM ${data.aimScore} thành công`);
        } else {
          await adminTargetService.createProfile(payload);
          toast.success(`Thêm mới mốc mục tiêu AIM ${data.aimScore} thành công`);
        }
        // Đóng modal và xóa lựa chọn cũ sau khi lưu thành công
        setIsModalOpen(false);
        setSelectedProfile(null);
        // Tải lại danh sách mới nhất từ Backend
        await fetchProfiles();
      } catch (error: unknown) {
        // Hiển thị lỗi chi tiết từ server hoặc thông báo mặc định
        toast.error(extractTargetErrorMessage(error, 'Lưu thông tin mục tiêu điểm số thất bại'));
      } finally {
        // Tắt cờ đang lưu trong mọi trường hợp
        setIsSubmittingProfile(false);
      }
    },
    [selectedProfile, fetchProfiles, toast]
  );

  // Trả ra các state và hàm xử lý cho AdminTargetPage sử dụng
  return {
    profiles,
    isLoadingProfiles,
    errorMessage,
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
