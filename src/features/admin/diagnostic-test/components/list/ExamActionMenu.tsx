import React, { useState, useRef, useEffect } from 'react';
import { Eye, Edit3, CheckCircle2, Archive, Trash2, MoreHorizontal } from 'lucide-react';
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
 * Menu thao tác 3 chấm cho từng bộ đề thi.
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
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="action-menu-container" ref={menuRef}>
      <button
        type="button"
        className="action-menu-trigger"
        onClick={() => setIsOpen((prev) => !prev)}
        title="Thao tác"
      >
        <MoreHorizontal size={18} />
      </button>

      {isOpen && (
        <div className="action-menu-dropdown">
          <button
            type="button"
            className="action-menu-item"
            onClick={() => {
              setIsOpen(false);
              onView(exam.id);
            }}
          >
            <Eye size={15} />
            <span>Xem chi tiết</span>
          </button>

          <button
            type="button"
            className="action-menu-item"
            onClick={() => {
              setIsOpen(false);
              onEdit(exam.id);
            }}
          >
            <Edit3 size={15} />
            <span>Chỉnh sửa đề thi</span>
          </button>

          {/* CHỈ ADMIN MỚI ĐƯỢC PHÉP THAO TÁC CÁC CHỨC NĂNG DƯỚI ĐÂY */}
          {isAdmin && exam.examStatus !== 'ACTIVE' && (
            <button
              type="button"
              className="action-menu-item"
              onClick={() => {
                setIsOpen(false);
                onActivate(exam.id);
              }}
            >
              <CheckCircle2 size={15} className="text-green-600" />
              <span>Kích hoạt đề thi</span>
            </button>
          )}

          {isAdmin && exam.examStatus === 'ACTIVE' && (
            <button
              type="button"
              className="action-menu-item"
              onClick={() => {
                setIsOpen(false);
                onArchive(exam.id);
              }}
            >
              <Archive size={15} className="text-gray-500" />
              <span>Lưu trữ đề thi</span>
            </button>
          )}

          {isAdmin && (
            <button
              type="button"
              className="action-menu-item danger"
              onClick={() => {
                setIsOpen(false);
                onDelete(exam.id);
              }}
            >
              <Trash2 size={15} />
              <span>Xóa đề thi</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

