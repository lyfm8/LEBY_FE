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

  useEffect(() => {
    if (isOpen) {
      if (user) {
        reset({
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          password: '',
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
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">{user ? 'Cập nhật Người dùng' : 'Thêm Người dùng mới'}</h2>
          <button onClick={onClose} className="modal-close"><X size={24} /></button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label className="form-label">Tên đăng nhập</label>
            <input type="text" className="form-input" {...register('username')} disabled={!!user} />
            {errors.username && <p className="form-error">{errors.username.message}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" className="form-input" {...register('email')} />
            {errors.email && <p className="form-error">{errors.email.message}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Họ và tên</label>
            <input type="text" className="form-input" {...register('fullName')} />
            {errors.fullName && <p className="form-error">{errors.fullName.message}</p>}
          </div>

          {!user && (
            <div className="form-group">
              <label className="form-label">Mật khẩu</label>
              <input type="password" className="form-input" {...register('password')} />
              {errors.password && <p className="form-error">{errors.password.message}</p>}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Vai trò</label>
            <select className="form-input" {...register('role')}>
              <option value="STUDENT">Học viên</option>
              <option value="ADMIN">Quản trị viên</option>
            </select>
          </div>

          <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center' }}>
            <input type="checkbox" id="isActive" {...register('isActive')} />
            <label htmlFor="isActive" className="form-label" style={{ marginBottom: 0 }}>Đang hoạt động</label>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={isLoading}>
              Hủy
            </button>
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? 'Đang lưu...' : (user ? 'Cập nhật' : 'Thêm mới')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
