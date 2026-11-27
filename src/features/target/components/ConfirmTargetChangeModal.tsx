import { AlertTriangle, X } from 'lucide-react';

interface ConfirmTargetChangeModalProps {
    isOpen: boolean;
    currentScore: number | null;
    newScore: number;
    isSubmitting: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

/**
 * Hộp thoại xác nhận khi học viên đổi sang mục tiêu AIM mới (UC05 - Luồng 4a, 4b, 7a).
 * Cảnh báo việc lưu trữ lộ trình hiện tại, bảo lưu tiến độ bài học, và cảnh báo thêm nếu hạ AIM.
 */
export function ConfirmTargetChangeModal({
    isOpen,
    currentScore,
    newScore,
    isSubmitting,
    onConfirm,
    onCancel,
}: ConfirmTargetChangeModalProps) {
    if (!isOpen) return null;

    const isDowngrade = currentScore !== null && newScore < currentScore;

    return (
        <div className="target-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="target-modal-title">
            <div className="target-modal">
                <div className="target-modal__header">
                    <div className="target-modal__title-wrap">
                        <div className="target-modal__icon">
                            <AlertTriangle size={20} />
                        </div>
                        <h2 id="target-modal-title" className="target-modal__title">
                            Xác nhận thay đổi mục tiêu học tập
                        </h2>
                    </div>
                    <button
                        type="button"
                        className="target-modal__close"
                        onClick={onCancel}
                        disabled={isSubmitting}
                        aria-label="Đóng hộp thoại"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="target-modal__body">
                    {currentScore !== null && (
                        <div className="target-modal__score-diff">
                            <span className="target-modal__score-pill">AIM {currentScore}</span>
                            <span className="target-modal__arrow">→</span>
                            <span className="target-modal__score-pill is-new">
                                AIM {newScore}
                                {newScore === 850 ? '+' : ''}
                            </span>
                        </div>
                    )}

                    <p className="target-modal__desc">
                        Bạn đang thay đổi mục tiêu học tập. Lộ trình hiện tại sẽ được lưu trữ vào lịch sử, các
                        mô-đun bạn đã vượt qua sẽ được bảo lưu tiến độ bài học sang lộ trình mới. Bạn có chắc
                        chắn muốn đổi không?
                    </p>

                    {isDowngrade && (
                        <div className="target-modal__downgrade-warn" role="alert">
                            <strong>Lưu ý:</strong> Mục tiêu bạn chọn ({newScore}) thấp hơn mục tiêu hiện tại (
                            {currentScore}). Bạn có chắc chắn muốn điều chỉnh không?
                        </div>
                    )}
                </div>

                <div className="target-modal__actions">
                    <button
                        type="button"
                        className="target-modal__btn is-cancel"
                        onClick={onCancel}
                        disabled={isSubmitting}
                    >
                        Hủy bỏ
                    </button>
                    <button
                        type="button"
                        className="target-modal__btn is-confirm"
                        onClick={onConfirm}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Đang cập nhật...' : 'Đồng ý tiếp tục'}
                    </button>
                </div>
            </div>
        </div>
    );
}
