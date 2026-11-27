import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Lock, BookOpen, Sparkles, Play, Info } from 'lucide-react';
import type { ModuleItem } from '../types/roadmapTypes';

// Kiểu dữ liệu props nhận vào cho từng chặng mô-đun trên dòng thời gian
interface ModuleTimelineItemProps {
    // Dữ liệu chi tiết của một mô-đun trên lộ trình
    item: ModuleItem;
    // Cờ xác định đây có phải mô-đun cuối cùng hay không để ẩn đoạn dây nối bên dưới
    isLast: boolean;
}

/**
 * Thẻ hiển thị một chặng mô-đun trên trục thời gian của trang Lộ trình học cá nhân.
 * Thể hiện rõ thứ tự học, phần thi liên kết, năng lực trọng tâm, tiến độ bài học và trạng thái mở khóa tuần tự.
 *
 * @param props Chứa dữ liệu mô-đun và cờ vị trí cuối danh sách
 */
export function ModuleTimelineItem({ item, isLast }: ModuleTimelineItemProps) {
    // Trạng thái bật/tắt khung nhắc nhở khi học viên bấm vào một mô-đun đang bị khóa
    const [isLockNoticeVisible, setIsLockNoticeVisible] = useState<boolean>(false);

    // Tách 4 trạng thái tiến độ từ Backend để điều khiển màu sắc và nút thao tác
    const isCompleted = item.status === 'COMPLETED';
    const isInProgress = item.status === 'IN_PROGRESS';
    const isUnlocked = item.status === 'UNLOCKED';
    const isLocked = item.status === 'LOCKED';
    // Cả hai trạng thái đang học và vừa mở khóa đều nổi bật cho học viên bấm vào học ngay
    const isActive = isInProgress || isUnlocked;

    // Xử lý khi người dùng nhấn vào thẻ hoặc nút ổ khóa của mô-đun chưa mở khóa
    const handleLockedInteraction = () => {
        // Bật hoặc tắt khung thông báo hướng dẫn ngay trong thẻ thay vì dùng hộp thoại trình duyệt
        setIsLockNoticeVisible((prev) => !prev);
    };

    // Hàm phụ hiển thị biểu tượng chấm tròn trên trục dọc Timeline theo trạng thái
    function renderNodeIndicator() {
        // Đã vượt ải hoàn thành -> chấm xanh lá kèm dấu tích
        if (isCompleted) {
            return (
                <div className="timeline-node is-completed" title="Đã hoàn thành">
                    <Check size={16} strokeWidth={3} />
                </div>
            );
        }
        // Đang mở khóa hoặc đang học -> chấm xanh nổi bật có vòng sáng
        if (isActive) {
            return (
                <div className="timeline-node is-active" title="Đang mở khóa">
                    <div className="timeline-node__inner" />
                </div>
            );
        }
        // Chưa mở khóa -> chấm xám kèm biểu tượng ổ khóa
        return (
            <div className="timeline-node is-locked" title="Chưa mở khóa">
                <Lock size={14} />
            </div>
        );
    }

    // Ưu tiên hiển thị lý do cá nhân hóa từ cụ thể đến tổng quát (năng lực trọng tâm -> lý do gợi ý -> tên phần thi)
    const adaptiveReasonText = item.abilityName
        ? `Trọng tâm: ${item.abilityName}`
        : item.reason || `Củng cố nền tảng ${item.partName}`;

    // Nhãn kỹ năng tiếng Việt thân thiện thay vì hiển thị enum kỹ thuật
    const sectionLabel = item.section === 'LISTENING' ? 'Nghe hiểu' : 'Đọc hiểu';

    return (
        <div className={`timeline-row ${isLast ? 'is-last' : ''}`}>
            {/* Cột trục dọc Timeline và dây nối xuống chặng tiếp theo */}
            <div className="timeline-spine">
                {renderNodeIndicator()}
                {/* Chỉ vẽ dây nối nếu chưa phải mô-đun cuối cùng */}
                {!isLast && <div className={`timeline-line ${isCompleted ? 'is-completed' : ''}`} />}
            </div>

            {/* Thẻ thông tin chặng mô-đun */}
            <div
                className={`timeline-card ${isActive ? 'is-active' : ''} ${isLocked ? 'is-locked is-clickable-locked' : ''}`}
                onClick={isLocked ? handleLockedInteraction : undefined}
            >
                {/* Hàng thẻ phân loại: thứ tự chặng, phần thi TOEIC và kỹ năng cần cải thiện */}
                <div className="timeline-card__meta-row">
                    <span className="timeline-card__order">Chặng #{item.orderNo}</span>
                    <span className="timeline-card__part-tag">
                        {item.partName} • {sectionLabel}
                    </span>
                    <span
                        className="timeline-card__ability-tag"
                        title="Lý do mô-đun được gợi ý trong lộ trình của bạn"
                    >
                        <Sparkles size={12} />
                        <span>{adaptiveReasonText}</span>
                    </span>
                </div>

                {/* Phần tiêu đề mô-đun, mô tả mục tiêu và nhãn trạng thái */}
                <div className="timeline-card__header">
                    <div className="timeline-card__titles">
                        <h3 className="timeline-card__title">{item.title}</h3>
                        <p className="timeline-card__desc">{item.description}</p>
                    </div>

                    <span className={`timeline-card__badge is-${item.status.toLowerCase()}`}>
                        {item.statusLabel}
                    </span>
                </div>

                {/* Phần chân thẻ: thanh tiến độ bài học và nút hành động tương ứng trạng thái */}
                <div className="timeline-card__footer">
                    <div className="timeline-card__progress-wrap">
                        {/* Số bài học đã hoàn thành trên tổng số bài học */}
                        <div className="timeline-card__lessons-count">
                            <BookOpen size={14} />
                            <span>
                                {item.completedLessons}/{item.totalLessons} bài học
                            </span>
                        </div>

                        {/* Thanh tiến độ trực quan */}
                        <div className="timeline-card__bar-track">
                            <div
                                className="timeline-card__bar-fill"
                                style={{ width: `${item.progressPercent}%` }}
                            />
                        </div>

                        {/* Chỉ hiện phần trăm khi tiến độ lớn hơn 0 */}
                        {item.progressPercent > 0 && (
                            <span className="timeline-card__percent">{item.progressPercent}%</span>
                        )}
                    </div>

                    {/* Nút Học tiếp ngay cho mô-đun đang học dở */}
                    {isInProgress && (
                        <Link to={`/modules/${item.id}`} className="timeline-card__action-btn">
                            <Play size={14} />
                            <span>Học tiếp ngay</span>
                        </Link>
                    )}

                    {/* Nút Bắt đầu học cho mô-đun vừa mở khóa */}
                    {isUnlocked && (
                        <Link to={`/modules/${item.id}`} className="timeline-card__action-btn">
                            <Play size={14} />
                            <span>Bắt đầu học</span>
                        </Link>
                    )}

                    {/* Nút Xem lại bài học cho mô-đun đã hoàn thành */}
                    {isCompleted && (
                        <Link to={`/modules/${item.id}`} className="timeline-card__action-btn is-review">
                            Xem lại bài học
                        </Link>
                    )}
                </div>

                {/* Khung thông báo thân thiện khi học viên bấm vào mô-đun đang khóa */}
                {isLocked && isLockNoticeVisible && (
                    <div className="timeline-card__lock-notice" role="status">
                        <Info size={16} className="timeline-card__lock-notice-icon" />
                        <span>
                            Mô-đun này chưa được mở khóa. Bạn cần vượt qua bài kiểm tra của mô-đun trước đó để
                            tiếp tục học.
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
