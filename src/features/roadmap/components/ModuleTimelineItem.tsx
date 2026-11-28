
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    BookOpen,
    Check,
    ChevronDown,
    ChevronUp,
    Clock,
    Compass,
    FileQuestion,
    Info,
    Lock,
    Play,
    Sparkles,
    Video,
} from 'lucide-react';
import type { ModuleItem } from '../types/roadmapTypes';
import type { CatalogAccessMode, CatalogLessonPreview } from '@/features/catalog/types/catalogTypes';

/**
 * Thông tin mở rộng tùy chọn khi tái sử dụng ModuleTimelineItem cho màn hình Thư viện khóa học 7 Part.
 * Không bắt buộc khi dùng tại trang Lộ trình học cá nhân (tương thích ngược 100%).
 */
export interface TimelineCatalogExtension {
    /** Chế độ truy cập của mô-đun trên Thư viện (Trọng tâm mở/khóa, Học tự do, Xem trước). */
    accessMode: CatalogAccessMode;
    /** Nhãn phân loại hiển thị gọn gàng trên hàng đầu (Trọng tâm cần học / Đã nắm vững • Học tự do...). */
    categoryLabel: string;
    /** Cờ xác định học viên có thể vào học trực tiếp mô-đun hay không. */
    canAccess: boolean;
    /** Lý do hiển thị khi mô-đun đang bị khóa quyền truy cập. */
    lockReason: string | null;
    /** Số lượng bài giảng lý thuyết trong mô-đun. */
    videoLessonCount: number;
    /** Số lượng bài tập thực hành trong mô-đun. */
    practiceLessonCount: number;
    /** Tổng thời lượng bài giảng lý thuyết (giây). */
    totalDurationSeconds: number;
    /** Danh sách bài học đề cương xem trước (xổ xuống trực tiếp trong thẻ). */
    lessonPreviews: CatalogLessonPreview[];
}

// Kiểu dữ liệu props nhận vào cho từng chặng mô-đun trên dòng thời gian
interface ModuleTimelineItemProps {
    // Dữ liệu chi tiết của một mô-đun trên lộ trình (hoặc mô-đun quy đổi từ Thư viện)
    item: ModuleItem;
    // Cờ xác định đây có phải mô-đun cuối cùng hay không để ẩn đoạn dây nối bên dưới
    isLast: boolean;
    // Dữ liệu mở rộng tùy chọn dành riêng cho Thư viện khóa học 7 Part (nếu có)
    catalogExt?: TimelineCatalogExtension;
}

/**
 * Chuyển đổi thời lượng tính bằng giây sang định dạng ngắn gọn dễ đọc.
 *
 * @param totalSeconds Tổng số giây cần định dạng
 * @returns Chuỗi thời lượng (VD: "12 phút" hoặc "05:30")
 */
function formatSecondsShort(totalSeconds: number, asClock = false): string {
    // Bỏ qua nếu chưa cập nhật thời lượng
    if (!totalSeconds || totalSeconds <= 0) {
        return '';
    }
    // Chế độ đồng hồ mm:ss cho từng dòng đề cương bài học
    if (asClock) {
        const mins = Math.floor(totalSeconds / 60);
        const secs = Math.floor(totalSeconds % 60);
        return `${mins}:${String(secs).padStart(2, '0')}`;
    }
    // Chế độ ước lượng tổng thời lượng của cả mô-đun
    const totalMinutes = Math.max(1, Math.round(totalSeconds / 60));
    if (totalMinutes < 60) {
        return `${totalMinutes} phút`;
    }
    const hours = Math.floor(totalMinutes / 60);
    const remainMinutes = totalMinutes % 60;
    return remainMinutes > 0 ? `${hours}g ${remainMinutes}p` : `${hours} giờ`;
}

/**
 * Thẻ hiển thị một mô-đun trên trục thời gian, dùng chung cho cả Lộ trình học cá nhân
 * và Thư viện khóa học 7 Part để bảo đảm giao diện đồng nhất và tái sử dụng tối đa mã nguồn.
 *
 * @param props Chứa dữ liệu mô-đun, cờ vị trí cuối danh sách và phần mở rộng Thư viện (nếu có)
 */
