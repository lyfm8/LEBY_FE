import { BookOpen, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { ExamAudioPlayer } from '@/shared/exam/components/ExamAudioPlayer';
import { ExplanationPanel } from '@/shared/exam/components/ExplanationPanel';
import { MISTAKE_SOURCE_LABELS, type MistakeQuestionItem } from '../types/mistakeTypes';

// Kiểu props truyền vào thẻ hiển thị 1 câu hỏi làm sai trong chế độ Xem lại
interface MistakeQuestionCardProps {
    item: MistakeQuestionItem;
    displayIndex: number;
}

/**
 * Định dạng thời điểm làm sai gần nhất sang ngày giờ tiếng Việt dễ đọc.
 *
 * @param isoString Chuỗi thời gian ISO trả về từ Backend
 * @returns Chuỗi định dạng dd/mm/yyyy HH:mm hoặc chuỗi rỗng nếu null
 */
function formatWrongTime(isoString: string | null): string {
    // Trả chuỗi rỗng nếu không có mốc thời gian
    if (!isoString) {
        return '';
    }
    // Chuyển sang đối tượng Date và kiểm tra hợp lệ
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) {
        return '';
    }
    // Hiển thị ngày và giờ gọn gàng theo chuẩn Việt Nam
    return date.toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

/**
 * Presentational Component: Thẻ xem lại chi tiết 1 câu hỏi đã làm sai trong Sổ tay.
 * Tái sử dụng trực tiếp ExamAudioPlayer (nghe lại tự do + chỉnh tốc độ) và ExplanationPanel.
 */
export function MistakeQuestionCard({ item, displayIndex }: MistakeQuestionCardProps) {
    // Định dạng mốc thời gian sai gần nhất
    const formattedDate = formatWrongTime(item.lastWrongAt);
    // Lấy nhãn tiếng Việt của nguồn bài thi phát sinh lỗi sai
    const sourceBadgeText = item.sourceLabel || MISTAKE_SOURCE_LABELS[item.sourceType];

    return (
        <article className="pf-mistake-card">
            {/* Phần đầu thẻ: Số thứ tự, Part, Kỹ năng, Nguồn bài thi và số lần sai */}
            <header className="pf-mistake-card__head">
                <div className="pf-mistake-card__badges">
                    <span className="pf-mistake-index">Câu #{displayIndex}</span>
                    <span className="pf-mistake-part-badge">{item.partName}</span>
                    <span className="pf-mistake-source-badge">{sourceBadgeText}</span>
                    {item.wrongCount > 1 && (
                        <span className="pf-mistake-count-badge">Sai {item.wrongCount} lần</span>
                    )}
                </div>

                {/* Thời điểm làm sai gần nhất */}
                {formattedDate && (
                    <span className="pf-mistake-time">
                        <Clock size={13} />
                        <span>{formattedDate}</span>
                    </span>
                )}
            </header>

            {/* Các thẻ kỹ năng liên quan đến câu hỏi */}
            {item.abilities.length > 0 && (
                <div className="pf-mistake-abilities">
                    {item.abilities.map((ab) => (
                        <span key={ab.abilityId} className="pf-mistake-ability-tag">
                            {ab.abilityName}
                        </span>
                    ))}
                </div>
            )}

            {/* Ngữ liệu chùm (chỉ dẫn, đoạn văn bài đọc, ảnh hoặc tệp nghe dùng chung) */}
            {(item.instruction || item.passage || item.audioUrl || item.imageUrl) && (
                <div className="pf-mistake-context">
                    {item.instruction && (
                        <p className="pf-mistake-instruction">{item.instruction}</p>
                    )}

                    {/* Trình phát âm thanh dùng chung chế độ ôn tập: phát lại vô hạn + chỉnh tốc độ 0.8x/1.0x/1.2x */}
                    {item.audioUrl && (
                        <div className="pf-mistake-audio">
                            <ExamAudioPlayer
                                stepKey={`mistake-review-${item.questionId}`}
                                src={item.audioUrl}
                                policy="UNLIMITED"
                                allowSpeedControl={true}
                                isLocked={false}
                                isReviewMode={true}
                                onAudioEnded={() => undefined}
                            />
                        </div>
                    )}

                    {/* Hình ảnh minh họa câu hỏi (Part 1 hoặc bài đọc có bảng biểu) */}
                    {item.imageUrl && (
                        <img
                            src={item.imageUrl}
                            alt={`Hình minh họa câu ${displayIndex}`}
                            className="pf-mistake-image"
                            loading="lazy"
                        />
                    )}

                    {/* Đoạn văn đọc hiểu (Part 6, Part 7) có khung cuộn dễ theo dõi */}
                    {item.passage && (
                        <div className="pf-mistake-passage">
                            <div className="pf-mistake-passage__label">
                                <BookOpen size={14} />
                                <span>Đoạn văn ngữ cảnh</span>
                            </div>
                            <p className="pf-mistake-passage__text">{item.passage}</p>
                        </div>
                    )}
                </div>
            )}

            {/* Nội dung câu hỏi chính */}
            <h4 className="pf-mistake-question-title">{item.title}</h4>

            {/* Danh sách phương án A/B/C/D tô nổi bật đáp án đã chọn sai và đáp án đúng */}
            <div className="pf-mistake-options">
                {item.options.map((opt) => {
                    // Xác định phương án này là đáp án đúng hay phương án học viên từng chọn sai
                    const isCorrectOption = item.correctAnswer === opt.key;
                    const isWrongSelected = item.lastUserAnswer === opt.key && !isCorrectOption;

                    // Ghép lớp trạng thái tương ứng để người học nhận diện ngay điểm sai
                    const statusClass = isCorrectOption
                        ? 'is-correct'
                        : isWrongSelected
                          ? 'is-wrong'
                          : '';

                    return (
                        <div key={opt.key} className={`pf-mistake-opt ${statusClass}`}>
                            <span className="pf-mistake-opt__key">{opt.key}</span>
                            <span className="pf-mistake-opt__text">{opt.text}</span>
                            {isCorrectOption && (
                                <span className="pf-mistake-opt__tag is-correct">
                                    <CheckCircle2 size={14} />
                                    <span>Đáp án đúng</span>
                                </span>
                            )}
                            {isWrongSelected && (
                                <span className="pf-mistake-opt__tag is-wrong">
                                    <XCircle size={14} />
                                    <span>Bạn đã chọn</span>
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Nhắc rõ khi học viên bỏ trống câu này ở lần thi trước */}
            {!item.lastUserAnswer && (
                <p className="pf-mistake-unanswered-note">
                    Bạn đã bỏ trống câu này ở lần làm bài trước.
                </p>
            )}

            {/* Khung giải thích chi tiết (Manh mối, Phân tích, Lời thoại, Bản dịch, Từ vựng) */}
            <div className="pf-mistake-explanation">
                <ExplanationPanel
                    explanation={item.explanation}
                    questionOrderNo={item.questionId}
                />
            </div>
        </article>
    );
}
