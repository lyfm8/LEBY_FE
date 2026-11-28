import React from 'react';
import { Eye, Edit3, CheckCircle2, Archive, Trash2 } from 'lucide-react';
import type { ExamListItem } from '../../types';

interface ExamActionMenuProps {
  exam: ExamListItem;
  isAdmin: boolean;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onActivate: (id: number) => void;
  onArchive: (id: number) => void;
  onDelete: (id: number) => void;
}

/**
 * Nhóm nút thao tác phẳng (icon + chữ) cho từng bộ đề thi.
 * Phân quyền ẩn các nút kích hoạt / lưu trữ / xóa đối với Giáo viên.
 */
export const ExamActionMenu: React.FC<ExamActionMenuProps> = ({
  exam,
  isAdmin,
  onView,
  onEdit,
  onActivate,
  onArchive,
  onDelete,
}) => {
  return (
    <div className="admin-actions-cell is-end">
      <button
        type="button"
        className="admin-btn-action"
        onClick={() => onView(exam.id)}
        title="Xem chi tiết"
      >
        <Eye size={14} />
        <span>Xem</span>
      </button>

      <button
        type="button"
        className="admin-btn-action"
        onClick={() => onEdit(exam.id)}
        title="Chỉnh sửa đề thi"
      >
        <Edit3 size={14} />
        <span>Sửa</span>
      </button>

      {/* CHỈ ADMIN MỚI ĐƯỢC PHÉP THAO TÁC CÁC CHỨC NĂNG DƯỚI ĐÂY */}
      {isAdmin && exam.examStatus !== 'ACTIVE' && (
        <button
          type="button"
          className="admin-btn-action"
          onClick={() => onActivate(exam.id)}
          title="Kích hoạt đề thi"
        >
          <CheckCircle2 size={14} />
          <span>Kích hoạt</span>
        </button>
      )}

      {isAdmin && exam.examStatus === 'ACTIVE' && (
        <button
          type="button"
          className="admin-btn-action"
          onClick={() => onArchive(exam.id)}
          title="Lưu trữ đề thi"
        >
          <Archive size={14} />
          <span>Lưu trữ</span>
        </button>
      )}

      {isAdmin && (
        <button
          type="button"
          className="admin-btn-action delete"
          onClick={() => onDelete(exam.id)}
          title="Xóa đề thi"
        >
          <Trash2 size={14} />
          <span>Xóa</span>
        </button>
      )}
    </div>
  );
};

