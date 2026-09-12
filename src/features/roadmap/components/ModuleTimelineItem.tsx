import { Link } from 'react-router-dom';
import { Check, Lock, BookOpen } from 'lucide-react';
import type { ModuleItem } from '../types/roadmapTypes';

interface ModuleTimelineItemProps {
    item: ModuleItem;
    isLast: boolean;
}

export function ModuleTimelineItem({ item, isLast }: ModuleTimelineItemProps) {
    const isCompleted = item.status === 'COMPLETED';
    const isInProgress = item.status === 'IN_PROGRESS';
    const isLocked = item.status === 'LOCKED';

    function renderNodeIndicator() {
        if (isCompleted) {
            return (
                <div className="timeline-node is-completed">
                    <Check size={16} strokeWidth={3} />
                </div>
            );
        }
        if (isInProgress) {
            return (
                <div className="timeline-node is-active">
                    <div className="timeline-node__inner" />
                </div>
            );
        }
        return (
            <div className="timeline-node is-locked">
                <Lock size={14} />
            </div>
        );
    }

    return (
        <div className={`timeline-row ${isLast ? 'is-last' : ''}`}>
            {/* Cột mốc Timeline */}
            <div className="timeline-spine">
                {renderNodeIndicator()}
                {!isLast && <div className={`timeline-line ${isCompleted ? 'is-completed' : ''}`} />}
            </div>

            {/* Thẻ Module */}
            <div className={`timeline-card ${isInProgress ? 'is-active' : ''} ${isLocked ? 'is-locked' : ''}`}>
                <div className="timeline-card__header">
                    <div className="timeline-card__titles">
                        <h3 className="timeline-card__title">{item.title}</h3>
                        <p className="timeline-card__desc">{item.description}</p>
                    </div>

                    <span className={`timeline-card__badge is-${item.status.toLowerCase()}`}>
                        {item.statusLabel}
                    </span>
                </div>

                <div className="timeline-card__footer">
                    <div className="timeline-card__progress-wrap">
                        <div className="timeline-card__lessons-count">
                            <BookOpen size={14} />
                            <span>
                                {item.completedLessons}/{item.totalLessons} bài học
                            </span>
                        </div>

                        <div className="timeline-card__bar-track">
                            <div
                                className="timeline-card__bar-fill"
                                style={{ width: `${item.progressPercent}%` }}
                            />
                        </div>

                        {item.progressPercent > 0 && (
                            <span className="timeline-card__percent">{item.progressPercent}%</span>
                        )}
                    </div>

                    {isInProgress && (
                        <Link to={`/modules/${item.id}`} className="timeline-card__action-btn">
                            Học tiếp ngay
                        </Link>
                    )}

                    {isCompleted && (
                        <Link to={`/modules/${item.id}`} className="timeline-card__action-btn is-review">
                            Xem lại bài học
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
