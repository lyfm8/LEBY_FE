import { useEffect } from 'react';
import { Check, CheckCircle2, Flag, X } from 'lucide-react';
import type {
    BaseExamQuestion,
    ExamRevealedInfo,
    ExamRoomMode,
    ExamStep,
    OptionKey,
} from '../types/examTypes';
import { ExplanationPanel } from './ExplanationPanel';

interface ExamQuestionCardProps<TQuestion extends BaseExamQuestion = BaseExamQuestion> {
    step: ExamStep<TQuestion>;
    answers: Record<number, OptionKey | null>;
    flagged: Set<number>;
    focusedOrderNo?: number | null;
    disabled?: boolean;
    mode?: ExamRoomMode;
    isReviewMode?: boolean;
    reviewQuestionMap?: Record<number, ExamRevealedInfo>;
    revealedOrderNos?: Set<number>;
    onSelectOption?: (orderNo: number, option: OptionKey) => void;
    onCheckAnswer?: (orderNo: number) => void;
    onToggleFlag: (orderNo: number) => void;
}

/**
 * Hiển thị nội dung câu hỏi đơn hoặc chùm câu hỏi (Part 3, 4, 6, 7) dùng chung:
 * - mode = 'EXAM': làm bài thi (chọn đáp án + Flag, chưa lộ đúng/sai).
 * - mode = 'PRACTICE': luyện tập tức thì (nút "Kiểm tra đáp án" từng câu -> tô xanh/đỏ + hiện Giải thích).
 * - mode = 'REVIEW': xem lại toàn bộ câu hỏi đã nộp kèm đáp án đúng/sai và Giải thích.
 */
