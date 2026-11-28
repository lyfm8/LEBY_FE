import { Link } from 'react-router-dom';
import { Award, Lock } from 'lucide-react';
import type { LessonContentType, LessonNavItem } from '../types/lessonTypes';

/**
 * Tạo đường dẫn đúng phòng học tương ứng với loại bài học:
 * - Bài thực hành (PRACTICE) -> Phòng luyện tập tức thì (UC12)
 * - Bài giảng lý thuyết (VIDEO) -> Phòng học bài giảng Video (UC11)
 */
export function buildLessonRoutePath(
    moduleId: number,
    lessonId: number,
    lessonType?: LessonContentType
): string {
    return lessonType === 'PRACTICE'
        ? `/modules/${moduleId}/lessons/${lessonId}/practice`
        : `/modules/${moduleId}/lessons/${lessonId}`;
}

/**
 * Thuộc tính đầu vào cho cột danh sách bài học trong cùng mô-đun.
 */
interface LessonSidebarListProps {
    /** Mã mô-đun hiện tại dùng để tạo liên kết chuyển bài và vào bài thi vượt ải. */
    moduleId: number;
    /** Mã bài học đang mở để đánh dấu trạng thái nổi bật. */
    currentLessonId: number;
    /** Danh sách toàn bộ bài học đã xuất bản trong mô-đun. */
    lessons: LessonNavItem[];
    /** Tỷ lệ phần trăm hoàn thành bài giảng của cả mô-đun. */
    moduleProgressPercent: number;
    /** Số bài giảng lý thuyết đã hoàn thành. */
    completedVideoLessons: number;
    /** Tổng số bài giảng lý thuyết của mô-đun. */
    totalVideoLessons: number;
    /** Tỷ lệ tối thiểu (%) cần đạt để mở khóa bài kiểm tra vượt ải. */
    requiredCompletionRate: number;
    /** Cờ xác định bài kiểm tra vượt ải đã được mở khóa hay chưa. */
    moduleTestUnlocked: boolean;
    /** Cờ xác định mô-đun có thuộc lộ trình cá nhân hay không (ẩn khối vượt ải khi Học tự do). */
    inRoadmap?: boolean;
}

/**
 * Chuyển số giây sang định dạng phút:giây ngắn gọn (ví dụ 06:15).
 *
 * @param totalSeconds Tổng số giây cần định dạng
 * @returns Chuỗi hiển thị thời lượng thân thiện
 */
