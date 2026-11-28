import { ExamAudioPlayer } from '@/shared/exam/components/ExamAudioPlayer';
import { ExplanationPanel } from '@/shared/exam/components/ExplanationPanel';
import { MISTAKE_SOURCE_LABELS, type MistakeQuestionItem } from '../types/mistakeTypes';

// Kiểu props truyền vào thẻ hiển thị 1 câu hỏi làm sai trong chế độ Xem lại
interface MistakeQuestionCardProps {
    item: MistakeQuestionItem;
    displayIndex: number;
    /** Bật chế độ Accordion thu gọn / bung chi tiết khi xem danh sách câu sai theo nhóm. */
    isExpanded?: boolean;
    /** Hàm bật/tắt mở rộng nội dung chi tiết (Audio, Ảnh, Đáp án, Giải thích) của câu hỏi. */
    onToggleExpand?: () => void;
}

/**
 * Định dạng thời điểm làm sai gần nhất sang ngày giờ tiếng Việt dễ đọc.
 *
 * @param isoString Chuỗi thời gian ISO trả về từ Backend
 * @returns Chuỗi định dạng dd/mm/yyyy HH:mm hoặc chuỗi rỗng nếu null
 */
function formatWrongTime(isoString: string | null): string {
    if (!isoString) {
        return '';
    }
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) {
        return '';
    }
    return date.toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

/**
 * Rút gọn tên phần thi thành nhãn ngắn "Part 1".."Part 7" cho thẻ câu hỏi gọn mắt.
 */
function formatShortPartTag(partName: string, partNo: number): string {
    const matched = partName.match(/Part\s*\d+/i);
    if (matched) {
        return matched[0].replace(/\s+/g, ' ');
    }
    return partNo > 0 ? `Part ${partNo}` : partName;
}

/**
 * Presentational Component: Thẻ xem lại chi tiết 1 câu hỏi đã làm sai trong Sổ tay.
 * Hỗ trợ chế độ Accordion thu gọn thành 1 dòng gọn gàng và chỉ mount Audio/Ảnh/Giải thích khi người học bấm mở.
 */
export function MistakeQuestionCard({
    item,
    displayIndex,
    isExpanded = true,
    onToggleExpand,
}: MistakeQuestionCardProps) {
    const formattedDate = formatWrongTime(item.lastWrongAt);
    const sourceBadgeText = item.sourceLabel || MISTAKE_SOURCE_LABELS[item.sourceType];
    const shortPartLabel = formatShortPartTag(item.partName, item.partNo);
    const isCollapsible = typeof onToggleExpand === 'function';
    const primaryAbility = item.abilities[0]?.abilityName;
    const previewSnippet =
        item.title && item.title.trim().length > 0
            ? item.title.trim()
            : item.instruction?.trim() || 'Bấm để nghe audio và xem đáp án chi tiết';

    return (
        <article className={`pf-mistake-card ${isCollapsible && !isExpanded ? 'is-collapsed' : ''}`}>
            {/* Phần đầu thẻ: khi có chế độ Accordion thì bấm trực tiếp cả hàng tiêu đề để mở/đóng */}
            {isCollapsible ? (
                <button
                    type="button"
                    className="pf-mistake-accordion-trigger"
                    onClick={onToggleExpand}
                    aria-expanded={isExpanded}
                >
                    <div className="pf-mistake-accordion-trigger__main">
                        <div className="pf-mistake-card__badges">
                            <span className="pf-mistake-index">Câu #{displayIndex}</span>
                            <span className="pf-mistake-part-badge">{shortPartLabel}</span>
                            {primaryAbility && (
                                <span className="pf-mistake-ability-tag">{primaryAbility}</span>
                            )}
                            {item.abilities.length > 1 && (
                                <span className="pf-mistake-ability-more">
                                    +{item.abilities.length - 1}
                                </span>
                            )}
                            {item.wrongCount > 1 && (
                                <span className="pf-mistake-count-badge">Sai {item.wrongCount} lần</span>
                            )}
                        </div>
                        {!isExpanded && (
                            <p className="pf-mistake-accordion-preview">{previewSnippet}</p>
                        )}
                    </div>

                    <div className="pf-mistake-accordion-trigger__right">
                        {formattedDate && (
                            <span className="pf-mistake-time">
                                <span>{formattedDate}</span>
                            </span>
                        )}
                        <span className="pf-mistake-expand-pill">
                            <span>{isExpanded ? 'Thu gọn' : 'Xem chi tiết'}</span>
                        </span>
                    </div>
                </button>
            ) : (
                <header className="pf-mistake-card__head">
                    <div className="pf-mistake-card__badges">
                        <span className="pf-mistake-index">Câu #{displayIndex}</span>
                        <span className="pf-mistake-part-badge">{shortPartLabel}</span>
                        <span className="pf-mistake-source-badge">{sourceBadgeText}</span>
                        {item.wrongCount > 1 && (
                            <span className="pf-mistake-count-badge">Sai {item.wrongCount} lần</span>
                        )}
                    </div>

                    {formattedDate && (
                        <span className="pf-mistake-time">
                            <span>{formattedDate}</span>
                        </span>
                    )}
                </header>
            )}

            {/* Nội dung đầy đủ: chỉ render khi thẻ đang mở để tránh nạp hàng loạt audio/ảnh cùng lúc */}
            {isExpanded && (
                <div className="pf-mistake-card__body">
                    {/* Nguồn bài thi & toàn bộ kỹ năng liên quan */}
                    <div className="pf-mistake-card__submeta">
                        <span className="pf-mistake-source-badge">{sourceBadgeText}</span>
                        {item.abilities.map((ab) => (
                            <span key={ab.abilityId} className="pf-mistake-ability-tag">
                                {ab.abilityName}
                            </span>
                        ))}
                    </div>

                    {/* Ngữ liệu chùm (chỉ dẫn, đoạn văn bài đọc, ảnh hoặc tệp nghe dùng chung) */}
                    {(item.instruction || item.passage || item.audioUrl || item.imageUrl) && (
                        <div className="pf-mistake-context">
                            {item.instruction && (
                                <p className="pf-mistake-instruction">{item.instruction}</p>
                            )}

                            {/* Trình phát âm thanh chế độ ôn tập: phát lại tự do + chỉnh tốc độ */}
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

                            {/* Hình ảnh minh họa câu hỏi */}
                            {item.imageUrl && (
                                <img
                                    src={item.imageUrl}
                                    alt={`Hình minh họa câu ${displayIndex}`}
                                    className="pf-mistake-image"
                                    loading="lazy"
                                />
                            )}

                            {/* Đoạn văn đọc hiểu (Part 6, Part 7) */}
                            {item.passage && (
                                <div className="pf-mistake-passage">
                                    <div className="pf-mistake-passage__label">
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
                            const isCorrectOption = item.correctAnswer === opt.key;
                            const isWrongSelected = item.lastUserAnswer === opt.key && !isCorrectOption;

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
                                            <span>Đáp án đúng</span>
                                        </span>
                                    )}
                                    {isWrongSelected && (
                                        <span className="pf-mistake-opt__tag is-wrong">
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
                </div>
            )}
        </article>
    );
}
