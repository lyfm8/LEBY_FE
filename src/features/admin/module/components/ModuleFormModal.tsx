import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { moduleFormSchema, type ModuleFormValues } from '../utils/schema';
import type { ModuleResponse } from '../types';
import { adminPartService } from '@/features/admin/part/services/adminPartService';
import type { PartResponse } from '@/features/admin/part/types';
import { X } from 'lucide-react';

interface ModuleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ModuleFormValues) => void;
  moduleData: ModuleResponse | null;
  isLoading: boolean;
}

export const ModuleFormModal: React.FC<ModuleFormModalProps> = ({
  isOpen, onClose, onSubmit, moduleData, isLoading
}) => {
  const [parts, setParts] = useState<PartResponse[]>([]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ModuleFormValues>({
    resolver: zodResolver(moduleFormSchema),
    defaultValues: {
      title: '',
      type: 'THEORY',
      sequence: 1,
      status: 'DRAFT',
      partId: null,
    }
  });

  useEffect(() => {
    if (isOpen) {
      adminPartService.getParts().then(res => {
        if (res.success && res.data) setParts(res.data);
      }).catch(console.error);

      if (moduleData) {
        reset({
          title: moduleData.title,
          type: moduleData.type,
          sequence: moduleData.sequence,
          status: moduleData.status,
          partId: moduleData.partId,
        });
      } else {
        reset({
          title: '',
          type: 'THEORY',
          sequence: 1,
          status: 'DRAFT',
          partId: null,
        });
      }
    }
  }, [isOpen, moduleData, reset]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">
            {moduleData ? 'Cập nhật Module' : 'Thêm Module mới'}
          </h2>
          <button onClick={onClose} className="modal-close">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label className="form-label">Tên Module *</label>
            <input
              {...register('title')}
              className="form-input"
              placeholder="VD: TOEIC Part 1 Overview"
            />
            {errors.title && <p className="form-error">{errors.title.message}</p>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Loại Module</label>
              <select {...register('type')} className="form-input">
                <option value="THEORY">Lý thuyết (Theory)</option>
                <option value="PRACTICE">Luyện tập (Practice)</option>
                <option value="EXAM">Đề thi (Exam)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Thứ tự hiển thị *</label>
              <input
                type="number"
                {...register('sequence')}
                className="form-input"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Part liên kết</label>
              <select {...register('partId')} className="form-input">
                <option value="">-- Không chọn --</option>
                {parts.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Trạng thái</label>
              <select {...register('status')} className="form-input">
                <option value="DRAFT">Bản nháp (DRAFT)</option>
                <option value="PUBLISHED">Xuất bản (PUBLISHED)</option>
                <option value="ARCHIVED">Lưu trữ (ARCHIVED)</option>
              </select>
            </div>
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
