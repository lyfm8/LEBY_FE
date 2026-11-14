import { useState, useEffect, useCallback } from 'react';
import { adminUserService } from '../services/adminUserService';
import type { UserListItemResponse, UserFilterParams } from '../types';

/**
 * Custom hook quản lý toàn bộ nghiệp vụ và state của trang Quản lý Người dùng (Admin User).
 * Tách biệt hoàn toàn logic (State, Data Fetching, Handlers) khỏi Component giao diện.
 *
 * @param initialFilters Bộ lọc mặc định ban đầu (tùy chọn)
 * @returns Các biến trạng thái và hàm thao tác với danh sách người dùng
 */
export function useAdminUsers(initialFilters?: Partial<UserFilterParams>) {
  const [users, setUsers] = useState<UserListItemResponse[]>([]);
  const [filters, setFilters] = useState<UserFilterParams>({
    page: 0,
    pageSize: 10,
    ...initialFilters,
  });
  const [totalPages, setTotalPages] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  /**
   * Tải danh sách User từ API dựa trên state `filters` hiện tại.
   */
  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await adminUserService.getUsers(filters);
      if (res.success && res.data) {
        setUsers(res.data);
        if (res.pagination) {
          setTotalPages(res.pagination.totalPages);
        }
      }
    } catch (error: unknown) {
      console.error('Failed to fetch users:', error);
      alert('Có lỗi xảy ra khi tải danh sách người dùng');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  // Tự động tải lại danh sách mỗi khi bộ lọc hoặc trang thay đổi
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  /**
   * Cập nhật các trường trong bộ lọc tìm kiếm.
   */
  const handleFilterChange = useCallback((newFilters: Partial<UserFilterParams>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  /**
   * Đổi trạng thái khóa/mở tài khoản người dùng (Soft Toggle Active).
   */
  const handleToggleActive = useCallback(
    async (id: number) => {
      if (!window.confirm('Bạn có chắc chắn muốn thay đổi trạng thái tài khoản này?')) return;

      try {
        const res = await adminUserService.toggleActive(id);
        if (res.success) {
          // Tải lại danh sách sau khi đổi trạng thái để UI đồng bộ
          fetchUsers();
        }
      } catch (error: unknown) {
        console.error('Failed to toggle user active status:', error);
        alert('Thay đổi trạng thái thất bại');
      }
    },
    [fetchUsers]
  );

  return {
    users,
    filters,
    totalPages,
    isLoading,
    handleFilterChange,
    handleToggleActive,
    refetch: fetchUsers,
  };
}
