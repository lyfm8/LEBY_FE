import { useMemo } from 'react';
import {
    AlertCircle,
    ArrowLeft,
    BookOpen,
    CheckCircle2,
    RotateCcw,
    Send,
    Trophy,
    XCircle,
} from 'lucide-react';
import { ExamAudioPlayer } from '@/shared/exam/components/ExamAudioPlayer';
import { ExplanationPanel } from '@/shared/exam/components/ExplanationPanel';
import type { OptionKey } from '@/shared/exam/types/examTypes';
import type {
    MistakeRetryQuestionResult,
    MistakeRetrySetData,
    MistakeRetrySubmitData,
} from '../types/mistakeTypes';

// Kiểu props cho màn hình làm lại ngay nguyên bộ câu sai
interface MistakeRetryViewProps {
    retrySet: MistakeRetrySetData;
    answers: Record<number, OptionKey>;
    isSubmitting: boolean;
    submitError: string | null;
    submitResult: MistakeRetrySubmitData | null;
    onSelectOption: (questionId: number, option: OptionKey) => void;
    onSubmit: () => void;
    onRestart: () => void;
    onExit: () => void;
}

/**
 * Presentational Component: Không gian làm lại ngay nguyên bộ câu hỏi làm sai.
 * - Trước khi nộp: ẩn hoàn toàn đáp án đúng và lời giải, cho phép chọn A/B/C/D toàn bộ bài.
 * - Sau khi nộp: hiển thị điểm tổng, tô xanh/đỏ từng câu và mở sẵn lời giải chi tiết.
 */
