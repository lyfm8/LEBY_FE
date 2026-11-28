import { Link } from 'react-router-dom';
import {
    AlertCircle,
    ArrowRight,
    Award,
    Compass,
    LogIn,
    Play,
    RefreshCw,
    Target,
    Trophy,
} from 'lucide-react';
import { SidebarNav } from '@/features/roadmap/components/SidebarNav';
import { useDashboard } from '../hooks/useDashboard';
import { DashboardSkeleton } from '../components/DashboardSkeleton';
import { DashboardOnboardingCard } from '../components/DashboardOnboardingCard';
import { StatCard } from '../components/StatCard';
import { CurrentModuleFocusCard } from '../components/CurrentModuleFocusCard';
import { WeeklyProgressChart } from '../components/WeeklyProgressChart';
import { QuickShortcutsCard } from '../components/QuickShortcutsCard';
import { RecentActivityCard } from '../components/RecentActivityCard';
import type { DashboardCurrentModule } from '../types/dashboardTypes';
import '../dashboard.css';

/**
 * Định dạng tổng thời gian học (phút) thành chuỗi dễ đọc cho thẻ chỉ số KPI.
 *
 * @param totalMinutes Tổng số phút đã học
 * @returns Chuỗi hiển thị (ví dụ: "2 giờ 15 phút" hoặc "45 phút")
 */
function formatStudyDuration(totalMinutes: number): string {
    // Nếu chưa có phút học nào -> trả về 0 phút rõ ràng
    if (!totalMinutes || totalMinutes <= 0) {
        return '0 phút';
    }
    // Dưới 60 phút -> hiển thị thẳng đơn vị phút
    if (totalMinutes < 60) {
        return `${totalMinutes} phút`;
    }
    // Từ 60 phút trở lên -> tách thành giờ và phút dư
    const hours = Math.floor(totalMinutes / 60);
    const remainMinutes = totalMinutes % 60;
    return remainMinutes > 0 ? `${hours} giờ ${remainMinutes} phút` : `${hours} giờ`;
}

/**
 * Xác định đường dẫn cho nút "Tiếp tục bài học" trên thanh tiêu đề Dashboard.
 *
 * @param currentModule Mô-đun đang học hiện tại (có thể null)
 * @returns Đường dẫn đích phù hợp nhất
 */
function resolveHeaderContinueUrl(currentModule: DashboardCurrentModule | null): string {
    // Nếu không có mô-đun đang mở hoặc mô-đun đang bảo trì -> dẫn sang trang Lộ trình học
    if (!currentModule || currentModule.isUnderMaintenance || currentModule.moduleId === null) {
        return '/learning-path';
    }
    // Nếu đã có bài học gợi ý tiếp tục -> nhảy thẳng vào phòng Video hoặc phòng Luyện tập
    if (currentModule.continueLessonId !== null) {
        return currentModule.continueLessonType === 'PRACTICE'
            ? `/modules/${currentModule.moduleId}/lessons/${currentModule.continueLessonId}/practice`
            : `/modules/${currentModule.moduleId}/lessons/${currentModule.continueLessonId}`;
    }
    // Dự phòng dẫn vào trang chi tiết mô-đun hiện tại
    return `/modules/${currentModule.moduleId}`;
}

/**
 * Trang Dashboard học tập cá nhân (màn hình trung tâm của học viên).
 * Tổng hợp tiến độ hoàn thành lộ trình, chuỗi ngày học liên tục, thời gian học,
 * điểm TOEIC dự đoán, mô-đun đang học tiếp theo, biểu đồ tuần và các lối tắt học tập.
 */
