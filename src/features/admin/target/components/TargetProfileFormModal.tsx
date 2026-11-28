import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { targetProfileSchema, type TargetProfileFormValues } from '../utils/schema';
import type { TargetProfileResponse } from '../types';

interface TargetProfileFormModalProps {
  // Cờ điều khiển trạng thái hiển thị của modal
  isOpen: boolean;
  // Callback đóng modal
  onClose: () => void;
  // Callback gửi dữ liệu đã validate khi người dùng lưu form
  onSubmit: (data: TargetProfileFormValues) => void | Promise<void>;
  // Mốc mục tiêu đang được chọn để sửa (null nếu đang thêm mới)
  profile: TargetProfileResponse | null;
  // Cờ báo đang gửi request lên server để khóa nút submit
  isLoading: boolean;
}

/**
 * Modal thêm mới hoặc chỉnh sửa thông tin mốc mục tiêu điểm số (AIM).
 */
export const TargetProfileFormModal: React.FC<TargetProfileFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  profile,
  isLoading,
}) => {
  // Khởi tạo React Hook Form kết hợp Zod validator để kiểm tra dữ liệu trước khi submit
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TargetProfileFormValues>({
    resolver: zodResolver(targetProfileSchema),
    defaultValues: {
      description: '',
    },
  });

  // Đồng bộ giá trị biểu mẫu mỗi khi mở modal hoặc chuyển đổi giữa thêm mới / chỉnh sửa
  useEffect(() => {
    // Chỉ nạp lại dữ liệu khi modal thực sự mở
    if (isOpen) {
      if (profile) {
        // Nạp sẵn điểm AIM và mô tả hiện tại khi ở chế độ chỉnh sửa
        reset({
          aimScore: profile.aimScore,
          description: profile.description || '',
        });
      } else {
        // Đặt trống ô nhập điểm và mô tả khi tạo mới để hiện placeholder gợi ý
        reset({
          aimScore: undefined,
          description: '',
        });
      }
    }
  }, [isOpen, profile, reset]);

  // Không render DOM khi modal đang đóng
  if (!isOpen) {
    return null;
  }

  // Render popup nhập thông tin mốc mục tiêu AIM
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content target-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {profile ? 'Sửa Mục Tiêu' : 'Thêm Mục Tiêu Mới'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="modal-close"
            aria-label="Đóng hộp thoại"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label className="form-label" htmlFor="target-aim-score">
              Điểm Aim <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              id="target-aim-score"
              type="number"
              min={10}
              max={990}
              {...register('aimScore', { valueAsNumber: true })}
              className="form-input target-form-control"
              placeholder="VD: 650"
            />
            {errors.aimScore && <p className="form-error">{errors.aimScore.message}</p>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="target-aim-description">
              Mô tả
            </label>
            <textarea
              id="target-aim-description"
              {...register('description')}
              rows={3}
              className="form-textarea target-form-control"
              placeholder="Mô tả cho mục tiêu này..."
            />
            {errors.description && <p className="form-error">{errors.description.message}</p>}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={isLoading}
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
