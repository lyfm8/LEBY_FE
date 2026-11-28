import React from 'react';
import { AlertCircle, Download, RotateCcw } from 'lucide-react';
import { useAdminUsers } from '../hooks/useAdminUsers';
import { UserTable } from '../components/UserTable';
import { UserFilterBar } from '../components/UserFilterBar';
import { Pagination } from '../components/Pagination';
import '../admin-user.css';

/**
 * Trang Quản lý tài khoản người dùng (UC A02).
 * Toàn bộ logic tải dữ liệu, đồng bộ URL và xuất Excel nằm trong useAdminUsers.
 */
export const AdminUserPage: React.FC = () => {
  // Lấy toàn bộ state và hàm xử lý từ custom hook useAdminUsers
  const {
    users,
    targetProfiles,
    filters,
    hasActiveFilters,
    totalPages,
    totalItems,
    isLoading,
    errorMessage,
    isExporting,
    handleFilterChange,
    handleResetFilters,
    handleExportExcel,
    refetch,
  } = useAdminUsers();

  // Render giao diện trang danh sách người dùng
  return (
    <div className="admin-page-container admin-user-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Quản lý Học viên &amp; Tài khoản</h1>
          <p className="admin-page-subtitle">
            Tra cứu tài khoản, xem tiến trình học tập, cấp lại mật khẩu và quản lý quyền truy cập hệ thống
          </p>
        </div>

        <button
          type="button"
          className="btn-secondary user-export-btn"
          onClick={() => void handleExportExcel()}
          disabled={isExporting}
        >
          <Download size={16} />
          <span>{isExporting ? 'Đang xuất file...' : 'Xuất danh sách'}</span>
        </button>
      </div>

      <UserFilterBar
        filters={filters}
        targetProfiles={targetProfiles}
        hasActiveFilters={hasActiveFilters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
      />

      {errorMessage ? (
        <div className="table-container user-state-box is-error">
          <AlertCircle size={28} color="#dc2626" />
          <p className="user-error-text">{errorMessage}</p>
          <button type="button" className="btn-primary" onClick={() => void refetch()}>
            <RotateCcw size={14} />
            <span>Thử lại</span>
          </button>
        </div>
      ) : (
        <>
          <UserTable
            users={users}
            isLoading={isLoading}
            hasActiveFilters={hasActiveFilters}
            onResetFilters={handleResetFilters}
          />

          <Pagination
            currentPage={filters.page}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={filters.size}
            onPageChange={(page) => handleFilterChange({ page })}
          />
        </>
      )}
    </div>
  );
};
