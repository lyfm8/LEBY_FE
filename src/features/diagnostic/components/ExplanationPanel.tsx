import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { DiagnosticExplanation } from '../types/diagnosticTypes';

interface ExplanationPanelProps {
    // Dữ liệu lời giải chi tiết của câu hỏi (có thể null nếu chưa biên soạn)
    explanation: DiagnosticExplanation | null;
    // Số thứ tự câu hỏi dùng để tạo thuộc tính aria-controls chuẩn xác
    questionOrderNo: number;
}

/**
 * Khối hiển thị nút "Giải thích" có thể mở rộng / thu gọn ngay dưới từng câu hỏi trong Review Mode (BR14).
 * Trình bày đầy đủ: Manh mối đáp án, Phân tích chi tiết, Lời thoại (Transcript), Bản dịch và Từ vựng.
 */
export function ExplanationPanel({ explanation, questionOrderNo }: ExplanationPanelProps) {
    // Trạng thái đóng/mở nội dung giải thích của riêng từng câu hỏi (mặc định thu gọn)
    const [isExpanded, setIsExpanded] = useState<boolean>(false);

    // Tách danh sách từ vựng an toàn nếu trường vocabulary khác null
    const vocabularyList = explanation?.vocabulary ?? [];
    // Kiểm tra xem lời giải có ít nhất một trường dữ liệu hợp lệ để hiển thị hay không
    const hasContent = Boolean(
        explanation &&
            (explanation.clue ||
                explanation.analysis ||
                explanation.transcript ||
                explanation.translation ||
                vocabularyList.length > 0)
    );
    // Định danh DOM duy nhất phục vụ thuộc tính accessibility aria-controls
    const panelId = `diag-explanation-body-${questionOrderNo}`;

    return (
        <div className="diag-explanation-box">
            {/* Nút bấm mở rộng / thu gọn phần giải thích ngay bên dưới danh sách đáp án */}
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

            {/* Vùng nội dung chi tiết chỉ render khi người dùng bấm mở rộng */}
            {isExpanded && (
                <div id={panelId} className="diag-explanation-body">
                    {!hasContent ? (
                        // Thông báo nhẹ nhàng khi ngân hàng câu hỏi chưa cập nhật lời giải cho câu này
                        <p className="diag-explanation-empty">
                            Chưa có giải thích chi tiết cho câu hỏi này.
                        </p>
                    ) : (
                        <div className="diag-explanation-sections">
                            {/* Manh mối nhận diện đáp án đúng (ưu tiên đặt đầu để học viên nắm ý chính nhanh) */}
                            {explanation?.clue && (
                                <div className="diag-explanation-item is-clue">
                                    <span className="diag-explanation-label">Manh mối đáp án</span>
                                    <p className="diag-explanation-text">{explanation.clue}</p>
                                </div>
                            )}

                            {/* Phân tích lý do chọn đáp án đúng và giải thích bẫy các phương án nhiễu */}
                            {explanation?.analysis && (
                                <div className="diag-explanation-item">
                                    <span className="diag-explanation-label">Phân tích chi tiết</span>
                                    <p className="diag-explanation-text">{explanation.analysis}</p>
                                </div>
                            )}

                            {/* Lời thoại băng nghe tiếng Anh (dành cho các câu Listening Part 1-4) */}
                            {explanation?.transcript && (
                                <div className="diag-explanation-item">
                                    <span className="diag-explanation-label">Lời thoại (Transcript)</span>
                                    <p className="diag-explanation-text is-pre">{explanation.transcript}</p>
                                </div>
                            )}

                            {/* Bản dịch nghĩa tiếng Việt giúp đối chiếu ngữ cảnh */}
                            {explanation?.translation && (
                                <div className="diag-explanation-item">
                                    <span className="diag-explanation-label">Bản dịch tiếng Việt</span>
                                    <p className="diag-explanation-text is-pre">{explanation.translation}</p>
                                </div>
                            )}

                            {/* Danh sách từ vựng học thuật đáng chú ý trong câu */}
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
