import { AlertTriangle, Clock, FileCheck2, Headphones, ShieldAlert, X } from 'lucide-react';
import type { MockExamListItem } from '../types/mockExamTypes';

// Props đầu vào cho hộp thoại xác nhận nội quy trước khi vào phòng thi thử ETS 200 câu
interface MockExamIntroModalProps {
    // Bộ đề thi thử học viên vừa chọn (null = đóng modal)
    exam: MockExamListItem | null;
    // Trạng thái đang gọi API khởi tạo lượt thi
    isStarting: boolean;
    // Thông báo lỗi nếu khởi tạo thất bại
    startError: string | null;
    // Callback đóng hộp thoại
    onClose: () => void;
    // Callback xác nhận bắt đầu làm bài thi
    onConfirmStart: () => void;
}

// Hộp thoại hướng dẫn và xác nhận nội quy phòng thi TOEIC chuẩn ETS 200 câu (UC17 Bước 3)
export function MockExamIntroModal({
    exam,
    isStarting,
    startError,
    onClose,
    onConfirmStart,
}: MockExamIntroModalProps) {
    // Không render DOM khi chưa chọn đề thi nào
    if (!exam) return null;

    // Xác định đề đang chọn là đề thi đầu ra hay đề luyện tập tự do
    const isOutput = exam.examTag === 'OUTPUT';

    return (
        <div className="diag-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="mock-intro-title">
            <div className="mock-intro-modal">
                <div className="mock-intro-modal__header">
                    <div className="mock-intro-modal__badges">
                        <span className={`mock-tag-badge ${isOutput ? 'is-output' : 'is-practice'}`}>
                            {isOutput ? 'Đề thi đầu ra (OUTPUT)' : 'Đề luyện tập (PRACTICE)'}
                        </span>
                    </div>
                    <button
                        type="button"
                        className="mock-intro-modal__close"
                        onClick={onClose}
                        disabled={isStarting}
                        aria-label="Đóng hộp thoại"
                    >
                        <X size={18} />
                    </button>
                </div>

                <h2 id="mock-intro-title" className="mock-intro-modal__title">
                    {exam.title}
                </h2>
                {exam.description && (
                    <p className="mock-intro-modal__desc">{exam.description}</p>
                )}

                <div className="mock-intro-metrics">
                    <div className="mock-intro-metric">
                        <Clock size={18} color="#ea580c" />
                        <div>
                            <span className="mock-intro-metric__label">Thời lượng chuẩn ETS</span>
                            <strong className="mock-intro-metric__val">{exam.durationMinutes} phút</strong>
                        </div>
                    </div>
                    <div className="mock-intro-metric">
                        <FileCheck2 size={18} color="#2563eb" />
                        <div>
                            <span className="mock-intro-metric__label">Quy mô đề thi</span>
                            <strong className="mock-intro-metric__val">
                                {exam.totalQuestions} câu (7 Part)
                            </strong>
                        </div>
                    </div>
                </div>

                <div className="mock-intro-rules">
                    <h3 className="mock-intro-rules__title">
                        <ShieldAlert size={16} color="#ea580c" />
                        <span>Quy định phòng thi thực tế (giống 100% kỳ thi thật)</span>
                    </h3>
                    <ul className="mock-intro-rules__list">
                        <li>
                            <Headphones size={15} className="mock-intro-rules__icon" />
                            <span>
                                Phần <strong>Listening (Part 1–4)</strong> chỉ được nghe{' '}
                                <strong>đúng 1 lần duy nhất</strong>; hệ thống tự động chuyển câu và khóa
                                tua hoặc nhảy câu cho tới khi phát xong toàn bộ phần Nghe.
                            </span>
                        </li>
                        <li>
                            <Clock size={15} className="mock-intro-rules__icon" />
                            <span>
                                Đồng hồ <strong>{exam.durationMinutes} phút</strong> chạy liên tục và tự
                                động thu bài ngay khi chạm <strong>00:00</strong>.
                            </span>
                        </li>
                        <li>
                            <FileCheck2 size={15} className="mock-intro-rules__icon" />
                            <span>
                                Đáp án của bạn được tự động lưu nháp liên tục cả trên máy chủ và trình
                                duyệt để phòng sự cố mất mạng hoặc đóng nhầm tab.
                            </span>
                        </li>
                    </ul>
                </div>

                {startError && (
                    <div className="mock-intro-error" role="alert">
                        <AlertTriangle size={16} />
                        <span>{startError}</span>
                    </div>
                )}

                <div className="diag-modal-actions">
                    <button
                        type="button"
                        className="diag-modal-btn is-cancel"
                        onClick={onClose}
                        disabled={isStarting}
                    >
                        Để sau
                    </button>
                    <button
                        type="button"
                        className="diag-modal-btn is-confirm"
                        onClick={onConfirmStart}
                        disabled={isStarting}
                    >
                        {isStarting ? 'Đang mở phòng thi...' : 'Tôi đã hiểu, Bắt đầu làm bài'}
                    </button>
                </div>
            </div>
        </div>
    );
}
