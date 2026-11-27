import React from 'react';

interface PaginationProps {
  // Chỉ số trang hiện tại (bắt đầu từ 0)
  currentPage: number;
  // Tổng số trang
  totalPages: number;
  // Tổng số tài khoản khớp bộ lọc
  totalItems: number;
  // Callback chuyển sang trang mới
  onPageChange: (page: number) => void;
}

/**
 * Thanh phân trang danh sách tài khoản người dùng.
 */
export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
}) => {
  // Ẩn thanh phân trang nếu không có dữ liệu hoặc chỉ có 1 trang duy nhất
  if (totalPages <= 1) {
    return null;
  }

  // Render dãy nút phân trang kèm thống kê tổng số bản ghi
  return (
    <div className="user-pagination-row">
      <span className="user-pagination-summary">
        Trang {currentPage + 1} / {totalPages} • Tổng {totalItems} tài khoản
      </span>

      <div className="pagination-container" style={{ marginTop: 0 }}>
        <button
          type="button"
          className="page-btn"
          disabled={currentPage === 0}
          onClick={() => onPageChange(currentPage - 1)}
        >
          Trước
        </button>

        {Array.from({ length: totalPages }).map((_, index) => (
          <button
            type="button"
            key={index}
            className={`page-btn ${currentPage === index ? 'active' : ''}`}
            onClick={() => onPageChange(index)}
          >
            {index + 1}
          </button>
        ))}

        <button
          type="button"
          className="page-btn"
          disabled={currentPage >= totalPages - 1}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Sau
        </button>
      </div>
    </div>
  );
};
