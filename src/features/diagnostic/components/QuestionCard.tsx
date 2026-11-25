import type { DiagnosticQuestion, OptionKey } from '../types/diagnosticTypes';

interface QuestionCardProps {
    question: DiagnosticQuestion;
    selectedOption: OptionKey | null;
    disabled?: boolean;
    onSelectOption: (option: OptionKey) => void;
}

/**
 * Hiển thị nội dung câu hỏi và phương án trả lời trong phòng thi chẩn đoán.
 *
 * Quy tắc bố cục:
 * - Những câu có hình ảnh đi kèm (VD: Part 1, câu có biểu đồ) HOẶC bài đọc dài thuộc chùm Part 6, 7
 *   sẽ được chia làm 2 nửa: bên trái hiển thị ảnh / đoạn văn (có scroll), bên phải hiển thị câu hỏi + đáp án.
 * - Các câu đơn hoặc câu Listening không có ảnh (Part 2, 3, 4, 5) hiển thị 1 cột chuẩn.
 */
export function QuestionCard({
    question,
    selectedOption,
    disabled = false,
    onSelectOption,
}: QuestionCardProps) {
    const hasImage = Boolean(question.imageUrl);
    const hasLongReadingPassage =
        Boolean(question.passage) &&
        (question.partNo === 6 || question.partNo === 7 || Boolean(question.isGroupQuestion));
    const isSplitLayout = hasImage || hasLongReadingPassage;

    const renderOptions = () => (
        <div className="diag-options-list" role="radiogroup" aria-label="Các phương án trả lời">
            {question.options.map((opt) => {
                const isSelected = selectedOption === opt.key;
                return (
                    <button
                        key={opt.key}
                        type="button"
                        disabled={disabled}
                        className={`diag-option-item ${isSelected ? 'is-selected' : ''}`}
                        onClick={() => onSelectOption(opt.key)}
                        role="radio"
                        aria-checked={isSelected}
                    >
                        <span className="diag-option-item__badge">{opt.key}</span>
                        <span className="diag-option-item__text">{opt.text}</span>
                    </button>
                );
            })}
        </div>
    );

    if (isSplitLayout) {
        return (
            <div className="diag-question-card is-split">
                {/* Nửa bên trái: Hình ảnh minh họa hoặc đoạn văn đọc hiểu dài (Part 6, 7) */}
                <div className="diag-split-left">
                    <div className="diag-split-pane__header">
                        <span className="diag-part-pill">{question.partName}</span>
                        {question.instruction && (
                            <p className="diag-split-instruction">{question.instruction}</p>
                        )}
                    </div>

                    <div className="diag-split-pane__scroll">
                        {question.imageUrl && (
                            <div className="diag-question-card__image-box">
                                <img
                                    src={question.imageUrl}
                                    alt={`Minh họa câu ${question.orderNo}`}
                                    className="diag-question-card__image"
                                />
                            </div>
                        )}

                        {question.passage && (
                            <div className="diag-question-card__passage">
                                <p className="diag-passage-text">{question.passage}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Nửa bên phải: Nội dung câu hỏi và danh sách đáp án */}
                <div className="diag-split-right">
                    <div className="diag-split-pane__scroll">
                        <div className="diag-question-meta-row">
                            <span className="diag-question-badge">Câu {question.orderNo}</span>
                            <span className="diag-section-tag">{question.section}</span>
                        </div>
                        <h2 className="diag-question-card__title">{question.title}</h2>
                        {renderOptions()}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="diag-question-card">
            <div className="diag-question-meta-row">
                <span className="diag-question-badge">Câu {question.orderNo}</span>
                <span className="diag-part-pill">{question.partName}</span>
            </div>

            {question.instruction && (
                <div className="diag-question-card__instruction">{question.instruction}</div>
            )}

            <h2 className="diag-question-card__title">{question.title}</h2>

            {renderOptions()}
        </div>
    );
}
