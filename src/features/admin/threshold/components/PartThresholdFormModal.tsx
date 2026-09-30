import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { partThresholdSchema, type PartThresholdFormValues } from '../utils/schema';
import type { TargetPartThresholdResponse } from '../types';
import type { PartResponse } from '@/features/admin/part/types';
import type { TargetProfileResponse } from '@/features/admin/target/types';
import { X } from 'lucide-react';

interface PartThresholdFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PartThresholdFormValues) => void;
  data: TargetPartThresholdResponse | null;
  parts: PartResponse[];
  profiles: TargetProfileResponse[];
  isLoading: boolean;
}

/**
 * Component Modal Form dùng để thêm mới hoặc sửa Ngưỡng điểm của Part.
 * 
 * NOTE: Sử dụng React Hook Form kết hợp Zod Resolver để validate dữ liệu ngay tại Client-side.
 * Form bắt buộc logic: weakThreshold < confirmThreshold < passThreshold.
 * 
 * @param isOpen Trạng thái hiển thị modal
 * @param onClose Hàm đóng modal
 * @param onSubmit Callback khi form validate thành công và ấn submit
 * @param data Dữ liệu bản ghi hiện tại (nếu là chế độ Edit)
 * @param parts Danh sách toàn bộ Part (dropdown)
 * @param profiles Danh sách toàn bộ AIM Profile (dropdown)
 * @param isLoading Trạng thái đang call api lưu
 */
export const PartThresholdFormModal: React.FC<PartThresholdFormModalProps> = ({
  isOpen, onClose, onSubmit, data, parts, profiles, isLoading
}) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<PartThresholdFormValues>({
    resolver: zodResolver(partThresholdSchema),
    defaultValues: {
      partId: 0,
      targetProfileId: 0,
      passThreshold: 75,
      confirmThreshold: 50,
      weakThreshold: 30
    }
  });

  // Lắng nghe sự thay đổi của props 'isOpen' hoặc 'data' để cập nhật dữ liệu form tương ứng
  React.useEffect(() => {
    if (isOpen) {
      if (data) {
        reset({
          partId: data.partId,
          targetProfileId: data.targetProfileId,
          passThreshold: data.passThreshold,
          confirmThreshold: data.confirmThreshold,
          weakThreshold: data.weakThreshold
        });
      } else {
        // Form mặc định khi thêm mới
        reset({
          partId: 0,
          targetProfileId: 0,
          passThreshold: 75,
          confirmThreshold: 50,
          weakThreshold: 30
        });
      }
    }
  }, [isOpen, data, reset]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">
            {data ? 'Sửa Ngưỡng Điểm Part' : 'Thêm Ngưỡng Điểm Part'}
          </h2>
          <button onClick={onClose} className="modal-close">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Part <span style={{ color: '#ef4444' }}>*</span></label>
              <select
                {...register('partId', { valueAsNumber: true })}
                className="form-input"
              >
                <option value={0} disabled>Chọn Part</option>
                {parts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              {errors.partId && <p className="form-error">{errors.partId.message}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Mục tiêu (AIM) <span style={{ color: '#ef4444' }}>*</span></label>
              <select
                {...register('targetProfileId', { valueAsNumber: true })}
                className="form-input"
              >
                <option value={0} disabled>Chọn Mục tiêu</option>
                {profiles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              {errors.targetProfileId && <p className="form-error">{errors.targetProfileId.message}</p>}
            </div>
          </div>

          <div className="settings-box">
            <h4>Thiết lập Ngưỡng (%)</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="form-label">Pass (Qua bài)</label>
                <input
                  type="number"
                  {...register('passThreshold', { valueAsNumber: true })}
                  className="form-input"
                  style={{ borderColor: '#bfdbfe' }}
                />
                {errors.passThreshold && <p className="form-error">{errors.passThreshold.message}</p>}
              </div>
              <div>
                <label className="form-label">Confirm (Cần xác nhận lại)</label>
                <input
                  type="number"
                  {...register('confirmThreshold', { valueAsNumber: true })}
                  className="form-input"
                  style={{ borderColor: '#bfdbfe' }}
                />
                {errors.confirmThreshold && <p className="form-error">{errors.confirmThreshold.message}</p>}
              </div>
              <div>
                <label className="form-label">Weak (Yếu)</label>
                <input
                  type="number"
                  {...register('weakThreshold', { valueAsNumber: true })}
                  className="form-input"
                  style={{ borderColor: '#bfdbfe' }}
                />
                {errors.weakThreshold && <p className="form-error">{errors.weakThreshold.message}</p>}
              </div>
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
