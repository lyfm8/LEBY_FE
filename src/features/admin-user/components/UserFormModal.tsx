import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userFormSchema, type UserFormValues } from '../utils/schema';
import type { UserDetailResponse } from '../types';
import { X } from 'lucide-react';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UserFormValues) => void;
  user: UserDetailResponse | null;
  isLoading: boolean;
}

export const UserFormModal: React.FC<UserFormModalProps> = ({ isOpen, onClose, onSubmit, user, isLoading }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: '',
      email: '',
      fullName: '',
      password: '',
      role: 'STUDENT',
      isActive: true,
    }
  });

  // Bước 1: Reset form khi mở modal (tạo mới hoặc sửa)
  useEffect(() => {
    if (isOpen) {
      if (user) {
        reset({
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          password: '', // Không fetch được password từ BE, bỏ trống
          role: user.role,
          isActive: user.isActive,
        });
      } else {
        reset({
          username: '',
          email: '',
          fullName: '',
          password: '',
          role: 'STUDENT',
          isActive: true,
        });
      }
    }
  }, [isOpen, user, reset]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="text-lg font-bold text-gray-800">
            {user ? 'Cập nhật người dùng' : 'Thêm người dùng mới'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
              <input
                {...register('username')}
                disabled={!!user} // Thường username không cho đổi sau khi tạo
                className={`w-full p-2 border rounded-md focus:ring-blue-500 ${errors.username ? 'border-red-500' : 'border-gray-300'} ${user ? 'bg-gray-100' : ''}`}
                placeholder="VD: user01"
              />
              {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                {...register('email')}
                className={`w-full p-2 border rounded-md focus:ring-blue-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Email liên hệ"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên *</label>
            <input
              {...register('fullName')}
              className={`w-full p-2 border rounded-md focus:ring-blue-500 ${errors.fullName ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="VD: Nguyễn Văn A"
            />
            {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
          </div>

          {!user && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu *</label>
              <input
                type="password"
                {...register('password')}
                className={`w-full p-2 border rounded-md focus:ring-blue-500 ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Nhập mật khẩu cho tài khoản mới"
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quyền (Role)</label>
              <select
                {...register('role')}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500"
              >
                <option value="STUDENT">Học viên (STUDENT)</option>
                <option value="ADMIN">Quản trị (ADMIN)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
              <div className="flex items-center h-10">
                <input
                  type="checkbox"
                  {...register('isActive')}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-600">Đang hoạt động</span>
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
            >
              {isLoading ? 'Đang lưu...' : (user ? 'Cập nhật' : 'Tạo mới')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
