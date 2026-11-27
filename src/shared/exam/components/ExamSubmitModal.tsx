import { AlertCircle } from 'lucide-react';

interface ExamSubmitModalProps {
    isOpen: boolean;
    totalQuestions: number;
    answeredCount: number;
    flaggedCount: number;
    isSubmitting: boolean;
    title?: string;
    description?: string;
    confirmLabel?: string;
    onClose: () => void;
    onConfirm: () => void;
}

/**
 * Hộp thoại xác nhận nộp bài thi dùng chung cho Diagnostic và Module Test (UC13 Bước 9 & Ngoại lệ 9a).
 */
export function ExamSubmitModal({
    isOpen,
    totalQuestions,
    answeredCount,
    flaggedCount,
    isSubmitting,
    title = 'Xác nhận nộp bài chẩn đoán?',
    description = 'Hệ thống AI sẽ phân tích ngay lập tức toàn bộ câu trả lời của bạn để tính điểm và xây dựng biểu đồ radar năng lực.',
    confirmLabel = 'Nộp bài ngay',
    onClose,
    onConfirm,
}: ExamSubmitModalProps) {
    if (!isOpen) return null;

    const unansweredCount = Math.max(0, totalQuestions - answeredCount);

    return (
        <div className="diag-modal-backdrop" role="dialog" aria-modal="true">
            <div className="diag-modal-card">
                <div className="diag-modal-card__icon">
                    <AlertCircle size={32} color="#ea580c" />
                </div>

                <h3 className="diag-modal-card__title">{title}</h3>
                <p className="diag-modal-card__desc">{description}</p>

                <div className="diag-modal-stats">
                    <div className="diag-modal-stat-item">
                        <span className="diag-modal-stat-label">Đã làm:</span>
                        <span className="diag-modal-stat-val is-answered">{answeredCount}</span>
                    </div>
                    <div className="diag-modal-stat-item">
                        <span className="diag-modal-stat-label">Chưa làm:</span>
                        <span className="diag-modal-stat-val is-unanswered">{unansweredCount}</span>
                    </div>
                    <div className="diag-modal-stat-item">
                        <span className="diag-modal-stat-label">Đánh dấu:</span>
                        <span className="diag-modal-stat-val is-flagged">{flaggedCount}</span>
                    </div>
                </div>

                {unansweredCount > 0 && (
                    <div className="diag-modal-warning is-unanswered-alert">
                        Bạn còn <strong>{unansweredCount} câu chưa làm</strong>. Các câu chưa làm sẽ không
                        được tính điểm.
                    </div>
                )}

                <div className="diag-modal-actions">
                    <button
                        type="button"
                        className="diag-modal-btn is-cancel"
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
                        Làm tiếp
                    </button>
                    <button
                        type="button"
                        className="diag-modal-btn is-confirm"
                        onClick={onConfirm}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Đang chấm bài...' : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
