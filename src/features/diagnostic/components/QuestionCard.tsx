import { useEffect } from 'react';
import { Flag } from 'lucide-react';
import type { DiagnosticExamStep, DiagnosticQuestion, OptionKey } from '../types/diagnosticTypes';

interface QuestionCardProps {
    // Màn hình câu hỏi hiện tại (chứa 1 câu đơn hoặc 1 chùm câu hỏi cùng parentId)
    step: DiagnosticExamStep;
    // Bản đồ đáp án đang chọn của từng câu theo orderNo
    answers: Record<number, OptionKey | null>;
    // Tập các câu hỏi đã được đánh dấu cờ theo dõi
    flagged: Set<number>;
    // Câu hỏi cần cuộn mượt tới khi học viên chọn từ bảng Palette
    focusedOrderNo?: number | null;
    // Vô hiệu hóa tương tác khi phòng thi đang tạm dừng hoặc đang nộp bài
    disabled?: boolean;
    // Hàm cập nhật đáp án cho một câu hỏi cụ thể
    onSelectOption: (orderNo: number, option: OptionKey) => void;
    // Hàm bật/tắt cờ đánh dấu cho một câu hỏi cụ thể
    onToggleFlag: (orderNo: number) => void;
}

/**
 * Hiển thị nội dung câu hỏi đơn hoặc toàn bộ chùm câu hỏi (Part 3, 4, 6, 7) trên cùng một trang:
 * - Câu có hình ảnh hoặc đoạn văn đọc hiểu dùng bố cục 2 nửa (trái: ảnh/đoạn văn, phải: các câu hỏi con).
 * - Mỗi câu hỏi đều có nút icon Flag đặt ngay ở đầu câu để đồng bộ khi hiển thị theo chùm.
 */
