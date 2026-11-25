import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Pause, Play } from 'lucide-react';

interface DiagnosticHeaderProps {
    title: string;
    currentQuestion: number;
    totalQuestions: number;
    initialSeconds: number;
    isPaused: boolean;
    isLocked: boolean;
    onTogglePause: () => void;
    onSecondsChange?: (secondsLeft: number) => void;
    onTimeOut?: () => void;
}

/**
 * Header phòng thi chẩn đoán gồm đồng hồ đếm ngược, nút tạm dừng client-side (Luồng 4b)
 * và kích hoạt tự động nộp bài khi chạm mốc 00:00 (BR07).
 */
export function DiagnosticHeader({
    title,
    currentQuestion,
    totalQuestions,
    initialSeconds,
    isPaused,
    isLocked,
    onTogglePause,
    onSecondsChange,
    onTimeOut,
}: DiagnosticHeaderProps) {
    const [secondsLeft, setSecondsLeft] = useState(Math.max(0, Math.floor(initialSeconds)));
    const hasTriggeredTimeoutRef = useRef(false);

    useEffect(() => {
        setSecondsLeft(Math.max(0, Math.floor(initialSeconds)));
        hasTriggeredTimeoutRef.current = false;
    }, [initialSeconds]);

    useEffect(() => {
        onSecondsChange?.(secondsLeft);
    }, [secondsLeft, onSecondsChange]);

    useEffect(() => {
        if (isLocked || isPaused) {
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
    }, [secondsLeft, isPaused, isLocked, onTimeOut]);

    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;
    const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    const isUrgent = secondsLeft > 0 && secondsLeft < 300;

    return (
        <header className="diag-header">
            <div className="diag-header__container">
                <Link to="/dashboard" className="diag-header__logo">
                    <div className="diag-header__logo-badge">L</div>
                    <span className="diag-header__logo-text">LEBY</span>
                </Link>

                <div className="diag-header__title">{title}</div>

                <div className="diag-header__stats">
                    <span className="diag-header__question-counter">
                        Câu {currentQuestion} / {totalQuestions}
                    </span>

                    <div className={`diag-header__timer ${isUrgent ? 'is-urgent' : ''} ${isPaused ? 'is-paused' : ''}`}>
                        <Clock size={16} />
                        <span>{formattedTime}</span>
                    </div>

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
                </div>
            </div>
        </header>
    );
}
