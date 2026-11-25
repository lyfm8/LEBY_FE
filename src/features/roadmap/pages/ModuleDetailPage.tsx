import { useParams, Link } from 'react-router-dom';
import {
    Video,
    BookOpen,
    Check,
    Lock,
    ChevronRight,
    Flag,
    AlertCircle,
    RotateCcw,
    ArrowLeft,
    Sparkles,
} from 'lucide-react';
import { SidebarNav } from '../components/SidebarNav';
import { useModuleDetail } from '../hooks/useModuleDetail';
import '../roadmap.css';

/**
 * Chuyển đổi thời lượng giây (durationSeconds từ Entity Lesson) thành chuỗi dễ đọc cho học viên.
 * Xử lý 3 trường hợp biên: chưa có thời lượng (<= 0), dưới 1 phút (chỉ hiện giây), và từ 1 phút trở lên (mm:ss phút).
 */
function formatLessonDuration(durationSeconds: number, fallbackText?: string): string {
    if (!durationSeconds || durationSeconds <= 0) {
        return fallbackText || 'Chưa cập nhật';
    }
    const minutes = Math.floor(durationSeconds / 60);
    const seconds = durationSeconds % 60;
    if (minutes === 0) {
        return `${seconds} giây`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')} phút`;
}

/**
 * Trang Chi tiết Module học tập và Bài kiểm tra vượt ải (Module Test).
 * Tách logic fetching sang useModuleDetail và xử lý đầy đủ 4 trạng thái Loading/Error/Empty/Success.
 */
export default function ModuleDetailPage() {
    const { moduleId } = useParams<{ moduleId: string }>();
    const { data, isLoading, error, refetch } = useModuleDetail(moduleId);

    if (isLoading) {
        return (
            <div className="app-layout">
                <SidebarNav />
                <div className="roadmap-loading">
                    <div className="roadmap-spinner" />
                    <p>Đang tải chi tiết Module...</p>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="app-layout">
                <SidebarNav />
                <main className="roadmap-main">
                    <div className="roadmap-state-card">
                        <AlertCircle size={48} className="roadmap-state-card__icon is-error" />
                        <h2 className="roadmap-state-card__title">Không thể tải thông tin Module</h2>
                        <p className="roadmap-state-card__desc">
                            {error || 'Module bạn đang tìm không tồn tại hoặc chưa được gán vào lộ trình.'}
                        </p>
                        <div className="roadmap-state-card__actions">
                            <button type="button" className="roadmap-btn-primary" onClick={refetch}>
                                <RotateCcw size={16} />
                                <span>Thử lại</span>
                            </button>
                            <Link to="/learning-path" className="roadmap-btn-secondary">
                                <ArrowLeft size={16} />
                                <span>Quay lại lộ trình</span>
                            </Link>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="app-layout">
            <SidebarNav />

            <main className="roadmap-main">
                <div className="module-detail-container">
                    {/* Hero Card tối màu */}
                    <section className="module-hero-card">
                        <nav className="module-breadcrumb">
                            <Link to="/learning-path">Lộ trình</Link>
                            <ChevronRight size={14} />
                            <span>{data.partName}</span>
                            <ChevronRight size={14} />
                            <span>Module {data.moduleId}</span>
                        </nav>

                        <div className="module-hero-card__header">
                            <h1 className="module-hero-card__title">{data.title}</h1>
                            <span className={`module-hero-card__badge is-${data.status.toLowerCase()}`}>
                                {data.statusLabel}
                            </span>
                        </div>

                        {data.abilityName && (
                            <div className="module-hero-card__ability">
                                <Sparkles size={14} />
                                <span>Năng lực trọng tâm: {data.abilityName}</span>
                            </div>
                        )}

                        <p className="module-hero-card__desc">{data.description}</p>

                        <div className="module-hero-card__progress-wrap">
                            <span className="module-hero-card__progress-label">
                                Tiến độ Module: {data.completedLessons} / {data.totalLessons} bài học hoàn thành
                            </span>
                            <div className="module-hero-card__progress-track">
                                <div
                                    className="module-hero-card__progress-fill"
                                    style={{ width: `${data.progressPercent}%` }}
                                />
                            </div>
                        </div>
                    </section>

                    {/* Danh sách bài học */}
                    <section className="module-lessons-section">
                        <h2 className="module-lessons-section__title">
                            Danh sách bài giảng & bài tập thực hành
                        </h2>

                        {data.lessons.length === 0 ? (
                            <div className="roadmap-state-card is-compact">
                                <p className="roadmap-state-card__desc">
                                    Module này hiện chưa có bài học nào được xuất bản.
                                </p>
                            </div>
                        ) : (
                            <div className="module-lessons-list">
                                {data.lessons.map((lesson) => {
                                    // Bài học hiện hành là bài đã được mở khóa (!isLocked) nhưng học viên chưa hoàn thành (!isCompleted)
                                    const isCurrent = !lesson.isCompleted && !lesson.isLocked;
                                    const durationDisplay = formatLessonDuration(
                                        lesson.durationSeconds,
                                        lesson.durationText
                                    );

                                    return (
                                        <div
                                            key={lesson.id}
                                            className={`module-lesson-item ${lesson.isCompleted ? 'is-completed' : ''} ${isCurrent ? 'is-current' : ''} ${lesson.isLocked ? 'is-locked' : ''}`}
                                        >
                                            <div className="module-lesson-item__left">
                                                <div className="module-lesson-item__icon-box">
                                                    {lesson.type === 'VIDEO' ? (
                                                        <Video size={20} />
                                                    ) : (
                                                        <BookOpen size={20} />
                                                    )}
                                                </div>

                                                <div className="module-lesson-item__info">
                                                    <div className="module-lesson-item__title-row">
                                                        <h3 className="module-lesson-item__title">
                                                            {lesson.orderNo}. {lesson.title}
                                                        </h3>
                                                        {lesson.isFree && (
                                                            <span className="module-lesson-item__free-badge">
                                                                Miễn phí
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="module-lesson-item__meta">
                                                        {lesson.type === 'VIDEO'
                                                            ? 'Video giảng dạy'
                                                            : 'Luyện tập thực hành'}{' '}
                                                        • {durationDisplay}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="module-lesson-item__right">
                                                {lesson.isCompleted && (
                                                    <div className="module-lesson-item__check-wrap">
                                                        <Link
                                                            to={`/modules/${data.moduleId}/lessons/${lesson.id}`}
                                                            className="module-lesson-item__review-link"
                                                        >
                                                            Xem lại
                                                        </Link>
                                                        <div className="module-lesson-item__check">
                                                            <Check size={18} strokeWidth={3} />
                                                        </div>
                                                    </div>
                                                )}

                                                {isCurrent && (
                                                    <Link
                                                        to={`/modules/${data.moduleId}/lessons/${lesson.id}`}
                                                        className="module-lesson-item__start-btn"
                                                    >
                                                        Học ngay
                                                    </Link>
                                                )}

                                                {lesson.isLocked && (
                                                    <div className="module-lesson-item__lock" title="Hoàn thành bài trước để mở khóa">
                                                        <Lock size={18} />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>

                    {/* Khối Bài kiểm tra Module */}
                    <section className="module-test-card">
                        <div className="module-test-card__header">
                            <div className="module-test-card__title-row">
                                <Flag size={20} className="module-test-card__flag-icon" />
                                <h3 className="module-test-card__title">{data.moduleTest.title}</h3>
                            </div>

                            <span className="module-test-card__badge">
                                {data.moduleTest.isUnlocked ? 'SẴN SÀNG' : 'ĐANG KHÓA'}
                            </span>
                        </div>

                        <p className="module-test-card__desc">{data.moduleTest.description}</p>

                        <div className="module-test-card__footer">
                            <div className="module-test-card__req">
                                Hoàn thành tối thiểu <strong>{data.requiredCompletionRate}%</strong> bài học để mở
                                khóa • Cần đạt <strong>{data.moduleTest.passScore} điểm</strong> (AIM{' '}
                                {data.moduleTest.targetScore}) để vượt ải
                            </div>

                            {data.moduleTest.isUnlocked ? (
                                <Link
                                    to={`/modules/${data.moduleId}/test`}
                                    className="module-test-card__btn is-active"
                                >
                                    Bắt đầu kiểm tra ({data.moduleTest.totalQuestions} câu •{' '}
                                    {data.moduleTest.durationMinutes} phút)
                                </Link>
                            ) : (
                                <button type="button" className="module-test-card__btn" disabled>
                                    Chưa mở khóa
                                </button>
                            )}
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
