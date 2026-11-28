import { useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    Video,
    BookOpen,
    Check,
    Lock,
    Flag,
    AlertCircle,
    RotateCcw,
    ArrowLeft,
    Sparkles,
    Award,
} from 'lucide-react';
import { SidebarNav } from '../components/SidebarNav';
import { RoadmapSkeleton } from '../components/RoadmapSkeleton';
import { useModuleDetail } from '../hooks/useModuleDetail';
import type { ModuleLessonItem } from '../types/roadmapTypes';
import '../roadmap.css';

/**
 * Chuyển đổi thời lượng tính bằng giây sang chuỗi dễ đọc cho học viên.
 *
 * @param durationSeconds Tổng số giây của bài giảng
 * @param fallbackText Chuỗi dự phòng nếu chưa có thời lượng
 * @returns Chuỗi định dạng thời lượng (VD: "10:20 phút" hoặc "45 giây")
 */
function formatLessonDuration(durationSeconds: number, fallbackText?: string): string {
    // Nếu chưa cập nhật thời lượng -> hiển thị nhãn mặc định
    if (!durationSeconds || durationSeconds <= 0) {
        return fallbackText || 'Đang cập nhật thời lượng';
    }
    // Tách phần phút nguyên và số giây lẻ còn lại
    const minutes = Math.floor(durationSeconds / 60);
    const seconds = durationSeconds % 60;
    // Dưới 1 phút chỉ hiện số giây cho gọn
    if (minutes === 0) {
        return `${seconds} giây`;
    }
    // Từ 1 phút trở lên hiển thị dạng mm:ss phút
    return `${minutes}:${seconds.toString().padStart(2, '0')} phút`;
}

/**
 * Trang Chi tiết Mô-đun học tập của học viên.
 * Hiển thị mục tiêu năng lực, tiến độ bài giảng, 2 danh mục tách biệt (Bài giảng lý thuyết & Bài tập thực hành)
 * và khối Bài kiểm tra vượt ải với ngưỡng điểm động theo mục tiêu của học viên.
 */
