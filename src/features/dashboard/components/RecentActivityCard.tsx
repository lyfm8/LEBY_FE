import { Link } from 'react-router-dom';
import {
    Award,
    CheckCircle2,
    ClipboardCheck,
    PlayCircle,
    Trophy,
} from 'lucide-react';
import type { DashboardActivityType, DashboardRecentActivity } from '../types/dashboardTypes';

// Kiểu props nhận vào của danh sách lịch sử hoạt động gần đây
interface RecentActivityCardProps {
    activities: DashboardRecentActivity[];
}

/**
 * Chọn biểu tượng trực quan tương ứng với từng loại sự kiện học tập/thi cử.
 *
 * @param type Loại hoạt động do Backend phân loại
 * @returns Phần tử biểu tượng lucide-react
 */
function renderTypeIcon(type: DashboardActivityType) {
    // Bài tập thực hành
    if (type === 'PRACTICE') {
        return <CheckCircle2 size={18} className="act-item__icon is-practice" />;
    }
    // Bài giảng Video
    if (type === 'VIDEO') {
        return <PlayCircle size={18} className="act-item__icon is-video" />;
    }
    // Bài thi vượt ải mô-đun
    if (type === 'MODULE_TEST') {
        return <Award size={18} className="act-item__icon is-test" />;
    }
    // Bài thi thử TOEIC 200 câu đầu ra
    if (type === 'MOCK_EXAM') {
        return <Trophy size={18} className="act-item__icon is-mock" />;
    }
    // Bài thi chẩn đoán đầu vào
    return <ClipboardCheck size={18} className="act-item__icon is-diagnostic" />;
}

/**
 * Thẻ hiển thị Top hoạt động học tập và khảo thí gần đây nhất của học viên.
 * Cho phép bấm trực tiếp vào từng dòng để xem lại bài học hoặc kết quả thi.
 */
export function RecentActivityCard({ activities }: RecentActivityCardProps) {
    return (
        <section className="db-card db-card--activity">
            {/* Tiêu đề khối lịch sử hoạt động */}
            <h3 className="db-card__title">Hoạt động học tập gần đây</h3>

            {/* Xử lý trạng thái rỗng gọn gàng khi học viên chưa có nhật ký học tập */}
            {activities.length === 0 ? (
                <div className="db-empty-inline">
                    Chưa có hoạt động gần đây. Khi bạn xem bài giảng hoặc làm bài kiểm tra, lịch sử học tập sẽ tự
                    động hiển thị tại đây.
                </div>
            ) : (
                <div className="act-list">
                    {activities.map((act) => {
                        // Nội dung chung của 1 dòng hoạt động (dùng chung cho cả Link và div)
                        const rowBody = (
                            <>
                                {renderTypeIcon(act.type)}
                                <div className="act-item__content">
                                    <h4 className="act-item__title">{act.title}</h4>
                                    <p className="act-item__subtitle">
                                        {act.subtitle} • {act.timeAgo}
                                    </p>
                                </div>
                            </>
                        );

                        // Nếu có đường dẫn đích -> render Link cho phép bấm xem lại ngay
                        if (act.targetUrl) {
                            return (
                                <Link key={act.id} to={act.targetUrl} className="act-item is-clickable">
                                    {rowBody}
                                </Link>
                            );
                        }

                        // Ngược lại chỉ hiển thị dạng thông tin tĩnh
                        return (
                            <div key={act.id} className="act-item">
                                {rowBody}
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
