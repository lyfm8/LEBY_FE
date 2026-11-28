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

  const rawWeakMax = watch('weakMax');
  const rawStableMin = watch('stableMin');
  const watchedWeakMax = Number.isFinite(rawWeakMax) ? Math.min(Math.max(rawWeakMax, 0), 100) : 50;
  const watchedStableMin = Number.isFinite(rawStableMin)
    ? Math.min(Math.max(rawStableMin, watchedWeakMax), 100)
    : 75;

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
    <div className="modal-overlay" onClick={() => !isLoading && onClose()}>
      <div
        className="modal-content threshold-modal threshold-modal-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h2 className="modal-title">
              {data ? 'Cập nhật Quy tắc Đánh giá Năng lực' : 'Tạo mới Quy tắc Đánh giá Năng lực'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="modal-close"
            disabled={isLoading}
            aria-label="Đóng hộp thoại"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="threshold-modal-form">
          {/* Dropdown Năng lực */}
          <div className="form-group">
            <label className="form-label" htmlFor="ability-rule-select">
              <span className="threshold-label-main">
                Năng lực (Ability) <span className="threshold-required-mark">*</span>
              </span>
            </label>
            <select
              id="ability-rule-select"
              {...register('abilityId', { valueAsNumber: true })}
              disabled={!!data || isLoading}
              className={`form-select ${errors.abilityId ? 'is-invalid' : ''}`}
            >
              <option value={0}>-- Chọn Năng lực sư phạm --</option>
              {abilities.map(a => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
            {errors.abilityId && <span className="form-error">{errors.abilityId.message}</span>}
          </div>

          {/* Sơ đồ Trực quan 2 Ngưỡng Cắt */}
          <div className="threshold-visual-diagram">
            <div className="visual-diagram-header">
              <span className="visual-diagram-title">Mô hình phân loại nhị phân Tầng 2</span>
            </div>

            <div className="visual-range-bar">
              <div
                className="range-segment segment-weak"
                style={{ width: `${watchedWeakMax}%` }}
              >
                {watchedWeakMax >= 15 && <span>YẾU</span>}
              </div>
              <div
                className="range-segment segment-developing"
                style={{ width: `${Math.max(0, watchedStableMin - watchedWeakMax)}%` }}
              >
                {watchedStableMin - watchedWeakMax >= 16 && <span>PHÁT TRIỂN</span>}
              </div>
              <div
                className="range-segment segment-stable"
                style={{ width: `${Math.max(0, 100 - watchedStableMin)}%` }}
              >
                {100 - watchedStableMin >= 15 && <span>VỮNG</span>}
              </div>
            </div>

            <div className="visual-legend-grid cols-3">
              <div className="visual-legend-card">
                <div className="visual-legend-top">
                  <span className="visual-legend-dot segment-weak" />
                  <span>Yếu</span>
                </div>
                <div className="visual-legend-range">&lt; {watchedWeakMax}%</div>
                <span className="visual-legend-note">Áp dụng cho cận chuẩn</span>
              </div>

              <div className="visual-legend-card">
                <div className="visual-legend-top">
                  <span className="visual-legend-dot segment-developing" />
                  <span>Phát triển</span>
                </div>
                <div className="visual-legend-range">
                  {watchedWeakMax}% – &lt; {watchedStableMin}%
                </div>
                <span className="visual-legend-note">Mức giữa</span>
              </div>

              <div className="visual-legend-card">
                <div className="visual-legend-top">
                  <span className="visual-legend-dot segment-stable" />
                  <span>Vững</span>
                </div>
                <div className="visual-legend-range">&ge; {watchedStableMin}%</div>
                <span className="visual-legend-note">Áp dụng cho dưới chuẩn</span>
              </div>
            </div>
          </div>

          {/* Ngưỡng Yếu & Ngưỡng Vững vàng */}
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="ability-weak-max">
                <span className="threshold-label-main">
                  Ngưỡng Yếu <span className="threshold-required-mark">*</span>
                </span>
              </label>
              <div className="threshold-input-wrap">
                <input
                  id="ability-weak-max"
                  type="number"
                  step="0.5"
                  min="0"
                  max="100"
                  {...register('weakMax', { valueAsNumber: true })}
                  className={`form-input ${errors.weakMax ? 'is-invalid' : ''}`}
                />
                <span className="threshold-input-unit">%</span>
              </div>
              <span className="field-hint">Áp dụng cho nhánh cạn chuẩn</span>
              {errors.weakMax && <span className="form-error">{errors.weakMax.message}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="ability-stable-min">
                <span className="threshold-label-main">
                  Ngưỡng Vững <span className="threshold-required-mark">*</span>
                </span>
              </label>
              <div className="threshold-input-wrap">
                <input
                  id="ability-stable-min"
                  type="number"
                  step="0.5"
                  min="0"
                  max="100"
                  {...register('stableMin', { valueAsNumber: true })}
                  className={`form-input ${errors.stableMin ? 'is-invalid' : ''}`}
                />
                <span className="threshold-input-unit">%</span>
              </div>
              <span className="field-hint">Áp dụng cho nhánh dưới chuẩn</span>
              {errors.stableMin && <span className="form-error">{errors.stableMin.message}</span>}
            </div>
          </div>

          {/* Số câu hỏi kiểm chứng */}
          <div className="form-group">
            <label className="form-label" htmlFor="ability-min-evidence">
              <span className="threshold-label-main">
                Số câu kiểm chứng tối thiểu <span className="threshold-required-mark">*</span>
              </span>
            </label>
            <div className="threshold-input-wrap">
              <input
                id="ability-min-evidence"
                type="number"
                min="1"
                max="50"
                {...register('minEvidenceCount', { valueAsNumber: true })}
                className={`form-input ${errors.minEvidenceCount ? 'is-invalid' : ''}`}
              />
              <span className="threshold-input-unit">câu</span>
            </div>

            {errors.minEvidenceCount && (
              <span className="form-error">{errors.minEvidenceCount.message}</span>
            )}
          </div>

          <div className="modal-footer">
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
