import React, { useMemo } from 'react';
import { Edit2, Plus, Trash2 } from 'lucide-react';
import type { TargetProfileResponse } from '../types';

interface TargetProfileTableProps {
  // Danh sách các mốc mục tiêu điểm số lấy từ Backend
  profiles: TargetProfileResponse[];
  // Cờ đang tải danh sách mục tiêu
  isLoading: boolean;
  // Cờ xác định người dùng có quyền quản trị (ADMIN) để hiển thị nút thêm/sửa/xóa hay không
  isAdmin: boolean;
  // Callback mở modal thêm mới mốc mục tiêu khi danh sách đang trống
  onAdd: () => void;
  // Callback mở modal chỉnh sửa một mốc mục tiêu cụ thể
  onEdit: (profile: TargetProfileResponse) => void;
  // Callback xóa một mốc mục tiêu cụ thể
  onDelete: (profile: TargetProfileResponse) => void;
}

/**
 * Bảng hiển thị danh sách các mốc mục tiêu điểm số (AIM),
 * đồng bộ cấu trúc, font chữ và phong cách tối giản với bảng Quản lý học viên (/admin/users).
 */
export const TargetProfileTable: React.FC<TargetProfileTableProps> = ({
  profiles,
  isLoading,
  isAdmin,
  onAdd,
  onEdit,
  onDelete,
}) => {
  // Sắp xếp danh sách mục tiêu theo điểm AIM tăng dần để dễ theo dõi thứ bậc lộ trình
  const sortedProfiles = useMemo(
    () => [...profiles].sort((a, b) => a.aimScore - b.aimScore),
    [profiles]
  );

  // Trạng thái Loading: hiển thị khung chờ đồng nhất với trang Quản lý học viên
  if (isLoading) {
    return (
      <div className="table-container target-state-box">
        <div className="target-spinner" />
        <span>Đang tải danh sách mục tiêu điểm số...</span>
      </div>
    );
  }

  // Trạng thái Empty: hiển thị thông báo rõ ràng kèm nút thêm mới nếu là ADMIN
  if (sortedProfiles.length === 0) {
    return (
      <div className="table-container target-state-box">
        <p className="target-empty-title">Chưa có mốc mục tiêu điểm số nào trong hệ thống</p>
        {isAdmin && (
          <button type="button" className="btn-primary" onClick={onAdd}>
            <Plus size={16} />
            <span>Thêm Mục Tiêu</span>
          </button>
        )}
      </div>
    );
  }

  // Trạng thái Success: render bảng danh sách dùng chung .table-container và .admin-table
  return (
    <div className="table-container">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Mã</th>
            <th>Mục tiêu AIM</th>
            <th>Mô tả</th>
            <th>Số học viên</th>
            {isAdmin && <th style={{ textAlign: 'right' }}>Hành động</th>}
          </tr>
        </thead>
        <tbody>
          {sortedProfiles.map((profile) => {
            // Render từng dòng mốc mục tiêu điểm số
            return (
              <tr key={profile.id}>
                <td className="target-id-cell">#{profile.id}</td>

                <td className="target-score-cell">AIM {profile.aimScore}</td>

                <td className="target-desc-cell">
                  {profile.description?.trim() ? profile.description : 'Chưa có mô tả'}
                </td>

                <td className="target-users-cell">{profile.totalUsers} học viên</td>

                {isAdmin && (
                  <td>
                    <div className="target-action-buttons">
                      <button
                        type="button"
                        className="target-btn-action target-btn-neutral"
                        onClick={() => onEdit(profile)}
                        title="Chỉnh sửa thông tin mục tiêu điểm số"
                      >
                        <Edit2 size={14} />
                        <span>Sửa</span>
                      </button>

                      <button
                        type="button"
                        className="target-btn-action target-btn-danger"
                        onClick={() => onDelete(profile)}
                        title="Xóa mốc mục tiêu điểm số"
                      >
                        <Trash2 size={14} />
                        <span>Xóa</span>
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
