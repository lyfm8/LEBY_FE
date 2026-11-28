import React from 'react';
import { AdminPagination } from '@/features/admin/layout/components/AdminPagination';

interface PaginationProps {
  // Chỉ số trang hiện tại (bắt đầu từ 0)
  currentPage: number;
  // Tổng số trang
  totalPages: number;
  // Tổng số tài khoản khớp bộ lọc
  totalItems: number;
  // Số lượng bản ghi mỗi trang
  pageSize?: number;
  // Callback chuyển sang trang mới
  onPageChange: (page: number) => void;
}

/**
 * Thanh phân trang danh sách tài khoản người dùng (đồng bộ chuẩn toàn Admin).
 */
export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize = 10,
  onPageChange,
}) => {
  return (
    <AdminPagination
      currentPage={currentPage}
      totalPages={totalPages}
      totalItems={totalItems}
      pageSize={pageSize}
      itemLabel="tài khoản"
      onPageChange={onPageChange}
    />
  );
};