export function MistakeRetryView({
    retrySet,
    answers,
    isSubmitting,
    submitError,
    submitResult,
    onSelectOption,
    onSubmit,
    onRestart,
    onExit,
}: MistakeRetryViewProps) {
    // Tạo bản đồ kết quả chấm theo questionId để tra cứu O(1) khi render từng thẻ câu hỏi
    const resultByQuestionId = useMemo(() => {
        const map: Record<number, MistakeRetryQuestionResult> = {};
        if (!submitResult) {
            return map;
        }
        for (const item of submitResult.results) {
            map[item.questionId] = item;
        }
        return map;
    }, [submitResult]);

    // Đếm số câu học viên đã chọn đáp án trong phiên làm lại hiện tại
    const answeredCount = useMemo(() => {
        return retrySet.questions.filter((q) => Boolean(answers[q.questionId])).length;
    }, [retrySet.questions, answers]);

    // Xác định phiên hiện tại đã được nộp và chấm điểm xong chưa
    const isSubmitted = submitResult !== null;

    return (
        <div className="pf-retry-wrap">
            {/* Thanh đầu phiên làm lại: nút quay về sổ tay, tiến độ trả lời và nút nộp bài */}
            <div className="pf-retry-topbar">
                <button type="button" className="pf-btn-edit" onClick={onExit}>
                    <ArrowLeft size={16} />
                    <span>Quay lại Sổ tay</span>
                </button>

                <div className="pf-retry-topbar__meta">
                    <span className="pf-retry-progress-pill">
                        {isSubmitted
                            ? `Kết quả: ${submitResult.correctCount}/${submitResult.totalQuestions} câu đúng (${submitResult.accuracyPercent}%)`
                            : `Đã chọn ${answeredCount}/${retrySet.sessionSize} câu`}
                    </span>

                    {!isSubmitted ? (
                        <button
                            type="button"
                            className="pf-btn-save pf-retry-submit-btn"
                            onClick={onSubmit}
                            disabled={isSubmitting}
                        >
                            <Send size={15} />
                            <span>{isSubmitting ? 'Đang chấm điểm...' : 'Nộp bài & Chấm điểm'}</span>
                        </button>
                    ) : (
                        <button
                            type="button"
                            className="pf-btn-save pf-retry-submit-btn"
                            onClick={onRestart}
                        >
                            <RotateCcw size={15} />
                            <span>Làm lại lần nữa</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Khung lỗi nếu gửi nộp bài gặp sự cố kết nối */}
            {submitError && (
                <div className="pf-alert-error" role="alert">
                    <AlertCircle size={16} />
                    <span>{submitError}</span>
                </div>
            )}

            {/* Thẻ tổng kết điểm số hiển thị ngay sau khi nộp bài */}
            {isSubmitted && (
                <section className="pf-retry-summary-card" aria-label="Kết quả phiên làm lại">
                    <div className="pf-retry-summary-card__icon">
                        <Trophy size={26} />
                    </div>
                    <div className="pf-retry-summary-card__body">
                        <h3 className="pf-retry-summary-card__title">
                            Bạn trả lời đúng {submitResult.correctCount}/{submitResult.totalQuestions} câu ({submitResult.accuracyPercent}%)
                        </h3>
                        <p className="pf-retry-summary-card__desc">
                            {submitResult.accuracyPercent >= 80
                                ? 'Rất tốt! Bạn đã nắm chắc phần lớn các câu từng làm sai trước đây.'
                                : 'Hãy xem kỹ phần giải thích bên dưới từng câu chưa đúng rồi làm lại thêm một lượt nhé.'}
                        </p>
                    </div>
                </section>
            )}

            {/* Danh sách toàn bộ các câu hỏi trong bộ làm lại */}
            <div className="pf-mistake-list">
                {retrySet.questions.map((question) => {
                    // Lấy phương án học viên vừa chọn và kết quả chấm (nếu đã nộp bài)
                    const selectedKey = answers[question.questionId] ?? null;
                    const graded = resultByQuestionId[question.questionId];

                    return (
                        <article
                            key={question.questionId}
                            className={`pf-mistake-card ${
                                graded ? (graded.isCorrect ? 'is-graded-correct' : 'is-graded-wrong') : ''
                            }`}
                        >
                            {/* Tiêu đề thẻ câu hỏi làm lại */}
                            <header className="pf-mistake-card__head">
                                <div className="pf-mistake-card__badges">
                                    <span className="pf-mistake-index">Câu {question.orderNo}</span>
                                    <span className="pf-mistake-part-badge">{question.partName}</span>
                                    <span className="pf-mistake-source-badge">{question.sourceLabel}</span>
                                </div>

                                {/* Nhãn kết quả đúng/sai sau khi nộp bài */}
                                {graded && (
                                    <span
                                        className={`pf-retry-status-pill ${
                                            graded.isCorrect ? 'is-correct' : 'is-wrong'
                                        }`}
                                    >
                                        {graded.isCorrect ? (
                                            <>
                                                <CheckCircle2 size={14} />
                                                <span>Chính xác</span>
                                            </>
                                        ) : (
                                            <>
                                                <XCircle size={14} />
                                                <span>Chưa đúng</span>
                                            </>
                                        )}
                                    </span>
                                )}
                            </header>

                            {/* Ngữ liệu câu hỏi (audio nghe lại tự do, hình ảnh, đoạn văn) */}
                            {(question.instruction ||
                                question.passage ||
                                question.audioUrl ||
                                question.imageUrl) && (
                                <div className="pf-mistake-context">
                                    {question.instruction && (
                                        <p className="pf-mistake-instruction">{question.instruction}</p>
                                    )}

                                    {question.audioUrl && (
                                        <div className="pf-mistake-audio">
                                            <ExamAudioPlayer
                                                stepKey={`mistake-retry-${question.questionId}`}
                                                src={question.audioUrl}
                                                policy="UNLIMITED"
                                                allowSpeedControl={true}
                                                isLocked={false}
                                                isReviewMode={true}
                                                onAudioEnded={() => undefined}
                                            />
                                        </div>
                                    )}

                                    {question.imageUrl && (
                                        <img
                                            src={question.imageUrl}
                                            alt={`Hình minh họa câu ${question.orderNo}`}
                                            className="pf-mistake-image"
                                            loading="lazy"
                                        />
                                    )}

                                    {question.passage && (
                                        <div className="pf-mistake-passage">
                                            <div className="pf-mistake-passage__label">
                                                <BookOpen size={14} />
                                                <span>Đoạn văn ngữ cảnh</span>
                                            </div>
                                            <p className="pf-mistake-passage__text">{question.passage}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Nội dung đề bài */}
                            <h4 className="pf-mistake-question-title">{question.title}</h4>

                            {/* Các nút phương án lựa chọn A/B/C/D */}
                            <div className="pf-mistake-options">
                                {question.options.map((opt) => {
                                    // Kiểm tra phương án này có đang được chọn không
                                    const isChosen = selectedKey === opt.key;
                                    // Sau khi nộp bài, tô màu đáp án đúng và đáp án chọn sai
                                    let statusClass = isChosen ? 'is-selected' : '';
                                    if (graded) {
                                        if (graded.correctAnswer === opt.key) {
                                            statusClass = 'is-correct';
                                        } else if (isChosen) {
                                            statusClass = 'is-wrong';
                                        } else {
                                            statusClass = '';
                                        }
                                    }

                                    return (
                                        <button
                                            key={opt.key}
                                            type="button"
                                            className={`pf-mistake-opt pf-mistake-opt--btn ${statusClass}`}
                                            onClick={() => onSelectOption(question.questionId, opt.key)}
                                            disabled={isSubmitted}
                                        >
                                            <span className="pf-mistake-opt__key">{opt.key}</span>
                                            <span className="pf-mistake-opt__text">{opt.text}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Chỉ hiển thị lời giải chi tiết sau khi học viên đã nộp bài chấm điểm */}
                            {graded && (
                                <div className="pf-mistake-explanation">
                                    <ExplanationPanel
                                        explanation={graded.explanation}
                                        questionOrderNo={question.questionId}
                                        defaultExpanded={!graded.isCorrect}
                                    />
                                </div>
                            )}
                        </article>
                    );
                })}
            </div>

            {/* Thanh hành động chốt cuối trang để học viên nộp bài ngay mà không cần cuộn lên đầu */}
            <div className="pf-retry-bottom-bar">
                {!isSubmitted ? (
                    <button
                        type="button"
                        className="pf-btn-save pf-retry-submit-btn"
                        onClick={onSubmit}
                        disabled={isSubmitting}
                    >
                        <Send size={15} />
                        <span>
                            {isSubmitting
                                ? 'Đang chấm điểm...'
                                : `Nộp bài & Chấm điểm (${answeredCount}/${retrySet.sessionSize} câu)`}
                        </span>
                    </button>
                ) : (
                    <div className="pf-retry-bottom-actions">
                        <button type="button" className="pf-btn-edit" onClick={onExit}>
                            <ArrowLeft size={16} />
                            <span>Quay lại Sổ tay</span>
                        </button>
                        <button
                            type="button"
                            className="pf-btn-save pf-retry-submit-btn"
                            onClick={onRestart}
                        >
                            <RotateCcw size={15} />
                            <span>Làm lại lần nữa</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
