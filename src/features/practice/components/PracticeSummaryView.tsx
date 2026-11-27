import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Flag, RotateCcw, XCircle } from 'lucide-react';
import type { OptionKey } from '../../../shared/exam/types/examTypes';
import type { PracticeRoomData } from '../types/practiceTypes';

type SummaryFilter = 'ALL' | 'WRONG' | 'FLAGGED' | 'CORRECT' | 'UNCHECKED';

interface PracticeSummaryViewProps {
    data: PracticeRoomData;
    answers: Record<number, OptionKey | null>;
    revealedOrderNos: Set<number>;
    flagged: Set<number>;
    backToModuleUrl: string;
    onBackToQuestions: () => void;
    onJumpToQuestion: (orderNo: number) => void;
    onToggleFlag: (orderNo: number) => void;
    onResetPractice: () => void;
}

/**
 * Màn tổng kết phiên luyện tập tức thì (UC12 Luồng 8a & Bước 7):
 * Thống kê số câu đúng/sai, đánh dấu ôn lại và cho phép nhảy về từng câu để xem lại lời giải.
 */
export function PracticeSummaryView({
    data,
    answers,
    revealedOrderNos,
    flagged,
    backToModuleUrl,
    onBackToQuestions,
    onJumpToQuestion,
    onToggleFlag,
    onResetPractice,
}: PracticeSummaryViewProps) {
    const [filter, setFilter] = useState<SummaryFilter>('ALL');

    const stats = useMemo(() => {
        let correctCount = 0;
        let wrongCount = 0;
        let uncheckedCount = 0;

        for (const q of data.questions) {
            if (!revealedOrderNos.has(q.orderNo)) {
                uncheckedCount += 1;
                continue;
            }
            const picked = answers[q.orderNo] ?? null;
            if (picked !== null && picked === q.correctAnswer) {
                correctCount += 1;
            } else {
                wrongCount += 1;
            }
        }

        const checkedCount = correctCount + wrongCount;
        const accuracyPercent =
            checkedCount > 0 ? Math.round((correctCount * 100) / checkedCount) : 0;

        return {
            total: data.questions.length,
            correctCount,
            wrongCount,
            uncheckedCount,
            checkedCount,
            flaggedCount: flagged.size,
            accuracyPercent,
        };
    }, [data.questions, answers, revealedOrderNos, flagged.size]);

    const filteredQuestions = useMemo(() => {
        const sorted = [...data.questions].sort((a, b) => a.orderNo - b.orderNo);
        return sorted.filter((q) => {
            const isChecked = revealedOrderNos.has(q.orderNo);
            const picked = answers[q.orderNo] ?? null;
            const isCorrect = isChecked && picked !== null && picked === q.correctAnswer;
            const isWrong = isChecked && !isCorrect;
            const isFlagged = flagged.has(q.orderNo);

            if (filter === 'WRONG') return isWrong;
            if (filter === 'FLAGGED') return isFlagged;
            if (filter === 'CORRECT') return isCorrect;
            if (filter === 'UNCHECKED') return !isChecked;
            return true;
        });
    }, [data.questions, revealedOrderNos, answers, flagged, filter]);

    return (
        <main className="practice-summary-page">
            <section className="practice-summary-hero">
                <div>
                    <div className="practice-summary-hero__eyebrow">Tổng kết luyện tập tức thì</div>
                    <h1 className="practice-summary-hero__title">{data.lessonTitle}</h1>
                    <p className="practice-summary-hero__sub">
                        {data.moduleTitle} · {data.partName}
                        {data.abilityName ? ` · Năng lực: ${data.abilityName}` : ''}
                    </p>
                </div>

                <div className="practice-summary-hero__actions">
                    <button
                        type="button"
                        className="diag-nav-btn is-prev"
                        onClick={onBackToQuestions}
                    >
                        <ArrowLeft size={16} />
                        <span>{stats.uncheckedCount > 0 ? 'Làm tiếp bài tập' : 'Xem lại từng câu'}</span>
                    </button>
                    <button
                        type="button"
                        className="diag-nav-btn is-prev"
                        onClick={onResetPractice}
                    >
                        <RotateCcw size={16} />
                        <span>Làm lại từ đầu</span>
                    </button>
                    <Link to={backToModuleUrl} className="diag-nav-btn is-next">
                        <span>Quay lại mô-đun</span>
                    </Link>
                </div>
            </section>

            <section className="practice-summary-stats" aria-label="Thống kê luyện tập">
                <div className="practice-stat-card">
                    <span className="practice-stat-card__label">Đã kiểm tra</span>
                    <strong className="practice-stat-card__value">
                        {stats.checkedCount} / {stats.total}
                    </strong>
                </div>
                <div className="practice-stat-card">
                    <span className="practice-stat-card__label">Trả lời đúng</span>
                    <strong className="practice-stat-card__value is-correct">
                        {stats.correctCount}
                    </strong>
                </div>
                <div className="practice-stat-card">
                    <span className="practice-stat-card__label">Làm sai / Chưa chọn</span>
                    <strong className="practice-stat-card__value is-wrong">{stats.wrongCount}</strong>
                </div>
                <div className="practice-stat-card">
                    <span className="practice-stat-card__label">Tỷ lệ chính xác</span>
                    <strong className="practice-stat-card__value is-accent">
                        {stats.accuracyPercent}%
                    </strong>
                </div>
                <div className="practice-stat-card">
                    <span className="practice-stat-card__label">Đánh dấu ôn lại</span>
                    <strong className="practice-stat-card__value is-flagged">
                        {stats.flaggedCount}
                    </strong>
                </div>
            </section>

            <section className="practice-summary-list-card">
                <div className="practice-summary-list-card__top">
                    <h2 className="practice-summary-list-card__title">
                        Chi tiết câu hỏi ({filteredQuestions.length})
                    </h2>

                    <div className="practice-summary-filters" role="group" aria-label="Lọc câu hỏi tổng kết">
                        <button
                            type="button"
                            className={`practice-summary-filter-btn ${filter === 'ALL' ? 'is-active' : ''}`}
                            onClick={() => setFilter('ALL')}
                        >
                            Tất cả ({stats.total})
                        </button>
                        <button
                            type="button"
                            className={`practice-summary-filter-btn ${filter === 'WRONG' ? 'is-active' : ''}`}
                            onClick={() => setFilter('WRONG')}
                        >
                            Làm sai ({stats.wrongCount})
                        </button>
                        <button
                            type="button"
                            className={`practice-summary-filter-btn ${filter === 'FLAGGED' ? 'is-active' : ''}`}
                            onClick={() => setFilter('FLAGGED')}
                        >
                            Cần ôn lại ({stats.flaggedCount})
                        </button>
                        <button
                            type="button"
                            className={`practice-summary-filter-btn ${filter === 'CORRECT' ? 'is-active' : ''}`}
                            onClick={() => setFilter('CORRECT')}
                        >
                            Đúng ({stats.correctCount})
                        </button>
                        <button
                            type="button"
                            className={`practice-summary-filter-btn ${filter === 'UNCHECKED' ? 'is-active' : ''}`}
                            onClick={() => setFilter('UNCHECKED')}
                        >
                            Chưa kiểm tra ({stats.uncheckedCount})
                        </button>
                    </div>
                </div>

                {filteredQuestions.length === 0 ? (
                    <p className="diag-palette-empty">
                        Không có câu hỏi nào thuộc bộ lọc đã chọn.
                    </p>
                ) : (
                    <div className="practice-summary-rows">
                        {filteredQuestions.map((q) => {
                            const isChecked = revealedOrderNos.has(q.orderNo);
                            const picked = answers[q.orderNo] ?? null;
                            const isCorrect =
                                isChecked && picked !== null && picked === q.correctAnswer;
                            const isWrong = isChecked && !isCorrect;
                            const isFlagged = flagged.has(q.orderNo);

                            return (
                                <div key={q.questionId} className="practice-summary-row">
                                    <div className="practice-summary-row__left">
                                        <span
                                            className={`practice-summary-row__num ${
                                                isCorrect ? 'is-correct' : isWrong ? 'is-wrong' : ''
                                            }`}
                                        >
                                            Câu {q.orderNo}
                                        </span>
                                        <div className="practice-summary-row__info">
                                            <p className="practice-summary-row__title">
                                                {q.title || 'Nghe băng ghi âm và chọn đáp án đúng nhất'}
                                            </p>
                                            <div className="practice-summary-row__meta">
                                                {isChecked ? (
                                                    <>
                                                        <span
                                                            style={{
                                                                color: isCorrect ? '#15803d' : '#b91c1c',
                                                                fontWeight: 600,
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                gap: 4,
                                                            }}
                                                        >
                                                            {isCorrect ? (
                                                                <CheckCircle2 size={14} />
                                                            ) : (
                                                                <XCircle size={14} />
                                                            )}
                                                            {isCorrect ? 'Đúng' : 'Sai'}
                                                        </span>
                                                        <span>
                                                            Bạn chọn: <strong>{picked ?? 'Chưa chọn'}</strong>
                                                        </span>
                                                        <span>
                                                            Đáp án đúng: <strong>{q.correctAnswer}</strong>
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span>
                                                        {picked
                                                            ? `Đã chọn tạm (${picked}) — chưa bấm kiểm tra`
                                                            : 'Chưa kiểm tra câu hỏi này'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="practice-summary-row__right">
                                        <button
                                            type="button"
                                            className={`diag-question-flag-btn ${isFlagged ? 'is-active' : ''}`}
                                            onClick={() => onToggleFlag(q.orderNo)}
                                            aria-label={
                                                isFlagged
                                                    ? `Bỏ đánh dấu câu ${q.orderNo}`
                                                    : `Đánh dấu câu ${q.orderNo} cần ôn lại`
                                            }
                                            title={
                                                isFlagged
                                                    ? 'Bỏ đánh dấu ôn lại'
                                                    : 'Đánh dấu cần ôn lại'
                                            }
                                        >
                                            <Flag size={15} fill={isFlagged ? '#f59e0b' : 'none'} />
                                        </button>
                                        <button
                                            type="button"
                                            className="practice-summary-jump-btn"
                                            onClick={() => onJumpToQuestion(q.orderNo)}
                                        >
                                            {isChecked ? 'Xem giải thích' : 'Làm câu này'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>
        </main>
    );
}
