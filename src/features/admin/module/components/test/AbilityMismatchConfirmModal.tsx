import React from 'react';
import { AlertTriangle, X, Loader2 } from 'lucide-react';

/**
 * Props đầu vào cho hộp thoại xác nhận khi đề thi có câu hỏi ngoài năng lực đào tạo của mô-đun.
 */
interface AbilityMismatchConfirmModalProps {
  // Cờ bật/tắt hiển thị hộp thoại
  isOpen: boolean;
  // Số lượng câu hỏi đang lệch năng lực của mô-đun
  mismatchCount: number;
  // Danh sách tên các năng lực mà mô-đun đang phụ trách đào tạo
  moduleAbilityNames: string[];
  // Cờ đang xử lý lưu cấu hình sau khi người dùng xác nhận
  isSaving: boolean;
  // Hàm đóng hộp thoại để quay lại chỉnh sửa danh sách câu hỏi
  onCancel: () => void;
  // Hàm xác nhận vẫn đưa các câu hỏi này vào đề thi vượt ải
  onConfirm: () => void;
}

/**
 * Hộp thoại cảnh báo sư phạm khi giáo viên chọn câu hỏi không thuộc năng lực đào tạo của mô-đun.
 */
export const AbilityMismatchConfirmModal: React.FC<AbilityMismatchConfirmModalProps> = ({
  isOpen,
  mismatchCount,
  moduleAbilityNames,
  isSaving,
  onCancel,
  onConfirm,
}) => {
  // Không render ra DOM nếu hộp thoại đang đóng
  if (!isOpen) return null;

  return (
    <div
      className="pq-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Xác nhận câu hỏi ngoài năng lực mô-đun"
    >
      <div className="pq-modal-panel mt-confirm-modal">
        {/* Phần tiêu đề cảnh báo sư phạm */}
        <div className="pq-modal-header">
          <div className="mt-confirm-title-wrap">
            <span className="mt-confirm-icon-box">
              <AlertTriangle size={18} />
            </span>
            <div>
              <h3 className="pq-modal-title">Cảnh báo lệch năng lực đào tạo</h3>
              <p className="pq-modal-subtitle">
                Phát hiện {mismatchCount} câu hỏi không thuộc năng lực mục tiêu của mô-đun
              </p>
            </div>
          </div>
          {/* Nút đóng hộp thoại */}
          <button
            type="button"
            className="pq-modal-close-btn"
            onClick={onCancel}
            disabled={isSaving}
            aria-label="Đóng"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nội dung thông báo cảnh báo sư phạm rõ ràng */}
        <div className="mt-confirm-body">
          <p className="mt-confirm-message">
            Một số câu hỏi được chọn không thuộc năng lực đào tạo của mô-đun này. Bạn có chắc chắn
            muốn đưa vào đề không?
          </p>

          {/* Hiển thị danh sách năng lực mục tiêu của mô-đun để giáo viên đối chiếu nhanh */}
          {moduleAbilityNames.length > 0 && (
            <div className="mt-confirm-abilities">
              <span className="mt-confirm-abilities-label">Năng lực của mô-đun:</span>
              <div className="pq-meta-tags">
                {moduleAbilityNames.map((name) => (
                  <span key={name} className="pq-meta-pill pq-meta-ability">
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Chân hộp thoại với 2 nút hành động */}
        <div className="pq-modal-footer mt-confirm-footer">
          <button
            type="button"
            className="btn-secondary"
            onClick={onCancel}
            disabled={isSaving}
          >
            Quay lại kiểm tra
          </button>
          <button
            type="button"
            className="btn-primary mt-btn-warning"
            onClick={onConfirm}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 size={15} className="spin" />
                <span>Đang lưu...</span>
              </>
            ) : (
              <span>Vẫn lưu đề thi</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
