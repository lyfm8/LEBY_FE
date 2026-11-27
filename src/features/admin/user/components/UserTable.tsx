import React from 'react';
import { Link } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { ROLE_LABELS, formatDateTimeVi } from '../utils/schema';
import type { UserListItemResponse } from '../types';

interface UserTableProps {
  // Danh sách người dùng hiển thị trên trang hiện tại
  users: UserListItemResponse[];
  // Cờ đang tải danh sách
  isLoading: boolean;
  // Cờ cho biết có đang bật tìm kiếm/lọc hay không để hiển thị câu Empty phù hợp
  hasActiveFilters: boolean;
  // Callback xóa bộ lọc khi không tìm thấy kết quả
  onResetFilters: () => void;
}

/**
 * Bảng hiển thị danh sách tài khoản người dùng (UC A02 - Bước 2).
 * Cột Hành động gộp gọn vào nút "Xem chi tiết"; mọi thao tác quản trị nằm trong trang chi tiết.
 */
export const UserTable: React.FC<UserTableProps> = ({
  users,
  isLoading,
  hasActiveFilters,
  onResetFilters,
}) => {
  // Trạng thái 1 (Loading): Hiển thị thông báo chờ gọn gàng trong khung bảng
  if (isLoading) {
    return (
      <div className="table-container user-state-box">
        <div className="user-spinner" />
        <span>Đang tải danh sách tài khoản...</span>
      </div>
    );
  }

  // Trạng thái 3 (Empty): Phân biệt chưa có tài khoản nào và không khớp bộ lọc (Ngoại lệ 3b)
  if (users.length === 0) {
    return (
      <div className="table-container user-state-box">
        <p className="user-empty-title">
          {hasActiveFilters
            ? 'Không tìm thấy tài khoản nào khớp với tiêu chí tìm kiếm'
            : 'Chưa có tài khoản người dùng nào trong hệ thống'}
        </p>
        {hasActiveFilters && (
          <button type="button" className="btn-secondary" onClick={onResetFilters}>
            Xóa bộ lọc tìm kiếm
          </button>
        )}
      </div>
    );
  }

  // Trạng thái 4 (Success): Render bảng danh sách đầy đủ các cột theo đặc tả Bước 2
  return (
    <div className="table-container">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Mã</th>
            <th>Họ tên</th>
            <th>Email</th>
            <th>Vai trò</th>
            <th>Mục tiêu AIM</th>
            <th>Ngày đăng ký</th>
            <th>Trạng thái</th>
            <th style={{ textAlign: 'right' }}>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            // Suy ra trạng thái hoạt động ưu tiên isActive boolean, dự phòng status string nếu cần
            const isUserActive = user.isActive ?? user.status === 'ACTIVE';

            // Render từng dòng dữ liệu tài khoản
            return (
              <tr key={user.id}>
                <td className="user-id-cell">#{user.id}</td>

                <td>
                  <Link to={`/admin/users/${user.id}`} className="user-name-link">
                    {user.fullName || 'Chưa cập nhật'}
                  </Link>
                </td>

                <td className="user-email">{user.email}</td>

                <td>
                  <span className="user-role-text">{ROLE_LABELS[user.role] || user.role}</span>
                </td>

                <td className="user-aim-cell">{user.aimTarget || '—'}</td>

                <td className="user-date-cell">{formatDateTimeVi(user.createdAt, false)}</td>

                <td>
                  <span className={`user-status-dot ${isUserActive ? 'is-active' : 'is-locked'}`}>
                    <span className="user-status-dot__circle" />
                    <span>{isUserActive ? 'Đang hoạt động' : 'Bị tạm khóa'}</span>
                  </span>
                </td>

                <td>
                  <div className="action-buttons">
                    <Link
                      to={`/admin/users/${user.id}`}
                      className="btn-action btn-neutral"
                      title="Xem chi tiết tài khoản, lộ trình học và thao tác quản trị"
                    >
                      <Eye size={14} />
                      <span>Xem chi tiết</span>
                    </Link>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
