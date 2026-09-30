import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { abilityRuleSchema, type AbilityRuleFormValues } from '../utils/schema';
import type { AbilityEvaluationRuleResponse } from '../types';
import type { AbilityResponse } from '@/features/admin-part/types';
import { X } from 'lucide-react';

interface AbilityRuleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AbilityRuleFormValues) => void;
  data: AbilityEvaluationRuleResponse | null;
  abilities: AbilityResponse[];
  isLoading: boolean;
}

/**
 * Component Modal Form dùng để thêm mới hoặc sửa Quy tắc đánh giá Năng lực (Ability).
 * 
 * NOTE: Giao diện yêu cầu nhập các ngưỡng % để xếp loại học viên (Stable/Developing/Weak).
 * Zod schema đảm bảo validation: developingThreshold < stableThreshold.
 * Trạng thái DRAFT (Nháp) hay PUBLISHED (Hoạt động) quyết định rule này có được hệ thống áp dụng tính toán hay không.
 * 
 * @param isOpen Trạng thái hiển thị modal
 * @param onClose Hàm đóng modal
 * @param onSubmit Callback khi form validate thành công và click lưu
 * @param data Dữ liệu bản ghi hiện tại (nếu ở mode Edit)
 * @param abilities Danh sách Năng lực (master data) để bind vào dropdown
 * @param isLoading Trạng thái đang call API
 */
export const AbilityRuleFormModal: React.FC<AbilityRuleFormModalProps> = ({
  isOpen, onClose, onSubmit, data, abilities, isLoading
}) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<AbilityRuleFormValues>({
    resolver: zodResolver(abilityRuleSchema),
    defaultValues: {
      abilityId: 0,
      stableThreshold: 80,
      developingThreshold: 50,
      status: 'DRAFT'
    }
  });

  // Tự động load data vào form khi Mở Modal ở chế độ chỉnh sửa, hoặc reset trắng ở chế độ thêm mới.
  React.useEffect(() => {
    if (isOpen) {
      if (data) {
        reset({
          abilityId: data.abilityId,
          stableThreshold: data.stableThreshold,
          developingThreshold: data.developingThreshold,
          status: data.status
        });
      } else {
        // Mặc định an toàn cho form khi tạo mới
        reset({
          abilityId: 0,
          stableThreshold: 80,
          developingThreshold: 50,
          status: 'DRAFT'
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
            {data ? 'Sửa Quy Tắc Đánh Giá Năng Lực' : 'Thêm Quy Tắc Đánh Giá'}
          </h2>
          <button onClick={onClose} className="modal-close">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label className="form-label">Năng lực (Ability) <span style={{ color: '#ef4444' }}>*</span></label>
            <select
              {...register('abilityId', { valueAsNumber: true })}
              className="form-input"
            >
              <option value={0} disabled>Chọn Năng lực</option>
              {abilities.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
            {errors.abilityId && <p className="form-error">{errors.abilityId.message}</p>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Trạng thái (Status)</label>
              <select
                {...register('status')}
                className="form-input"
              >
                <option value="DRAFT">Nháp (DRAFT)</option>
                <option value="PUBLISHED">Hoạt động (PUBLISHED)</option>
              </select>
            </div>
          </div>

          <div className="settings-box green">
            <h4>Thiết lập Ngưỡng (%)</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="form-label">Stable (Ổn định)</label>
                <input
                  type="number"
                  {...register('stableThreshold', { valueAsNumber: true })}
                  className="form-input"
                  style={{ borderColor: '#dcfce7' }}
                />
                {errors.stableThreshold && <p className="form-error">{errors.stableThreshold.message}</p>}
              </div>
              <div>
                <label className="form-label">Developing (Đang phát triển)</label>
                <input
                  type="number"
                  {...register('developingThreshold', { valueAsNumber: true })}
                  className="form-input"
                  style={{ borderColor: '#dcfce7' }}
                />
                {errors.developingThreshold && <p className="form-error">{errors.developingThreshold.message}</p>}
              </div>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#15803d', marginTop: '0.75rem' }}>Lưu ý: Dưới mức Developing sẽ được đánh giá là WEAK (Yếu).</p>
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