export default function DashboardPage() {
    // Gọi custom hook để lấy dữ liệu tổng hợp Dashboard cùng 4 trạng thái chuẩn
    const { data, isLoading, error, errorType, refetch } = useDashboard();

    // Trạng thái 1 (Loading): Hiển thị Skeleton mô phỏng chính xác bố cục Dashboard thật
    if (isLoading) {
        return (
            <div className="app-layout">
                <SidebarNav />
                <div className="app-main-viewport db-viewport">
                    <DashboardSkeleton />
                </div>
            </div>
        );
    }

    // Trạng thái 2 (Error): Lỗi hết phiên 401 hoặc mất kết nối máy chủ -> hiện thông báo kèm nút hành động
    if (error || !data) {
        // Kiểm tra trường hợp phiên đăng nhập hết hạn để đổi nút sang Đăng nhập lại
        const isUnauthorized = errorType === 'UNAUTHORIZED';
        return (
            <div className="app-layout">
                <SidebarNav />
                <main className="app-main-viewport db-viewport">
                    <div className="db-container">
                        <div className="db-error-card" role="alert">
                            <AlertCircle size={44} className="db-error-card__icon" />
                            <h2 className="db-error-card__title">
                                {isUnauthorized
                                    ? 'Phiên làm việc đã hết hạn'
                                    : 'Không thể tải dữ liệu bảng điều khiển'}
                            </h2>
                            <p className="db-error-card__desc">
                                {error || 'Hệ thống tạm thời gặp sự cố kết nối. Vui lòng thử tải lại trang.'}
                            </p>
                            <div className="db-error-card__actions">
                                {isUnauthorized ? (
                                    <Link to="/login" className="db-btn-primary">
                                        <LogIn size={16} />
                                        <span>Đăng nhập lại</span>
                                    </Link>
                                ) : (
                                    <button type="button" className="db-btn-primary" onClick={() => void refetch()}>
                                        <RefreshCw size={16} />
                                        <span>Tải lại trang</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    // Trạng thái 3 (Onboarding / Empty): Chưa chọn mục tiêu, chưa thi chẩn đoán hoặc đang đồng bộ lộ trình
    if (
        data.dashboardState === 'NEED_TARGET' ||
        data.dashboardState === 'NEED_DIAGNOSTIC' ||
        data.dashboardState === 'SYNCING_ROADMAP'
    ) {
        return (
            <div className="app-layout">
                <SidebarNav />
                <div className="app-main-viewport db-viewport">
                    <main className="db-container">
                        <DashboardOnboardingCard
                            state={data.dashboardState}
                            fullName={data.user.fullName}
                            targetScore={data.user.targetScore}
                            hasInProgressDiagnostic={data.diagnostic.hasInProgressDiagnostic}
                            onRefresh={() => void refetch()}
                        />
                    </main>
                </div>
            </div>
        );
    }

    // Xác định trạng thái đã hoàn thành trọn vẹn lộ trình học (bao gồm cả PASS 100% 7 Part)
    const isCompletedRoadmap = data.dashboardState === 'COMPLETED';
    // Tính đường dẫn nút Tiếp tục bài học ở thanh tiêu đề
    const headerContinueUrl = resolveHeaderContinueUrl(data.currentModule);

    // Chuẩn bị dòng phụ chú thật cho thẻ Điểm TOEIC dự đoán
    const scoreSubtext =
        data.diagnostic.listeningScore !== null && data.diagnostic.readingScore !== null
            ? `Nghe ${data.diagnostic.listeningScore} • Đọc ${data.diagnostic.readingScore}${data.user.targetScore ? ` • Mục tiêu ${data.user.targetScore}` : ''}`
            : data.user.targetScore
              ? `Mục tiêu hiện tại: ${data.user.targetScore} điểm TOEIC`
              : 'Ước lượng từ bài đánh giá đầu vào';

    // Chuẩn bị dòng phụ chú thật cho thẻ Tiến độ lộ trình
    const progressSubtext = data.stats.isPassedAllParts
        ? 'Đạt chuẩn toàn bộ 7 phần thi'
        : `${data.stats.completedModules} / ${data.stats.totalModules} mô-đun • ${data.stats.completedLessons}/${data.stats.totalLessons} bài học`;

    // Chuẩn bị dòng phụ chú thật cho thẻ Chuỗi ngày học liên tục
    const streakSubtext = data.stats.isStudiedToday
        ? 'Hôm nay bạn đã duy trì nhịp học'
        : data.stats.streakDays > 0
          ? 'Học hôm nay để không bị đứt chuỗi'
          : 'Bắt đầu bài học đầu tiên hôm nay';

    // Chuẩn bị dòng phụ chú thật cho thẻ Thời gian đã học
    const studyTimeSubtext =
        data.stats.weeklyActiveDays > 0
            ? `Duy trì học ${data.stats.weeklyActiveDays}/7 ngày vừa qua`
            : 'Tích lũy từ bài giảng Video & bài thi';

    return (
        <div className="app-layout">
            <SidebarNav />

            <div className="app-main-viewport db-viewport">
                {/* Thanh chào mừng cá nhân hóa, mục tiêu AIM và nút hành động nhanh */}
                <header className="db-sub-header">
                    <div className="db-sub-header__left">
                        <span className="db-sub-header__welcome">Chào mừng trở lại,</span>
                        <h1 className="db-sub-header__name">{data.user.fullName}</h1>
                    </div>

                    <div className="db-sub-header__right">
                        {data.user.targetScore !== null && (
                            <Link
                                to="/target-selection"
                                className="db-sub-target-btn"
                                title="Bấm để điều chỉnh mốc điểm mục tiêu"
                            >
                                <Target size={15} />
                                <span>Mục tiêu: {data.user.targetScore} TOEIC</span>
                            </Link>
                        )}

                        {isCompletedRoadmap ? (
                            <Link to="/mock-exam" className="db-sub-roadmap-btn is-accent">
                                <Trophy size={15} />
                                <span>Thi thử 200 câu</span>
                            </Link>
                        ) : (
                            <Link to={headerContinueUrl} className="db-sub-roadmap-btn">
                                {data.currentModule && !data.currentModule.isUnderMaintenance ? (
                                    <>
                                        <Play size={14} />
                                        <span>Tiếp tục bài học</span>
                                    </>
                                ) : (
                                    <>
                                        <Compass size={15} />
                                        <span>Xem lộ trình</span>
                                    </>
                                )}
                            </Link>
                        )}
                    </div>
                </header>

                <main className="db-container">
                    {/* Banner chúc mừng khi học viên đã hoàn thành 100% lộ trình học -> mời thi thử 200 câu */}
                    {isCompletedRoadmap && (
                        <section className="db-completion-banner">
                            <div className="db-completion-banner__body">
                                <span className="db-completion-banner__badge">
                                    <Award size={15} />
                                    <span>
                                        {data.stats.isPassedAllParts
                                            ? `Đạt chuẩn mục tiêu ${data.user.targetScore ?? ''} điểm`
                                            : 'Hoàn thành 100% lộ trình học'}
                                    </span>
                                </span>
                                <h2 className="db-completion-banner__title">
                                    Xuất sắc! Bạn đã sẵn sàng nghiệm thu năng lực đầu ra
                                </h2>
                                <p className="db-completion-banner__desc">
                                    {data.stats.isPassedAllParts
                                        ? 'Kết quả đánh giá cho thấy bạn đã vững toàn bộ 7 phần thi cho mốc mục tiêu hiện tại. Tham gia bài thi thử TOEIC 200 câu để kiểm chứng năng lực thực tế.'
                                        : 'Bạn đã vượt qua toàn bộ các mô-đun trên lộ trình cá nhân. Tham gia bài thi thử TOEIC 200 câu chuẩn ETS để so sánh sự tiến bộ trước và sau khi học.'}
                                </p>
                            </div>
                            <div className="db-completion-banner__actions">
                                <Link to="/mock-exam" className="db-btn-primary">
                                    <Trophy size={17} />
                                    <span>Tham gia bài thi thử TOEIC 200 câu</span>
                                    <ArrowRight size={16} />
                                </Link>
                                <Link to="/target-selection" className="db-btn-secondary">
                                    <Target size={16} />
                                    <span>Nâng mục tiêu cao hơn</span>
                                </Link>
                            </div>
                        </section>
                    )}

                    {/* Lưới 4 thẻ chỉ số KPI tổng hợp từ dữ liệu thật */}
                    <section className="db-stats-grid" aria-label="Chỉ số học tập tổng quan">
                        <StatCard
                            type="progress"
                            title="Tiến độ lộ trình"
                            value={`${data.stats.roadmapProgressPercent}%`}
                            subtext={progressSubtext}
                            progressPercent={data.stats.roadmapProgressPercent}
                        />
                        <StatCard
                            type="streak"
                            title="Chuỗi ngày học liên tục"
                            value={`${data.stats.streakDays} ngày`}
                            subtext={streakSubtext}
                            isHighlighted={data.stats.isStudiedToday}
                        />
                        <StatCard
                            type="time"
                            title="Tổng thời gian đã học"
                            value={formatStudyDuration(data.stats.totalStudyMinutes)}
                            subtext={studyTimeSubtext}
                        />
                        <StatCard
                            type="score"
                            title="Điểm TOEIC dự đoán"
                            value={
                                data.stats.predictedScore !== null
                                    ? `${data.stats.predictedScore} / 990`
                                    : 'Chưa có'
                            }
                            subtext={scoreSubtext}
                        />
                    </section>

                    {/* Lưới nội dung chính 2 cột tinh gọn: Trái (Học tiếp ngay + Biểu đồ tuần) - Phải (Hoạt động gần đây + Truy cập nhanh) */}
                    <div className="db-content-grid">
                        <div className="db-content-left">
                            {data.currentModule && (
                                <CurrentModuleFocusCard module={data.currentModule} />
                            )}

                            <WeeklyProgressChart
                                days={data.weeklyProgress}
                                weeklyActiveDays={data.stats.weeklyActiveDays}
                            />
                        </div>

                        <div className="db-content-right">
                            <RecentActivityCard activities={data.recentActivities.slice(0, 5)} />

                            <QuickShortcutsCard
                                canTakeFullMockTest={data.stats.canTakeFullMockTest}
                                latestDiagnosticAttemptId={data.diagnostic.latestAttemptId}
                            />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
