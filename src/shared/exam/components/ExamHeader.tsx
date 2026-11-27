import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Clock, Pause, Play } from 'lucide-react';
import type { ExamRoomMode } from '../types/examTypes';

interface ExamHeaderProps {
    title: string;
    subtitle?: string;
    currentQuestion: number;
    totalQuestions: number;
    questionLabel?: string;
    mode?: ExamRoomMode;
    isReviewMode?: boolean;
    reviewScoreLabel?: string;
    passScoreBadge?: string;
    backToUrl?: string;
    backLabel?: string;
    onBackToReport?: () => void;
    initialSeconds?: number;
    showTimer?: boolean;
    showPauseButton?: boolean;
    isPaused?: boolean;
    isLocked?: boolean;
    onTogglePause?: () => void;
    onSecondsChange?: (secondsLeft: number) => void;
    onTimeOut?: () => void;
}

/**
 * Header phòng thi / phòng luyện tập dùng chung:
 * - Chế độ EXAM (Diagnostic / Module Test): hiển thị bộ đếm câu, đồng hồ đếm ngược, nút Tạm dừng và tự nộp khi hết giờ (BR07).
 * - Chế độ PRACTICE (UC12): ẩn đồng hồ và nút Tạm dừng, hiển thị nút Quay lại mô-đun.
 * - Chế độ REVIEW: ẩn đồng hồ, hiển thị thống kê số câu đúng và nút Quay lại báo cáo.
 */
export function ExamHeader({
    title,
    subtitle,
    currentQuestion,
    totalQuestions,
    questionLabel,
    mode,
    isReviewMode = false,
    reviewScoreLabel,
    passScoreBadge,
    backToUrl,
    backLabel = 'Quay lại mô-đun',
    onBackToReport,
    initialSeconds = 0,
    showTimer,
    showPauseButton = true,
    isPaused = false,
    isLocked = false,
    onTogglePause,
    onSecondsChange,
    onTimeOut,
}: ExamHeaderProps) {
    const resolvedMode: ExamRoomMode = mode ?? (isReviewMode ? 'REVIEW' : 'EXAM');
    const isTimerActive = showTimer ?? resolvedMode === 'EXAM';
    const [secondsLeft, setSecondsLeft] = useState(Math.max(0, Math.floor(initialSeconds)));
    const hasTriggeredTimeoutRef = useRef(false);

    useEffect(() => {
        if (!isTimerActive) return;
        setSecondsLeft(Math.max(0, Math.floor(initialSeconds)));
        hasTriggeredTimeoutRef.current = false;
    }, [initialSeconds, isTimerActive]);

    useEffect(() => {
        if (!isTimerActive) return;
        onSecondsChange?.(secondsLeft);
    }, [secondsLeft, onSecondsChange, isTimerActive]);

    useEffect(() => {
        if (!isTimerActive || isLocked || isPaused) {
            return;
        }

        if (secondsLeft <= 0) {
            if (!hasTriggeredTimeoutRef.current) {
                hasTriggeredTimeoutRef.current = true;
                onTimeOut?.();
            }
            return;
        }

        const timer = setInterval(() => {
            setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(timer);
    }, [secondsLeft, isPaused, isLocked, isTimerActive, onTimeOut]);

    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;
    const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    const isUrgent = isTimerActive && secondsLeft > 0 && secondsLeft < 300;
    const counterText = questionLabel ?? `Câu ${currentQuestion} / ${totalQuestions}`;

    return (
        <header className="diag-header">
            <div className="diag-header__container">
                <div className="exam-header__left-group">
                    {backToUrl ? (
                        <Link to={backToUrl} className="diag-header__back-btn">
                            <ChevronLeft size={16} />
                            <span>{backLabel}</span>
                        </Link>
                    ) : (
                        <Link to="/dashboard" className="diag-header__logo">
                            <div className="diag-header__logo-badge">L</div>
                            <span className="diag-header__logo-text">LEBY</span>
                        </Link>
                    )}
                </div>

                <div className="exam-header__center">
                    <div className="diag-header__title">{title}</div>
                    {subtitle && <span className="exam-header__subtitle">{subtitle}</span>}
                </div>

                <div className="diag-header__stats">
                    {passScoreBadge && <span className="exam-header__pass-pill">{passScoreBadge}</span>}
                    <span className="diag-header__question-counter">{counterText}</span>

                    {resolvedMode === 'REVIEW' && (
                        <>
                            <span className="diag-header__review-badge">Chế độ xem lại</span>
                            {reviewScoreLabel && (
                                <span className="diag-header__review-score">{reviewScoreLabel}</span>
                            )}
                            {onBackToReport && (
                                <button
                                    type="button"
                                    className="diag-header__back-btn"
                                    onClick={onBackToReport}
                                >
                                    Quay lại báo cáo
                                </button>
                            )}
                        </>
                    )}

                    {resolvedMode === 'PRACTICE' && (
                        <span className="exam-header__practice-badge">Luyện tập tức thì</span>
                    )}

                    {resolvedMode === 'EXAM' && isTimerActive && (
                        <>
                            <div
                                className={`diag-header__timer ${isUrgent ? 'is-urgent' : ''} ${isPaused ? 'is-paused' : ''}`}
                            >
                                <Clock size={16} />
                                <span>{formattedTime}</span>
                            </div>

                            {showPauseButton && onTogglePause && (
                                <button
                                    type="button"
                                    className={`diag-header__pause-btn ${isPaused ? 'is-resuming' : ''}`}
                                    onClick={onTogglePause}
                                    disabled={isLocked || secondsLeft <= 0}
                                    title={isPaused ? 'Tiếp tục làm bài' : 'Tạm dừng làm bài'}
                                >
                                    {isPaused ? <Play size={14} /> : <Pause size={14} />}
                                    <span>{isPaused ? 'Tiếp tục' : 'Tạm dừng'}</span>
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
