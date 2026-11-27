/**
 * Props xác định bố cục khung xương (Skeleton Loader) tương ứng với từng màn hình.
 */
interface RoadmapSkeletonProps {
    // Biến thể giao diện: 'roadmap' cho trang Lộ trình hoặc 'module-detail' cho trang Chi tiết Module
    variant: 'roadmap' | 'module-detail';
}

// Danh sách khóa tĩnh dùng để render số lượng thẻ giả lập cố định mà không tạo mảng mới mỗi lần render
const ROADMAP_PLACEHOLDER_ITEMS = [1, 2, 3];
const LESSON_PLACEHOLDER_ITEMS = [1, 2, 3, 4];

/**
 * Khung tải Skeleton đồng bộ hình dáng thực tế của trang Lộ trình học và Chi tiết Module,
 * giúp giảm cảm giác chờ và tránh giật bố cục khi dữ liệu thật trả về.
 *
 * @param props Chứa biến thể hiển thị ('roadmap' | 'module-detail')
 */
export function RoadmapSkeleton({ variant }: RoadmapSkeletonProps) {
    // Nếu đang ở trang Chi tiết Module -> hiển thị bộ khung Hero Card + danh sách bài học + khối bài thi
    if (variant === 'module-detail') {
        return (
            <div className="module-detail-container" aria-busy="true" aria-label="Đang tải chi tiết mô-đun">
                {/* Khung giả lập cho phần đầu Hero tối màu của mô-đun */}
                <div className="roadmap-skeleton-hero">
                    <div className="roadmap-skeleton-line is-dark is-short" />
                    <div className="roadmap-skeleton-line is-dark is-title" />
                    <div className="roadmap-skeleton-line is-dark is-medium" />
                    <div className="roadmap-skeleton-bar is-dark" />
                </div>

                {/* Khung giả lập cho nhóm tiêu đề và danh sách bài học */}
                <div className="roadmap-skeleton-section">
                    <div className="roadmap-skeleton-line is-section-title" />
                    <div className="roadmap-skeleton-list">
                        {/* Lặp tạo 4 thẻ bài học giả lập */}
                        {LESSON_PLACEHOLDER_ITEMS.map((item) => (
                            <div key={item} className="roadmap-skeleton-lesson-row">
                                <div className="roadmap-skeleton-icon" />
                                <div className="roadmap-skeleton-col">
                                    <div className="roadmap-skeleton-line is-medium" />
                                    <div className="roadmap-skeleton-line is-short" />
                                </div>
                                <div className="roadmap-skeleton-pill" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Mặc định hiển thị khung giả lập cho trang Lộ trình học (Header + Filter Bar + Timeline)
    return (
        <div className="roadmap-container" aria-busy="true" aria-label="Đang tải lộ trình học">
            {/* Khung giả lập cho thẻ Header tổng quan lộ trình */}
            <div className="roadmap-skeleton-card is-header">
                <div className="roadmap-skeleton-col">
                    <div className="roadmap-skeleton-line is-short" />
                    <div className="roadmap-skeleton-line is-title" />
                    <div className="roadmap-skeleton-line is-medium" />
                </div>
                <div className="roadmap-skeleton-stats">
                    <div className="roadmap-skeleton-badge" />
                    <div className="roadmap-skeleton-bar" />
                </div>
            </div>

            {/* Khung giả lập cho thanh bộ lọc kỹ năng và trạng thái */}
            <div className="roadmap-skeleton-card is-filter">
                <div className="roadmap-skeleton-pill" />
                <div className="roadmap-skeleton-pill" />
                <div className="roadmap-skeleton-pill" />
                <div className="roadmap-skeleton-pill" />
            </div>

            {/* Khung giả lập cho 3 chặng mô-đun trên dòng thời gian */}
            <div className="roadmap-skeleton-list">
                {ROADMAP_PLACEHOLDER_ITEMS.map((item) => (
                    <div key={item} className="roadmap-skeleton-timeline-row">
                        <div className="roadmap-skeleton-node" />
                        <div className="roadmap-skeleton-card is-timeline">
                            <div className="roadmap-skeleton-line is-short" />
                            <div className="roadmap-skeleton-line is-title" />
                            <div className="roadmap-skeleton-line is-medium" />
                            <div className="roadmap-skeleton-bar" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