export function QuestionCard({
    step,
    answers,
    flagged,
    focusedOrderNo,
    disabled = false,
    onSelectOption,
    onToggleFlag,
}: QuestionCardProps) {
    // Kiểm tra bước hiện tại có hình ảnh minh họa dùng chung hay không
    const hasImage = Boolean(step.imageUrl);
    // Kiểm tra bước hiện tại có đoạn văn dài (Part 6, 7 hoặc câu chùm có passage)
    const hasLongReadingPassage =
        Boolean(step.passage) &&
        (step.partNo === 6 ||
            step.partNo === 7 ||
            step.questions.length > 1 ||
            Boolean(step.questions[0]?.isGroupQuestion));
    // Quyết định sử dụng bố cục chia 2 nửa trái/phải hay 1 cột chuẩn
    const isSplitLayout = hasImage || hasLongReadingPassage;
    // Xác định bước hiện tại có phải là chùm nhiều câu hỏi hay không
    const isGroupStep = step.questions.length > 1;

    // Tự động cuộn tới đúng câu hỏi khi học viên click chọn ô trên bảng Palette
    useEffect(() => {
        // Không làm gì nếu không có yêu cầu focus câu cụ thể
        if (focusedOrderNo == null) return;
        // Tìm phần tử DOM tương ứng với số thứ tự câu hỏi
        const targetEl = document.getElementById(`diag-q-item-${focusedOrderNo}`);
        // Cuộn mượt sao cho câu đó hiển thị rõ trong khung nhìn
        targetEl?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, [focusedOrderNo, step.stepIndex]);

    // Hàm dựng giao diện cho từng câu hỏi đơn lẻ (tiêu đề câu + icon Flag đầu câu + 4 đáp án)
    const renderQuestionBlock = (question: DiagnosticQuestion, showPartPill: boolean) => {
        // Lấy đáp án hiện tại của câu hỏi này
        const selectedOption = answers[question.orderNo] ?? null;
        // Kiểm tra câu hỏi này có đang được gắn cờ hay không
        const isFlagged = flagged.has(question.orderNo);
        // Kiểm tra câu hỏi này có đang là câu được focus từ Palette hay không
        const isFocused = focusedOrderNo === question.orderNo;

        return (
            <div
                key={question.questionId}
                id={`diag-q-item-${question.orderNo}`}
                className={`diag-question-block ${isGroupStep ? 'is-grouped' : ''} ${isFocused ? 'is-focused' : ''}`}
            >
                {/* Hàng tiêu đề đầu mỗi câu hỏi: số câu, nhãn Part/Section và nút icon Flag */}
                <div className="diag-question-meta-row">
                    <div className="diag-question-meta-row__left">
                        <span className="diag-question-badge">Câu {question.orderNo}</span>
                        {showPartPill ? (
                            <span className="diag-part-pill">{question.partName}</span>
                        ) : (
                            <span className="diag-section-tag">{question.section}</span>
                        )}
                    </div>

                    {/* Nút Flag đặt trực tiếp ở đầu mỗi câu hỏi để đánh dấu độc lập từng câu */}
                    <button
                        type="button"
                        className={`diag-question-flag-btn ${isFlagged ? 'is-active' : ''}`}
                        onClick={() => onToggleFlag(question.orderNo)}
                        disabled={disabled}
                        aria-label={isFlagged ? `Bỏ đánh dấu câu ${question.orderNo}` : `Đánh dấu câu ${question.orderNo}`}
                        aria-pressed={isFlagged}
                        title={isFlagged ? 'Bỏ đánh dấu xem lại' : 'Đánh dấu xem lại'}
                    >
                        <Flag size={15} fill={isFlagged ? '#f59e0b' : 'none'} />
                    </button>
                </div>

                {/* Nội dung câu hỏi */}
                <h2 className="diag-question-card__title">{question.title}</h2>

                {/* Danh sách phương án trả lời A/B/C/D */}
                <div className="diag-options-list" role="radiogroup" aria-label={`Các phương án câu ${question.orderNo}`}>
                    {question.options.map((opt) => {
                        // Xác định phương án này có đang được chọn hay không
                        const isSelected = selectedOption === opt.key;
                        return (
                            <button
                                key={opt.key}
                                type="button"
                                disabled={disabled}
                                className={`diag-option-item ${isSelected ? 'is-selected' : ''}`}
                                onClick={() => onSelectOption(question.orderNo, opt.key)}
                                role="radio"
                                aria-checked={isSelected}
                            >
                                <span className="diag-option-item__badge">{opt.key}</span>
                                <span className="diag-option-item__text">{opt.text}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    };

    // Giao diện chia 2 cột cho câu có hình ảnh (Part 1, Part 3/4 biểu đồ) hoặc bài đọc dài (Part 6, 7)
    if (isSplitLayout) {
        return (
            <div className="diag-question-card is-split">
                {/* Nửa bên trái: Thông tin Part, chỉ dẫn chung, ảnh hoặc đoạn văn đọc hiểu */}
                <div className="diag-split-left">
                    <div className="diag-split-pane__header">
                        <span className="diag-part-pill">{step.partName}</span>
                        {step.instruction && <p className="diag-split-instruction">{step.instruction}</p>}
                    </div>

                    <div className="diag-split-pane__scroll">
                        {step.imageUrl && (
                            <div className="diag-question-card__image-box">
                                <img
                                    src={step.imageUrl}
                                    alt={`Minh họa ${step.partName}`}
                                    className="diag-question-card__image"
                                />
                            </div>
                        )}

                        {step.passage && (
                            <div className="diag-question-card__passage">
                                <p className="diag-passage-text">{step.passage}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Nửa bên phải: Danh sách 1 hoặc nhiều câu hỏi con cùng Flag ở đầu mỗi câu */}
                <div className="diag-split-right">
                    <div className="diag-split-pane__scroll">
                        {step.questions.map((question) => renderQuestionBlock(question, false))}
                    </div>
                </div>
            </div>
        );
    }

    // Giao diện 1 cột chuẩn cho Part 2, Part 5 hoặc chùm câu Nghe không có hình ảnh (Part 3, 4)
    return (
        <div className="diag-question-card">
            {/* Chỉ dẫn chung ở đầu thẻ nếu câu đơn/chùm có instruction */}
            {step.instruction && (
                <div className="diag-question-card__instruction">{step.instruction}</div>
            )}

            {/* Danh sách câu hỏi (1 câu đơn hoặc 3 câu cùng chùm Part 3/4) */}
            <div className="diag-single-pane__questions">
                {step.questions.map((question) => renderQuestionBlock(question, true))}
            </div>
        </div>
    );
}
