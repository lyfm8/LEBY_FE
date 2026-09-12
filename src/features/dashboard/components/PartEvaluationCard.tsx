import type { PartEvaluation } from '../types/dashboardTypes';

interface PartEvaluationCardProps {
    parts: PartEvaluation[];
}

export function PartEvaluationCard({ parts }: PartEvaluationCardProps) {
    return (
        <div className="db-card db-card--eval">
            <div className="db-card__header">
                <h3 className="db-card__title">Đánh giá năng lực theo TOEIC Parts 1-7</h3>
                <div className="db-card__legend">
                    <span className="db-card__legend-item is-pass">● PASS</span>
                    <span className="db-card__legend-item is-confirm">● CONFIRM</span>
                    <span className="db-card__legend-item is-weak">● WEAK</span>
                </div>
            </div>

            <div className="db-part-eval-list">
                {parts.map((item) => (
                    <div key={item.partNo} className="db-part-eval-row">
                        <span className="db-part-eval-name">{item.name}</span>

                        <div className="db-part-eval-track">
                            <div
                                className={`db-part-eval-fill is-${item.status.toLowerCase()}`}
                                style={{ width: `${item.scorePercent}%` }}
                            />
                        </div>

                        <span className="db-part-eval-score">{item.scorePercent}%</span>
                        <span className={`db-part-eval-badge is-${item.status.toLowerCase()}`}>
                            {item.status}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
