import React, { useEffect, useState, useCallback } from 'react';
import { adminUserService } from '../services/adminUserService';
import type { UserListItemResponse, UserFilterParams } from '../types';
import { UserTable } from '../components/UserTable';
import { UserFilterBar } from '../components/UserFilterBar';
import { Pagination } from '../components/Pagination';
import '../admin-user.css'; // NOTE: Import pure CSS

/**
 * Container Component xử lý Quản lý người dùng.
 * 
 * LƯU Ý KIẾN TRÚC:
 * - Chứa toàn bộ logic gọi API (Danh sách, Chi tiết, Tạo, Sửa, Xóa/Khóa).
 * - Quản lý State phân trang (Pagination) và Bộ lọc (Filters).
 * - Các component con (Table, FilterBar, Modal) nhận data qua props và trigger action qua callback.
 */
export const AdminUserPage: React.FC = () => {
  const [users, setUsers] = useState<UserListItemResponse[]>([]);
  const [filters, setFilters] = useState<UserFilterParams>({ page: 0, pageSize: 10 });
  const [totalPages, setTotalPages] = useState<number>(0);
  
  const [isLoading, setIsLoading] = useState<boolean>(true);

  /**
   * Bước 1: Hàm tải danh sách User từ API dựa trên state `filters`.
   * Tối ưu: Dùng useCallback để tránh tạo lại hàm mỗi lần render, giúp useEffect không bị trigger thừa.
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
    } catch (error) {
      // NOTE: Log lỗi nội bộ, còn UI chỉ báo chung chung để tránh lộ thông tin
      console.error('Failed to fetch users:', error);
      alert('Có lỗi xảy ra khi tải danh sách người dùng');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  // Gọi fetchUsers mỗi khi bộ lọc (filters) thay đổi
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  /**
   * Xử lý merge filter mới vào filter hiện tại để trigger useEffect load lại data.
   */
  const handleFilterChange = (newFilters: Partial<UserFilterParams>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  /**
   * Bước 3: Đổi trạng thái khóa/mở tài khoản nhanh (Soft Deactivate).
   */
  const handleToggleActive = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn thay đổi trạng thái tài khoản này?')) return;
    
    try {
      const res = await adminUserService.toggleActive(id);
      if (res.success) {
        // Tối ưu: Load lại danh sách sau khi toggle thành công để UI tự động cập nhật
        fetchUsers();
      }
    } catch (error) {
      console.error('Failed to toggle user active status:', error);
      alert('Thay đổi trạng thái thất bại');
    }
  };

  return (
    <div className="admin-page-container">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Quản lý Học viên & Tài khoản</h1>
          <p className="admin-page-subtitle">Quản lý thông tin, phân quyền và trạng thái hoạt động của người dùng hệ thống</p>
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

      {/* Tối ưu: Phân trang bắt buộc từ Backend */}
      <Pagination 
        currentPage={filters.page} 
        totalPages={totalPages} 
        onPageChange={(page) => handleFilterChange({ page })} 
      />
    </div>
  );
};

