import { Link } from 'react-router-dom';
import {
    AlertTriangle,
    ArrowRight,
    CheckCircle2,
    Clock,
    Compass,
    HelpCircle,
    Play,
    PlayCircle,
    ShieldCheck,
} from 'lucide-react';
import type { DashboardCurrentModule, DashboardLessonItem } from '../types/dashboardTypes';

// Kiểu props nhận vào của khối làm nổi bật mô-đun đang học tiếp theo
interface CurrentModuleFocusCardProps {
    module: DashboardCurrentModule;
}

/**
 * Định dạng thời lượng bài giảng từ giây sang chuỗi thân thiện (ví dụ: 12 phút).
 *
 * @param seconds Thời lượng bài học tính bằng giây
 * @returns Chuỗi hiển thị ngắn gọn cho người học
 */
function formatLessonDuration(seconds: number): string {
    // Nếu chưa khai báo thời lượng -> hiển thị nhãn mặc định ngắn gọn
    if (!seconds || seconds <= 0) {
        return 'Video bài giảng';
    }
    // Quy đổi sang số phút tối thiểu là 1 phút để không hiển thị 0 phút
    const minutes = Math.max(1, Math.round(seconds / 60));
    return `${minutes} phút`;
}

/**
 * Tạo đường dẫn phòng học chuẩn theo loại bài học:
 * - Bài luyện tập đi vào phòng Practice (/modules/:moduleId/lessons/:lessonId/practice)
 * - Bài giảng lý thuyết đi vào phòng Video (/modules/:moduleId/lessons/:lessonId)
 *
 * @param moduleId ID mô-đun hiện tại
 * @param lessonId ID bài học cần mở
 * @param lessonType Loại bài học (VIDEO hoặc PRACTICE)
 * @returns Đường dẫn điều hướng nội bộ
 */
function buildLessonPath(
    moduleId: number,
    lessonId: number,
    lessonType: DashboardLessonItem['type']
): string {
    // Nếu là bài thực hành -> dẫn sang màn hình luyện tập tức thì
    if (lessonType === 'PRACTICE') {
        return `/modules/${moduleId}/lessons/${lessonId}/practice`;
    }
    // Ngược lại dẫn sang phòng xem bài giảng Video
    return `/modules/${moduleId}/lessons/${lessonId}`;
}

/**
 * Khối trung tâm Dashboard: làm nổi bật mô-đun đang mở khóa hiện tại trên lộ trình,
 * danh sách bài giảng / bài luyện tập cần hoàn thành và nút Tiếp tục bài học trực tiếp.
 * Đồng thời xử lý trạng thái bảo trì học liệu khi mô-đun đang được cập nhật.
 */
