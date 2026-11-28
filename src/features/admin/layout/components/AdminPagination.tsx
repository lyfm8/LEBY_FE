import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AdminPaginationProps {
  /** Chỉ số trang hiện tại (bắt đầu từ 0) */
  currentPage: number;
  /** Tổng số trang */
  totalPages: number;
  /** Tổng số bản ghi khớp bộ lọc */
  totalItems: number;
  /** Số lượng bản ghi trên mỗi trang */
  pageSize: number;
  /** Danh từ mô tả loại đối tượng (ví dụ: 'câu hỏi', 'đề thi') */
  itemLabel: string;
  /** Callback chuyển trang */
  onPageChange: (page: number) => void;
  /** Cờ vô hiệu hóa nút khi đang tải */
  isDisabled?: boolean;
}

/**
 * Thanh phân trang chuẩn dùng chung cho các bảng quản trị Admin LEBY.
 */
export const AdminPagination: React.FC<AdminPaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  itemLabel,
  onPageChange,
  isDisabled = false,
}) => {
  if (totalItems <= 0) {
    return null;
  }

  const safeTotalPages = Math.max(totalPages, 1);
  const startItem = currentPage * pageSize + 1;
  const endItem = Math.min((currentPage + 1) * pageSize, totalItems);

  return (
    <div className="admin-pagination-bar">
      <div className="admin-pagination-counter">
        Hiển thị <strong>{startItem}</strong> – <strong>{endItem}</strong>{' '}
        trong tổng số <strong>{totalItems}</strong> {itemLabel}
      </div>

      <div className="admin-pagination-btn-group">
        <button
          type="button"
          className="admin-pagination-nav-btn"
          disabled={isDisabled || currentPage <= 0}
          onClick={() => onPageChange(currentPage - 1)}
          title="Trang trước"
          aria-label="Trang trước"
        >
          <ChevronLeft size={16} />
        </button>

        <span className="admin-pagination-page-info">
          Trang {currentPage + 1} / {safeTotalPages}
        </span>

        <button
          type="button"
          className="admin-pagination-nav-btn"
          disabled={isDisabled || currentPage + 1 >= safeTotalPages}
          onClick={() => onPageChange(currentPage + 1)}
          title="Trang sau"
          aria-label="Trang sau"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};
