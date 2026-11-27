import { useState, useMemo } from 'react';
import { Flag, PanelRightClose, PanelRightOpen } from 'lucide-react';
import type { BaseExamQuestion, ExamRoomMode, OptionKey } from '../types/examTypes';

type PaletteFilter = 'ALL' | 'UNANSWERED' | 'FLAGGED' | 'CORRECT' | 'INCORRECT';

interface ExamQuestionPaletteProps<TQuestion extends BaseExamQuestion = BaseExamQuestion> {
    questions: TQuestion[];
    activeOrderNos: Set<number>;
    answers: Record<number, OptionKey | null>;
    flagged: Set<number>;
    isCollapsed: boolean;
    isListeningCompleted: boolean;
    mode?: ExamRoomMode;
    isReviewMode?: boolean;
    reviewStatusMap?: Record<number, boolean>;
    revealedOrderNos?: Set<number>;
    onToggleCollapse: () => void;
    onSelectQuestion: (orderNo: number) => void;
}

/**
 * Bản đồ câu hỏi chia khu vực Nghe & Đọc (tự động ẩn khu vực không có câu hỏi ở Module Test / Practice):
 * - mode = 'EXAM': khóa chuyển câu khi phần Nghe chưa chạy xong hết; đánh dấu đã làm / đang xem / chưa làm / cờ.
 * - mode = 'PRACTICE': mở nhảy câu tự do, câu đã bấm kiểm tra tô xanh lá (đúng) hoặc đỏ (sai).
 * - mode = 'REVIEW': mở khóa toàn bộ, tô xanh lá / đỏ và lọc theo câu đúng/sai/đánh dấu.
 */
