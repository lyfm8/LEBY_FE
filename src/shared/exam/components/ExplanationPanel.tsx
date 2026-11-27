import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { ExamExplanation } from '../types/examTypes';

interface ExplanationPanelProps {
    explanation: ExamExplanation | null;
    questionOrderNo: number;
    defaultExpanded?: boolean;
}

/**
 * Khối hiển thị nút "Giải thích" có thể mở rộng / thu gọn bên dưới từng câu hỏi.
 * Dùng chung cho chế độ Xem lại (Diagnostic / Module Test Review) và Luyện tập tức thì (Practice).
 */
export function ExplanationPanel({
    explanation,
    questionOrderNo,
    defaultExpanded = false,
}: ExplanationPanelProps) {
    const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);

    const vocabularyList = explanation?.vocabulary ?? [];
    const hasContent = Boolean(
        explanation &&
            (explanation.clue ||
                explanation.analysis ||
                explanation.transcript ||
                explanation.translation ||
                vocabularyList.length > 0)
    );
    const panelId = `exam-explanation-body-${questionOrderNo}`;

    return (
        <div className="diag-explanation-box">
            <button
                type="button"
                className={`diag-explanation-toggle ${isExpanded ? 'is-open' : ''}`}
                onClick={() => setIsExpanded((prev) => !prev)}
                aria-expanded={isExpanded}
                aria-controls={panelId}
            >
                <span>Giải thích</span>
                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {isExpanded && (
                <div id={panelId} className="diag-explanation-body">
                    {!hasContent ? (
                        <p className="diag-explanation-empty">
                            Chưa có giải thích chi tiết cho câu hỏi này.
                        </p>
                    ) : (
                        <div className="diag-explanation-sections">
                            {explanation?.clue && (
                                <div className="diag-explanation-item is-clue">
                                    <span className="diag-explanation-label">Manh mối đáp án</span>
                                    <p className="diag-explanation-text">{explanation.clue}</p>
                                </div>
                            )}

                            {explanation?.analysis && (
                                <div className="diag-explanation-item">
                                    <span className="diag-explanation-label">Phân tích chi tiết</span>
                                    <p className="diag-explanation-text">{explanation.analysis}</p>
                                </div>
                            )}

                            {explanation?.transcript && (
                                <div className="diag-explanation-item">
                                    <span className="diag-explanation-label">Lời thoại (Transcript)</span>
                                    <p className="diag-explanation-text is-pre">{explanation.transcript}</p>
                                </div>
                            )}

                            {explanation?.translation && (
                                <div className="diag-explanation-item">
                                    <span className="diag-explanation-label">Bản dịch tiếng Việt</span>
                                    <p className="diag-explanation-text is-pre">{explanation.translation}</p>
                                </div>
                            )}

                            {vocabularyList.length > 0 && (
                                <div className="diag-explanation-item">
                                    <span className="diag-explanation-label">Từ vựng trọng tâm</span>
                                    <ul className="diag-explanation-vocab-list">
                                        {vocabularyList.map((vocab, idx) => (
                                            <li key={`${vocab.word}-${idx}`} className="diag-explanation-vocab-row">
                                                <strong className="diag-explanation-vocab-word">{vocab.word}</strong>
                                                {vocab.type && (
                                                    <span className="diag-explanation-vocab-type">({vocab.type})</span>
                                                )}
                                                <span className="diag-explanation-vocab-meaning">
                                                    — {vocab.meaning}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
