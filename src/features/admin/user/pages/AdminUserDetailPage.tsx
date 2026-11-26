import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { useAdminUserDetail } from '../hooks/useAdminUserDetail';
import { UserDetailHeader } from '../components/detail/UserDetailHeader';
import { UserLearningPathTab } from '../components/detail/UserLearningPathTab';
import { UserDiagnosticHistoryTab } from '../components/detail/UserDiagnosticHistoryTab';
import { UserModuleTestHistoryTab } from '../components/detail/UserModuleTestHistoryTab';
import { UserMockTestHistoryTab } from '../components/detail/UserMockTestHistoryTab';
import '../admin-user.css';

/**
 * Trang Chi tiết tài khoản người dùng & tiến trình học tập (/admin/users/:id).
 * Bố cục tối giản theo phong cách trang Student, đồng bộ tab đang xem lên URL (?tab=...).
 */
export const AdminUserDetailPage: React.FC = () => {
  // Lấy dữ liệu chi tiết và các callback thao tác từ custom hook
  const {
    currentUserId,
    detail,
    activeTab,
    isLoading,
    errorMessage,
    isNotFound,
    isActionLoading,
    handleTabChange,
    handleBackToList,
    handleToggleActive,
    handleToggleTeacherRole,
    handleResetPassword,
    refetch,
  } = useAdminUserDetail();

  // Trạng thái 1 (Loading): Hiển thị vòng xoay chờ gọn nhẹ
  if (isLoading) {
    return (
      <div className="admin-page-container admin-user-page">
        <div className="table-container user-state-box">
          <div className="user-spinner" />
          <span>Đang tải thông tin người dùng...</span>
        </div>
      </div>
    );
  }

  // Trạng thái 2 (NotFound / Error): Phân biệt 404 không tồn tại và lỗi kết nối có nút Thử lại
  if (errorMessage || !detail) {
    return (
      <div className="admin-page-container admin-user-page">
        <div className="table-container user-state-box is-error">
          <AlertCircle size={30} color="#dc2626" />
          <p className="user-error-text">{errorMessage || 'Dữ liệu người dùng không tồn tại'}</p>
          <div className="user-state-actions">
            {!isNotFound && (
              <button type="button" className="btn-primary" onClick={() => void refetch()}>
                <RotateCcw size={14} />
                <span>Thử lại</span>
              </button>
            )}
            <button type="button" className="btn-secondary" onClick={handleBackToList}>
              Quay lại danh sách
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Trạng thái 3 (Success): Render Header thông tin + 4 Tab tiến trình học tập
  return (
    <div className="admin-page-container admin-user-page">
      <UserDetailHeader
        profile={detail.profile}
        activeExamStatus={detail.activeExamStatus}
        currentUserId={currentUserId}
        isActionLoading={isActionLoading}
        onBack={handleBackToList}
        onToggleActive={() => void handleToggleActive()}
        onToggleRole={() => void handleToggleTeacherRole()}
        onResetPassword={() => void handleResetPassword()}
      />

      <div className="user-detail-tabs" role="tablist" aria-label="Tiến trình học tập người dùng">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'learning-path'}
          className={`user-detail-tab ${activeTab === 'learning-path' ? 'is-active' : ''}`}
          onClick={() => handleTabChange('learning-path')}
        >
          Lộ trình học ({detail.learningPath?.items.length ?? 0})
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'diagnostic'}
          className={`user-detail-tab ${activeTab === 'diagnostic' ? 'is-active' : ''}`}
          onClick={() => handleTabChange('diagnostic')}
        >
          Thi chẩn đoán ({detail.diagnosticHistory.length})
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'module-test'}
          className={`user-detail-tab ${activeTab === 'module-test' ? 'is-active' : ''}`}
          onClick={() => handleTabChange('module-test')}
        >
          Vượt ải mô-đun ({detail.moduleTestHistory.length})
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'mock-test'}
          className={`user-detail-tab ${activeTab === 'mock-test' ? 'is-active' : ''}`}
          onClick={() => handleTabChange('mock-test')}
        >
          Điểm thi thử ({detail.mockTestHistory.length})
        </button>
      </div>

      {activeTab === 'learning-path' && (
        <UserLearningPathTab learningPath={detail.learningPath} />
      )}

      {activeTab === 'diagnostic' && (
        <UserDiagnosticHistoryTab history={detail.diagnosticHistory} />
      )}

      {activeTab === 'module-test' && (
        <UserModuleTestHistoryTab history={detail.moduleTestHistory} />
      )}

      {activeTab === 'mock-test' && (
        <UserMockTestHistoryTab history={detail.mockTestHistory} />
      )}
    </div>
  );
};
