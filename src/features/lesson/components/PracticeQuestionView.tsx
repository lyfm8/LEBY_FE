import { useEffect, useRef, useState } from 'react';
import { BookOpen, CheckCircle2, ChevronDown, HelpCircle, XCircle } from 'lucide-react';
import type { LessonReviewQuestion } from '../types/lessonTypes';

/** Các mức tốc độ phát âm thanh cho câu hỏi ôn tập (hỗ trợ nghe chậm, chuẩn và nhanh). */
const AUDIO_PLAYBACK_RATES = [0.8, 1.0, 1.2] as const;

/**
 * Trình phát âm thanh câu hỏi ôn tập kèm menu ẩn chọn tốc độ phát (0.8x, 1.0x, 1.2x).
 */
function ReviewAudioPlayer({ src }: { src: string }) {
    // Tham chiếu trực tiếp đến thẻ DOM <audio> để cập nhật thuộc tính playbackRate
    const audioRef = useRef<HTMLAudioElement | null>(null);
    // Tham chiếu khung menu tốc độ để phát hiện click ra ngoài và tự đóng menu
    const rateMenuRef = useRef<HTMLDivElement | null>(null);
    // Lưu tốc độ phát âm thanh hiện tại (mặc định 1.0x)
    const [playbackRate, setPlaybackRate] = useState<number>(1.0);
    // Cờ đóng/mở menu chọn tốc độ phát đang ẩn
    const [isRateMenuOpen, setIsRateMenuOpen] = useState<boolean>(false);

    // Tự động đóng menu chọn tốc độ khi người dùng nhấn ra bên ngoài khung menu
    useEffect(() => {
        if (!isRateMenuOpen) {
            return;
        }
        // Kiểm tra điểm nhấn chuột có nằm ngoài vùng rateMenuRef hay không
        const handleOutsideClick = (event: MouseEvent) => {
            if (rateMenuRef.current && !rateMenuRef.current.contains(event.target as Node)) {
                setIsRateMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, [isRateMenuOpen]);

    /**
     * Thay đổi tốc độ phát âm thanh ngay lập tức và đóng menu chọn tốc độ.
     *
     * @param nextRate Tốc độ mới (0.8, 1.0 hoặc 1.2)
     */
    function handleChangeRate(nextRate: number) {
        // Cập nhật trạng thái tốc độ đang chọn
        setPlaybackRate(nextRate);
        // Áp dụng trực tiếp tốc độ mới lên trình phát âm thanh nếu đã gắn DOM
        if (audioRef.current) {
            audioRef.current.playbackRate = nextRate;
        }
        // Đóng gọn thanh chọn tốc độ sau khi đã chọn xong
        setIsRateMenuOpen(false);
    }

    /**
     * Đảm bảo giữ đúng tốc độ người dùng đã chọn mỗi khi tệp âm thanh bắt đầu tải hoặc phát lại.
     */
    function handleApplySavedRate() {
        if (audioRef.current) {
            audioRef.current.playbackRate = playbackRate;
        }
    }

    return (
        <div className="practice-media-audio">
            {/* Trình phát âm thanh gốc của trình duyệt */}
            <audio
                ref={audioRef}
                controls
                preload="none"
                src={src}
                onLoadedMetadata={handleApplySavedRate}
                onPlay={handleApplySavedRate}
            />
            {/* Nút gọn hiển thị tốc độ hiện tại; bấm vào sẽ mở thanh chọn tốc độ ẩn */}
            <div ref={rateMenuRef} className="practice-audio-rate-dropdown">
                <button
                    type="button"
                    className={`practice-audio-rate-trigger ${isRateMenuOpen ? 'is-open' : ''}`}
                    onClick={() => setIsRateMenuOpen((prev) => !prev)}
                    aria-expanded={isRateMenuOpen}
                    aria-haspopup="listbox"
                    title="Chọn tốc độ phát âm thanh"
                >
                    <span>{playbackRate.toFixed(1)}x</span>
                    <ChevronDown size={13} className="practice-audio-rate-chevron" />
                </button>

                {/* Danh sách tốc độ ẩn chỉ hiển thị khi người dùng bấm mở */}
                {isRateMenuOpen && (
                    <div
                        className="practice-audio-rate-menu"
                        role="listbox"
                        aria-label="Tốc độ phát âm thanh"
                    >
                        {AUDIO_PLAYBACK_RATES.map((rate) => {
                            // Xác định mức tốc độ này có đang được kích hoạt hay không
                            const isActive = playbackRate === rate;
                            // Định dạng nhãn hiển thị chuẩn 1 chữ số thập phân (0.8x, 1.0x, 1.2x)
                            const label = `${rate.toFixed(1)}x`;

                            return (
                                <button
                                    key={rate}
                                    type="button"
                                    role="option"
                                    aria-selected={isActive}
                                    className={`practice-audio-rate-option ${isActive ? 'is-active' : ''}`}
                                    onClick={() => handleChangeRate(rate)}
                                >
                                    {label}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

/**
 * Thuộc tính đầu vào cho khối câu hỏi ôn tập củng cố đi kèm bài giảng.
 */
interface PracticeQuestionViewProps {
    /** Danh sách câu hỏi ôn tập đã được Backend chuẩn hóa từ practice_questions. */
    questions: LessonReviewQuestion[];
    /** Tiêu đề khối câu hỏi (mặc định hiển thị cho khối ôn tập sau bài giảng). */
    heading?: string;
}

/**
 * Khối hiển thị và kiểm tra tức thì các câu hỏi ôn tập củng cố gắn trên bài giảng lý thuyết.
 * Hỗ trợ đầy đủ câu hỏi đơn lập, câu hỏi chùm có ngữ cảnh cha (đoạn văn/ảnh/audio) và giải thích chi tiết.
 */
export function PracticeQuestionView({
    questions,
    heading = 'Câu hỏi ôn tập củng cố',
}: PracticeQuestionViewProps) {
    // Lưu phương án mà học viên đã tích chọn theo từng mã câu hỏi
    const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
    // Lưu cờ xác nhận câu hỏi nào đã được bấm "Kiểm tra đáp án"
    const [checkedQuestions, setCheckedQuestions] = useState<Record<number, boolean>>({});
    // Lưu cảnh báo nhẹ nếu học viên bấm kiểm tra khi chưa chọn phương án
    const [emptySelectionWarning, setEmptySelectionWarning] = useState<Record<number, boolean>>({});

    // Nếu không có câu hỏi ôn tập nào thì không hiển thị khối này
    if (!questions || questions.length === 0) {
        return null;
    }

    /**
     * Ghi nhận phương án học viên vừa chọn cho một câu hỏi cụ thể.
     *
     * @param questionId Mã liên kết câu hỏi ôn tập
     * @param optionKey  Ký tự đáp án (A, B, C hoặc D)
     */
    function handleSelectOption(questionId: number, optionKey: string) {
        // Cập nhật phương án đã chọn của câu hỏi tương ứng
        setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionKey }));
        // Xóa cảnh báo chưa chọn đáp án (nếu trước đó đang hiển thị)
        setEmptySelectionWarning((prev) => ({ ...prev, [questionId]: false }));
    }

    /**
     * Chấm đáp án tức thì và mở khung giải thích chi tiết cho câu hỏi tương ứng.
     *
     * @param questionId Mã liên kết câu hỏi ôn tập cần chấm
     */
    function handleCheckAnswer(questionId: number) {
        // Nếu học viên chưa chọn đáp án thì hiện nhắc nhẹ thay vì chấm sai
        if (!selectedAnswers[questionId]) {
            setEmptySelectionWarning((prev) => ({ ...prev, [questionId]: true }));
            return;
        }
        // Đánh dấu câu hỏi này đã được kiểm tra để hiển thị đúng/sai và lời giải
        setCheckedQuestions((prev) => ({ ...prev, [questionId]: true }));
    }

    // Đếm tổng số câu đã kiểm tra và số câu trả lời chính xác để hiện tóm tắt ngắn gọn
    const checkedCount = questions.filter((q) => checkedQuestions[q.id]).length;
    const correctCount = questions.filter(
        (q) =>
            checkedQuestions[q.id] &&
            selectedAnswers[q.id]?.toUpperCase() === q.correctAnswer?.toUpperCase()
    ).length;

    return (
        <section className="practice-view" aria-label={heading}>
            {/* Tiêu đề khối ôn tập và bộ đếm số câu đã làm đúng */}
            <div className="practice-view__header">
                <div className="practice-view__title-wrap">
                    <HelpCircle size={20} className="practice-view__icon" />
                    <h2 className="practice-view__heading">{heading}</h2>
                </div>
                <span className="practice-view__counter">
                    {checkedCount > 0
                        ? `Đúng ${correctCount}/${checkedCount} câu đã kiểm tra`
                        : `${questions.length} câu hỏi`}
                </span>
            </div>

            {/* Danh sách từng thẻ câu hỏi ôn tập */}
            <div className="practice-questions-list">
                {questions.map((question, index) => {
                    // Lấy phương án hiện đang chọn của câu hỏi này
                    const selectedKey = selectedAnswers[question.id];
                    // Kiểm tra câu hỏi đã được bấm kiểm tra đáp án hay chưa
                    const isChecked = Boolean(checkedQuestions[question.id]);
                    // So sánh không phân biệt chữ hoa/thường với đáp án đúng từ server
                    const isCorrect =
                        isChecked &&
                        selectedKey?.toUpperCase() === question.correctAnswer?.toUpperCase();
                    // Kiểm tra xem câu hỏi có ngữ cảnh cha (đoạn văn, ảnh hoặc âm thanh chung) hay không
                    const hasParentContext = Boolean(
                        question.parentContextText || question.parentImageUrl || question.parentAudioUrl
                    );

                    return (
                        <article key={question.id} className="practice-q-card">
                            {/* Số thứ tự và nội dung câu hỏi */}
                            <div className="practice-q-card__head">
                                <span className="practice-q-card__index">Câu {index + 1}</span>
                                <h3 className="practice-q-card__title">{question.questionText}</h3>
                            </div>

                            {/* Khối ngữ cảnh chung của câu hỏi chùm (nếu có) */}
                            {hasParentContext && (
                                <div className="practice-context-box">
                                    <div className="practice-context-box__label">
                                        <BookOpen size={14} />
                                        <span>Ngữ liệu bài học</span>
                                    </div>
                                    {/* Tệp âm thanh chung của chùm câu hỏi kèm chọn tốc độ phát */}
                                    {question.parentAudioUrl && (
                                        <ReviewAudioPlayer src={question.parentAudioUrl} />
                                    )}
                                    {/* Hình ảnh chung của chùm câu hỏi */}
                                    {question.parentImageUrl && (
                                        <img
                                            src={question.parentImageUrl}
                                            alt={`Ngữ liệu minh họa câu ${index + 1}`}
                                            className="practice-media-image"
                                        />
                                    )}
                                    {/* Đoạn văn ngữ cảnh của chùm câu hỏi */}
                                    {question.parentContextText && (
                                        <p className="practice-context-box__text">
                                            {question.parentContextText}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Media riêng của từng câu hỏi đơn (nếu có) */}
                            {question.audioUrl && (
                                <ReviewAudioPlayer src={question.audioUrl} />
                            )}
                            {question.imageUrl && (
                                <img
                                    src={question.imageUrl}
                                    alt={`Hình minh họa câu ${index + 1}`}
                                    className="practice-media-image"
                                />
                            )}

                            {/* Lưới các phương án lựa chọn A/B/C/D */}
                            <div className="practice-options-grid">
                                {question.options.map((opt) => {
                                    // Đánh dấu nút đang được chọn
                                    const isChosen = selectedKey === opt.key;
                                    // Xác định lớp CSS tô màu đúng/sai sau khi bấm Kiểm tra đáp án
                                    let statusClass = '';
                                    if (isChecked) {
                                        if (opt.key.toUpperCase() === question.correctAnswer?.toUpperCase()) {
                                            statusClass = 'is-correct';
                                        } else if (isChosen) {
                                            statusClass = 'is-wrong';
                                        }
                                    }

                                    return (
                                        <button
                                            key={opt.key}
                                            type="button"
                                            className={`practice-opt-btn ${isChosen ? 'is-chosen' : ''} ${statusClass}`}
                                            onClick={() => handleSelectOption(question.id, opt.key)}
                                        >
                                            <span className="practice-opt-key">{opt.key}</span>
                                            <span className="practice-opt-text">{opt.text}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Thanh thao tác kiểm tra đáp án và cảnh báo nếu chưa chọn phương án */}
                            <div className="practice-q-card__actions">
                                <button
                                    type="button"
                                    className="practice-check-btn"
                                    onClick={() => handleCheckAnswer(question.id)}
                                >
                                    {isChecked ? 'Kiểm tra lại đáp án' : 'Kiểm tra đáp án'}
                                </button>
                                {emptySelectionWarning[question.id] && (
                                    <span className="practice-warning-text" role="alert">
                                        Vui lòng chọn một phương án trả lời trước khi kiểm tra.
                                    </span>
                                )}
                            </div>

                            {/* Khung phản hồi đúng/sai và giải thích chi tiết đáp án */}
                            {isChecked && (
                                <div
                                    className={`practice-explain-box ${isCorrect ? 'is-correct' : 'is-wrong'}`}
                                >
                                    <div className="practice-explain-header">
                                        {isCorrect ? (
                                            <>
                                                <CheckCircle2 size={18} className="is-correct" />
                                                <span>Chính xác! Đáp án đúng là {question.correctAnswer}.</span>
                                            </>
                                        ) : (
                                            <>
                                                <XCircle size={18} className="is-wrong" />
                                                <span>Chưa chính xác. Đáp án đúng là {question.correctAnswer}.</span>
                                            </>
                                        )}
                                    </div>

                                    {/* Hiển thị chi tiết lời giải theo từng mục có dữ liệu */}
                                    {question.explanation && (
                                        <div className="practice-explain-details">
                                            {question.explanation.clue && (
                                                <p className="practice-explain-text">
                                                    <strong>Manh mối:</strong> {question.explanation.clue}
                                                </p>
                                            )}
                                            {question.explanation.analysis && (
                                                <p className="practice-explain-text">
                                                    <strong>Phân tích:</strong> {question.explanation.analysis}
                                                </p>
                                            )}
                                            {question.explanation.translation && (
                                                <p className="practice-explain-text">
                                                    <strong>Dịch nghĩa:</strong> {question.explanation.translation}
                                                </p>
                                            )}
                                            {question.explanation.transcript && (
                                                <p className="practice-explain-text is-transcript">
                                                    <strong>Lời thoại:</strong> {question.explanation.transcript}
                                                </p>
                                            )}
                                            {question.explanation.vocabulary &&
                                                question.explanation.vocabulary.length > 0 && (
                                                    <div className="practice-vocab-list">
                                                        <strong>Từ vựng trọng tâm:</strong>
                                                        <ul>
                                                            {question.explanation.vocabulary.map((vocab, vIdx) => (
                                                                <li key={`${vocab.word}-${vIdx}`}>
                                                                    <span className="practice-vocab-word">
                                                                        {vocab.word}
                                                                    </span>
                                                                    {vocab.type && (
                                                                        <span className="practice-vocab-type">
                                                                            ({vocab.type})
                                                                        </span>
                                                                    )}
                                                                    <span>: {vocab.meaning}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </article>
                    );
                })}
            </div>
        </section>
    );
}