export default function ModuleDetailPage() {
    // Lấy mã mô-đun từ tham số đường dẫn URL (/modules/:moduleId)
    const { moduleId } = useParams<{ moduleId: string }>();
    // Hook điều hướng để quay lại đúng trang trước đó hoặc về trang lộ trình
    const navigate = useNavigate();
    // Gọi custom hook lấy dữ liệu chi tiết, cờ đang tải, thông báo lỗi và phân loại lỗi
    const { data, isLoading, error, errorType, refetch } = useModuleDetail(moduleId);

    // Xử lý bấm nút Quay lại trang trước (fallback về /learning-path nếu người dùng mở trực tiếp link)
    const handleGoBack = () => {
        if (window.history.length > 1) {
            navigate(-1);
            return;
        }
        navigate('/learning-path');
    };

    // Tách riêng danh sách Bài giảng lý thuyết để hiển thị thành khu vực đầu tiên
    const theoryLessons = useMemo<ModuleLessonItem[]>(() => {
        if (!data?.lessons) return [];
        return data.lessons.filter((lesson) => lesson.type === 'VIDEO');
    }, [data]);

    // Tách riêng danh sách Bài tập thực hành để hiển thị thành khu vực thứ hai
    const practiceLessons = useMemo<ModuleLessonItem[]>(() => {
        if (!data?.lessons) return [];
        return data.lessons.filter((lesson) => lesson.type === 'PRACTICE');
    }, [data]);

    // Trạng thái 1 (Loading): Hiển thị Skeleton khớp bố cục trang Chi tiết Mô-đun
    if (isLoading) {
        return (
            <div className="app-layout">
                <SidebarNav />
                <main className="roadmap-main">
                    <RoadmapSkeleton variant="module-detail" />
                </main>
            </div>
        );
    }

    // Trạng thái 2 (Error): Phân biệt rõ lỗi mô-đun bị khóa, không tồn tại hoặc lỗi mạng
    if (error || !data) {
        // Kiểm tra có phải trường hợp cố truy cập mô-đun đang bị khóa hay không
        const isLockedError = errorType === 'LOCKED';
        // Kiểm tra có phải trường hợp mô-đun không tồn tại hay không
        const isNotFoundError = errorType === 'NOT_FOUND';
        // Chọn tiêu đề rõ nghĩa tương ứng loại lỗi
        const errorTitle = isLockedError
            ? 'Mô-đun hiện đang bị khóa'
            : isNotFoundError
              ? 'Không tìm thấy mô-đun'
              : 'Không thể tải thông tin mô-đun';

        return (
            <div className="app-layout">
                <SidebarNav />
                <main className="roadmap-main">
                    <div className="roadmap-state-card">
                        {/* Hiện biểu tượng ổ khóa cho lỗi bị khóa, hoặc cảnh báo đỏ cho lỗi khác */}
                        {isLockedError ? (
                            <Lock size={48} className="roadmap-state-card__icon is-locked" />
                        ) : (
                            <AlertCircle size={48} className="roadmap-state-card__icon is-error" />
                        )}
                        <h2 className="roadmap-state-card__title">{errorTitle}</h2>
                        <p className="roadmap-state-card__desc">
                            {error || 'Nội dung mô-đun không tồn tại hoặc đã được gỡ bỏ.'}
                        </p>
                        <div className="roadmap-state-card__actions">
                            {/* Chỉ hiện nút Tải lại khi là lỗi kết nối mạng thông thường */}
                            {!isLockedError && !isNotFoundError && (
                                <button type="button" className="roadmap-btn-primary" onClick={refetch}>
                                    <RotateCcw size={16} />
                                    <span>Tải lại thông tin mô-đun</span>
                                </button>
                            )}
                            <Link
                                to="/learning-path"
                                className={
                                    isLockedError || isNotFoundError
                                        ? 'roadmap-btn-primary'
                                        : 'roadmap-btn-secondary'
                                }
                            >
                                <ArrowLeft size={16} />
                                <span>Quay lại lộ trình</span>
                            </Link>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    // Hàm dựng thẻ cho từng bài học (dùng chung cho cả nhóm Bài giảng lý thuyết và Bài tập thực hành)
    const renderLessonCard = (lesson: ModuleLessonItem) => {
        // Bài đang sẵn sàng học là bài chưa hoàn thành và không bị khóa
        const isCurrent = !lesson.isCompleted && !lesson.isLocked;
        // Xác định bài học thuộc dạng lý thuyết hay thực hành để chọn icon và nhãn phù hợp
        const isTheoryLesson = lesson.type === 'VIDEO';
        // Định dạng thời lượng bài giảng lý thuyết
        const durationDisplay = formatLessonDuration(lesson.durationSeconds, lesson.durationText);
        // Lấy số lượng câu hỏi đi kèm (0 nếu không có)
        const questionCount = lesson.questionCount ?? 0;

        return (
            <div
                key={lesson.id}
                className={`module-lesson-item ${lesson.isCompleted ? 'is-completed' : ''} ${isCurrent ? 'is-current' : ''} ${lesson.isLocked ? 'is-locked' : ''}`}
            >
                {/* Cột trái: biểu tượng loại bài học, tiêu đề và thông tin thời lượng / số câu hỏi */}
                <div className="module-lesson-item__left">
                    <div
                        className={`module-lesson-item__icon-box ${isTheoryLesson ? 'is-theory' : 'is-practice'}`}
                    >
                        {isTheoryLesson ? <Video size={20} /> : <BookOpen size={20} />}
                    </div>

                    <div className="module-lesson-item__info">
                        <div className="module-lesson-item__title-row">
                            <h3 className="module-lesson-item__title">
                                {lesson.orderNo}. {lesson.title}
                            </h3>
                            {/* Hiển thị nhãn Miễn phí nếu bài học mở tự do */}
                            {lesson.isFree && (
                                <span className="module-lesson-item__free-badge">Miễn phí</span>
                            )}
                        </div>

                        <div className="module-lesson-item__meta-row">
                            {/* Thông tin thời lượng cho bài giảng lý thuyết hoặc số câu hỏi cho bài tập thực hành */}
                            {isTheoryLesson ? (
                                <>
                                    <span className="module-lesson-item__meta-chip">
                                        <span>{durationDisplay}</span>
                                    </span>
                                    {/* Nếu bài giảng lý thuyết có gắn thêm câu hỏi ôn tập -> hiển thị nhãn phụ */}
                                    {questionCount > 0 && (
                                        <span className="module-lesson-item__meta-chip is-accent">
                                            <span>{questionCount} câu ôn tập</span>
                                        </span>
                                    )}
                                </>
                            ) : (
                                <span className="module-lesson-item__meta-chip is-accent">
                                    <span>
                                        {questionCount > 0
                                            ? `${questionCount} câu hỏi luyện tập`
                                            : 'Đang cập nhật câu hỏi'}
                                    </span>
                                </span>
                            )}

                            {/* Hiện tên năng lực bổ trợ nếu bài học có gắn năng lực cụ thể */}
                            {lesson.abilityName && (
                                <span className="module-lesson-item__meta-ability">
                                    • {lesson.abilityName}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Cột phải: nút hành động Học ngay / Luyện tập ngay / Xem lại / Khóa */}
                <div className="module-lesson-item__right">
                    {/* Bài đã hoàn thành -> hiển thị liên kết Xem lại / Làm lại kèm dấu tích xanh */}
                    {lesson.isCompleted && (
                        <div className="module-lesson-item__check-wrap">
                            <Link
                                to={
                                    isTheoryLesson
                                        ? `/modules/${data.moduleId}/lessons/${lesson.id}`
                                        : `/modules/${data.moduleId}/lessons/${lesson.id}/practice`
                                }
                                className="module-lesson-item__review-link"
                            >
                                {isTheoryLesson ? 'Xem lại' : 'Làm lại'}
                            </Link>
                            <div className="module-lesson-item__check" title="Đã hoàn thành">
                                <Check size={18} strokeWidth={3} />
                            </div>
                        </div>
                    )}

                    {/* Bài đang mở sẵn sàng -> hiển thị nút CTA chính */}
                    {isCurrent && (
                        <Link
                            to={
                                isTheoryLesson
                                    ? `/modules/${data.moduleId}/lessons/${lesson.id}`
                                    : `/modules/${data.moduleId}/lessons/${lesson.id}/practice`
                            }
                            className="module-lesson-item__start-btn"
                        >
                            {isTheoryLesson ? 'Học ngay' : 'Luyện tập ngay'}
                        </Link>
                    )}

                    {/* Bài đang khóa -> hiển thị biểu tượng ổ khóa */}
                    {lesson.isLocked && (
                        <div
                            className="module-lesson-item__lock"
                            title="Hoàn thành bài trước để mở khóa"
                        >
                            <Lock size={18} />
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // Xác định mô-đun đang mở theo chế độ Học tự do từ Thư viện khóa học hay thuộc lộ trình chính
    const isFreeStudyMode = data.inRoadmap === false || data.accessMode === 'FREE_STUDY';
    // Lấy thông tin bài kiểm tra vượt ải (có thể null khi đang ở chế độ Học tự do)
    const moduleTest = data.moduleTest;
    // Đường dẫn xem lại kết quả bài thi vượt ải gần nhất nếu đã có lịch sử thi
    const reviewResultPath = moduleTest?.lastAttemptId
        ? `/modules/${data.moduleId}/test/result/${moduleTest.lastAttemptId}`
        : `/modules/${data.moduleId}/test/result`;

    // Kiểm tra học viên đã vượt qua bài thi của mô-đun này hay chưa
    const hasPassedModuleTest = Boolean(moduleTest?.hasPassed);
    // Kiểm tra học viên vừa nâng mục tiêu và cần thi lại vượt ải đạt điểm chuẩn mới dù đã bảo lưu bài học
    const needsRetakeForNewAim = Boolean(moduleTest?.needsRetakeForNewAim);

    return (
        <div className="app-layout">
            <SidebarNav />

            <main className="roadmap-main">
                <div className="module-detail-container">
                    {/* Thanh điều hướng quay lại trang trước nằm ngay trên cùng */}
                    <div className="module-top-bar">
                        <button type="button" className="module-back-btn" onClick={handleGoBack}>
                            <ArrowLeft size={16} />
                            <span>Quay lại</span>
                        </button>
                    </div>

                    {/* Banner giải thích nhẹ khi học viên mở mô-đun ở chế độ Học tự do từ Thư viện */}
                    {isFreeStudyMode && (
                        <div className="module-free-study-banner" role="status">
                            <BookOpen size={18} className="module-free-study-banner__icon" />
                            <div>
                                <strong>Chế độ Học tự do</strong>
                                <p>
                                    Mô-đun này nằm ngoài lộ trình bắt buộc. Bạn có thể tự do xem bài giảng và
                                    ôn tập bổ trợ mà không ảnh hưởng tiến độ vượt ải chính.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Thẻ Hero tối màu tóm tắt mục tiêu và tiến độ mô-đun */}
                    <section className="module-hero-card">


                        <div className="module-hero-card__header">
                            <h1 className="module-hero-card__title">{data.title}</h1>
                        </div>

                        {/* Hiển thị năng lực trọng tâm nếu có */}
                        {data.abilityName && (
                            <div className="module-hero-card__ability">
                                <Sparkles size={14} />
                                <span>Năng lực trọng tâm: {data.abilityName}</span>
                            </div>
                        )}

                        {/* Thanh tiến độ bài học trong mô-đun */}
                        <div className="module-hero-card__progress-wrap">
                            <span className="module-hero-card__progress-label">
                                Tiến độ mô-đun:  (
                                {data.progressPercent}%)
                            </span>
                            <div className="module-hero-card__progress-track">
                                <div
                                    className="module-hero-card__progress-fill"
                                    style={{ width: `${data.progressPercent}%` }}
                                />
                            </div>
                        </div>
                    </section>

                    {/* Khu vực danh mục nội dung học liệu chia 2 phần rõ rệt */}
                    <section className="module-lessons-section">
                        {/* Trường hợp mô-đun chưa có bài học nào xuất bản */}
                        {data.lessons.length === 0 ? (
                            <div className="roadmap-state-card is-compact">
                                <p className="roadmap-state-card__desc">
                                    Học liệu của mô-đun đang được hoàn thiện. Vui lòng quay lại sau.
                                </p>
                            </div>
                        ) : (
                            <div className="module-lesson-groups">
                                {/* Phần 1: Danh sách Bài giảng lý thuyết */}
                                <div className="module-lesson-group">
                                    <div className="module-lesson-group__header">
                                        <div className="module-lesson-group__title-wrap">
                                            <h2 className="module-lessons-section__title is-inline">
                                                Bài giảng lý thuyết
                                            </h2>
                                        </div>
                                        <span className="module-lesson-group__count">
                                            {data.completedVideoLessons}/{theoryLessons.length} bài hoàn thành
                                        </span>
                                    </div>

                                    {theoryLessons.length > 0 ? (
                                        <div className="module-lessons-list">
                                            {theoryLessons.map(renderLessonCard)}
                                        </div>
                                    ) : (
                                        <p className="module-lesson-group__empty">
                                            Chưa có bài giảng lý thuyết nào trong mô-đun này.
                                        </p>
                                    )}
                                </div>

                                {/* Phần 2: Danh sách Bài tập thực hành tức thì */}
                                <div className="module-lesson-group">
                                    <div className="module-lesson-group__header">
                                        <div className="module-lesson-group__title-wrap">
                                            <h2 className="module-lessons-section__title is-inline">
                                                Bài tập thực hành
                                            </h2>
                                        </div>
                                        <span className="module-lesson-group__count">
                                            {practiceLessons.length} bài luyện tập
                                        </span>
                                    </div>

                                    {practiceLessons.length > 0 ? (
                                        <div className="module-lessons-list">
                                            {practiceLessons.map(renderLessonCard)}
                                        </div>
                                    ) : (
                                        <p className="module-lesson-group__empty">
                                            Chưa có bài tập thực hành nào trong mô-đun này.
                                        </p>
                                    )}
                                </div>

                                {/* Phần 3: Bài kiểm tra vượt ải đưa về cùng cấp và cùng màu với bài giảng & thực hành */}
                                {!isFreeStudyMode && moduleTest && (
                                    <div className="module-lesson-group">
                                        <div className="module-lesson-group__header">
                                            <div className="module-lesson-group__title-wrap">
                                                <h2 className="module-lessons-section__title is-inline">
                                                    Bài kiểm tra vượt ải
                                                </h2>
                                            </div>
                                            <span className="module-lesson-group__count">
                                                1 bài kiểm tra
                                            </span>
                                        </div>

                                        <div className="module-lessons-list">
                                            <div
                                                className={`module-lesson-item ${
                                                    hasPassedModuleTest
                                                        ? 'is-completed'
                                                        : moduleTest.isUnlocked
                                                          ? 'is-current'
                                                          : 'is-locked'
                                                }`}
                                            >
                                                {/* Cột trái: biểu tượng, tiêu đề bài thi và meta chi tiết */}
                                                <div className="module-lesson-item__left">
                                                    <div
                                                        className={`module-lesson-item__icon-box ${
                                                            hasPassedModuleTest
                                                                ? 'is-completed'
                                                                : moduleTest.isUnlocked
                                                                  ? 'is-current'
                                                                  : ''
                                                        }`}
                                                    >
                                                        {hasPassedModuleTest ? <Award size={20} /> : <Flag size={20} />}
                                                    </div>

                                                    <div className="module-lesson-item__info">
                                                        <div className="module-lesson-item__title-row">
                                                            <h3 className="module-lesson-item__title">
                                                                {moduleTest.title}
                                                            </h3>
                                                            <span
                                                                className={`module-test-pill ${
                                                                    hasPassedModuleTest
                                                                        ? 'is-passed'
                                                                        : moduleTest.isUnlocked
                                                                          ? 'is-ready'
                                                                          : 'is-locked'
                                                                }`}
                                                            >
                                                                {hasPassedModuleTest
                                                                    ? 'ĐÃ VƯỢT ẢI'
                                                                    : moduleTest.isUnlocked
                                                                      ? 'SẴN SÀNG'
                                                                      : 'CHƯA MỞ KHÓA'}
                                                            </span>
                                                        </div>

                                                        <div className="module-lesson-item__meta-row">
                                                            {moduleTest.isUnlocked ? (
                                                                <>
                                                                    <span className="module-lesson-item__meta-chip">
                                                                        <span>{moduleTest.totalQuestions} câu hỏi</span>
                                                                    </span>
                                                                    <span className="module-lesson-item__meta-chip">
                                                                        <span>{moduleTest.durationMinutes} phút</span>
                                                                    </span>
                                                                    <span className="module-lesson-item__meta-chip is-accent">
                                                                        <span>Cần đạt {moduleTest.passScore}/100 điểm</span>
                                                                    </span>
                                                                </>
                                                            ) : (
                                                                <span className="module-lesson-item__meta-chip">
                                                                    <span>
                                                                        Hoàn thành tối thiểu {data.requiredCompletionRate}% bài giảng để mở khóa • Cần đạt {moduleTest.passScore}/100 điểm
                                                                    </span>
                                                                </span>
                                                            )}

                                                            {typeof moduleTest.bestScore === 'number' && (
                                                                <span className="module-lesson-item__meta-ability">
                                                                    • Điểm cao nhất: {moduleTest.bestScore}/100
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Nhắc nhở nếu cần thi lại vì nâng mục tiêu */}
                                                        {needsRetakeForNewAim && (
                                                            <div className="module-test-retake-note">
                                                                <AlertCircle size={13} />
                                                                <span>
                                                                    Cần đạt tối thiểu <strong>{moduleTest.passScore}/100 điểm</strong> cho mục tiêu <strong>{moduleTest.targetScore} điểm</strong>.
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Cột phải: nút hành động Vào thi / Làm lại / Khóa */}
                                                <div className="module-lesson-item__right">
                                                    {hasPassedModuleTest && (
                                                        <div className="module-lesson-item__check-wrap">
                                                            {moduleTest.lastAttemptId && (
                                                                <Link
                                                                    to={reviewResultPath}
                                                                    className="module-lesson-item__review-link"
                                                                >
                                                                    Xem kết quả
                                                                </Link>
                                                            )}
                                                            <Link
                                                                to={`/modules/${data.moduleId}/test`}
                                                                className="module-lesson-item__review-link"
                                                            >
                                                                Thi lại
                                                            </Link>
                                                            <div className="module-lesson-item__check" title="Đã vượt ải">
                                                                <Check size={18} strokeWidth={3} />
                                                            </div>
                                                        </div>
                                                    )}

                                                    {moduleTest.isUnlocked && !hasPassedModuleTest && (
                                                        <Link
                                                            to={`/modules/${data.moduleId}/test`}
                                                            className="module-lesson-item__start-btn"
                                                        >
                                                            Làm bài thi
                                                        </Link>
                                                    )}

                                                    {!moduleTest.isUnlocked && !hasPassedModuleTest && (
                                                        <div
                                                            className="module-lesson-item__lock"
                                                            title={`Hoàn thành tối thiểu ${data.requiredCompletionRate}% bài giảng để mở khóa`}
                                                        >
                                                            <Lock size={18} />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </section>
                </div>
            </main>
        </div>
    );
}
