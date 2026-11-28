import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
    AlertCircle,
    ArrowRight,
    Award,
    CheckCircle2,
    ChevronLeft,
    Flag,
    Info,
    Lock,
    LogIn,
    RefreshCw,
    Sparkles,
    WifiOff,
    X,
} from 'lucide-react';
import { LessonRoomSkeleton } from '../components/LessonRoomSkeleton';
import { LessonSidebarList } from '../components/LessonSidebarList';
import { PracticeQuestionView } from '../components/PracticeQuestionView';
import { VideoPlayer } from '../components/VideoPlayer';
import { useLessonRoom } from '../hooks/useLessonRoom';
import { useVideoProgressTracker } from '../hooks/useVideoProgressTracker';
import '../lesson.css';

/**
 * Trang Phòng học bài giảng Video & Ghi nhận tiến độ học tự động.
 * Tích hợp trình phát chống tua, gợi ý Xem tiếp, tài liệu lý thuyết, câu hỏi ôn tập củng cố
 * và thanh danh sách bài học cùng trạng thái mở khóa bài thi vượt ải theo thời gian thực.
 */
export default function LessonRoomPage() {
    // Lấy tham số moduleId và lessonId từ đường dẫn URL hiện tại
    const { moduleId, lessonId } = useParams<{ moduleId: string; lessonId: string }>();
    // Hook điều hướng của React Router để chuyển sang bài học tiếp theo hoặc đăng nhập lại
    const navigate = useNavigate();

    // Tải dữ liệu phòng học thật từ Backend và xử lý phân loại lỗi
    const { lesson, isLoading, errorType, errorMessage, refetch, applyProgressUpdate } =
        useLessonRoom(lessonId);

    // Khởi chạy bộ giám sát thời lượng xem thực tế, chống tua và bảo toàn tiến độ khi mất mạng/hết phiên
    const {
        liveWatchPercent,
        effectiveDuration,
        isOffline,
        isSessionExpired,
        hasPendingSync,
        showCompletionToast,
        showTestUnlockedBanner,
        showSeekWarning,
        dismissCompletionToast,
        dismissTestUnlockedBanner,
        dismissSeekWarning,
        handlePlaybackTick,
        handleDurationResolved,
        handleSeekAttempt,
        handlePauseOrEndSync,
    } = useVideoProgressTracker({
        lesson,
        onProgressSynced: applyProgressUpdate,
    });

    // Trạng thái mở hộp thoại gửi báo lỗi học liệu nhanh khi video bị hỏng
    const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
    // Nội dung mô tả lỗi do học viên nhập trong hộp thoại báo lỗi
    const [reportNote, setReportNote] = useState<string>('');
    // Cờ xác nhận đã ghi nhận báo lỗi nhanh
    const [isReportSubmitted, setIsReportSubmitted] = useState<boolean>(false);

    /**
     * Mở hộp thoại báo lỗi học liệu nhanh và đặt lại trạng thái nhập liệu.
     */
    function handleOpenReportModal() {
        setReportNote('');
        setIsReportSubmitted(false);
        setIsReportModalOpen(true);
    }

    /**
     * Ghi nhận phản hồi báo lỗi học liệu phía người dùng.
     */
    function handleSubmitReport(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsReportSubmitted(true);
    }

    // Trạng thái 1: Đang tải dữ liệu phòng học -> hiển thị Skeleton khớp layout 2 cột
    if (isLoading) {
        return <LessonRoomSkeleton />;
    }

    // Trạng thái 2: Xảy ra lỗi khi tải bài học (bị khóa, không tồn tại, hết phiên hoặc lỗi mạng)
    if (errorType || !lesson) {
        // Xác định mã mô-đun an toàn để tạo nút quay lại trang chi tiết mô-đun hoặc lộ trình
        const fallbackModulePath = moduleId ? `/modules/${moduleId}` : '/learning-path';

        return (
            <div className="lesson-page lesson-state-wrapper">
                <div className="lesson-state-card" role="alert">
                    <div className={`lesson-state-card__icon is-${(errorType || 'GENERIC').toLowerCase()}`}>
                        {errorType === 'LOCKED' ? (
                            <Lock size={28} />
                        ) : errorType === 'UNAUTHORIZED' ? (
                            <LogIn size={28} />
                        ) : (
                            <AlertCircle size={28} />
                        )}
                    </div>

                    <h1 className="lesson-state-card__title">
                        {errorType === 'LOCKED'
                            ? 'Mô-đun hiện chưa được mở khóa'
                            : errorType === 'NOT_FOUND'
                              ? 'Không tìm thấy nội dung bài học'
                              : errorType === 'UNAUTHORIZED'
                                ? 'Phiên đăng nhập đã hết hạn'
                                : 'Không thể tải bài giảng'}
                    </h1>

                    <p className="lesson-state-card__desc">
                        {errorMessage || 'Đã xảy ra sự cố khi tải nội dung bài học. Vui lòng thử lại.'}
                    </p>

                    <div className="lesson-state-card__actions">
                        {errorType === 'UNAUTHORIZED' ? (
                            <button
                                type="button"
                                className="lesson-state-btn is-primary"
                                onClick={() => navigate('/login')}
                            >
                                <LogIn size={16} />
                                <span>Đăng nhập lại</span>
                            </button>
                        ) : errorType === 'LOCKED' ? (
                            <Link to="/learning-path" className="lesson-state-btn is-primary">
                                <ChevronLeft size={16} />
                                <span>Quay về lộ trình học</span>
                            </Link>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    className="lesson-state-btn is-primary"
                                    onClick={() => void refetch()}
                                >
                                    <RefreshCw size={16} />
                                    <span>Tải lại bài giảng</span>
                                </button>
                                <Link to={fallbackModulePath} className="lesson-state-btn is-secondary">
                                    <ChevronLeft size={16} />
                                    <span>Quay lại mô-đun</span>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Xác định bài học hiện tại có phải bài giảng lý thuyết (Video) hay không
    const isTheoryVideoLesson = lesson.lessonType === 'VIDEO';
    // Đường dẫn quay lại trang chi tiết mô-đun chứa bài giảng này
    const backToModuleUrl = `/modules/${lesson.moduleId}`;
    // Đường dẫn chuyển sang bài học liền trước (nếu có)
    const prevLessonUrl = lesson.prevLessonId
        ? `/modules/${lesson.moduleId}/lessons/${lesson.prevLessonId}`
        : null;
    // Đường dẫn chuyển sang bài học liền sau (nếu có)
    const nextLessonUrl = lesson.nextLessonId
        ? `/modules/${lesson.moduleId}/lessons/${lesson.nextLessonId}`
        : null;

    return (
        <div className="lesson-page">
            {/* Thanh tiêu đề cố định phía trên phòng học */}
            <header className="lesson-header">
                <div className="lesson-header__left">
                    {/* Nút quay lại danh sách bài học của mô-đun */}
                    <Link to={backToModuleUrl} className="lesson-back-btn">
                        <ChevronLeft size={18} />
                        <span>Quay lại mô-đun</span>
                    </Link>

                    {/* Tên mô-đun và tiêu đề bài giảng hiện tại */}
                    <div className="lesson-header__title-wrap">
                        <span className="lesson-header__mod-name">
                            {lesson.partName} • {lesson.moduleTitle}
                        </span>
                        <h1 className="lesson-header__title">{lesson.title}</h1>
                    </div>
                </div>

                {/* Cụm huy hiệu trạng thái tiến độ tự động (tuyệt đối không có nút hoàn thành thủ công) */}
                <div className="lesson-header__right">
                    {isTheoryVideoLesson && (
                        <div
                            className={`lesson-status-pill ${lesson.isCompleted ? 'is-completed' : 'is-learning'}`}
                            aria-live="polite"
                        >
                            {lesson.isCompleted ? (
                                <>
                                    <CheckCircle2 size={16} />
                                    <span>Đã hoàn thành</span>
                                </>
                            ) : (
                                <>
                                    <span className="lesson-status-pill__dot" aria-hidden="true" />
                                    <span>
                                        Đã xem {liveWatchPercent}% / {lesson.requiredWatchPercent}%
                                    </span>
                                </>
                            )}
                        </div>
                    )}

                    {/* Nút chuyển nhanh sang bài học tiếp theo hoặc quay về mô-đun */}
                    {nextLessonUrl ? (
                        <Link to={nextLessonUrl} className="lesson-next-header-btn">
                            <span>Bài học tiếp theo</span>
                            <ArrowRight size={16} />
                        </Link>
                    ) : (
                        <Link to={backToModuleUrl} className="lesson-next-header-btn is-subtle">
                            <span>Danh sách mô-đun</span>
                        </Link>
                    )}
                </div>
            </header>

            {/* Thông báo tích xanh nhẹ ở góc màn hình khi bài giảng vừa đạt mốc hoàn thành */}
            {showCompletionToast && (
                <div className="lesson-completion-toast" role="status" aria-live="polite">
                    <CheckCircle2 size={20} className="lesson-completion-toast__icon" />
                    <div className="lesson-completion-toast__body">
                        <strong>Chúc mừng! Bạn đã hoàn thành bài giảng này</strong>
                        <span>Tiến độ học tập của mô-đun đã được cập nhật tự động.</span>
                    </div>
                    <button
                        type="button"
                        className="lesson-toast-close"
                        onClick={dismissCompletionToast}
                        aria-label="Đóng thông báo"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* Khung nội dung phòng học 2 cột responsive */}
            <main className="lesson-body">
                {/* Banner cảnh báo mất kết nối mạng giữa chừng */}
                {isOffline && (
                    <div className="lesson-alert-banner is-warning" role="alert">
                        <WifiOff size={18} />
                        <span>
                            Mất kết nối mạng. Hệ thống đã lưu lại tiến độ xem gần nhất của bạn. Đang chờ kết nối lại...
                        </span>
                    </div>
                )}

                {/* Banner thông báo có tiến độ lưu tạm đang chờ đồng bộ lại */}
                {!isOffline && hasPendingSync && !isSessionExpired && (
                    <div className="lesson-alert-banner is-info" role="status">
                        <Info size={18} />
                        <span>
                            Đang đồng bộ lại tiến độ bài giảng đã lưu tạm từ bộ nhớ trình duyệt...
                        </span>
                    </div>
                )}

                {/* Banner nhắc nhở nhẹ khi học viên tua vội qua cuối video mà chưa xem đủ thời lượng */}
                {showSeekWarning && !lesson.isCompleted && (
                    <div className="lesson-alert-banner is-warning" role="status">
                        <AlertCircle size={18} />
                        <span>
                            Hệ thống chỉ ghi nhận thời lượng xem thực tế. Bạn cần xem tích lũy tối thiểu{' '}
                            <strong>{lesson.requiredWatchPercent}%</strong> thời lượng video để hoàn thành bài giảng này.
                        </span>
                        <button
                            type="button"
                            className="lesson-banner-close"
                            onClick={dismissSeekWarning}
                            aria-label="Đóng nhắc nhở"
                        >
                            <X size={15} />
                        </button>
                    </div>
                )}

                {/* Banner chúc mừng vừa mở khóa bài kiểm tra vượt ải của mô-đun */}
                {showTestUnlockedBanner && (
                    <div className="lesson-alert-banner is-success" role="status">
                        <Award size={20} />
                        <div className="lesson-alert-banner__content">
                            <strong>Bài kiểm tra vượt ải của mô-đun đã được mở khóa!</strong>
                            <span>
                                Bạn đã hoàn thành đủ tỷ lệ bài giảng yêu cầu và có thể tham gia bài kiểm tra bất cứ lúc nào.
                            </span>
                        </div>
                        <Link to={`/modules/${lesson.moduleId}/test`} className="lesson-banner-cta">
                            Làm bài kiểm tra
                        </Link>
                        <button
                            type="button"
                            className="lesson-banner-close"
                            onClick={dismissTestUnlockedBanner}
                            aria-label="Đóng thông báo"
                        >
                            <X size={15} />
                        </button>
                    </div>
                )}

                {/* Bố cục 2 cột: bên trái trình phát + lý thuyết + ôn tập; bên phải danh sách bài học */}
                <div className="lesson-workspace">
                    <div className="lesson-main-column">
                        {/* Nếu là bài giảng lý thuyết -> hiển thị Trình phát Video có giám sát tiến độ */}
                        {isTheoryVideoLesson && (
                            <VideoPlayer
                                src={lesson.videoUrl}
                                title={lesson.title}
                                initialPositionSeconds={lesson.lastPositionSeconds}
                                initialDurationSeconds={effectiveDuration}
                                liveWatchPercent={liveWatchPercent}
                                requiredWatchPercent={lesson.requiredWatchPercent}
                                isCompleted={lesson.isCompleted}
                                isOffline={isOffline}
                                isSessionExpired={isSessionExpired}
                                onPlaybackTick={handlePlaybackTick}
                                onDurationResolved={handleDurationResolved}
                                onSeekAttempt={handleSeekAttempt}
                                onPauseOrEndSync={handlePauseOrEndSync}
                                onReportBrokenVideo={handleOpenReportModal}
                            />
                        )}

                        {/* Thẻ thông tin lý thuyết, năng lực trọng tâm và ghi chú bài học */}
                        <section className="lesson-notes-card" aria-label="Tóm tắt nội dung bài học">
                            <div className="lesson-notes-card__top">
                                <h2 className="lesson-notes-card__title">Nội dung trọng tâm & Ghi chú</h2>
                                {lesson.abilityName && (
                                    <span className="lesson-ability-chip">
                                        <Sparkles size={13} />
                                        <span>{lesson.abilityName}</span>
                                    </span>
                                )}
                            </div>

                            {lesson.descriptions ? (
                                <p className="lesson-notes-card__desc">{lesson.descriptions}</p>
                            ) : (
                                <p className="lesson-notes-card__empty">
                                    Bài học hiện chưa có ghi chú tóm tắt bổ sung.
                                </p>
                            )}
                        </section>

                        {/* Khối câu hỏi ôn tập củng cố (hiển thị ngay dưới bài giảng khi có câu hỏi gắn kèm) */}
                        {lesson.reviewQuestions.length > 0 ? (
                            <PracticeQuestionView
                                questions={lesson.reviewQuestions}
                                heading={
                                    isTheoryVideoLesson
                                        ? 'Câu hỏi ôn tập củng cố kiến thức'
                                        : 'Bài tập thực hành'
                                }
                            />
                        ) : (
                            !isTheoryVideoLesson && (
                                <div className="lesson-notes-card">
                                    <p className="lesson-notes-card__empty">
                                        Bài tập này đang được cập nhật câu hỏi. Vui lòng quay lại sau.
                                    </p>
                                </div>
                            )
                        )}

                        {/* Thanh điều hướng cuối bài học: bài trước / quay lại mô-đun / bài tiếp theo */}
                        <footer className="lesson-footer-nav">
                            <div>
                                {prevLessonUrl ? (
                                    <Link to={prevLessonUrl} className="lesson-footer-btn is-secondary">
                                        <ChevronLeft size={16} />
                                        <span>Bài học trước</span>
                                    </Link>
                                ) : (
                                    <Link to={backToModuleUrl} className="lesson-footer-btn is-secondary">
                                        <ChevronLeft size={16} />
                                        <span>Quay lại danh sách mô-đun</span>
                                    </Link>
                                )}
                            </div>

                            <div className="lesson-footer-nav__right">
                                {nextLessonUrl ? (
                                    <Link to={nextLessonUrl} className="lesson-footer-btn is-primary">
                                        <span>Chuyển sang bài học tiếp theo</span>
                                        <ArrowRight size={16} />
                                    </Link>
                                ) : (
                                    <Link to={backToModuleUrl} className="lesson-footer-btn is-primary">
                                        <span>Quay lại danh sách mô-đun</span>
                                        <ArrowRight size={16} />
                                    </Link>
                                )}
                            </div>
                        </footer>
                    </div>

                    {/* Cột phải: danh sách bài học trong mô-đun và thẻ mở khóa bài thi vượt ải */}
                    <LessonSidebarList
                        moduleId={lesson.moduleId}
                        currentLessonId={lesson.id}
                        lessons={lesson.moduleLessons}
                        moduleProgressPercent={lesson.moduleProgressPercent}
                        completedVideoLessons={lesson.completedVideoLessons}
                        totalVideoLessons={lesson.totalVideoLessons}
                        requiredCompletionRate={lesson.requiredCompletionRate}
                        moduleTestUnlocked={lesson.moduleTestUnlocked}
                        inRoadmap={lesson.inRoadmap !== false}
                    />
                </div>
            </main>

            {/* Hộp thoại yêu cầu đăng nhập lại khi phiên làm việc hết hạn giữa chừng */}
            {isSessionExpired && (
                <div className="lesson-modal-backdrop" role="dialog" aria-modal="true" aria-label="Phiên đăng nhập hết hạn">
                    <div className="lesson-modal-card">
                        <div className="lesson-modal-card__icon is-warning">
                            <LogIn size={24} />
                        </div>
                        <h3 className="lesson-modal-card__title">Phiên làm việc đã hết hạn</h3>
                        <p className="lesson-modal-card__desc">
                            Hệ thống đã tạm dừng video và bảo lưu vị trí xem gần nhất của bạn. Vui lòng đăng nhập lại để tiếp tục học.
                        </p>
                        <div className="lesson-modal-card__actions">
                            <button
                                type="button"
                                className="lesson-state-btn is-primary"
                                onClick={() => navigate('/login')}
                            >
                                <LogIn size={16} />
                                <span>Đăng nhập lại</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Hộp thoại gửi báo lỗi học liệu nhanh khi video không tải được */}
            {isReportModalOpen && (
                <div className="lesson-modal-backdrop" role="dialog" aria-modal="true" aria-label="Báo lỗi bài giảng">
                    <div className="lesson-modal-card">
                        <div className="lesson-modal-card__header">
                            <div className="lesson-modal-card__title-row">
                                <Flag size={18} className="lesson-modal-flag-icon" />
                                <h3 className="lesson-modal-card__title">Báo lỗi học liệu nhanh</h3>
                            </div>
                            <button
                                type="button"
                                className="lesson-toast-close"
                                onClick={() => setIsReportModalOpen(false)}
                                aria-label="Đóng hộp thoại"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {isReportSubmitted ? (
                            <div className="lesson-report-success">
                                <CheckCircle2 size={28} className="is-done-icon" />
                                <p>
                                    Cảm ơn bạn đã phản hồi! Thông tin sự cố của bài giảng{' '}
                                    <strong>{lesson.title}</strong> đã được ghi nhận để đội ngũ quản trị kiểm tra.
                                </p>
                                <button
                                    type="button"
                                    className="lesson-state-btn is-primary"
                                    onClick={() => setIsReportModalOpen(false)}
                                >
                                    Đóng
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmitReport} className="lesson-report-form">
                                <p className="lesson-modal-card__desc">
                                    Bài giảng: <strong>{lesson.title}</strong>
                                </p>
                                <label htmlFor="lesson-report-note" className="lesson-report-label">
                                    Mô tả ngắn gọn lỗi bạn gặp phải
                                </label>
                                <textarea
                                    id="lesson-report-note"
                                    rows={3}
                                    value={reportNote}
                                    onChange={(e) => setReportNote(e.target.value)}
                                    placeholder="Ví dụ: Video không phát được, mất âm thanh hoặc đứng hình..."
                                    className="lesson-report-textarea"
                                    maxLength={500}
                                />
                                <div className="lesson-modal-card__actions">
                                    <button
                                        type="button"
                                        className="lesson-state-btn is-secondary"
                                        onClick={() => setIsReportModalOpen(false)}
                                    >
                                        Hủy
                                    </button>
                                    <button type="submit" className="lesson-state-btn is-primary">
                                        Gửi báo lỗi
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
