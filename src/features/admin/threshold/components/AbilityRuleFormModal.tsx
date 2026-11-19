import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { abilityRuleSchema, type AbilityRuleFormValues } from '../utils/schema';
import type { AbilityEvaluationRuleResponse } from '../types';
import type { AbilityResponse } from '@/features/admin/part/types';
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
 * Component Modal Form thêm mới hoặc cập nhật Quy tắc đánh giá Năng lực (Ability).
 * Tuân thủ mô hình nhị phân 2 ngưỡng cắt độc lập:
 * - weakMax (developingThreshold, mặc định 50%): Áp dụng khi Part là CONFIRM.
 * - stableMin (stableThreshold, mặc định 75%): Áp dụng khi Part là WEAK.
 */
export const AbilityRuleFormModal: React.FC<AbilityRuleFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  data,
  abilities,
  isLoading,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<AbilityRuleFormValues>({
    resolver: zodResolver(abilityRuleSchema),
    defaultValues: {
      abilityId: 0,
      weakMax: 50,
      stableMin: 75,
      minEvidenceCount: 3,
    },
  });

  const watchedWeakMax = watch('weakMax') || 50;
  const watchedStableMin = watch('stableMin') || 75;

  useEffect(() => {
    if (isOpen) {
      if (data) {
        reset({
          abilityId: data.abilityId,
          weakMax: data.weakMax,
          stableMin: data.stableMin,
          minEvidenceCount: data.minEvidenceCount,
        });
      } else {
        reset({
          abilityId: 0,
          weakMax: 50,
          stableMin: 75,
          minEvidenceCount: 3,
        });
      }
    }
  }, [isOpen, data, reset]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content modal-md">
        <div className="modal-header">
          <h2 className="modal-title">
            {data ? 'Cập nhật Quy tắc Đánh giá Năng lực' : 'Tạo mới Quy tắc Đánh giá Năng lực'}
          </h2>
          <button type="button" onClick={onClose} className="modal-close-btn" disabled={isLoading}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="modal-form">
          {/* Dropdown Năng lực */}
          <div className="form-group">
            <label className="form-label required">Năng lực (Ability)</label>
            <select
              {...register('abilityId', { valueAsNumber: true })}
              disabled={!!data || isLoading}
              className={`select-input ${errors.abilityId ? 'input-error' : ''}`}
            >
              <option value={0}>-- Chọn Năng lực sư phạm --</option>
              {abilities.map(a => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
            {errors.abilityId && <span className="error-message">{errors.abilityId.message}</span>}
          </div>

          {/* Sơ đồ Trực quan 2 Ngưỡng Cắt */}
          <div className="threshold-visual-diagram">
            <div className="visual-diagram-header">
              <span className="text-xs font-semibold text-gray-700">Mô hình phân loại nhị phân Tầng 2:</span>
            </div>
            <div className="visual-range-bar">
              <div
                className="range-segment segment-weak"
                style={{ width: `${Math.min(watchedWeakMax, 100)}%` }}
              >
                <span>YẾU (&lt; {watchedWeakMax}%)</span>
              </div>
              <div
                className="range-segment segment-developing"
                style={{
                  width: `${Math.max(0, Math.min(watchedStableMin - watchedWeakMax, 100))}%`,
                }}
              >
                <span>PHÁT TRIỂN</span>
              </div>
              <div
                className="range-segment segment-stable"
                style={{ width: `${Math.max(0, 100 - watchedStableMin)}%` }}
              >
                <span>VỮNG (&ge; {watchedStableMin}%)</span>
              </div>
            </div>
            <div className="visual-markers">
              <span>0%</span>
              <span style={{ left: `${watchedWeakMax}%` }} className="marker-pin marker-weak">
                {watchedWeakMax}% (CONFIRM cutoff)
              </span>
              <span style={{ left: `${watchedStableMin}%` }} className="marker-pin marker-stable">
                {watchedStableMin}% (WEAK cutoff)
              </span>
              <span>100%</span>
            </div>
          </div>

          {/* Ngưỡng Yếu & Ngưỡng Vững vàng */}
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label required">
                Ngưỡng Yếu (weakMax %)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="100"
                {...register('weakMax', { valueAsNumber: true })}
                className={`text-input ${errors.weakMax ? 'input-error' : ''}`}
              />
              <span className="field-hint">Cutoff nhánh CONFIRM (Mẫu 50.0%)</span>
              {errors.weakMax && <span className="error-message">{errors.weakMax.message}</span>}
            </div>

            <div className="form-group">
              <label className="form-label required">
                Ngưỡng Vững vàng (stableMin %)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="100"
                {...register('stableMin', { valueAsNumber: true })}
                className={`text-input ${errors.stableMin ? 'input-error' : ''}`}
              />
              <span className="field-hint">Cutoff nhánh WEAK (Mẫu 75.0%)</span>
              {errors.stableMin && <span className="error-message">{errors.stableMin.message}</span>}
            </div>
          </div>

          {/* Số câu hỏi kiểm chứng */}
          <div className="form-group">
            <label className="form-label required">Số câu kiểm chứng tối thiểu (Min Evidence)</label>
            <input
              type="number"
              min="1"
              max="50"
              {...register('minEvidenceCount', { valueAsNumber: true })}
              className={`text-input ${errors.minEvidenceCount ? 'input-error' : ''}`}
            />
            <span className="field-hint">Số câu hỏi cần thiết trong bài test để đủ độ tin cậy kết luận năng lực (mặc định 3 câu)</span>
            {errors.minEvidenceCount && (
              <span className="error-message">{errors.minEvidenceCount.message}</span>
            )}
          </div>

          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="btn-secondary"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary"
            >
              {isLoading ? 'Đang lưu...' : data ? 'Cập nhật' : 'Tạo mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
