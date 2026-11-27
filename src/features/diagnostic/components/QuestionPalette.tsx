import { useState, useMemo } from 'react';
import { Flag, PanelRightClose, PanelRightOpen } from 'lucide-react';
import type { DiagnosticQuestion, OptionKey } from '../types/diagnosticTypes';

type PaletteFilter = 'ALL' | 'UNANSWERED' | 'FLAGGED' | 'CORRECT' | 'INCORRECT';

interface QuestionPaletteProps {
    // Danh sách toàn bộ câu hỏi trong đề để chia rõ Phần Nghe và Phần Đọc
    questions: DiagnosticQuestion[];
    // Tập các câu hỏi đang hiển thị trên màn hình (gồm nhiều câu nếu đang ở câu chùm)
    activeOrderNos: Set<number>;
    // Bản đồ đáp án hiện tại theo orderNo
    answers: Record<number, OptionKey | null>;
    // Tập hợp câu hỏi đã gắn cờ đánh dấu theo dõi
    flagged: Set<number>;
    // Trạng thái thu gọn thanh bên phải
    isCollapsed: boolean;
    // Cờ xác định toàn bộ audio Phần Nghe đã chạy xong hết hay chưa
    isListeningCompleted: boolean;
    // Bật chế độ Xem lại: tô ô xanh lá (đúng) / đỏ (sai), mở khóa click và thêm bộ lọc đúng/sai
    isReviewMode?: boolean;
    // Bản đồ kết quả đúng/sai theo orderNo phục vụ tô màu Palette ở chế độ Xem lại
    reviewStatusMap?: Record<number, boolean>;
    // Đảo trạng thái thu gọn/mở rộng bảng Palette
    onToggleCollapse: () => void;
    // Callback nhảy tới câu hỏi khi bấm ô trên bảng Palette
    onSelectQuestion: (orderNo: number) => void;
}

/**
 * Bản đồ câu hỏi chia rõ 2 khu vực Nghe & Đọc:
 * - Khi thi thật: khóa click khi Phần Nghe chưa chạy hết, đánh dấu màu đã làm / đang xem / chưa làm / gắn cờ.
 * - Khi xem lại (isReviewMode): mở tự do cả hai khu vực, câu đúng màu xanh lá, câu sai màu đỏ và lọc được câu đúng/sai.
 */
