import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    BookOpen,
    Check,
    Info,
    Lock,
    Play,
    Sparkles,
} from 'lucide-react';
import type { ModuleItem } from '../types/roadmapTypes';

interface ModuleTimelineItemProps {
    item: ModuleItem;
    isLast: boolean;
}

/**
 * Thẻ hiển thị một mô-đun trên trục thời gian Lộ trình học cá nhân,
 * hỗ trợ cả chặng trong lộ trình lẫn mô-đun đã miễn học (chế độ Ôn tập tự do).
 */
export function ModuleTimelineItem({ item, isLast }: ModuleTimelineItemProps) {
    const [isLockNoticeVisible, setIsLockNoticeVisible] = useState<boolean>(false);

    const isExempted = item.inRoadmap === false;
    const isCompleted = !isExempted && item.status === 'COMPLETED';
    const isInProgress = !isExempted && item.status === 'IN_PROGRESS';
    const isUnlocked = !isExempted && item.status === 'UNLOCKED';
    const isLocked = !isExempted && item.status === 'LOCKED';
    const isActive = isInProgress || isUnlocked;

    const handleLockedInteraction = () => {
        setIsLockNoticeVisible((prev) => !prev);
    };

    function renderNodeIndicator() {
        if (isCompleted) {
            return (
                <div className="timeline-node is-completed" title="Đã hoàn thành">
                    <Check size={16} strokeWidth={3} />
                </div>
            );
        }
        if (isExempted) {
            return (
                <div className="timeline-node is-free-study" title="Đã miễn học · Ôn tập tự do">
                    <BookOpen size={14} />
                </div>
            );
        }
        if (isActive) {
            return (
                <div className="timeline-node is-active" title="Đang mở khóa">
                    <div className="timeline-node__inner" />
                </div>
            );
        }
        return (
            <div className="timeline-node is-locked" title="Chưa mở khóa">
                <Lock size={14} />
            </div>
        );
    }

    const adaptiveReasonText = item.abilityName
        ? item.abilityName
        : item.reason || `Củng cố nền tảng ${item.partName}`;

    const sectionLabel = item.section === 'LISTENING' ? 'Nghe hiểu' : 'Đọc hiểu';

    const lockNoticeMessage =
        'Mô-đun này chưa được mở khóa. Bạn cần vượt qua bài kiểm tra của mô-đun trước đó để tiếp tục học.';

    const inheritanceNote =
        !isExempted &&
        item.reason &&
        (item.reason.includes('kế thừa') ||
            item.reason.includes('bảo lưu') ||
            item.reason.includes('Đã hoàn thành toàn bộ bài giảng'))
            ? item.reason
            : null;

    const badgeClassName = isExempted ? 'is-free-study' : `is-${item.status.toLowerCase()}`;

    return (
        <div className={`timeline-row ${isLast ? 'is-last' : ''}`}>
            <div className="timeline-spine">
                {renderNodeIndicator()}
                {!isLast && (
                    <div
                        className={`timeline-line ${isCompleted || isExempted ? 'is-completed' : ''}`}
                    />
                )}
            </div>

            <div
                className={`timeline-card ${isActive ? 'is-active' : ''} ${isExempted ? 'is-free-study' : ''} ${isLocked ? 'is-locked is-clickable-locked' : ''}`}
                onClick={isLocked ? handleLockedInteraction : undefined}
            >
                <div className="timeline-card__meta-row">
                    {isExempted ? (
                        <span className="timeline-card__order is-free-study">
                            Đã vượt qua · Ôn tự do
                        </span>
                    ) : (
                        <span className="timeline-card__order">Chặng #{item.orderNo}</span>
                    )}

                    <span className="timeline-card__part-tag">
                        {item.partName} · {sectionLabel}
                    </span>

                    <span
                        className="timeline-card__ability-tag"
                        title="Kỹ năng trọng tâm của mô-đun"
                    >
                        <Sparkles size={12} />
                        <span>{adaptiveReasonText}</span>
                    </span>
                </div>

                <div className="timeline-card__header">
                    <div className="timeline-card__titles">
                        <h3 className="timeline-card__title">{item.title}</h3>
                        <p className="timeline-card__desc">{item.description}</p>
                        {inheritanceNote && (
                            <p className="timeline-card__inheritance-note">
                                <Info size={13} aria-hidden="true" />
                                <span>{inheritanceNote}</span>
                            </p>
                        )}
                    </div>

                    <span className={`timeline-card__badge ${badgeClassName}`}>{item.statusLabel}</span>
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
                                className={`timeline-card__bar-fill ${isExempted ? 'is-free-study' : ''}`}
                                style={{ width: `${item.progressPercent}%` }}
                            />
                        </div>

                        {item.progressPercent > 0 && (
                            <span className="timeline-card__percent">{item.progressPercent}%</span>
                        )}
                    </div>

                    <div className="timeline-card__actions">
                        {isExempted && (
                            <Link
                                to={`/modules/${item.id}`}
                                className="timeline-card__action-btn is-free-study"
                            >
                                <BookOpen size={14} />
                                <span>Ôn tập tự do</span>
                            </Link>
                        )}

                        {isInProgress && (
                            <Link to={`/modules/${item.id}`} className="timeline-card__action-btn">
                                <Play size={14} />
                                <span>Học tiếp ngay</span>
                            </Link>
                        )}

                        {isUnlocked && (
                            <Link to={`/modules/${item.id}`} className="timeline-card__action-btn">
                                <Play size={14} />
                                <span>Bắt đầu học</span>
                            </Link>
                        )}

                        {isCompleted && (
                            <Link to={`/modules/${item.id}`} className="timeline-card__action-btn is-review">
                                Xem lại bài học
                            </Link>
                        )}
                    </div>
                </div>

                {isLocked && isLockNoticeVisible && (
                    <div
                        className="timeline-card__lock-notice"
                        role="status"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <Info size={16} className="timeline-card__lock-notice-icon" />
                        <span>{lockNoticeMessage}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
