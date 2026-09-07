import { TrendingUp, Zap, Clock } from 'lucide-react';

interface StatCardProps {
    type: 'score' | 'streak' | 'time' | 'modules';
    value: string | number;
    title: string;
    subtext: string;
    extra?: number;
}

export function StatCard({ type, value, title, subtext, extra }: StatCardProps) {
    function renderIcon() {
        switch (type) {
            case 'score':
                return <TrendingUp size={20} className="stat-card__icon is-score" />;
            case 'streak':
                return <Zap size={20} className="stat-card__icon is-streak" />;
            case 'time':
                return <Clock size={20} className="stat-card__icon is-time" />;
            case 'modules':
                return (
                    <div className="stat-card__ring-wrapper">
                        <svg className="stat-card__ring-svg" viewBox="0 0 36 36">
                            <path
                                className="stat-card__ring-bg"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <path
                                className="stat-card__ring-fill"
                                strokeDasharray={`${extra ?? 75}, 100`}
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                        </svg>
                        <span className="stat-card__ring-text">{extra ?? 75}%</span>
                    </div>
                );
        }
    }

    return (
        <article className="stat-card">
            <div className="stat-card__header">
                <span className="stat-card__title">{title}</span>
                {renderIcon()}
            </div>

            <div className="stat-card__value">{value}</div>
            <div className="stat-card__subtext">{subtext}</div>
        </article>
    );
}