function formatLessonDuration(totalSeconds: number): string {
    // Nếu chưa có thông tin thời lượng thì trả về chuỗi rỗng để không hiển thị số 0 thừa
    if (!totalSeconds || totalSeconds <= 0) {
        return '';
    }
    // Tính số phút nguyên bằng cách chia 60 và làm tròn xuống
    const minutes = Math.floor(totalSeconds / 60);
    // Tính số giây dư còn lại sau khi đã tách phút
    const seconds = Math.floor(totalSeconds % 60);
    // Ghép phút và giây (luôn đủ 2 chữ số ở phần giây)
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Thanh bên hiển thị tiến độ chung của mô-đun, danh sách bài học để chuyển nhanh
 * và thẻ trạng thái mở khóa bài kiểm tra vượt ải.
 */
export function LessonSidebarList({
    moduleId,
    currentLessonId,
    lessons,
    moduleProgressPercent,
    completedVideoLessons,
    totalVideoLessons,
    requiredCompletionRate,
    moduleTestUnlocked,
    inRoadmap = true,
}: LessonSidebarListProps) {
    // Giới hạn giá trị thanh tiến độ luôn nằm trong đoạn an toàn [0, 100]
    const safeProgress = Math.max(0, Math.min(100, moduleProgressPercent));

    return (
        <aside className="lesson-sidebar-column" aria-label="Danh sách bài học trong mô-đun">
            {/* Thẻ chính chứa tiến độ và danh sách bài học */}
            <div className="lesson-sidebar-card">
                {/* Tiêu đề cột bên và số bài đã hoàn thành */}
                <div className="lesson-sidebar-card__header">
                    <h2 className="lesson-sidebar-card__title">Nội dung mô-đun</h2>
                    <span className="lesson-sidebar-card__summary">
                        {completedVideoLessons}/{totalVideoLessons} bài giảng
                    </span>
                </div>

                {/* Thanh tiến độ tổng thể của mô-đun */}
                <div className="lesson-sidebar-progress">
                    <div className="lesson-sidebar-progress__meta">
                        <span>Tiến độ hoàn thành</span>
                        <strong>{safeProgress}%</strong>
                    </div>
                    <div className="lesson-sidebar-progress__track">
                        <div
                            className="lesson-sidebar-progress__fill"
                            style={{ width: `${safeProgress}%` }}
                        />
                    </div>
                </div>

                {/* Danh sách từng bài học trong mô-đun */}
                <ul className="lesson-nav-list">
                    {lessons.map((item) => {
                        // Xác định bài học này có đang được mở hay không
                        const isActive = item.id === currentLessonId;
                        // Xác định bài học thuộc dạng bài giảng lý thuyết hay bài thực hành
                        const isTheory = item.lessonType === 'VIDEO';
                        // Định dạng thời lượng bài giảng nếu có
                        const durationLabel = formatLessonDuration(item.durationSeconds);

                        return (
                            <li key={item.id} className="lesson-nav-list__item">
                                <Link
                                    to={buildLessonRoutePath(moduleId, item.id, item.lessonType)}
                                    className={`lesson-nav-link ${isActive ? 'is-active' : ''} ${item.isCompleted ? 'is-completed' : ''}`}
                                    aria-current={isActive ? 'page' : undefined}
                                >
                                    {/* Tên bài học và thông tin phụ về loại/thời lượng/trạng thái */}
                                    <span className="lesson-nav-link__content">
                                        <span className="lesson-nav-link__title">{item.title}</span>
                                        <span className="lesson-nav-link__meta">
                                            <span>{isTheory ? 'Bài giảng lý thuyết' : 'Bài tập thực hành'}</span>
                                            {isTheory && durationLabel && <span>• {durationLabel}</span>}
                                            {item.isCompleted ? (
                                                <span className="lesson-nav-link__done">• Đã hoàn thành</span>
                                            ) : (
                                                isTheory &&
                                                item.watchPercent > 0 && (
                                                    <span className="lesson-nav-link__pct">• Đã xem {item.watchPercent}%</span>
                                                )
                                            )}
                                        </span>
                                    </span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </div>

            {/* Chỉ hiển thị thẻ bài kiểm tra vượt ải khi mô-đun nằm trong lộ trình chính */}
            {inRoadmap && (
                <div className={`lesson-test-card ${moduleTestUnlocked ? 'is-unlocked' : 'is-locked'}`}>
                    <div className="lesson-test-card__head">
                        <span className="lesson-test-card__icon" aria-hidden="true">
                            {moduleTestUnlocked ? <Award size={20} /> : <Lock size={18} />}
                        </span>
                        <div>
                            <h3 className="lesson-test-card__title">Bài kiểm tra vượt ải</h3>
                            <p className="lesson-test-card__desc">
                                {moduleTestUnlocked
                                    ? 'Bạn đã hoàn thành đủ bài giảng yêu cầu và có thể làm bài kiểm tra để mở mô-đun kế tiếp.'
                                    : `Hoàn thành tối thiểu ${requiredCompletionRate}% bài giảng lý thuyết để mở khóa bài kiểm tra này.`}
                            </p>
                        </div>
                    </div>

                    {/* Chỉ cho phép bấm vào phòng thi khi đã đạt ngưỡng hoàn thành */}
                    {moduleTestUnlocked ? (
                        <Link to={`/modules/${moduleId}/test`} className="lesson-test-card__btn">
                            Làm bài kiểm tra vượt ải
                        </Link>
                    ) : (
                        <button type="button" className="lesson-test-card__btn is-disabled" disabled>
                            Chưa mở khóa ({safeProgress}% / {requiredCompletionRate}%)
                        </button>
                    )}
                </div>
            )}
        </aside>
    );
}