export function CurrentModuleFocusCard({ module }: CurrentModuleFocusCardProps) {
    // Xác định trạng thái khóa nút hành động khi mô-đun đang tạm bảo trì học liệu
    const isMaintenance = Boolean(module.isUnderMaintenance);
    // Kiểm tra xem mô-đun đã hoàn thành toàn bộ bài học hiển thị và đã mở bài kiểm tra vượt ải chưa
    const isAllLessonsCompleted =
        module.totalLessons > 0 && module.completedLessons >= module.totalLessons;
    // Xác định đường dẫn chính cho nút hành động nổi bật nhất
    const primaryActionPath =
        !isMaintenance && module.moduleId !== null
            ? isAllLessonsCompleted && module.isModuleTestUnlocked
                ? `/modules/${module.moduleId}/test`
                : module.continueLessonId !== null && module.continueLessonType !== null
                  ? buildLessonPath(module.moduleId, module.continueLessonId, module.continueLessonType)
                  : `/modules/${module.moduleId}`
            : null;
    // Xác định nhãn tự nhiên cho nút hành động chính
    const primaryActionLabel =
        isAllLessonsCompleted && module.isModuleTestUnlocked
            ? 'Làm bài kiểm tra vượt ải'
            : module.continueLessonId !== null
              ? 'Tiếp tục bài học'
              : 'Mở mô-đun học ngay';

    return (
        <section className={`db-card db-focus-card ${isMaintenance ? 'is-maintenance' : ''}`}>
            {/* Hàng đầu: Nhãn chặng học, phần thi và tiến độ hoàn thành mô-đun */}
            <div className="db-focus-card__top">
                <div className="db-focus-card__badges">
                    <span className="db-focus-card__step-badge">Chặng #{module.orderNo} • Đang học</span>
                    {module.partName && <span className="db-focus-card__part-badge">{module.partName}</span>}
                    {module.abilityName && (
                        <span className="db-focus-card__ability-badge">{module.abilityName}</span>
                    )}
                </div>

                {/* Chỉ số tiến độ % nổi bật góc phải */}
                <span className="db-focus-card__percent">{module.progressPercent}%</span>
            </div>

            {/* Tiêu đề mô-đun và lời giải thích lý do trọng tâm */}
            <h2 className="db-focus-card__title">{module.title}</h2>
            {(module.reason || module.description) && (
                <p className="db-focus-card__desc">{module.reason || module.description}</p>
            )}

            {/* Thanh tiến độ tổng quan của riêng mô-đun hiện tại */}
            <div className="db-focus-card__progress-wrap">
                <div className="db-focus-card__progress-track">
                    <div
                        className="db-focus-card__progress-fill"
                        style={{ width: `${module.progressPercent}%` }}
                    />
                </div>
                <div className="db-focus-card__progress-meta">
                    <span>
                        Đã hoàn thành <strong>{module.completedLessons}</strong> / {module.totalLessons} bài học
                    </span>
                    <span>
                        {module.isModuleTestUnlocked
                            ? 'Đã đủ điều kiện thi vượt ải'
                            : `Cần đạt ${module.requiredCompletionRate}% bài giảng để mở bài thi vượt ải`}
                    </span>
                </div>
            </div>

            {/* Nếu mô-đun đang tạm khóa bảo trì học liệu -> hiển thị thông báo rõ ràng thay cho danh sách bài */}
            {isMaintenance ? (
                <div className="db-maintenance-box" role="status">
                    <AlertTriangle size={20} className="db-maintenance-box__icon" />
                    <div>
                        <strong className="db-maintenance-box__title">Mô-đun đang bảo trì học liệu</strong>
                        <p className="db-maintenance-box__desc">
                            {module.maintenanceMessage ||
                                'Mô-đun này đang được cập nhật học liệu. Bạn vui lòng quay lại sau hoặc xem các bài giảng khác.'}
                        </p>
                    </div>
                </div>
            ) : (
                <>
                    {/* Danh mục bài giảng video & bài luyện tập gần nhất cần hoàn thành */}
                    <div className="db-focus-lessons">
                        <div className="db-focus-lessons__head">
                            <span className="db-focus-lessons__label">Bài học cần hoàn thành tiếp theo</span>
                            {module.moduleId !== null && (
                                <Link to={`/modules/${module.moduleId}`} className="db-inline-link">
                                    Xem tất cả bài học
                                </Link>
                            )}
                        </div>

                        {module.upcomingLessons.length === 0 ? (
                            <div className="db-empty-inline">
                                Học liệu của mô-đun đang được hoàn thiện. Bạn có thể xem chi tiết mô-đun hoặc khám phá
                                thư viện khóa học.
                            </div>
                        ) : (
                            <div className="db-focus-lessons__list">
                                {module.upcomingLessons.map((lesson) => {
                                    // Phân biệt loại bài tập thực hành và bài giảng lý thuyết để hiển thị đúng biểu tượng
                                    const isPractice = lesson.type === 'PRACTICE';
                                    // Tính đường dẫn nhảy thẳng vào đúng phòng học của bài đó
                                    const lessonUrl =
                                        module.moduleId !== null
                                            ? buildLessonPath(module.moduleId, lesson.id, lesson.type)
                                            : '/learning-path';

                                    return (
                                        <Link
                                            key={lesson.id}
                                            to={lessonUrl}
                                            className={`db-focus-lesson-row ${lesson.isCompleted ? 'is-completed' : ''} ${lesson.isNextRecommended ? 'is-recommended' : ''}`}
                                        >
                                            {/* Biểu tượng trạng thái hoàn thành hoặc loại bài học */}
                                            <span className="db-focus-lesson-row__icon">
                                                {lesson.isCompleted ? (
                                                    <CheckCircle2 size={18} />
                                                ) : isPractice ? (
                                                    <HelpCircle size={18} />
                                                ) : (
                                                    <PlayCircle size={18} />
                                                )}
                                            </span>

                                            {/* Tiêu đề bài học và metadata thời lượng / số câu hỏi */}
                                            <div className="db-focus-lesson-row__info">
                                                <span className="db-focus-lesson-row__title">
                                                    {lesson.orderNo}. {lesson.title}
                                                </span>
                                                <span className="db-focus-lesson-row__meta">
                                                    <span>{isPractice ? 'Bài luyện tập' : 'Bài giảng'}</span>
                                                    <span aria-hidden="true">•</span>
                                                    {isPractice ? (
                                                        <span>
                                                            {lesson.questionCount > 0
                                                                ? `${lesson.questionCount} câu hỏi`
                                                                : 'Luyện tập kỹ năng'}
                                                        </span>
                                                    ) : (
                                                        <span className="db-focus-lesson-row__time">
                                                            <Clock size={12} />
                                                            {formatLessonDuration(lesson.durationSeconds)}
                                                        </span>
                                                    )}
                                                </span>
                                            </div>

                                            {/* Nhãn trạng thái gọn bên phải từng dòng bài học */}
                                            <span className="db-focus-lesson-row__status">
                                                {lesson.isCompleted
                                                    ? 'Đã xong'
                                                    : lesson.isNextRecommended
                                                      ? lesson.watchPercent > 0
                                                          ? `Tiếp tục (${lesson.watchPercent}%)`
                                                          : 'Học tiếp'
                                                      : lesson.watchPercent > 0
                                                        ? `${lesson.watchPercent}%`
                                                        : 'Chưa học'}
                                            </span>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Hàng nút hành động chính: Tiếp tục bài học & Xem chi tiết mô-đun / Làm bài vượt ải */}
                    <div className="db-focus-card__actions">
                        {primaryActionPath && (
                            <Link to={primaryActionPath} className="db-btn-primary">
                                {isAllLessonsCompleted && module.isModuleTestUnlocked ? (
                                    <ShieldCheck size={17} />
                                ) : (
                                    <Play size={16} />
                                )}
                                <span>{primaryActionLabel}</span>
                                <ArrowRight size={16} />
                            </Link>
                        )}

                        {module.moduleId !== null && (
                            <Link to={`/modules/${module.moduleId}`} className="db-btn-secondary">
                                <Compass size={16} />
                                <span>Chi tiết mô-đun</span>
                            </Link>
                        )}
                    </div>
                </>
            )}
        </section>
    );
}
