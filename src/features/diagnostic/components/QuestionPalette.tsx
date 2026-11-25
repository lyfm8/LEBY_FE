import { useState, useMemo } from 'react';
import { Flag, PanelRightClose, PanelRightOpen } from 'lucide-react';
import type { OptionKey } from '../types/diagnosticTypes';

type PaletteFilter = 'ALL' | 'UNANSWERED' | 'FLAGGED';

interface QuestionPaletteProps {
    total: number;
    currentIndex: number;
    answers: Record<number, OptionKey | null>;
    flagged: Set<number>;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
    onSelectQuestion: (index: number) => void;
}

/**
 * Bản đồ câu hỏi hỗ trợ thu gọn/mở rộng, lọc câu chưa làm / đánh dấu (Luồng 6a)
 * và hiển thị các ô câu hỏi kích thước lớn có thanh cuộn khi đề thi dài.
 */
export function QuestionPalette({
    total,
    currentIndex,
    answers,
    flagged,
    isCollapsed,
    onToggleCollapse,
    onSelectQuestion,
}: QuestionPaletteProps) {
    const [activeFilter, setActiveFilter] = useState<PaletteFilter>('ALL');

    const answeredCount = Object.values(answers).filter((v) => v !== null && v !== undefined).length;
    const flaggedCount = flagged.size;
    const unansweredCount = Math.max(0, total - answeredCount);

    const visibleIndices = useMemo(() => {
        const list: number[] = [];
        for (let i = 0; i < total; i++) {
            const qNo = i + 1;
            const isAnswered = answers[qNo] !== null && answers[qNo] !== undefined;
            const isItemFlagged = flagged.has(qNo);

            if (activeFilter === 'UNANSWERED' && isAnswered) continue;
            if (activeFilter === 'FLAGGED' && !isItemFlagged) continue;
            list.push(i);
        }
        return list;
    }, [total, answers, flagged, activeFilter]);

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
                    <strong>{answeredCount}</strong>
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

            {/* Chú thích trạng thái */}
            <div className="diag-palette-legend">
                <div className="diag-palette-legend__item">
                    <span className="diag-palette-legend__indicator is-answered" />
                    <span>Đã làm ({answeredCount})</span>
                </div>
                <div className="diag-palette-legend__item">
                    <span className="diag-palette-legend__indicator is-current" />
                    <span>Đang làm (1)</span>
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

            {/* Lưới câu hỏi có scroll khi nhiều câu, ô lớn và cờ nằm ngoài số */}
            {visibleIndices.length === 0 ? (
                <div className="diag-palette-empty">
                    Không có câu hỏi nào thuộc mục lọc này.
                </div>
            ) : (
                <div className="diag-palette-grid">
                    {visibleIndices.map((i) => {
                        const qNo = i + 1;
                        const isCurrent = i === currentIndex;
                        const isAnswered = answers[qNo] !== null && answers[qNo] !== undefined;
                        const isItemFlagged = flagged.has(qNo);

                        let statusClass = 'is-unanswered';
                        if (isCurrent) {
                            statusClass = 'is-current';
                        } else if (isAnswered) {
                            statusClass = 'is-answered';
                        }

                        return (
                            <button
                                key={qNo}
                                type="button"
                                className={`diag-palette-btn ${statusClass} ${isItemFlagged ? 'is-flagged' : ''}`}
                                onClick={() => onSelectQuestion(i)}
                                aria-label={`Chuyển đến câu ${qNo}${isItemFlagged ? ' (đã đánh dấu)' : ''}`}
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
            )}
        </aside>
    );
}
