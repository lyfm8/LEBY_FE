import { Link } from 'react-router-dom';
import { Check, Lock, BookOpen, Sparkles, Play } from 'lucide-react';
import type { ModuleItem } from '../types/roadmapTypes';

interface ModuleTimelineItemProps {
    item: ModuleItem;
    isLast: boolean;
}

/**
 * Thẻ hiển thị một Module trên dòng thời gian của Lộ trình học thích ứng.
 * Thể hiện rõ thứ tự học (#orderNo), phần thi (Part), năng lực yếu cần khắc phục (Ability) và trạng thái mở khóa.
 */
export function ModuleTimelineItem({ item, isLast }: ModuleTimelineItemProps) {
    // Tách 4 trạng thái tiến độ từ BE: COMPLETED (đã qua), IN_PROGRESS (đang học dở), UNLOCKED (vừa mở khóa), LOCKED (chưa tới lượt)
    const isCompleted = item.status === 'COMPLETED';
    const isInProgress = item.status === 'IN_PROGRESS';
    const isUnlocked = item.status === 'UNLOCKED';
    const isLocked = item.status === 'LOCKED';
    // Cả IN_PROGRESS và UNLOCKED đều là chặng đang mở cho học viên bấm vào học nên dùng chung trạng thái nổi bật
    const isActive = isInProgress || isUnlocked;

    // Hiển thị icon trạng thái trên trục dọc Timeline (dấu tích xanh / chấm cam đang học / ổ khóa xám)
    function renderNodeIndicator() {
        if (isCompleted) {
            return (
                <div className="timeline-node is-completed" title="Đã hoàn thành">
                    <Check size={16} strokeWidth={3} />
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
            <div className="timeline-node is-locked" title="Đang khóa">
                <Lock size={14} />
            </div>
        );
    }

    // Ưu tiên hiển thị lý do thích ứng từ cụ thể đến tổng quát: tên năng lực yếu (Tầng 2) -> lý do từ BE -> củng cố toàn Part (nhánh FULL_PART)
    const adaptiveReasonText = item.abilityName
        ? `Khắc phục năng lực: ${item.abilityName}`
        : item.reason || `Củng cố toàn bộ ${item.partName}`;

    return (
        <div className={`timeline-row ${isLast ? 'is-last' : ''}`}>
            {/* Cột mốc Timeline */}
            <div className="timeline-spine">
                {renderNodeIndicator()}
                {!isLast && <div className={`timeline-line ${isCompleted ? 'is-completed' : ''}`} />}
            </div>

            {/* Thẻ Module */}
            <div className={`timeline-card ${isActive ? 'is-active' : ''} ${isLocked ? 'is-locked' : ''}`}>
                <div className="timeline-card__meta-row">
                    <span className="timeline-card__order">Chặng #{item.orderNo}</span>
                    <span className="timeline-card__part-tag">
                        {item.partName} • {item.section === 'LISTENING' ? 'Nghe hiểu' : 'Đọc hiểu'}
                    </span>
                    <span className="timeline-card__ability-tag" title="Lý do module được chọn vào lộ trình thích ứng">
                        <Sparkles size={12} />
                        <span>{adaptiveReasonText}</span>
                    </span>
                </div>

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
        </div>
    );
}
