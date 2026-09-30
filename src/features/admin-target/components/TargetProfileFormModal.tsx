import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { targetProfileSchema, type TargetProfileFormValues } from '../utils/schema';
import type { TargetProfileResponse } from '../types';
import { X } from 'lucide-react';

interface TargetProfileFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TargetProfileFormValues) => void;
  profile: TargetProfileResponse | null;
  isLoading: boolean;
}

export const TargetProfileFormModal: React.FC<TargetProfileFormModalProps> = ({
  isOpen, onClose, onSubmit, profile, isLoading
}) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<TargetProfileFormValues>({
    resolver: zodResolver(targetProfileSchema),
    defaultValues: {
      name: '',
      aimScore: 0,
      description: ''
    }
  });

  React.useEffect(() => {
    if (isOpen) {
      if (profile) {
        reset({
          name: profile.name,
          aimScore: profile.aimScore,
          description: profile.description || ''
        });
      } else {
        reset({
          name: '',
          aimScore: 0,
          description: ''
        });
      }
    }
  }, [isOpen, profile, reset]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">
            {profile ? 'Sửa Mục Tiêu' : 'Thêm Mục Tiêu Mới'}
          </h2>
          <button onClick={onClose} className="modal-close">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label className="form-label">Tên mục tiêu <span style={{ color: '#ef4444' }}>*</span></label>
            <input
              {...register('name')}
              className="form-input"
              placeholder="VD: Đột phá 650"
            />
            {errors.name && <p className="form-error">{errors.name.message}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Điểm Aim <span style={{ color: '#ef4444' }}>*</span></label>
            <input
              type="number"
              {...register('aimScore', { valueAsNumber: true })}
              className="form-input"
              placeholder="VD: 650"
            />
            {errors.aimScore && <p className="form-error">{errors.aimScore.message}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Mô tả</label>
            <textarea
              {...register('description')}
              rows={3}
              className="form-textarea"
              placeholder="Mô tả cho mục tiêu này..."
            />
          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary"
            >
              {isLoading ? 'Đang lưu...' : 'Lưu lại'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
