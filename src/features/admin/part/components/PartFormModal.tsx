import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { partFormSchema, type PartFormValues } from '../utils/schema';
import type { PartResponse } from '../types';
import { X } from 'lucide-react';

interface PartFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PartFormValues) => void;
  part: PartResponse | null;
  isLoading: boolean;
}

export const PartFormModal: React.FC<PartFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  part,
  isLoading
}) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<PartFormValues>({
    resolver: zodResolver(partFormSchema),
    defaultValues: {
      name: '',
      sections: 'LISTENING',
      description: '',
    }
  });

  useEffect(() => {
    if (isOpen) {
      if (part) {
        reset({
          name: part.name,
          sections: part.sections,
          description: part.description || '',
        });
      } else {
        reset({
          name: '',
          sections: 'LISTENING',
          description: '',
        });
      }
    }
  }, [isOpen, part, reset]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">
            {part ? 'Cập nhật Phần thi (Part)' : 'Thêm Phần thi mới (Part)'}
          </h2>
          <button onClick={onClose} className="modal-close" type="button">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label className="form-label">
              Tên phần thi <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Ví dụ: Part 1: Photographs" 
              {...register('name')} 
            />
            {errors.name && <p className="form-error">{errors.name.message}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">
              Kỹ năng (Section) <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <select className="form-input" {...register('sections')}>
              <option value="LISTENING">Listening (Nghe hiểu)</option>
              <option value="READING">Reading (Đọc hiểu)</option>
            </select>
            {errors.sections && <p className="form-error">{errors.sections.message}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Mô tả chi tiết</label>
            <textarea 
              className="form-textarea" 
              rows={3}
              placeholder="Mô tả cấu trúc, dạng câu hỏi của phần thi này..." 
              {...register('description')}
            />
            {errors.description && <p className="form-error">{errors.description.message}</p>}
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={isLoading}>
              Hủy
            </button>
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? 'Đang lưu...' : (part ? 'Cập nhật' : 'Thêm mới')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
