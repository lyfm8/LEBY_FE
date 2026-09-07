import { Flag } from 'lucide-react';
import type { OptionKey } from '../types/diagnosticTypes';

interface QuestionPaletteProps {
    total: number;
    currentIndex: number;
    answers: Record<number, OptionKey | null>;
    flagged: Set<number>;
    onSelectQuestion: (index: number) => void;
}

export function QuestionPalette({
    total,
    currentIndex,
    answers,
    flagged,
    onSelectQuestion,
}: QuestionPaletteProps) {
    const answeredCount = Object.values(answers).filter((v) => v !== null).length;
    const flaggedCount = flagged.size;
    const unansweredCount = total - answeredCount;

    return (
        <aside className="diag-palette-card" aria-label="Bản đồ câu hỏi">
            <h3 className="diag-palette-card__title">Bản đồ câu hỏi</h3>

            {/* Legend */}
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

            {/* Grid 1 to N */}
            <div className="diag-palette-grid">
                {Array.from({ length: total }, (_, i) => {
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
                            aria-label={`Chuyển đến câu ${qNo}`}
                        >
                            {qNo}
                            {isItemFlagged && (
                                <span className="diag-palette-btn__flag">
                                    <Flag size={8} fill="#f59e0b" />
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        </aside>
    );
}
