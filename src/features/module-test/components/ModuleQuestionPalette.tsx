interface ModuleQuestionPaletteProps {
    total: number;
    currentIndex: number;
    answers: Record<number, string | null>;
    onSelectQuestion: (index: number) => void;
}

export function ModuleQuestionPalette({
    total,
    currentIndex,
    answers,
    onSelectQuestion,
}: ModuleQuestionPaletteProps) {
    const answeredCount = Object.values(answers).filter((v) => v !== null).length;
    const unansweredCount = total - answeredCount;

    return (
        <aside className="mtest-palette-card">
            <h3 className="mtest-palette-card__title">Bản đồ câu hỏi</h3>

            <div className="mtest-palette-legend">
                <div className="mtest-palette-legend__item">
                    <span className="mtest-palette-legend__dot is-answered" />
                    <span>Đã làm ({answeredCount})</span>
                </div>
                <div className="mtest-palette-legend__item">
                    <span className="mtest-palette-legend__dot is-current" />
                    <span>Đang làm (1)</span>
                </div>
                <div className="mtest-palette-legend__item">
                    <span className="mtest-palette-legend__dot is-unanswered" />
                    <span>Chưa làm ({unansweredCount})</span>
                </div>
            </div>

            <div className="mtest-palette-grid">
                {Array.from({ length: total }, (_, i) => {
                    const qNo = i + 1;
                    const isCurrent = i === currentIndex;
                    const isAnswered = answers[qNo] !== null && answers[qNo] !== undefined;

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
                            className={`mtest-palette-btn ${statusClass}`}
                            onClick={() => onSelectQuestion(i)}
                        >
                            {qNo}
                        </button>
                    );
                })}
            </div>
        </aside>
    );
}
