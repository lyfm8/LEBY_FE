import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface ModuleTestHeaderProps {
    title: string;
    topic: string;
    currentQ: number;
    totalQ: number;
    durationMinutes: number;
    onTimeOut?: () => void;
}

export function ModuleTestHeader({
    title,
    topic,
    currentQ,
    totalQ,
    durationMinutes,
    onTimeOut,
}: ModuleTestHeaderProps) {
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

    const m = Math.floor(secondsLeft / 60);
    const s = secondsLeft % 60;
    const timeFormatted = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

    return (
        <header className="mtest-header">
            <div className="mtest-header__title-box">
                <h1 className="mtest-header__title">{title}</h1>
                <span className="mtest-header__topic">{topic}</span>
            </div>

            <div className="mtest-header__right">
                <span className="mtest-header__counter">
                    Câu {currentQ} / {totalQ}
                </span>

                <div className="mtest-header__timer">
                    <Clock size={16} />
                    <span>{timeFormatted}</span>
                </div>
            </div>
        </header>
    );
}