export function QuestionPalette({
    questions,
    activeOrderNos,
    answers,
    flagged,
    isCollapsed,
    isListeningCompleted,
    isReviewMode = false,
    reviewStatusMap,
    onToggleCollapse,
    onSelectQuestion,
}: QuestionPaletteProps) {
    // Bộ lọc hiển thị câu hỏi trên bảng Palette (thay đổi linh hoạt theo chế độ thi hoặc xem lại)
    const [activeFilter, setActiveFilter] = useState<PaletteFilter>('ALL');

    // Tổng số câu hỏi trong đề
    const total = questions.length;
    // Số câu đã chọn ít nhất một đáp án
    const answeredCount = useMemo(
        () =>
            questions.filter((q) => answers[q.orderNo] !== null && answers[q.orderNo] !== undefined)
                .length,
        [questions, answers]
    );
    // Số câu đã gắn cờ xem lại
    const flaggedCount = flagged.size;
    // Số câu còn bỏ trống chưa làm (dùng cho chế độ thi)
    const unansweredCount = Math.max(0, total - answeredCount);

    // Đếm tổng câu đúng trong chế độ Xem lại
    const correctCount = useMemo(
        () => questions.filter((q) => Boolean(reviewStatusMap?.[q.orderNo])).length,
        [questions, reviewStatusMap]
    );
    // Đếm tổng câu sai (bao gồm cả câu bỏ qua) trong chế độ Xem lại
    const incorrectCount = Math.max(0, total - correctCount);

    // Lọc danh sách câu hỏi theo bộ lọc đang chọn và tách làm 2 nhóm LISTENING / READING
    const { listeningQuestions, readingQuestions } = useMemo(() => {
        // Sắp xếp danh sách câu theo thứ tự tăng dần orderNo
        const sorted = [...questions].sort((a, b) => a.orderNo - b.orderNo);
        // Hàm kiểm tra từng câu hỏi có khớp điều kiện bộ lọc hiện tại hay không
        const matchesFilter = (q: DiagnosticQuestion) => {
            const isAnswered = answers[q.orderNo] !== null && answers[q.orderNo] !== undefined;
            const isItemFlagged = flagged.has(q.orderNo);
            const isCorrectItem = Boolean(reviewStatusMap?.[q.orderNo]);
            if (activeFilter === 'UNANSWERED' && isAnswered) return false;
            if (activeFilter === 'FLAGGED' && !isItemFlagged) return false;
            if (activeFilter === 'CORRECT' && !isCorrectItem) return false;
            if (activeFilter === 'INCORRECT' && isCorrectItem) return false;
            return true;
        };

        // Lọc ra nhóm câu Nghe khớp bộ lọc
        const listening = sorted.filter((q) => q.section === 'LISTENING' && matchesFilter(q));
        // Lọc ra nhóm câu Đọc khớp bộ lọc
        const reading = sorted.filter((q) => q.section === 'READING' && matchesFilter(q));
        // Trả về hai danh sách tách biệt
        return { listeningQuestions: listening, readingQuestions: reading };
    }, [questions, answers, flagged, activeFilter, reviewStatusMap]);

    // Giao diện thu gọn chỉ hiển thị tổng quan nhanh và nút mở rộng
    if (isCollapsed) {
        return (
            <aside className="diag-palette-card is-collapsed" aria-label="Bản đồ câu hỏi (đang thu gọn)">
                {/* Nút mở rộng lại bảng câu hỏi */}
                <button
                    type="button"
                    className="diag-palette-expand-btn"
                    onClick={onToggleCollapse}
                    title="Mở rộng bản đồ câu hỏi"
                    aria-label="Mở rộng bản đồ câu hỏi"
                >
                    <PanelRightOpen size={20} />
                </button>
                {/* Số câu đúng (nếu xem lại) hoặc số câu đã làm (nếu đang thi) trên tổng số câu */}
                <div className="diag-palette-mini-stat">
                    <strong>{isReviewMode ? correctCount : answeredCount}</strong>
                    <span>/ {total}</span>
                </div>
                {/* Hiển thị số câu đánh dấu nếu có */}
                {flaggedCount > 0 && (
                    <div className="diag-palette-mini-flag" title={`${flaggedCount} câu đã đánh dấu`}>
                        <Flag size={14} fill="#f59e0b" color="#d97706" />
                        <span>{flaggedCount}</span>
                    </div>
                )}
            </aside>
        );
    }

    // Hàm dựng lưới ô số cho từng khu vực Nghe hoặc Đọc
    const renderSectionGrid = (sectionQuestions: DiagnosticQuestion[], isSectionLocked: boolean) => (
        <div className="diag-palette-grid">
            {sectionQuestions.map((q) => {
                // Lấy số thứ tự thực tế của câu hỏi trên đề
                const qNo = q.orderNo;
                // Kiểm tra câu này có đang hiển thị ở màn hình hiện tại hay không
                const isCurrent = activeOrderNos.has(qNo);
                // Kiểm tra câu này đã chọn đáp án chưa
                const isAnswered = answers[qNo] !== null && answers[qNo] !== undefined;
                // Kiểm tra câu này có đang được gắn cờ không
                const isItemFlagged = flagged.has(qNo);
                // Trong chế độ Xem lại luôn mở khóa bấm chuyển câu tự do
                const isEffectiveLocked = isReviewMode ? false : isSectionLocked;

                // Xác định class màu trạng thái cho từng ô số theo chế độ Xem lại hoặc Làm bài
                let statusClass = 'is-unanswered';
                if (isReviewMode) {
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

                // Tạo nhãn mô tả trạng thái hỗ trợ đọc màn hình và tooltip hover
                const reviewStatusText = isReviewMode
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

    // Xác định có câu hỏi nào thuộc kết quả lọc ở một trong hai khu vực hay không
    const hasVisibleItems = listeningQuestions.length > 0 || readingQuestions.length > 0;

    return (
        <aside className="diag-palette-card" aria-label="Bản đồ câu hỏi">
            {/* Tiêu đề bảng và nút Thu gọn */}
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

            {/* Chú thích các màu trạng thái trên bảng */}
            {isReviewMode ? (
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

            {/* Bộ lọc danh sách câu hỏi */}
            {isReviewMode ? (
                <div className="diag-palette-filters is-review" role="tablist" aria-label="Lọc câu hỏi xem lại">
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

            {/* Hiển thị thông báo trống hoặc hai khu vực Phần Nghe / Phần Đọc */}
            {!hasVisibleItems ? (
                <div className="diag-palette-empty">Không có câu hỏi nào thuộc mục lọc này.</div>
            ) : (
                <div className="diag-palette-sections">
                    {/* Khu vực Phần Nghe: mở khóa toàn bộ khi ở chế độ Xem lại */}
                    {listeningQuestions.length > 0 && (
                        <div className={`diag-palette-section ${!isReviewMode && !isListeningCompleted ? 'is-dimmed' : ''}`}>
                            <div className="diag-palette-section__header">
                                <span className="diag-palette-section__title">Phần Nghe (Listening)</span>
                            </div>
                            {renderSectionGrid(listeningQuestions, !isReviewMode && !isListeningCompleted)}
                        </div>
                    )}

                    {/* Khu vực Phần Đọc: mở khóa toàn bộ khi ở chế độ Xem lại */}
                    {readingQuestions.length > 0 && (
                        <div className={`diag-palette-section ${!isReviewMode && !isListeningCompleted ? 'is-locked-wait' : ''}`}>
                            <div className="diag-palette-section__header">
                                <span className="diag-palette-section__title">Phần Đọc (Reading)</span>
                            </div>
                            {renderSectionGrid(readingQuestions, !isReviewMode && !isListeningCompleted)}
                        </div>
                    )}
                </div>
            )}
        </aside>
    );
}
