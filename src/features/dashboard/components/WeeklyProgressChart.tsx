import { BarChart3 } from 'lucide-react';
import type { DashboardWeeklyDay } from '../types/dashboardTypes';

// Kiểu props nhận vào của biểu đồ tiến độ học tập 7 ngày gần nhất
interface WeeklyProgressChartProps {
    days: DashboardWeeklyDay[];
    weeklyActiveDays: number;
}

/**
 * Biểu đồ cột hoạt động hoàn thành 7 ngày gần nhất dựng thuần CSS/SVG (không cài thêm thư viện ngoài).
 * Hiển thị số bài học hoàn thành và bài thi đã nộp theo từng ngày cố định (không bị dịch chuyển giữa các ngày).
 */
export function WeeklyProgressChart({
    days,
    weeklyActiveDays,
}: WeeklyProgressChartProps) {
    // Tổng hợp số bài học hoàn thành và bài thi đã nộp trong 7 ngày gần nhất từ mốc thời gian cố định
    const weeklyCompletedLessons = days.reduce((sum, day) => sum + day.completedLessons, 0);
    const weeklyTestsSubmitted = days.reduce((sum, day) => sum + day.testsSubmitted, 0);
    const weeklyTotalActivities = weeklyCompletedLessons + weeklyTestsSubmitted;

    // Tìm số hoạt động cao nhất trong 7 ngày để chuẩn hóa tỷ lệ chiều cao cột (tối thiểu 4 để cột nhỏ vẫn cân đối)
    const maxActivities = days.reduce(
        (highest, day) => Math.max(highest, day.completedLessons + day.testsSubmitted),
        0
    );
    const scaleCeiling = Math.max(4, maxActivities);
    const hasAnyActivity = weeklyTotalActivities > 0 || weeklyActiveDays > 0;

    return (
        <section className="db-card db-weekly-card">
            {/* Tiêu đề khối biểu đồ và tóm tắt số bài học / bài thi hoàn thành trong tuần */}
            <div className="db-card__header">
                <div>
                    <h3 className="db-card__title">Hoạt động học tập 7 ngày gần nhất</h3>
                </div>
    
            </div>

            {/* Lưới 7 cột ngày liên tiếp từ 6 ngày trước đến hôm nay */}
            <div className="db-weekly-chart" role="img" aria-label="Biểu đồ hoạt động học tập 7 ngày gần nhất">
                {days.map((day) => {
                    const dayActivities = day.completedLessons + day.testsSubmitted;
                    // Tính chiều cao phần trăm của cột (giữ mức nền tối thiểu 12% khi có hoạt động để dễ quan sát)
                    const rawHeight = Math.round((dayActivities / scaleCeiling) * 100);
                    const barHeightPercent = dayActivities > 0 ? Math.max(12, Math.min(100, rawHeight)) : 4;
                    // Tạo nội dung giải thích chi tiết khi người dùng rê chuột vào từng ngày
                    const tooltipText = `${day.dayLabel} (${day.date}): ${day.completedLessons} bài học hoàn thành • ${day.testsSubmitted} bài thi đã nộp`;

                    return (
                        <div
                            key={day.date}
                            className={`db-weekly-col ${day.isToday ? 'is-today' : ''} ${dayActivities > 0 ? 'has-data' : ''}`}
                            title={tooltipText}
                        >
                            {/* Tổng số hoạt động hoàn thành hiển thị gọn phía trên đầu cột */}
                            <span className="db-weekly-col__value">
                                {dayActivities > 0 ? `${dayActivities}` : '0'}
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