export function ExamQuestionPalette<TQuestion extends BaseExamQuestion = BaseExamQuestion>({
    questions,
    activeOrderNos,
    answers,
    flagged,
    isCollapsed,
    isListeningCompleted,
    mode,
    isReviewMode = false,
    reviewStatusMap,
    revealedOrderNos,
    onToggleCollapse,
    onSelectQuestion,
}: ExamQuestionPaletteProps<TQuestion>) {
    const resolvedMode: ExamRoomMode = mode ?? (isReviewMode ? 'REVIEW' : 'EXAM');
    const isReviewLike = resolvedMode === 'REVIEW';
    const isPractice = resolvedMode === 'PRACTICE';

    const [activeFilter, setActiveFilter] = useState<PaletteFilter>('ALL');

    const total = questions.length;
    const answeredCount = useMemo(
        () =>
            questions.filter((q) => answers[q.orderNo] !== null && answers[q.orderNo] !== undefined)
                .length,
        [questions, answers]
    );
    const flaggedCount = flagged.size;
    const unansweredCount = Math.max(0, total - answeredCount);

    const correctCount = useMemo(
        () =>
            questions.filter((q) => {
                if (isPractice && !revealedOrderNos?.has(q.orderNo)) return false;
                return Boolean(reviewStatusMap?.[q.orderNo]);
            }).length,
        [questions, reviewStatusMap, isPractice, revealedOrderNos]
    );

    const incorrectCount = useMemo(() => {
        if (isPractice) {
            return questions.filter(
                (q) => Boolean(revealedOrderNos?.has(q.orderNo)) && !reviewStatusMap?.[q.orderNo]
            ).length;
        }
        return Math.max(0, total - correctCount);
    }, [questions, isPractice, revealedOrderNos, reviewStatusMap, total, correctCount]);

    const { listeningQuestions, readingQuestions } = useMemo(() => {
        const sorted = [...questions].sort((a, b) => a.orderNo - b.orderNo);
        const matchesFilter = (q: TQuestion) => {
            const isAnswered = answers[q.orderNo] !== null && answers[q.orderNo] !== undefined;
            const isItemFlagged = flagged.has(q.orderNo);
            const isChecked = isReviewLike || Boolean(revealedOrderNos?.has(q.orderNo));
            const isCorrectItem = isChecked && Boolean(reviewStatusMap?.[q.orderNo]);
            const isIncorrectItem = isChecked && !reviewStatusMap?.[q.orderNo];

            if (activeFilter === 'UNANSWERED' && isAnswered) return false;
            if (activeFilter === 'FLAGGED' && !isItemFlagged) return false;
            if (activeFilter === 'CORRECT' && !isCorrectItem) return false;
            if (activeFilter === 'INCORRECT' && !isIncorrectItem) return false;
            return true;
        };

        const listening = sorted.filter((q) => q.section === 'LISTENING' && matchesFilter(q));
        const reading = sorted.filter((q) => q.section === 'READING' && matchesFilter(q));
        return { listeningQuestions: listening, readingQuestions: reading };
    }, [questions, answers, flagged, activeFilter, reviewStatusMap, isReviewLike, revealedOrderNos]);

    if (isCollapsed) {
        return (
            <aside className="diag-palette-card is-collapsed" aria-label="Bản đồ câu hỏi (đang thu gọn)">
                <button
                    type="button"
                    className="diag-palette-expand-btn"
                    onClick={onToggleCollapse}
                    title="Mở rộng bản đồ câu hỏi"
                    aria-label="Mở rộng bản đồ câu hỏi"
                >
                    <PanelRightOpen size={20} />
                </button>
                <div className="diag-palette-mini-stat">
                    <strong>{isReviewLike ? correctCount : answeredCount}</strong>
                    <span>/ {total}</span>
                </div>
                {flaggedCount > 0 && (
                    <div className="diag-palette-mini-flag" title={`${flaggedCount} câu đã đánh dấu`}>
                        <Flag size={14} fill="#f59e0b" color="#d97706" />
                        <span>{flaggedCount}</span>
                    </div>
                )}
            </aside>
        );
    }

    const renderSectionGrid = (sectionQuestions: TQuestion[], isSectionLocked: boolean) => (
        <div className="diag-palette-grid">
            {sectionQuestions.map((q) => {
                const qNo = q.orderNo;
                const isCurrent = activeOrderNos.has(qNo);
                const isAnswered = answers[qNo] !== null && answers[qNo] !== undefined;
                const isItemFlagged = flagged.has(qNo);
                const isChecked = isReviewLike || (isPractice && Boolean(revealedOrderNos?.has(qNo)));
                const isEffectiveLocked = isReviewLike || isPractice ? false : isSectionLocked;

                let statusClass = 'is-unanswered';
                if (isChecked) {
                    const isCorrectItem = Boolean(reviewStatusMap?.[qNo]);
                    statusClass = isCorrectItem ? 'is-review-correct' : 'is-review-incorrect';
                    if (isCurrent) {
                        statusClass += ' is-review-current';
                    }
                } else if (isCurrent) {
                    statusClass = 'is-current';
                } else if (isAnswered) {
                    statusClass = 'is-answered';
                }

                const reviewStatusText = isChecked
                    ? reviewStatusMap?.[qNo]
                        ? ' - Đúng'
                        : ' - Sai'
                    : '';

                return (
                    <button
                        key={q.questionId}
                        type="button"
                        disabled={isEffectiveLocked}
                        className={`diag-palette-btn ${statusClass} ${isItemFlagged ? 'is-flagged' : ''}`}
                        onClick={() => onSelectQuestion(qNo)}
                        aria-label={`Chuyển đến câu ${qNo}${reviewStatusText}${isItemFlagged ? ' (đã đánh dấu)' : ''}`}
                        title={
                            isEffectiveLocked
                                ? 'Khóa chuyển câu cho đến khi nghe xong toàn bộ phần Nghe'
                                : `Đi tới câu ${qNo}${reviewStatusText}`
                        }
                    >
                        <span className="diag-palette-btn__num">{qNo}</span>
                        {isItemFlagged && (
                            <span className="diag-palette-btn__flag" aria-hidden="true">
                                <Flag size={9} fill="#f59e0b" color="#d97706" />
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );

    const hasVisibleItems = listeningQuestions.length > 0 || readingQuestions.length > 0;
    const isNavigationLocked = !isReviewLike && !isPractice && !isListeningCompleted;

    return (
        <aside className="diag-palette-card" aria-label="Bản đồ câu hỏi">
            <div className="diag-palette-card__header">
                <h3 className="diag-palette-card__title">Bản đồ câu hỏi</h3>
                <button
                    type="button"
                    className="diag-palette-collapse-btn"
                    onClick={onToggleCollapse}
                    title="Thu gọn bản đồ câu hỏi"
                    aria-label="Thu gọn bản đồ câu hỏi"
                >
                    <PanelRightClose size={16} />
                    <span>Thu gọn</span>
                </button>
            </div>

            {isReviewLike ? (
                <div className="diag-palette-legend">
                    <div className="diag-palette-legend__item">
                        <span className="diag-palette-legend__indicator is-review-correct" />
                        <span>Đúng ({correctCount})</span>
                    </div>
                    <div className="diag-palette-legend__item">
                        <span className="diag-palette-legend__indicator is-review-incorrect" />
                        <span>Sai ({incorrectCount})</span>
                    </div>
                    <div className="diag-palette-legend__item">
                        <span className="diag-palette-legend__indicator is-review-current" />
                        <span>Đang xem ({activeOrderNos.size})</span>
                    </div>
                    <div className="diag-palette-legend__item">
                        <span className="diag-palette-legend__indicator is-flagged" />
                        <span>Đánh dấu ({flaggedCount})</span>
                    </div>
                </div>
            ) : isPractice ? (
                <div className="diag-palette-legend">
                    <div className="diag-palette-legend__item">
                        <span className="diag-palette-legend__indicator is-review-correct" />
                        <span>Đúng ({correctCount})</span>
                    </div>
                    <div className="diag-palette-legend__item">
                        <span className="diag-palette-legend__indicator is-review-incorrect" />
                        <span>Sai ({incorrectCount})</span>
                    </div>
                    <div className="diag-palette-legend__item">
                        <span className="diag-palette-legend__indicator is-current" />
                        <span>Đang làm ({activeOrderNos.size})</span>
                    </div>
                    <div className="diag-palette-legend__item">
                        <span className="diag-palette-legend__indicator is-flagged" />
                        <span>Cần ôn lại ({flaggedCount})</span>
                    </div>
                </div>
            ) : (
                <div className="diag-palette-legend">
                    <div className="diag-palette-legend__item">
                        <span className="diag-palette-legend__indicator is-answered" />
                        <span>Đã làm ({answeredCount})</span>
                    </div>
                    <div className="diag-palette-legend__item">
                        <span className="diag-palette-legend__indicator is-current" />
                        <span>Đang xem ({activeOrderNos.size})</span>
                    </div>
                    <div className="diag-palette-legend__item">
                        <span className="diag-palette-legend__indicator is-unanswered" />
                        <span>Chưa làm ({unansweredCount})</span>
                    </div>
                    <div className="diag-palette-legend__item">
                        <span className="diag-palette-legend__indicator is-flagged" />
                        <span>Đánh dấu ({flaggedCount})</span>
                    </div>
                </div>
            )}

            {isReviewLike || isPractice ? (
                <div className="diag-palette-filters is-review" role="tablist" aria-label="Lọc câu hỏi">
                    <button
                        type="button"
                        role="tab"
                        aria-selected={activeFilter === 'ALL'}
                        className={`diag-palette-filter-btn ${activeFilter === 'ALL' ? 'is-active' : ''}`}
                        onClick={() => setActiveFilter('ALL')}
                    >
                        Tất cả ({total})
                    </button>
                    <button
                        type="button"
                        role="tab"
                        aria-selected={activeFilter === 'CORRECT'}
                        className={`diag-palette-filter-btn ${activeFilter === 'CORRECT' ? 'is-active' : ''}`}
                        onClick={() => setActiveFilter('CORRECT')}
                    >
                        Câu đúng ({correctCount})
                    </button>
                    <button
                        type="button"
                        role="tab"
                        aria-selected={activeFilter === 'INCORRECT'}
                        className={`diag-palette-filter-btn ${activeFilter === 'INCORRECT' ? 'is-active' : ''}`}
                        onClick={() => setActiveFilter('INCORRECT')}
                    >
                        Câu sai ({incorrectCount})
                    </button>
                    <button
                        type="button"
                        role="tab"
                        aria-selected={activeFilter === 'FLAGGED'}
                        className={`diag-palette-filter-btn ${activeFilter === 'FLAGGED' ? 'is-active' : ''}`}
                        onClick={() => setActiveFilter('FLAGGED')}
                    >
                        Đánh dấu ({flaggedCount})
                    </button>
                </div>
            ) : (
                <div className="diag-palette-filters" role="tablist" aria-label="Lọc câu hỏi">
                    <button
                        type="button"
                        role="tab"
                        aria-selected={activeFilter === 'ALL'}
                        className={`diag-palette-filter-btn ${activeFilter === 'ALL' ? 'is-active' : ''}`}
                        onClick={() => setActiveFilter('ALL')}
                    >
                        Tất cả ({total})
                    </button>
                    <button
                        type="button"
                        role="tab"
                        aria-selected={activeFilter === 'UNANSWERED'}
                        className={`diag-palette-filter-btn ${activeFilter === 'UNANSWERED' ? 'is-active' : ''}`}
                        onClick={() => setActiveFilter('UNANSWERED')}
                    >
                        Chưa làm ({unansweredCount})
                    </button>
                    <button
                        type="button"
                        role="tab"
                        aria-selected={activeFilter === 'FLAGGED'}
                        className={`diag-palette-filter-btn ${activeFilter === 'FLAGGED' ? 'is-active' : ''}`}
                        onClick={() => setActiveFilter('FLAGGED')}
                    >
                        Đánh dấu ({flaggedCount})
                    </button>
                </div>
            )}

            {!hasVisibleItems ? (
                <div className="diag-palette-empty">Không có câu hỏi nào thuộc mục lọc này.</div>
            ) : (
                <div className="diag-palette-sections">
                    {listeningQuestions.length > 0 && (
                        <div className={`diag-palette-section ${isNavigationLocked ? 'is-dimmed' : ''}`}>
                            <div className="diag-palette-section__header">
                                <span className="diag-palette-section__title">Phần Nghe (Listening)</span>
                            </div>
                            {renderSectionGrid(listeningQuestions, isNavigationLocked)}
                        </div>
                    )}

                    {readingQuestions.length > 0 && (
                        <div className={`diag-palette-section ${isNavigationLocked ? 'is-locked-wait' : ''}`}>
                            <div className="diag-palette-section__header">
                                <span className="diag-palette-section__title">Phần Đọc (Reading)</span>
                            </div>
                            {renderSectionGrid(readingQuestions, isNavigationLocked)}
                        </div>
                    )}
                </div>
            )}
        </aside>
    );
}
