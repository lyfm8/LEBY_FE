import React from 'react';
import { useAdminUsers } from '../hooks/useAdminUsers';
import { UserTable } from '../components/UserTable';
import { UserFilterBar } from '../components/UserFilterBar';
import { Pagination } from '../components/Pagination';
import '../admin-user.css';

/**
 * Presentational Container Component: Quản lý người dùng & học viên.
 * Toàn bộ logic (state, API fetching, handlers) được ủy quyền cho hook useAdminUsers.
 */
export const AdminUserPage: React.FC = () => {
  const {
    users,
    filters,
    totalPages,
    isLoading,
    handleFilterChange,
    handleToggleActive,
  } = useAdminUsers();

  return (
    <div className="admin-page-container">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Quản lý Học viên & Tài khoản</h1>
          <p className="admin-page-subtitle">
            Quản lý thông tin, phân quyền và trạng thái hoạt động của người dùng hệ thống
          </p>
        </div>
      </div>

      <UserFilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      <UserTable
        users={users}
        isLoading={isLoading}
        onToggleActive={handleToggleActive}
      />

      <Pagination
        currentPage={filters.page}
        totalPages={totalPages}
        onPageChange={(page) => handleFilterChange({ page })}
      />
    </div>
  );
};
