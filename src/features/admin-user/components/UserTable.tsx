import React from 'react';
import type { UserListItemResponse } from '../types';
import { Edit2, Ban, CheckCircle } from 'lucide-react';

interface UserTableProps {
  users: UserListItemResponse[];
  onEdit: (id: number) => void;
  onToggleActive: (id: number) => void;
  isLoading: boolean;
}

export const UserTable: React.FC<UserTableProps> = ({ users, onEdit, onToggleActive, isLoading }) => {
  if (isLoading) {
    return <div style={{ textAlign: 'center', padding: '2.5rem', color: '#6b7280' }}>Đang tải dữ liệu...</div>;
  }

  return (
    <div className="table-container">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Họ Tên</th>
            <th>Email</th>
            <th>AIM Target</th>
            <th style={{ textAlign: 'center' }}>Trạng thái</th>
            <th>Ngày Đăng Ký</th>
            <th style={{ textAlign: 'right' }}>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                Không tìm thấy người dùng nào
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user.id}>
                <td>
                  <div className="user-name">{user.fullName}</div>
                  {user.role === 'ADMIN' && (
                    <span className="badge badge-admin" style={{ marginTop: '0.25rem' }}>{user.role}</span>
                  )}
                </td>
                <td className="user-email">{user.email}</td>
                <td style={{ color: '#4b5563', fontWeight: 500 }}>
                  {user.aimTarget || '—'}
                </td>
                <td style={{ textAlign: 'center' }}>
                  {user.isActive ? (
                    <span className="badge badge-active">
                      Hoạt động
                    </span>
                  ) : (
                    <span className="badge badge-inactive">
                      Đã khóa
                    </span>
                  )}
                </td>
                <td style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                  {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      onClick={() => onEdit(user.id)}
                      className="btn-icon"
                      title="Chỉnh sửa"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => onToggleActive(user.id)}
                      className={`btn-icon ${user.isActive ? 'danger' : 'success'}`}
                      title={user.isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                    >
                      {user.isActive ? <Ban size={18} /> : <CheckCircle size={18} />}
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