export function ModuleTimelineItem({ item, isLast, catalogExt }: ModuleTimelineItemProps) {
    // Trạng thái bật/tắt khung nhắc nhở khi học viên bấm vào một mô-đun đang bị khóa
    const [isLockNoticeVisible, setIsLockNoticeVisible] = useState<boolean>(false);
    // Trạng thái bật/tắt danh sách đề cương xem trước ngay bên trong thẻ (dùng cho Thư viện)
    const [isSyllabusExpanded, setIsSyllabusExpanded] = useState<boolean>(false);

    // Xác định các trạng thái chế độ Thư viện (nếu đang dùng ở trang Thư viện khóa học)
    const isFreeStudy = catalogExt?.accessMode === 'FREE_STUDY';
    const isPreviewOnly = catalogExt?.accessMode === 'PREVIEW_ONLY';

    // Tách 4 trạng thái tiến độ từ Backend để điều khiển màu sắc và nút thao tác
    const isCompleted = !isFreeStudy && !isPreviewOnly && item.status === 'COMPLETED';
    const isInProgress = !isFreeStudy && !isPreviewOnly && item.status === 'IN_PROGRESS';
    const isUnlocked = !isFreeStudy && !isPreviewOnly && item.status === 'UNLOCKED';
    const isLocked = catalogExt ? !catalogExt.canAccess : item.status === 'LOCKED';
    // Cả hai trạng thái đang học và vừa mở khóa đều nổi bật cho học viên bấm vào học ngay
    const isActive = isInProgress || isUnlocked;

    // Xử lý khi người dùng nhấn vào thẻ mô-đun chưa mở khóa
    const handleLockedInteraction = () => {
        // Bật hoặc tắt khung thông báo hướng dẫn ngay trong thẻ thay vì dùng hộp thoại trình duyệt
        setIsLockNoticeVisible((prev) => !prev);
    };

    // Hàm phụ hiển thị biểu tượng chấm tròn trên trục dọc Timeline theo trạng thái
    function renderNodeIndicator() {
        // Đã vượt ải hoàn thành -> chấm xanh lá kèm dấu tích
        if (isCompleted) {
            return (
                <div className="timeline-node is-completed" title="Đã hoàn thành">
                    <Check size={16} strokeWidth={3} />
                </div>
            );
        }
        // Chế độ Học tự do (ngoài lộ trình) -> chấm xanh ngọc mở tự do
        if (isFreeStudy) {
            return (
                <div className="timeline-node is-free-study" title="Học tự do">
                    <BookOpen size={14} />
                </div>
            );
        }
        // Đang mở khóa hoặc đang học -> chấm xanh nổi bật có vòng sáng
        if (isActive) {
            return (
                <div className="timeline-node is-active" title="Đang mở khóa">
                    <div className="timeline-node__inner" />
                </div>
            );
        }
        // Chưa mở khóa -> chấm xám kèm biểu tượng ổ khóa
        return (
            <div className="timeline-node is-locked" title="Chưa mở khóa">
                <Lock size={14} />
            </div>
        );
    }

    // Hiển thị trực tiếp tên năng lực (bỏ tiền tố "Trọng tâm:") để thẻ gọn gàng, không lặp từ
    const adaptiveReasonText = item.abilityName
        ? item.abilityName
        : item.reason || `Củng cố nền tảng ${item.partName}`;

    // Nhãn kỹ năng tiếng Việt thân thiện thay vì hiển thị enum kỹ thuật
    const sectionLabel = item.section === 'LISTENING' ? 'Nghe hiểu' : 'Đọc hiểu';

    // Xác định nội dung lý do khóa hiển thị khi bấm vào thẻ đang bị khóa
    const lockNoticeMessage =
        catalogExt?.lockReason ||
        'Mô-đun này chưa được mở khóa. Bạn cần vượt qua bài kiểm tra của mô-đun trước đó để tiếp tục học.';

    // Chuỗi tổng thời lượng hiển thị trên thẻ ở màn hình Thư viện (nếu có dữ liệu)
    const totalDurationText = catalogExt ? formatSecondsShort(catalogExt.totalDurationSeconds) : '';

    // Xác định thông báo kế thừa tiến độ từ lộ trình trước để hiển thị riêng, tránh bị tên năng lực che mất
    const inheritanceNote =
        !catalogExt &&
        item.reason &&
        (item.reason.includes('kế thừa') ||
            item.reason.includes('bảo lưu') ||
            item.reason.includes('Đã hoàn thành toàn bộ bài giảng'))
            ? item.reason
            : null;

    // Lớp màu của badge trạng thái bên góc phải thẻ
    const badgeClassName = isFreeStudy
        ? 'is-free-study'
        : isPreviewOnly
          ? 'is-locked'
          : `is-${item.status.toLowerCase()}`;

    return (
        <div className={`timeline-row ${isLast ? 'is-last' : ''}`}>
            {/* Cột trục dọc Timeline và dây nối xuống chặng tiếp theo */}
            <div className="timeline-spine">
                {renderNodeIndicator()}
                {/* Chỉ vẽ dây nối nếu chưa phải mô-đun cuối cùng */}
                {!isLast && <div className={`timeline-line ${isCompleted ? 'is-completed' : ''}`} />}
            </div>

            {/* Thẻ thông tin mô-đun (giữ nguyên khung thẻ chuẩn của trang Lộ trình) */}
            <div
                className={`timeline-card ${isActive ? 'is-active' : ''} ${isFreeStudy ? 'is-free-study' : ''} ${isLocked ? 'is-locked is-clickable-locked' : ''}`}
                onClick={isLocked ? handleLockedInteraction : undefined}
            >
                {/* Hàng thẻ phân loại: thứ tự chặng/phân loại Thư viện, phần thi TOEIC và kỹ năng trọng tâm */}
                <div className="timeline-card__meta-row">
                    {/* Nếu là Thư viện thì hiển thị nhãn phân loại (Trọng tâm cần học / Học tự do / Xem trước) */}
                    {catalogExt ? (
                        <span
                            className={`timeline-card__order ${
                                isFreeStudy
                                    ? 'is-free-study'
                                    : isPreviewOnly
                                      ? 'is-preview-only'
                                      : 'is-roadmap-focus'
                            }`}
                        >
                            {catalogExt.categoryLabel}
                            {item.orderNo > 0 ? ` • Chặng #${item.orderNo}` : ''}
                        </span>
                    ) : (
                        <span className="timeline-card__order">Chặng #{item.orderNo}</span>
                    )}

                    <span className="timeline-card__part-tag">
                        {item.partName} • {sectionLabel}
                    </span>

                    <span
                        className="timeline-card__ability-tag"
                        title="Kỹ năng trọng tâm của mô-đun"
                    >
                        <Sparkles size={12} />
                        <span>{adaptiveReasonText}</span>
                    </span>
                </div>

                {/* Phần tiêu đề mô-đun, mô tả mục tiêu và nhãn trạng thái */}
                <div className="timeline-card__header">
                    <div className="timeline-card__titles">
                        <h3 className="timeline-card__title">{item.title}</h3>
                        <p className="timeline-card__desc">{item.description}</p>
                        {/* Hiển thị dòng ghi chú kế thừa tiến độ hoặc yêu cầu thi vượt ải theo mục tiêu mới */}
                        {inheritanceNote && (
                            <p className="timeline-card__inheritance-note">
                                <Info size={13} aria-hidden="true" />
                                <span>{inheritanceNote}</span>
                            </p>
                        )}
                    </div>

                    <span className={`timeline-card__badge ${badgeClassName}`}>{item.statusLabel}</span>
                </div>

                {/* Phần chân thẻ: thống kê bài học, thanh tiến độ và cụm nút hành động */}
                <div className="timeline-card__footer">
                    <div className="timeline-card__progress-wrap">
                        {/* Số bài học đã hoàn thành trên tổng số bài học */}
                        <div className="timeline-card__lessons-count">
                            <BookOpen size={14} />
                            <span>
                                {isPreviewOnly
                                    ? `${item.totalLessons} bài học`
                                    : `${item.completedLessons}/${item.totalLessons} bài học`}
                            </span>
                        </div>

                        {/* Hiển thị thêm số bài giảng / thực hành / thời lượng khi ở chế độ Thư viện */}
                        {catalogExt && (
                            <div className="catalog-inline-metrics">
                                <span className="catalog-inline-metric">
                                    <Video size={13} />
                                    <span>{catalogExt.videoLessonCount} bài giảng</span>
                                </span>
                                <span className="catalog-inline-metric">
                                    <FileQuestion size={13} />
                                    <span>{catalogExt.practiceLessonCount} thực hành</span>
                                </span>
                                {totalDurationText && (
                                    <span className="catalog-inline-metric">
                                        <Clock size={13} />
                                        <span>{totalDurationText}</span>
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Thanh tiến độ trực quan (ẩn khi ở chế độ xem trước chưa thi chẩn đoán) */}
                        {!isPreviewOnly && (
                            <>
                                <div className="timeline-card__bar-track">
                                    <div
                                        className={`timeline-card__bar-fill ${isFreeStudy ? 'is-free-study' : ''}`}
                                        style={{ width: `${item.progressPercent}%` }}
                                    />
                                </div>

                                {/* Chỉ hiện phần trăm khi tiến độ lớn hơn 0 */}
                                {item.progressPercent > 0 && (
                                    <span className="timeline-card__percent">{item.progressPercent}%</span>
                                )}
                            </>
                        )}
                    </div>

                    {/* Cụm nút hành động bên phải chân thẻ */}
                    <div className="timeline-card__actions">
                        {/* Nút bật/tắt xem trước đề cương ngay trong thẻ khi dùng trên Thư viện */}
                        {catalogExt && catalogExt.lessonPreviews.length > 0 && (
                            <button
                                type="button"
                                className="timeline-card__syllabus-btn"
                                onClick={(event) => {
                                    // Ngăn sự kiện click lan lên thẻ cha đang bị khóa
                                    event.stopPropagation();
                                    setIsSyllabusExpanded((prev) => !prev);
                                }}
                                aria-expanded={isSyllabusExpanded}
                            >
                                <span>{isSyllabusExpanded ? 'Ẩn đề cương' : 'Xem đề cương'}</span>
                                {isSyllabusExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                        )}

                        {/* Nút Học tự do cho mô-đun ngoài lộ trình trên Thư viện */}
                        {isFreeStudy && (
                            <Link
                                to={`/modules/${item.id}`}
                                className="timeline-card__action-btn is-free-study"
                            >
                                <Play size={14} />
                                <span>Học tự do</span>
                            </Link>
                        )}

                        {/* Nút Học tiếp ngay cho mô-đun đang học dở */}
                        {isInProgress && (
                            <Link to={`/modules/${item.id}`} className="timeline-card__action-btn">
                                <Play size={14} />
                                <span>Học tiếp ngay</span>
                            </Link>
                        )}

                        {/* Nút Bắt đầu học cho mô-đun vừa mở khóa */}
                        {isUnlocked && (
                            <Link to={`/modules/${item.id}`} className="timeline-card__action-btn">
                                <Play size={14} />
                                <span>Bắt đầu học</span>
                            </Link>
                        )}

                        {/* Nút Xem lại bài học cho mô-đun đã hoàn thành */}
                        {isCompleted && (
                            <Link to={`/modules/${item.id}`} className="timeline-card__action-btn is-review">
                                Xem lại bài học
                            </Link>
                        )}
                    </div>
                </div>

                {/* Danh sách đề cương xem trước xổ xuống mượt mà ngay bên trong thẻ (dùng cho Thư viện) */}
                {catalogExt && isSyllabusExpanded && catalogExt.lessonPreviews.length > 0 && (
                    <div
                        className="catalog-inline-syllabus"
                        onClick={(event) => {
                            // Không để click vào vùng đề cương làm bật/tắt thông báo khóa của thẻ cha
                            event.stopPropagation();
                        }}
                    >
                        <div className="catalog-inline-syllabus__title">
                            Đề cương nội dung ({catalogExt.lessonPreviews.length} bài học)
                        </div>
                        <ol className="catalog-inline-syllabus__list">
                            {catalogExt.lessonPreviews.map((lesson) => {
                                // Xác định loại bài học là lý thuyết hay thực hành
                                const isTheory = lesson.type === 'VIDEO';
                                // Định dạng thời lượng mm:ss nếu có
                                const durationClock = formatSecondsShort(lesson.durationSeconds, true);

                                return (
                                    <li key={lesson.id} className="catalog-inline-syllabus__item">
                                        <span className="catalog-inline-syllabus__left">
                                            {isTheory ? <Video size={14} /> : <BookOpen size={14} />}
                                            <span className="catalog-inline-syllabus__name">
                                                {lesson.orderNo}. {lesson.title}
                                            </span>
                                        </span>
                                        <span className="catalog-inline-syllabus__right">
                                            <span>{isTheory ? 'Bài giảng' : 'Thực hành'}</span>
                                            {isTheory && durationClock && <span>• {durationClock}</span>}
                                            {isLocked && <Lock size={12} aria-hidden="true" />}
                                        </span>
                                    </li>
                                );
                            })}
                        </ol>
                    </div>
                )}

                {/* Khung thông báo thân thiện khi học viên bấm vào mô-đun đang khóa */}
                {isLocked && isLockNoticeVisible && (
                    <div
                        className="timeline-card__lock-notice"
                        role="status"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <Info size={16} className="timeline-card__lock-notice-icon" />
                        <span>{lockNoticeMessage}</span>
                        {isPreviewOnly && (
                            <Link to="/diagnostic/room" className="catalog-inline-lock-cta">
                                <Compass size={14} />
                                <span>Làm đánh giá đầu vào</span>
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
