import React from 'react';
import { AlertCircle, Plus, RotateCcw } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useTargetProfiles } from '../hooks/useTargetProfiles';
import { TargetProfileTable } from '../components/TargetProfileTable';
import { TargetProfileFormModal } from '../components/TargetProfileFormModal';
import '../admin-target.css';

/**
 * Trang Quản lý Mục tiêu điểm số (/admin/targets).
 * Chỉ quản lý danh mục các mốc điểm AIM (tạo, sửa, xóa và xem số lượng học viên).
 */
export const AdminTargetPage: React.FC = () => {
  // Đọc thông tin người dùng hiện tại để phân quyền thao tác ghi (chỉ ADMIN mới được thêm/sửa/xóa)
  const { user } = useAuth();
  // Cờ kiểm tra vai trò Quản trị viên
  const isAdmin = user?.role === 'ADMIN';

  // Lấy toàn bộ state và handler CRUD từ custom hook useTargetProfiles
  const {
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
    refetchProfiles,
  } = useTargetProfiles();

  // Render giao diện trang quản lý danh mục mục tiêu điểm số đồng bộ với trang Quản lý học viên
  return (
    <div className="admin-page-container admin-target-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Mục tiêu điểm số</h1>
          <p className="admin-page-subtitle">
            Quản lý các mốc điểm TOEIC mục tiêu (AIM) và theo dõi số lượng học viên đang theo học
          </p>
        </div>

        {isAdmin && (
          <button
            type="button"
            className="btn-primary target-add-btn"
            onClick={handleAddProfile}
          >
            <Plus size={16} />
            <span>Thêm Mục Tiêu</span>
          </button>
        )}
      </div>

      {errorMessage ? (
        <div className="table-container target-state-box is-error">
          <AlertCircle size={28} color="#dc2626" />
          <p className="target-error-text">{errorMessage}</p>
          <button
            type="button"
            className="btn-primary"
            onClick={() => void refetchProfiles()}
          >
            <RotateCcw size={14} />
            <span>Thử lại</span>
          </button>
        </div>
      ) : (
        <TargetProfileTable
          profiles={profiles}
          isLoading={isLoadingProfiles}
          isAdmin={isAdmin}
          onAdd={handleAddProfile}
          onEdit={handleEditProfile}
          onDelete={(profile) => void handleDeleteProfile(profile)}
        />
      )}

      <TargetProfileFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitProfile}
        profile={selectedProfile}
        isLoading={isSubmittingProfile}
      />
    </div>
  );
};
