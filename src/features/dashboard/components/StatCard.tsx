import { Clock, Flame, TrendingUp } from 'lucide-react';

// Kiểu props cho thẻ chỉ số KPI tổng quan trên Dashboard học viên
interface StatCardProps {
    type: 'progress' | 'streak' | 'time' | 'score';
    value: string | number;
    title: string;
    subtext: string;
    progressPercent?: number;
    isHighlighted?: boolean;
}

/**
 * Thẻ hiển thị một chỉ số học tập cốt lõi (KPI) với biểu tượng đồng nhất hoặc vòng tròn tiến độ SVG.
 */
export function StatCard({
    type,
    value,
    title,
    subtext,
    progressPercent,
    isHighlighted = false,
}: StatCardProps) {
    // Khống chế tỷ lệ vòng tròn tiến độ nằm gọn trong khoảng 0 - 100 để tránh NaN hoặc tràn nét vẽ
    const safePercent =
        typeof progressPercent === 'number' && Number.isFinite(progressPercent)
            ? Math.max(0, Math.min(100, Math.round(progressPercent)))
            : 0;

    // Chọn biểu tượng trực quan tương ứng với từng loại thẻ KPI
    function renderIcon() {
        // Thẻ tiến độ lộ trình dùng vòng tròn SVG hiển thị trực quan phần trăm hoàn thành
        if (type === 'progress') {
            return (
                <div className="stat-card__ring-wrapper" aria-label={`Tiến độ ${safePercent}%`}>
                    <svg className="stat-card__ring-svg" viewBox="0 0 36 36">
                        <path
                            className="stat-card__ring-bg"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                            className="stat-card__ring-fill"
                            strokeDasharray={`${safePercent}, 100`}
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                    </svg>
                    <span className="stat-card__ring-text">{safePercent}%</span>
                </div>
            );
        }

        // Thẻ chuỗi ngày học liên tục dùng biểu tượng ngọn lửa
        if (type === 'streak') {
            return (
                <span className={`stat-card__icon-box is-streak ${isHighlighted ? 'is-active' : ''}`}>
                    <Flame size={19} />
                </span>
            );
        }

        // Thẻ tổng thời gian đã học dùng biểu tượng đồng hồ
        if (type === 'time') {
            return (
                <span className="stat-card__icon-box is-time">
                    <Clock size={19} />
                </span>
            );
        }

        // Thẻ điểm TOEIC dự đoán dùng biểu tượng tăng trưởng
        return (
            <span className="stat-card__icon-box is-score">
                <TrendingUp size={19} />
            </span>
        );
    }

    return (
        <article className={`stat-card ${isHighlighted ? 'is-highlighted' : ''}`}>
            {/* Hàng đầu: Tiêu đề chỉ số và biểu tượng trực quan */}
            <div className="stat-card__header">
                <span className="stat-card__title">{title}</span>
                {renderIcon()}
            </div>

            {/* Giá trị số liệu chính nổi bật */}
            <div className="stat-card__value">{value}</div>

            {/* Dòng giải thích ngữ cảnh thật đi kèm */}
            <div className="stat-card__subtext">{subtext}</div>
        </article>
    );
}
