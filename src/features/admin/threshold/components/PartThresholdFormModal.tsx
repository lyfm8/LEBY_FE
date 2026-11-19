import React, { useEffect } from 'react';
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
 * Component Modal Form thêm mới hoặc cập nhật Ngưỡng điểm phần thi (TargetPartThreshold).
 * Ràng buộc mô hình 4 nhánh Tầng 1 theo thứ tự:
 * fullPartThreshold (35%) <= confirmingScore (60%) <= passScore (80%).
 */
export const PartThresholdFormModal: React.FC<PartThresholdFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  data,
  parts,
  profiles,
  isLoading,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<PartThresholdFormValues>({
    resolver: zodResolver(partThresholdSchema),
    defaultValues: {
      partId: 0,
      targetProfileId: 0,
      passScore: 80,
      confirmingScore: 60,
      fullPartThreshold: 35,
    },
  });

  const watchedPass = watch('passScore') || 80;
  const watchedConfirm = watch('confirmingScore') || 60;
  const watchedFullPart = watch('fullPartThreshold') || 35;

  useEffect(() => {
    if (isOpen) {
      if (data) {
        reset({
          partId: data.partId,
          targetProfileId: data.targetProfileId,
          passScore: data.passScore,
          confirmingScore: data.confirmingScore ?? null,
          fullPartThreshold: data.fullPartThreshold ?? null,
        });
      } else {
        reset({
          partId: 0,
          targetProfileId: 0,
          passScore: 80,
          confirmingScore: 60,
          fullPartThreshold: 35,
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
            {data ? 'Cập nhật Ngưỡng điểm Part Diagnostic' : 'Tạo mới Ngưỡng điểm Part Diagnostic'}
          </h2>
          <button type="button" onClick={onClose} className="modal-close-btn" disabled={isLoading}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="modal-form">
          {/* Target Profile AIM & Part */}
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label required">Mục tiêu (AIM)</label>
              <select
                {...register('targetProfileId', { valueAsNumber: true })}
                disabled={!!data || isLoading}
                className={`select-input ${errors.targetProfileId ? 'input-error' : ''}`}
              >
                <option value={0}>-- Chọn Mục tiêu AIM --</option>
                {profiles.map(p => (
                  <option key={p.id} value={p.id}>
                    AIM {p.aimScore}
                  </option>
                ))}
              </select>
              {errors.targetProfileId && (
                <span className="error-message">{errors.targetProfileId.message}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label required">Phần thi (Part)</label>
              <select
                {...register('partId', { valueAsNumber: true })}
                disabled={!!data || isLoading}
                className={`select-input ${errors.partId ? 'input-error' : ''}`}
              >
                <option value={0}>-- Chọn Phần thi (Part) --</option>
                {parts.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              {errors.partId && <span className="error-message">{errors.partId.message}</span>}
            </div>
          </div>

          {/* Sơ đồ Trực quan 4 Nhánh Tầng 1 */}
          <div className="threshold-visual-diagram">
            <div className="visual-diagram-header">
              <span className="text-xs font-semibold text-gray-700">Phân luồng 4 nhánh kết quả Part Diagnostic:</span>
            </div>
            <div className="visual-range-bar">
              <div
                className="range-segment segment-fullpart"
                style={{ width: `${Math.min(watchedFullPart, 100)}%` }}
              >
                <span>MẤT GỐC</span>
              </div>
              <div
                className="range-segment segment-weak"
                style={{
                  width: `${Math.max(0, Math.min(watchedConfirm - watchedFullPart, 100))}%`,
                }}
              >
                <span>YẾU</span>
              </div>
              <div
                className="range-segment segment-confirm"
                style={{
                  width: `${Math.max(0, Math.min(watchedPass - watchedConfirm, 100))}%`,
                }}
              >
                <span>CẬN CHUẨN</span>
              </div>
              <div
                className="range-segment segment-pass"
                style={{ width: `${Math.max(0, 100 - watchedPass)}%` }}
              >
                <span>PASS</span>
              </div>
            </div>
            <div className="visual-markers">
              <span>0%</span>
              <span style={{ left: `${watchedFullPart}%` }} className="marker-pin marker-fullpart">
                {watchedFullPart}% (Full Part)
              </span>
              <span style={{ left: `${watchedConfirm}%` }} className="marker-pin marker-confirm">
                {watchedConfirm}% (Confirm)
              </span>
              <span style={{ left: `${watchedPass}%` }} className="marker-pin marker-pass">
                {watchedPass}% (Pass)
              </span>
              <span>100%</span>
            </div>
          </div>

          {/* 3 Mức điểm */}
          <div className="form-grid-3">
            <div className="form-group">
              <label className="form-label required">Điểm Đạt chuẩn (passScore %)</label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="100"
                {...register('passScore', { valueAsNumber: true })}
                className={`text-input ${errors.passScore ? 'input-error' : ''}`}
              />
              <span className="field-hint">Level 3: &ge; điểm này miễn học Part</span>
              {errors.passScore && <span className="error-message">{errors.passScore.message}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Điểm Cận chuẩn (confirmingScore %)</label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="100"
                {...register('confirmingScore', {
                  setValueAs: v => (v === '' || v === null || v === undefined || Number.isNaN(Number(v)) ? null : Number(v)),
                })}
                className={`text-input ${errors.confirmingScore ? 'input-error' : ''}`}
                placeholder="Để trống nếu không áp dụng"
              />
              <span className="field-hint">Level 2: Soi Tầng 2 với developingThreshold (50%)</span>
              {errors.confirmingScore && (
                <span className="error-message">{errors.confirmingScore.message}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Điểm Mất gốc (fullPartThreshold %)</label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="100"
                {...register('fullPartThreshold', {
                  setValueAs: v => (v === '' || v === null || v === undefined || Number.isNaN(Number(v)) ? null : Number(v)),
                })}
                className={`text-input ${errors.fullPartThreshold ? 'input-error' : ''}`}
                placeholder="Để trống nếu không áp dụng"
              />
              <span className="field-hint">Level 1: &lt; điểm này bốc 100% Module</span>
              {errors.fullPartThreshold && (
                <span className="error-message">{errors.fullPartThreshold.message}</span>
              )}
            </div>
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
