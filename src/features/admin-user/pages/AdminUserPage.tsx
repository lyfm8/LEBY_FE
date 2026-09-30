import React, { useEffect, useState, useCallback } from 'react';
import { adminUserService } from '../services/adminUserService';
import type { UserListItemResponse, UserFilterParams, UserDetailResponse } from '../types';
import type { UserFormValues } from '../utils/schema';
import { UserTable } from '../components/UserTable';
import { UserFilterBar } from '../components/UserFilterBar';
import { UserFormModal } from '../components/UserFormModal';
import { Pagination } from '../components/Pagination';

export const AdminUserPage: React.FC = () => {
  const [users, setUsers] = useState<UserListItemResponse[]>([]);
  const [filters, setFilters] = useState<UserFilterParams>({ page: 0, pageSize: 10 });
  const [totalPages, setTotalPages] = useState<number>(0);
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  const [selectedUser, setSelectedUser] = useState<UserDetailResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Load danh sách người dùng
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
      console.error('Failed to fetch users:', error);
      alert('Có lỗi xảy ra khi tải danh sách người dùng');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Xử lý thay đổi filter
  const handleFilterChange = (newFilters: Partial<UserFilterParams>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Mở modal thêm mới
  const handleAddNew = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  // Mở modal sửa (cần fetch chi tiết)
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

  // Xử lý khóa / mở khóa tài khoản (toggle active)
  const handleToggleActive = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn thay đổi trạng thái tài khoản này?')) return;
    
    try {
      const res = await adminUserService.toggleActive(id);
      if (res.success) {
        // Refetch danh sách thay vì reload trang
        fetchUsers();
      }
    } catch (error) {
      console.error('Failed to toggle user active status:', error);
      alert('Thay đổi trạng thái thất bại');
    }
  };

  // Submit form (Tạo mới hoặc Cập nhật)
  const handleFormSubmit = async (data: UserFormValues) => {
    try {
      setIsSubmitting(true);
      if (selectedUser) {
        // Cập nhật
        await adminUserService.update(selectedUser.id, {
          username: data.username,
          email: data.email,
          fullName: data.fullName,
          role: data.role,
          isActive: data.isActive
        });
      } else {
        // Tạo mới
        await adminUserService.create({
          ...data,
          password: data.password || '123456' // Fallback an toàn nếu thiếu
        });
      }
      setIsModalOpen(false);
      fetchUsers(); // Tải lại danh sách
    } catch (error) {
      console.error('Failed to save user:', error);
      alert('Lưu thông tin thất bại, vui lòng kiểm tra lại');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý Học viên & Tài khoản</h1>
        <p className="text-gray-500 mt-1">Quản lý thông tin, phân quyền và trạng thái hoạt động của người dùng hệ thống</p>
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
