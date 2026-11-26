import { useState, useMemo } from 'react';
import { Flag, Lock, PanelRightClose, PanelRightOpen, Unlock } from 'lucide-react';
import type { DiagnosticQuestion, OptionKey } from '../types/diagnosticTypes';

type PaletteFilter = 'ALL' | 'UNANSWERED' | 'FLAGGED';

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
    // Đảo trạng thái thu gọn/mở rộng bảng Palette
    onToggleCollapse: () => void;
    // Callback nhảy tới câu hỏi khi bấm ô trên bảng Palette
    onSelectQuestion: (orderNo: number) => void;
}

/**
 * Bản đồ câu hỏi chia rõ 2 khu vực Nghe & Đọc:
 * - Không gộp ô câu hỏi chùm trên Palette, giữ đủ từng ô số để dễ kiểm soát câu sót/gắn cờ.
 * - Khi Phần Nghe chưa chạy hết toàn bộ audio: làm mờ và khóa click để tránh ngắt chuỗi nghe liên tục.
 * - Khi Phần Nghe đã chạy hết toàn bộ audio: làm sáng lại Phần Nghe và mở khóa toàn bộ bảng cho phép sửa đáp án / gắn cờ.
 */
export function QuestionPalette({
    questions,
    activeOrderNos,
    answers,
    flagged,
    isCollapsed,
    isListeningCompleted,
    onToggleCollapse,
    onSelectQuestion,
}: QuestionPaletteProps) {
    // Bộ lọc hiển thị câu hỏi trên bảng Palette (Tất cả / Chưa làm / Đánh dấu)
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
    // Số câu còn bỏ trống chưa làm
    const unansweredCount = Math.max(0, total - answeredCount);

    // Lọc danh sách câu hỏi theo bộ lọc đang chọn và tách làm 2 nhóm LISTENING / READING
    const { listeningQuestions, readingQuestions } = useMemo(() => {
        // Sắp xếp danh sách câu theo thứ tự tăng dần orderNo
        const sorted = [...questions].sort((a, b) => a.orderNo - b.orderNo);
        // Hàm kiểm tra từng câu hỏi có khớp điều kiện bộ lọc hiện tại hay không
        const matchesFilter = (q: DiagnosticQuestion) => {
            const isAnswered = answers[q.orderNo] !== null && answers[q.orderNo] !== undefined;
            const isItemFlagged = flagged.has(q.orderNo);
            if (activeFilter === 'UNANSWERED' && isAnswered) return false;
            if (activeFilter === 'FLAGGED' && !isItemFlagged) return false;
            return true;
        };

        // Lọc ra nhóm câu Nghe khớp bộ lọc
        const listening = sorted.filter((q) => q.section === 'LISTENING' && matchesFilter(q));
        // Lọc ra nhóm câu Đọc khớp bộ lọc
        const reading = sorted.filter((q) => q.section === 'READING' && matchesFilter(q));
        // Trả về hai danh sách tách biệt
        return { listeningQuestions: listening, readingQuestions: reading };
    }, [questions, answers, flagged, activeFilter]);

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
                {/* Số câu đã làm trên tổng số câu */}
                <div className="diag-palette-mini-stat">
                    <strong>{answeredCount}</strong>
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

                // Xác định class màu trạng thái cho từng ô số
                let statusClass = 'is-unanswered';
                if (isCurrent) {
                    statusClass = 'is-current';
                } else if (isAnswered) {
                    statusClass = 'is-answered';
                }

                return (
                    <button
                        key={q.questionId}
                        type="button"
                        disabled={isSectionLocked}
                        className={`diag-palette-btn ${statusClass} ${isItemFlagged ? 'is-flagged' : ''}`}
                        onClick={() => onSelectQuestion(qNo)}
                        aria-label={`Chuyển đến câu ${qNo}${isItemFlagged ? ' (đã đánh dấu)' : ''}`}
                        title={
                            isSectionLocked
                                ? 'Khóa chuyển câu cho đến khi nghe xong toàn bộ phần Nghe'
                                : `Đi tới câu ${qNo}`
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

            {/* Bộ lọc danh sách câu hỏi (UC06 Luồng thay thế 6a) */}
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

            {/* Hiển thị thông báo trống hoặc hai khu vực Phần Nghe / Phần Đọc */}
            {!hasVisibleItems ? (
                <div className="diag-palette-empty">Không có câu hỏi nào thuộc mục lọc này.</div>
            ) : (
                <div className="diag-palette-sections">
                    {/* Khu vực Phần Nghe: làm mờ khi chưa chạy xong toàn bộ audio, sáng lại và cho chỉnh sửa khi nghe xong */}
                    {listeningQuestions.length > 0 && (
                        <div className={`diag-palette-section ${!isListeningCompleted ? 'is-dimmed' : ''}`}>
                            <div className="diag-palette-section__header">
                                <span className="diag-palette-section__title">Phần Nghe (Listening)</span>
                                
                            </div>
                            {renderSectionGrid(listeningQuestions, !isListeningCompleted)}
                        </div>
                    )}

                    {/* Khu vực Phần Đọc: khóa click khi phần Nghe chưa chạy xong, mở tự do ngay sau khi nghe xong */}
                    {readingQuestions.length > 0 && (
                        <div className={`diag-palette-section ${!isListeningCompleted ? 'is-locked-wait' : ''}`}>
                            <div className="diag-palette-section__header">
                                <span className="diag-palette-section__title">Phần Đọc (Reading)</span>
                            </div>
                            {renderSectionGrid(readingQuestions, !isListeningCompleted)}
                        </div>
                    )}
                </div>
            )}
        </aside>
    );
}
