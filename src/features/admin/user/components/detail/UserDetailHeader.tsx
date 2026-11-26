import React from 'react';
import { ArrowDownCircle, ArrowLeft, ArrowUpCircle, Ban, CheckCircle, KeyRound } from 'lucide-react';
import { ROLE_LABELS, formatDateTimeVi } from '../../utils/schema';
import type { UserActiveExamStatusResponse, UserListItemResponse } from '../../types';

interface UserDetailHeaderProps {
  // Thông tin hồ sơ tài khoản đang xem
  profile: UserListItemResponse;
  // Trạng thái phiên thi trực tuyến hiện tại (nếu có)
  activeExamStatus: UserActiveExamStatusResponse;
  // ID tài khoản Admin đang đăng nhập để áp dụng BR11
  currentUserId: number | null;
  // Cờ đang chạy API thao tác (khóa/đổi vai trò/reset pass)
  isActionLoading: boolean;
  // Quay về danh sách người dùng
  onBack: () => void;
  // Khóa hoặc mở khóa tài khoản
  onToggleActive: () => void;
  // Nâng hoặc hạ quyền giữa STUDENT <-> TEACHER
  onToggleRole: () => void;
  // Đặt lại mật khẩu ngẫu nhiên và gửi email
  onResetPassword: () => void;
}

/**
 * Phần đầu trang Chi tiết người dùng: thông tin tóm tắt và các nút thao tác quản trị.
 */
export const UserDetailHeader: React.FC<UserDetailHeaderProps> = ({
  profile,
  activeExamStatus,
  currentUserId,
  isActionLoading,
  onBack,
  onToggleActive,
  onToggleRole,
  onResetPassword,
}) => {
  // Kiểm tra có phải chính tài khoản Admin đang đăng nhập không (BR11)
  const isSelf = currentUserId !== null && currentUserId === profile.id;
  // Suy ra trạng thái hoạt động ưu tiên boolean isActive, dự phòng status string
  const isUserActive = profile.isActive ?? profile.status === 'ACTIVE';
  // Kiểm tra tài khoản có hỗ trợ nâng/hạ quyền không
  const canChangeRole = profile.role === 'STUDENT' || profile.role === 'TEACHER';
  // Lấy chữ cái đầu của họ tên hoặc email để hiển thị avatar mặc định khi chưa có ảnh
  const avatarFallback = (profile.fullName || profile.email || 'U').trim().charAt(0).toUpperCase();

  // Render nút quay lại và thẻ hồ sơ gọn gàng
  return (
    <div className="user-detail-top">
      <button type="button" className="user-back-btn" onClick={onBack}>
        <ArrowLeft size={16} />
        <span>Quay lại danh sách</span>
      </button>

      <div className="user-detail-card">
        <div className="user-detail-card__main">
          <div className="user-detail-identity">
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt={profile.fullName || profile.email}
                className="user-detail-avatar"
              />
            ) : (
              <div className="user-detail-avatar-fallback">{avatarFallback}</div>
            )}

            <div className="user-detail-identity__info">
              <div className="user-detail-title-row">
                <h1 className="user-detail-name">{profile.fullName || 'Chưa cập nhật họ tên'}</h1>
                <span className="user-detail-id">#{profile.id}</span>
              </div>
              <p className="user-detail-email">{profile.email}</p>
              {activeExamStatus.hasActiveExamSession && (
                <p className="user-detail-exam-note">Đang có phiên thi trực tuyến chưa nộp</p>
              )}
            </div>
          </div>

          <div className="user-detail-actions">
            {!isSelf && (
              <button
                type="button"
                className="btn-secondary"
                onClick={onResetPassword}
                disabled={isActionLoading}
              >
                <KeyRound size={15} />
                <span>Đặt lại mật khẩu</span>
              </button>
            )}

            {canChangeRole && !isSelf && (
              <button
                type="button"
                className="btn-secondary"
                onClick={onToggleRole}
                disabled={isActionLoading}
              >
                {profile.role === 'STUDENT' ? (
                  <>
                    <ArrowUpCircle size={15} />
                    <span>Nâng lên Giáo viên</span>
                  </>
                ) : (
                  <>
                    <ArrowDownCircle size={15} />
                    <span>Hạ xuống Học viên</span>
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              className={`btn-action user-detail-lock-btn ${isUserActive ? 'btn-lock' : 'btn-unlock'}`}
              onClick={onToggleActive}
              disabled={isActionLoading || (isSelf && isUserActive)}
              title={isSelf && isUserActive ? 'BR11: Không thể tự khóa tài khoản của chính mình' : undefined}
            >
              {isUserActive ? (
                <>
                  <Ban size={15} />
                  <span>Tạm khóa tài khoản</span>
                </>
              ) : (
                <>
                  <CheckCircle size={15} />
                  <span>Mở khóa tài khoản</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="user-detail-meta-grid">
          <div className="user-detail-meta-item">
            <span className="user-detail-meta-label">Vai trò</span>
            <span className="user-detail-meta-value">{ROLE_LABELS[profile.role] || profile.role}</span>
          </div>

          <div className="user-detail-meta-item">
            <span className="user-detail-meta-label">Mục tiêu AIM</span>
            <span className="user-detail-meta-value">{profile.aimTarget || 'Chưa thiết lập'}</span>
          </div>

          <div className="user-detail-meta-item">
            <span className="user-detail-meta-label">Ngày đăng ký</span>
            <span className="user-detail-meta-value">{formatDateTimeVi(profile.createdAt, false)}</span>
          </div>

          <div className="user-detail-meta-item">
            <span className="user-detail-meta-label">Trạng thái</span>
            <span className={`user-status-dot ${isUserActive ? 'is-active' : 'is-locked'}`}>
              <span className="user-status-dot__circle" />
              <span>{isUserActive ? 'Đang hoạt động' : 'Bị tạm khóa'}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
