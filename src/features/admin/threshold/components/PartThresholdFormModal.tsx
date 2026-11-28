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

  const rawPass = watch('passScore');
  const rawConfirm = watch('confirmingScore');
  const rawFullPart = watch('fullPartThreshold');

  const watchedFullPart =
    rawFullPart !== null && rawFullPart !== undefined && Number.isFinite(rawFullPart)
      ? Math.min(Math.max(rawFullPart, 0), 100)
      : 0;
  const watchedConfirm =
    rawConfirm !== null && rawConfirm !== undefined && Number.isFinite(rawConfirm)
      ? Math.min(Math.max(rawConfirm, watchedFullPart), 100)
      : watchedFullPart;
  const watchedPass = Number.isFinite(rawPass)
    ? Math.min(Math.max(rawPass, watchedConfirm), 100)
    : 80;

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
    <div className="modal-overlay" onClick={() => !isLoading && onClose()}>
      <div
        className="modal-content threshold-modal threshold-modal-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h2 className="modal-title">
              {data ? 'Cập nhật Ngưỡng điểm Part Diagnostic' : 'Tạo mới Ngưỡng điểm Part Diagnostic'}
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
          {/* Target Profile AIM & Part */}
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="part-threshold-aim">
                <span className="threshold-label-main">
                  Mục tiêu (AIM) <span className="threshold-required-mark">*</span>
                </span>
              </label>
              <select
                id="part-threshold-aim"
                {...register('targetProfileId', { valueAsNumber: true })}
                disabled={!!data || isLoading}
                className={`form-select ${errors.targetProfileId ? 'is-invalid' : ''}`}
              >
                <option value={0}>-- Chọn Mục tiêu AIM --</option>
                {profiles.map(p => (
                  <option key={p.id} value={p.id}>
                    AIM {p.aimScore}
                  </option>
                ))}
              </select>
              {errors.targetProfileId && (
                <span className="form-error">{errors.targetProfileId.message}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="part-threshold-part">
                <span className="threshold-label-main">
                  Phần thi (Part) <span className="threshold-required-mark">*</span>
                </span>
              </label>
              <select
                id="part-threshold-part"
                {...register('partId', { valueAsNumber: true })}
                disabled={!!data || isLoading}
                className={`form-select ${errors.partId ? 'is-invalid' : ''}`}
              >
                <option value={0}>-- Chọn Phần thi (Part) --</option>
                {parts.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              {errors.partId && <span className="form-error">{errors.partId.message}</span>}
            </div>
          </div>

          {/* Sơ đồ Trực quan 4 Nhánh Tầng 1 */}
          <div className="threshold-visual-diagram">
            <div className="visual-diagram-header">
              <span className="visual-diagram-title">Phân luồng 4 nhánh kết quả Part Diagnostic</span>
            </div>

            <div className="visual-range-bar">
              <div
                className="range-segment segment-fullpart"
                style={{ width: `${watchedFullPart}%` }}
              >
                {watchedFullPart >= 14 && <span>MẤT GỐC</span>}
              </div>
              <div
                className="range-segment segment-weak"
                style={{ width: `${Math.max(0, watchedConfirm - watchedFullPart)}%` }}
              >
                {watchedConfirm - watchedFullPart >= 12 && <span>YẾU</span>}
              </div>
              <div
                className="range-segment segment-confirm"
                style={{ width: `${Math.max(0, watchedPass - watchedConfirm)}%` }}
              >
                {watchedPass - watchedConfirm >= 15 && <span>CẬN CHUẨN</span>}
              </div>
              <div
                className="range-segment segment-pass"
                style={{ width: `${Math.max(0, 100 - watchedPass)}%` }}
              >
                {100 - watchedPass >= 12 && <span>PASS</span>}
              </div>
            </div>

            <div className="visual-legend-grid cols-4">
              <div className="visual-legend-card">
                <div className="visual-legend-top">
                  <span className="visual-legend-dot segment-fullpart" />
                  <span>Mất gốc</span>
                </div>
                <div className="visual-legend-range">&lt; {watchedFullPart}%</div>
                <span className="visual-legend-note">Bốc 100% Module</span>
              </div>

              <div className="visual-legend-card">
                <div className="visual-legend-top">
                  <span className="visual-legend-dot segment-weak" />
                  <span>Yếu</span>
                </div>
                <div className="visual-legend-range">
                  {watchedFullPart}% – &lt; {watchedConfirm}%
                </div>
                <span className="visual-legend-note">Lọc Tầng 2 (WEAK)</span>
              </div>

              <div className="visual-legend-card">
                <div className="visual-legend-top">
                  <span className="visual-legend-dot segment-confirm" />
                  <span>Cận chuẩn</span>
                </div>
                <div className="visual-legend-range">
                  {watchedConfirm}% – &lt; {watchedPass}%
                </div>
                <span className="visual-legend-note">Lọc Tầng 2 (CONFIRM)</span>
              </div>

              <div className="visual-legend-card">
                <div className="visual-legend-top">
                  <span className="visual-legend-dot segment-pass" />
                  <span>Đạt chuẩn</span>
                </div>
                <div className="visual-legend-range">&ge; {watchedPass}%</div>
                <span className="visual-legend-note">Miễn học Part</span>
              </div>
            </div>
          </div>

          {/* 3 Mức điểm */}
          <div className="form-grid-3">
            <div className="form-group">
              <label className="form-label" htmlFor="part-pass-score">
                <span className="threshold-label-main">
                  Đạt chuẩn <span className="threshold-required-mark">*</span>
                </span>
              </label>
              <div className="threshold-input-wrap">
                <input
                  id="part-pass-score"
                  type="number"
                  step="0.5"
                  min="0"
                  max="100"
                  {...register('passScore', { valueAsNumber: true })}
                  className={`form-input ${errors.passScore ? 'is-invalid' : ''}`}
                />
                <span className="threshold-input-unit">%</span>
              </div>
              {errors.passScore && <span className="form-error">{errors.passScore.message}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="part-confirm-score">
                <span className="threshold-label-main">Cận chuẩn <span className="threshold-required-mark">*</span></span> 
              </label>
              <div className="threshold-input-wrap">
                <input
                  id="part-confirm-score"
                  type="number"
                  step="0.5"
                  min="0"
                  max="100"
                  {...register('confirmingScore', {
                    setValueAs: v => (v === '' || v === null || v === undefined || Number.isNaN(Number(v)) ? null : Number(v)),
                  })}
                  className={`form-input ${errors.confirmingScore ? 'is-invalid' : ''}`}
                  placeholder="Tùy chọn"
                />
                <span className="threshold-input-unit">%</span>
              </div>
              {errors.confirmingScore && (
                <span className="form-error">{errors.confirmingScore.message}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="part-fullpart-score">
                <span className="threshold-label-main">Mất gốc <span className="threshold-required-mark">*</span></span> 
              </label>
              <div className="threshold-input-wrap">
                <input
                  id="part-fullpart-score"
                  type="number"
                  step="0.5"
                  min="0"
                  max="100"
                  {...register('fullPartThreshold', {
                    setValueAs: v => (v === '' || v === null || v === undefined || Number.isNaN(Number(v)) ? null : Number(v)),
                  })}
                  className={`form-input ${errors.fullPartThreshold ? 'is-invalid' : ''}`}
                  placeholder="Tùy chọn"
                />
                <span className="threshold-input-unit">%</span>
              </div>
              {errors.fullPartThreshold && (
                <span className="form-error">{errors.fullPartThreshold.message}</span>
              )}
            </div>
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
