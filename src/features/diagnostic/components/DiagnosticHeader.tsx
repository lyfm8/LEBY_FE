import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';

interface DiagnosticHeaderProps {
    title: string;
    currentQuestion: number;
    totalQuestions: number;
    durationMinutes: number;
    onTimeOut?: () => void;
}

export function DiagnosticHeader({
    title,
    currentQuestion,
    totalQuestions,
    durationMinutes,
    onTimeOut,
}: DiagnosticHeaderProps) {
    const [secondsLeft, setSecondsLeft] = useState(durationMinutes * 60);

    useEffect(() => {
        if (secondsLeft <= 0) {
            onTimeOut?.();
            return;
        }

        const timer = setInterval(() => {
            setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(timer);
    }, [secondsLeft, onTimeOut]);

    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;
    const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    const isUrgent = secondsLeft < 300;

    return (
        <header className="diag-header">
            <div className="diag-header__container">
                <Link to="/" className="diag-header__logo">
                    <div className="diag-header__logo-badge">L</div>
                    <span className="diag-header__logo-text">LEBY</span>
                </Link>

                <div className="diag-header__title">{title}</div>

                <div className="diag-header__stats">
                    <span className="diag-header__question-counter">
                        Câu {currentQuestion} / {totalQuestions}
                    </span>

                    <div className={`diag-header__timer ${isUrgent ? 'is-urgent' : ''}`}>
                        <Clock size={16} />
                        <span>{formattedTime}</span>
                    </div>
                </div>
            </div>
        </header>
    );
}
