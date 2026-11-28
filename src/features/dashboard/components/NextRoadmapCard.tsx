import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Lock } from 'lucide-react';
import type { DashboardModuleItem } from '../types/dashboardTypes';

// Kiểu props nhận vào của thẻ lộ trình các chặng học tiếp theo bên cột phải
interface NextRoadmapCardProps {
    modules: DashboardModuleItem[];
    completedModules: number;
    totalModules: number;
    isPassedAllParts: boolean;
}

/**
 * Thẻ cột phải hiển thị danh sách tối đa 4 chặng học lân cận trên lộ trình cá nhân,
 * thể hiện rõ mô-đun đang học, đã hoàn thành và đang khóa tuần tự.
 */
export function NextRoadmapCard({
    modules,
    completedModules,
    totalModules,
    isPassedAllParts,
}: NextRoadmapCardProps) {
    // Tạo dòng mô tả động theo đúng dữ liệu lộ trình thực tế thay cho câu hardcode cũ
    const subtitle = isPassedAllParts
        ? 'Bạn đã đạt chuẩn toàn bộ 7 phần thi cho mục tiêu hiện tại'
        : totalModules > 0
          ? `Đã hoàn thành ${completedModules}/${totalModules} mô-đun trọng tâm theo thứ tự sư phạm`
          : 'Lộ trình học cá nhân hóa của bạn';

    return (
        <aside className="db-roadmap-card">
            {/* Đầu thẻ gồm tiêu đề và liên kết xem đầy đủ toàn bộ lộ trình */}
            <div className="db-roadmap-card__header">
                <h3 className="db-roadmap-card__title">Lộ trình học tiếp theo</h3>
                <Link to="/learning-path" className="db-inline-link">
                    <span>Xem tất cả</span>
                    <ArrowRight size={14} />
                </Link>
            </div>
            <p className="db-roadmap-card__desc">{subtitle}</p>

            {/* Trạng thái rỗng khi học viên PASS 100% 7 Part không cần mô-đun bổ sung */}
            {modules.length === 0 ? (
                <div className="db-empty-inline">
                    Không còn mô-đun bắt buộc nào trên lộ trình. Bạn có thể tham gia bài thi thử 200 câu hoặc ôn
                    tập tự do trong thư viện khóa học.
                </div>
            ) : (
                <div className="db-roadmap-list">
                    {modules.map((item) => {
                        // Phân loại trạng thái từng chặng để áp dụng kiểu hiển thị và nút bấm phù hợp
                        const isActive = item.status === 'IN_PROGRESS' || item.status === 'UNLOCKED';
                        const isCompleted = item.status === 'COMPLETED';
                        const isLocked = item.isLocked || item.status === 'LOCKED';
                        const sectionLabel = item.section === 'LISTENING' ? 'Nghe hiểu' : 'Đọc hiểu';

                        return (
                            <div
                                key={item.learningPathItemId}
                                className={`db-roadmap-item ${isActive ? 'is-next' : ''} ${isLocked ? 'is-locked' : ''} ${isCompleted ? 'is-completed' : ''}`}
                            >
                                {/* Hàng nhãn trạng thái, số chặng và kỹ năng */}
                                <div className="db-roadmap-item__meta">
                                    <span className={`db-roadmap-item__status-tag is-${item.status.toLowerCase()}`}>
                                        Chặng {item.orderNo} • {item.statusLabel}
                                    </span>
                                    <span className="db-roadmap-item__section">
                                        {item.partName ? `${item.partName} • ${sectionLabel}` : sectionLabel}
                                    </span>
                                </div>

                                {/* Tên mô-đun và mô tả ngắn */}
                                <h4 className="db-roadmap-item__title">{item.title}</h4>
                                {item.description && (
                                    <p className="db-roadmap-item__desc">{item.description}</p>
                                )}

                                {/* Hành động tương ứng với trạng thái mở khóa tuần tự */}
                                {isActive && item.moduleId !== null && !item.isUnderMaintenance && (
                                    <Link to={`/modules/${item.moduleId}`} className="db-roadmap-item__btn">
                                        {item.status === 'IN_PROGRESS' ? 'Vào học ngay' : 'Mở mô-đun'}
                                    </Link>
                                )}

                                {isActive && item.isUnderMaintenance && (
                                    <span className="db-roadmap-item__locked-note">
                                        Đang cập nhật học liệu
                                    </span>
                                )}

                                {isCompleted && item.moduleId !== null && (
                                    <Link
                                        to={`/modules/${item.moduleId}`}
                                        className="db-roadmap-item__btn is-unlocked"
                                    >
                                        <CheckCircle2 size={14} />
                                        <span>Ôn tập lại</span>
                                    </Link>
                                )}

                                {isLocked && (
                                    <span className="db-roadmap-item__locked-note">
                                        <Lock size={13} />
                                        <span>Hoàn thành mô-đun trước để mở khóa</span>
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </aside>
    );
}
