import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { abilityFormSchema, type AbilityFormValues } from '../utils/schema';
import type { AbilityResponse } from '../types';
import { X } from 'lucide-react';

interface AbilityFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AbilityFormValues) => void;
  ability: AbilityResponse | null;
  isLoading: boolean;
  partName: string;
}

export const AbilityFormModal: React.FC<AbilityFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  ability,
  isLoading,
  partName
}) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<AbilityFormValues>({
    resolver: zodResolver(abilityFormSchema),
    defaultValues: {
      name: '',
      description: '',
    }
  });

  useEffect(() => {
    if (isOpen) {
      if (ability) {
        reset({
          name: ability.name,
          description: ability.description || '',
        });
      } else {
        reset({ name: '', description: '' });
      }
    }
  }, [isOpen, ability, reset]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">
            {ability ? 'Cập nhật Năng lực' : 'Thêm Năng lực mới'}
          </h2>
          <button onClick={onClose} className="modal-close" type="button"><X size={24} /></button>
        </div>
        
        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1.5rem' }}>
          Áp dụng cho phần thi: <strong style={{ color: '#111827' }}>{partName}</strong>
        </p>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label className="form-label">Tên năng lực <span style={{ color: '#dc2626' }}>*</span></label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Ví dụ: Identifying Actions" 
              {...register('name')} 
            />
            {errors.name && <p className="form-error">{errors.name.message}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Mô tả chi tiết</label>
            <textarea 
              className="form-textarea" 
              rows={4}
              placeholder="Giải thích chi tiết về năng lực này..."
              {...register('description')}
            />
            {errors.description && <p className="form-error">{errors.description.message}</p>}
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={isLoading}>
              Hủy
            </button>
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? 'Đang lưu...' : (ability ? 'Cập nhật' : 'Thêm mới')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