export function ExamQuestionCard<TQuestion extends BaseExamQuestion = BaseExamQuestion>({
    step,
    answers,
    flagged,
    focusedOrderNo,
    disabled = false,
    mode,
    isReviewMode = false,
    reviewQuestionMap,
    revealedOrderNos,
    onSelectOption,
    onCheckAnswer,
    onToggleFlag,
}: ExamQuestionCardProps<TQuestion>) {
    const resolvedMode: ExamRoomMode = mode ?? (isReviewMode ? 'REVIEW' : 'EXAM');

    const hasImage = Boolean(step.imageUrl);
    const hasLongReadingPassage =
        Boolean(step.passage) &&
        (step.partNo === 6 ||
            step.partNo === 7 ||
            step.questions.length > 1 ||
            Boolean(step.questions[0]?.isGroupQuestion));
    const isSplitLayout = hasImage || hasLongReadingPassage;
    const isGroupStep = step.questions.length > 1;

    useEffect(() => {
        if (focusedOrderNo == null) return;
        const targetEl = document.getElementById(`diag-q-item-${focusedOrderNo}`);
        targetEl?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, [focusedOrderNo, step.stepIndex]);

    const renderQuestionBlock = (question: TQuestion, showPartPill: boolean) => {
        const selectedOption = answers[question.orderNo] ?? null;
        const isFlagged = flagged.has(question.orderNo);
        const isFocused = focusedOrderNo === question.orderNo;

        const isRevealed =
            resolvedMode === 'REVIEW' ||
            (resolvedMode === 'PRACTICE' && Boolean(revealedOrderNos?.has(question.orderNo)));
        const revealInfo = isRevealed ? reviewQuestionMap?.[question.orderNo] : undefined;

        const isSelectionLocked = disabled || resolvedMode === 'REVIEW' || (resolvedMode === 'PRACTICE' && isRevealed);

        return (
            <div
                key={question.questionId}
                id={`diag-q-item-${question.orderNo}`}
                className={`diag-question-block ${isGroupStep ? 'is-grouped' : ''} ${isFocused ? 'is-focused' : ''}`}
            >
                <div className="diag-question-meta-row">
                    <div className="diag-question-meta-row__left">
                        <span className="diag-question-badge">Câu {question.orderNo}</span>
                        {showPartPill ? (
                            <span className="diag-part-pill">{question.partName}</span>
                        ) : (
                            <span className="diag-section-tag">{question.section}</span>
                        )}
                        {isRevealed && revealInfo && (
                            <span
                                className={`diag-review-status-pill ${
                                    revealInfo.isCorrect
                                        ? 'is-correct'
                                        : selectedOption == null
                                          ? 'is-skipped'
                                          : 'is-wrong'
                                }`}
                            >
                                {revealInfo.isCorrect
                                    ? 'Đúng'
                                    : selectedOption == null
                                      ? 'Chưa chọn đáp án'
                                      : 'Sai'}
                            </span>
                        )}
                    </div>

                    <button
                        type="button"
                        className={`diag-question-flag-btn ${isFlagged ? 'is-active' : ''}`}
                        onClick={() => onToggleFlag(question.orderNo)}
                        disabled={disabled}
                        aria-label={isFlagged ? `Bỏ đánh dấu câu ${question.orderNo}` : `Đánh dấu câu ${question.orderNo}`}
                        aria-pressed={isFlagged}
                        title={
                            resolvedMode === 'PRACTICE'
                                ? isFlagged
                                    ? 'Bỏ đánh dấu câu hỏi cần ôn lại'
                                    : 'Đánh dấu câu hỏi cần ôn lại'
                                : isFlagged
                                  ? 'Bỏ đánh dấu xem lại'
                                  : 'Đánh dấu xem lại'
                        }
                    >
                        <Flag size={15} fill={isFlagged ? '#f59e0b' : 'none'} />
                    </button>
                </div>

                <h2 className="diag-question-card__title">{question.title}</h2>

                <div className="diag-options-list" role="radiogroup" aria-label={`Các phương án câu ${question.orderNo}`}>
                    {question.options.map((opt) => {
                        const isSelected = selectedOption === opt.key;
                        const isCorrectOption = Boolean(isRevealed && revealInfo?.correctAnswer === opt.key);
                        const isWrongSelected = Boolean(isRevealed && revealInfo && isSelected && !isCorrectOption);

                        let reviewClass = '';
                        if (isRevealed) {
                            if (isCorrectOption) {
                                reviewClass = 'is-review-mode is-review-correct';
                            } else if (isWrongSelected) {
                                reviewClass = 'is-review-mode is-review-wrong';
                            } else {
                                reviewClass = 'is-review-mode';
                            }
                        }

                        return (
                            <button
                                key={opt.key}
                                type="button"
                                disabled={isSelectionLocked}
                                className={`diag-option-item ${!isRevealed && isSelected ? 'is-selected' : ''} ${reviewClass}`}
                                onClick={() => {
                                    if (!isSelectionLocked) {
                                        onSelectOption?.(question.orderNo, opt.key);
                                    }
                                }}
                                role="radio"
                                aria-checked={isSelected}
                            >
                                <span className="diag-option-item__badge">
                                    {isCorrectOption ? (
                                        <Check size={15} strokeWidth={2.75} />
                                    ) : isWrongSelected ? (
                                        <X size={15} strokeWidth={2.75} />
                                    ) : (
                                        opt.key
                                    )}
                                </span>
                                <span className="diag-option-item__text">
                                    {isRevealed && (isCorrectOption || isWrongSelected) ? (
                                        <strong>{opt.key}. </strong>
                                    ) : null}
                                    {opt.text}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {resolvedMode === 'PRACTICE' && !isRevealed && onCheckAnswer && (
                    <div className="exam-practice-check-row">
                        <button
                            type="button"
                            className="exam-practice-check-btn"
                            onClick={() => onCheckAnswer(question.orderNo)}
                            disabled={disabled}
                        >
                            <CheckCircle2 size={16} />
                            <span>Kiểm tra đáp án</span>
                        </button>
                    </div>
                )}

                {isRevealed && (
                    <ExplanationPanel
                        key={question.questionId}
                        explanation={revealInfo?.explanation ?? null}
                        questionOrderNo={question.orderNo}
                    />
                )}
            </div>
        );
    };

    if (isSplitLayout) {
        return (
            <div className="diag-question-card is-split">
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

                <div className="diag-split-right">
                    <div className="diag-split-pane__scroll">
                        {step.questions.map((question) => renderQuestionBlock(question, false))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="diag-question-card">
            {step.instruction && (
                <div className="diag-question-card__instruction">{step.instruction}</div>
            )}

            <div className="diag-single-pane__questions">
                {step.questions.map((question) => renderQuestionBlock(question, true))}
            </div>
        </div>
    );
}
