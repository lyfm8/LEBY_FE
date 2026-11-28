import { BarChart3 } from 'lucide-react';
import type { DashboardWeeklyDay } from '../types/dashboardTypes';

// Kiểu props nhận vào của biểu đồ tiến độ học tập 7 ngày gần nhất
interface WeeklyProgressChartProps {
    days: DashboardWeeklyDay[];
    weeklyStudyMinutes: number;
    weeklyActiveDays: number;
}

/**
 * Biểu đồ cột tiến độ học tập 7 ngày gần nhất dựng thuần CSS/SVG (không cài thêm thư viện ngoài).
 * Hiển thị số phút học từng ngày, làm nổi bật cột hôm nay và xử lý gọn trạng thái chưa có hoạt động.
 */
export function WeeklyProgressChart({
    days,
    weeklyStudyMinutes,
    weeklyActiveDays,
}: WeeklyProgressChartProps) {
    // Tìm số phút cao nhất trong 7 ngày để chuẩn hóa tỷ lệ chiều cao cột (tối thiểu 15 phút để cột nhỏ vẫn cân đối)
    const maxMinutes = days.reduce((highest, day) => Math.max(highest, day.studyMinutes), 0);
    const scaleCeiling = Math.max(15, maxMinutes);
    // Kiểm tra xem cả 7 ngày đều chưa ghi nhận hoạt động nào hay không
    const hasAnyActivity = weeklyStudyMinutes > 0 || weeklyActiveDays > 0;

    return (
        <section className="db-card db-weekly-card">
            {/* Tiêu đề khối biểu đồ và tóm tắt tổng thời gian tuần này */}
            <div className="db-card__header">
                <div>
                    <h3 className="db-card__title">Tiến độ học tập 7 ngày gần nhất</h3>
                    <p className="db-card__subtitle">
                        {hasAnyActivity
                            ? `Bạn đã học ${weeklyStudyMinutes} phút trong ${weeklyActiveDays}/7 ngày vừa qua`
                            : 'Chưa có thời gian học trong tuần này — bắt đầu 1 bài giảng ngay hôm nay để khởi động chuỗi học'}
                    </p>
                </div>
                <span className="db-weekly-card__badge">
                    <BarChart3 size={15} />
                    <span>{weeklyStudyMinutes} phút</span>
                </span>
            </div>

            {/* Lưới 7 cột ngày liên tiếp từ 6 ngày trước đến hôm nay */}
            <div className="db-weekly-chart" role="img" aria-label="Biểu đồ số phút học 7 ngày gần nhất">
                {days.map((day) => {
                    // Tính chiều cao phần trăm của cột (giữ mức nền tối thiểu 6% khi có phút học để dễ quan sát)
                    const rawHeight = Math.round((day.studyMinutes / scaleCeiling) * 100);
                    const barHeightPercent = day.studyMinutes > 0 ? Math.max(10, Math.min(100, rawHeight)) : 4;
                    // Tạo nội dung giải thích chi tiết khi người dùng rê chuột vào từng ngày
                    const tooltipText = `${day.dayLabel} (${day.date}): ${day.studyMinutes} phút học • ${day.completedLessons} bài hoàn thành • ${day.testsSubmitted} bài thi`;

                    return (
                        <div
                            key={day.date}
                            className={`db-weekly-col ${day.isToday ? 'is-today' : ''} ${day.studyMinutes > 0 ? 'has-data' : ''}`}
                            title={tooltipText}
                        >
                            {/* Giá trị số phút hiển thị gọn phía trên đầu cột */}
                            <span className="db-weekly-col__value">
                                {day.studyMinutes > 0 ? `${day.studyMinutes}p` : '0'}
                            </span>

                            {/* Khung cột chứa thanh dữ liệu chiều cao động */}
                            <div className="db-weekly-col__track">
                                <div
                                    className="db-weekly-col__bar"
                                    style={{ height: `${barHeightPercent}%` }}
                                />
                            </div>

                            {/* Nhãn thứ trong tuần (T2..CN) */}
                            <span className="db-weekly-col__label">
                                {day.isToday ? 'Hôm nay' : day.dayLabel}
                            </span>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
