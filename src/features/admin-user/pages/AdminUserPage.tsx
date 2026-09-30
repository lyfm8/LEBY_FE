import React, { useEffect, useState, useCallback } from 'react';
import { adminUserService } from '../services/adminUserService';
import type { UserListItemResponse, UserFilterParams, UserDetailResponse } from '../types';
import type { UserFormValues } from '../utils/schema';
import { UserTable } from '../components/UserTable';
import { UserFilterBar } from '../components/UserFilterBar';
import { UserFormModal } from '../components/UserFormModal';
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
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  const [selectedUser, setSelectedUser] = useState<UserDetailResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

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
   * Reset thông tin để mở Modal ở chế độ Tạo mới.
   */
  const handleAddNew = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  /**
   * Bước 2: Gọi API lấy dữ liệu chi tiết (đầy đủ các trường) trước khi mở Modal sửa.
   * Tối ưu: Không dùng data từ danh sách vì danh sách thường không chứa đủ thông tin chi tiết.
   */
  const handleEdit = async (id: number) => {
    try {
      const res = await adminUserService.getById(id);
      if (res.success && res.data) {
        setSelectedUser(res.data);
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error('Failed to fetch user details:', error);
      alert('Không thể lấy thông tin chi tiết người dùng');
    }
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

  /**
   * Bước 4: Xử lý Submit Form (Dùng chung cho cả Create và Update).
   */
  const handleFormSubmit = async (data: UserFormValues) => {
    try {
      setIsSubmitting(true);
      if (selectedUser) {
        // Cập nhật người dùng hiện tại
        await adminUserService.update(selectedUser.id, {
          username: data.username,
          email: data.email,
          fullName: data.fullName,
          role: data.role,
          isActive: data.isActive
        });
      } else {
        // Tạo mới người dùng
        await adminUserService.create({
          ...data,
          // SECURITY: Nếu Backend yêu cầu mật khẩu, gửi mật khẩu default.
          password: data.password || '123456' 
        });
      }
      setIsModalOpen(false);
      fetchUsers(); 
    } catch (error) {
      console.error('Failed to save user:', error);
      alert('Lưu thông tin thất bại, vui lòng kiểm tra lại');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-page-container">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Quản lý Học viên & Tài khoản</h1>
        <p className="admin-page-subtitle">Quản lý thông tin, phân quyền và trạng thái hoạt động của người dùng hệ thống</p>
      </div>

      <UserFilterBar 
        filters={filters} 
        onFilterChange={handleFilterChange} 
        onAddNew={handleAddNew} 
      />

      <UserTable 
        users={users} 
        isLoading={isLoading} 
        onEdit={handleEdit} 
        onToggleActive={handleToggleActive} 
      />

      {/* Tối ưu: Phân trang bắt buộc từ Backend */}
      <Pagination 
        currentPage={filters.page} 
        totalPages={totalPages} 
        onPageChange={(page) => handleFilterChange({ page })} 
      />

      <UserFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        user={selectedUser}
        isLoading={isSubmitting}
      />
    </div>
  );
};

