import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
    AlertCircle,
    Compass,
    RotateCcw,
    Target,
    Filter,
    Award,
    CheckCircle2,
    ArrowRight,
} from 'lucide-react';
import { SidebarNav } from '../components/SidebarNav';
import { ModuleTimelineItem } from '../components/ModuleTimelineItem';
import { RoadmapSkeleton } from '../components/RoadmapSkeleton';
import { useRoadmap } from '../hooks/useRoadmap';
import type { ModuleStatus, SectionType } from '../types/roadmapTypes';
import '../roadmap.css';

// Kiểu giá trị bộ lọc kỹ năng (Tất cả / Nghe hiểu / Đọc hiểu)
type SectionFilter = 'ALL' | SectionType;

// Kiểu giá trị bộ lọc trạng thái mô-đun
type StatusFilter = 'ALL' | ModuleStatus;

// Danh sách tùy chọn lọc theo kỹ năng khai báo ngoài component để tránh tạo lại mảng mỗi lần render
const SECTION_FILTER_OPTIONS: ReadonlyArray<{ value: SectionFilter; label: string }> = [
    { value: 'ALL', label: 'Tất cả' },
    { value: 'LISTENING', label: 'Nghe hiểu' },
    { value: 'READING', label: 'Đọc hiểu' },
];

// Danh sách tùy chọn lọc theo trạng thái hoàn thành mô-đun
const STATUS_FILTER_OPTIONS: ReadonlyArray<{ value: StatusFilter; label: string }> = [
    { value: 'ALL', label: 'Tất cả' },
    { value: 'IN_PROGRESS', label: 'Đang học' },
    { value: 'COMPLETED', label: 'Đã hoàn thành' },
    { value: 'LOCKED', label: 'Chưa mở khóa' },
];

/**
 * Trang Lộ trình học cá nhân hóa thích ứng của học viên.
 * Hiển thị toàn cảnh các chặng học theo đúng thứ tự sư phạm, xử lý đầy đủ 4 trạng thái giao diện
 * cùng kịch bản đạt chuẩn toàn bộ 7 phần thi ngay từ bài đánh giá đầu vào.
 */
export default function LearningPathPage() {
    // Gọi custom hook để lấy dữ liệu lộ trình, cờ đang tải, thông báo lỗi và hàm tải lại
    const { data, isLoading, error, refetch } = useRoadmap();
    // Đọc và ghi bộ lọc lên URL Search Params để giữ nguyên trạng thái khi tải lại trang
    const [searchParams, setSearchParams] = useSearchParams();

    // Đọc giá trị bộ lọc kỹ năng và trạng thái hiện tại trên URL (mặc định là ALL)
    const sectionParam = (searchParams.get('section') as SectionFilter) || 'ALL';
    const statusParam = (searchParams.get('status') as StatusFilter) || 'ALL';

    // Cập nhật bộ lọc trên URL và xóa tham số khi chọn lại "Tất cả" để đường dẫn gọn gàng
    const handleFilterChange = (key: 'section' | 'status', value: string) => {
        setSearchParams((prev) => {
            // Tạo bản sao URLSearchParams trước khi chỉnh sửa để không mutate tham chiếu cũ
            const next = new URLSearchParams(prev);
            if (value === 'ALL') {
                next.delete(key);
            } else {
                next.set(key, value);
            }
            return next;
        });
    };

    // Xóa toàn bộ bộ lọc đang áp dụng để hiển thị lại đầy đủ lộ trình
    const handleResetFilters = () => {
        setSearchParams({});
    };

    // Tối ưu: Dùng useMemo chỉ lọc lại danh sách mô-đun khi dữ liệu hoặc bộ lọc thực sự thay đổi
    const filteredModules = useMemo(() => {
        // Nếu chưa có danh sách mô-đun -> trả về mảng rỗng an toàn
        if (!data?.modules) return [];
        // Lọc mô-đun khớp đồng thời kỹ năng và trạng thái đang chọn
        return data.modules.filter((m) => {
            const matchSection = sectionParam === 'ALL' || m.section === sectionParam;
            const matchStatus = statusParam === 'ALL' || m.status === statusParam;
            return matchSection && matchStatus;
        });
    }, [data, sectionParam, statusParam]);

    // Trạng thái 1 (Loading): Hiển thị Skeleton khớp bố cục thật thay cho spinner quay tròn
    if (isLoading) {
        return (
            <div className="app-layout">
                <SidebarNav />
                <main className="roadmap-main">
                    <RoadmapSkeleton variant="roadmap" />
                </main>
            </div>
        );
    }

    // Trạng thái 2 (Error): Lỗi kết nối hoặc máy chủ -> hiển thị thông báo kèm nút Thử lại
    if (error) {
        return (
            <div className="app-layout">
                <SidebarNav />
                <main className="roadmap-main">
                    <div className="roadmap-state-card">
                        <AlertCircle size={48} className="roadmap-state-card__icon is-error" />
                        <h2 className="roadmap-state-card__title">Không thể tải lộ trình học</h2>
                        <p className="roadmap-state-card__desc">{error}</p>
                        <button type="button" className="roadmap-btn-primary" onClick={refetch}>
                            <RotateCcw size={16} />
                            <span>Thử lại</span>
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    // Trạng thái 3 (Empty): Học viên chưa thiết lập mục tiêu hoặc chưa làm bài đánh giá đầu vào
    if (!data) {
        return (
            <div className="app-layout">
                <SidebarNav />
                <main className="roadmap-main">
                    <div className="roadmap-state-card">
                        <Compass size={52} className="roadmap-state-card__icon is-empty" />
                        <h2 className="roadmap-state-card__title">Bạn chưa có lộ trình học cá nhân</h2>
                        <p className="roadmap-state-card__desc">
                            Hãy chọn mục tiêu điểm TOEIC và hoàn thành bài đánh giá đầu vào để hệ thống xây dựng
                            lộ trình ôn luyện phù hợp nhất với trình độ của bạn.
                        </p>
                        <div className="roadmap-state-card__actions">
                            <Link to="/diagnostic/room" className="roadmap-btn-primary">
                                <Compass size={16} />
                                <span>Làm bài đánh giá đầu vào</span>
                            </Link>
                            <Link to="/target-selection" className="roadmap-btn-secondary">
                                <Target size={16} />
                                <span>Thiết lập mục tiêu</span>
                            </Link>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    // Kiểm tra trường hợp học viên đạt chuẩn toàn bộ 7 phần thi ngay ở bài đánh giá đầu vào
    const isPassedAllParts =
        Boolean(data.isPassedAllParts) || (data.status === 'COMPLETED' && data.modules.length === 0);

    // Nếu đã đạt chuẩn mục tiêu ngay từ đầu -> hiển thị màn hình chúc mừng và mở lối sang bài thi thử đầu ra
    if (isPassedAllParts) {
        return (
            <div className="app-layout">
                <SidebarNav />
                <main className="roadmap-main">
                    <div className="roadmap-celebration-card">
                        <div className="roadmap-celebration-card__icon-wrap">
                            <Award size={44} />
                        </div>
                        <span className="roadmap-celebration-card__badge">
                            Đạt chuẩn mục tiêu {data.targetScore} điểm
                        </span>
                        <h1 className="roadmap-celebration-card__title">
                            Chúc mừng! Trình độ của bạn đã đạt chuẩn mục tiêu
                        </h1>
                        <p className="roadmap-celebration-card__desc">
                            Kết quả đánh giá cho thấy bạn đã vững toàn bộ các kỹ năng cho mục tiêu{' '}
                            <strong>{data.targetScore} điểm TOEIC</strong>. Bạn có thể tham gia bài thi thử TOEIC
                            200 câu để kiểm chứng kết quả đầu ra hoặc nâng mốc mục tiêu cao hơn.
                        </p>
                        <div className="roadmap-state-card__actions">
                            <Link to="/diagnostic/room" className="roadmap-btn-primary">
                                <span>Làm bài thi thử TOEIC 200 câu</span>
                                <ArrowRight size={16} />
                            </Link>
                            <Link to="/target-selection" className="roadmap-btn-secondary">
                                <Target size={16} />
                                <span>Nâng mốc mục tiêu cao hơn</span>
                            </Link>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    // Xác định người dùng có đang áp dụng bộ lọc hay không để hiện nút Xóa bộ lọc khi cần
    const isFiltered = sectionParam !== 'ALL' || statusParam !== 'ALL';
    // Kiểm tra học viên đã hoàn thành 100% toàn bộ các mô-đun trên lộ trình hay chưa
    const isRoadmapCompleted = data.status === 'COMPLETED' && data.totalModules > 0;

    return (
        <div className="app-layout">
            <SidebarNav />

            <main className="roadmap-main">
                <div className="roadmap-container">
                    {/* Header tổng quan mục tiêu và thanh tiến độ toàn lộ trình */}
                    <header className="roadmap-header">
                        <div className="roadmap-header__left">
                            <div className="roadmap-header__eyebrow">
                                <span>LỘ TRÌNH CÁ NHÂN HÓA • PHIÊN BẢN #{data.version}</span>
                            </div>
                            <h1 className="roadmap-header__title">Lộ trình học dành riêng cho bạn</h1>
                            <p className="roadmap-header__desc">
                                Gồm {data.totalModules} mô-đun trọng tâm giúp bạn chinh phục mục tiêu{' '}
                                {data.targetScore} điểm TOEIC.
                            </p>
                        </div>

                        <div className="roadmap-header__right">
                            {/* Thẻ hiển thị mốc điểm mục tiêu hiện tại */}
                            <div className="roadmap-header__aim-badge">
                                <span className="roadmap-header__aim-label">MỤC TIÊU</span>
                                <span className="roadmap-header__aim-val">{data.targetScore} điểm</span>
                            </div>

                            {/* Thanh tiến độ tổng thể của toàn bộ lộ trình */}
                            <div className="roadmap-header__progress-box">
                                <div className="roadmap-header__progress-text">
                                    <span>
                                        HOÀN THÀNH {data.completedModules}/{data.totalModules} MÔ-ĐUN
                                    </span>
                                    <strong>{data.progressPercent}%</strong>
                                </div>
                                <div className="roadmap-header__progress-track">
                                    <div
                                        className="roadmap-header__progress-fill"
                                        style={{ width: `${data.progressPercent}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Banner chúc mừng khi học viên đã hoàn thành xuất sắc 100% lộ trình học */}
                    {isRoadmapCompleted && (
                        <section className="roadmap-completed-banner" aria-label="Hoàn thành lộ trình">
                            <div className="roadmap-completed-banner__left">
                                <CheckCircle2 size={24} className="roadmap-completed-banner__icon" />
                                <div>
                                    <h2 className="roadmap-completed-banner__title">
                                        Bạn đã hoàn thành toàn bộ lộ trình học!
                                    </h2>
                                    <p className="roadmap-completed-banner__desc">
                                        Bài thi thử TOEIC 200 câu đã sẵn sàng để bạn kiểm chứng năng lực đầu ra.
                                    </p>
                                </div>
                            </div>
                            <Link to="/target-selection" className="roadmap-btn-secondary">
                                <Target size={16} />
                                <span>Đổi mục tiêu mới</span>
                            </Link>
                        </section>
                    )}

                    {/* Thanh bộ lọc theo kỹ năng và trạng thái đồng bộ với URL */}
                    <section className="roadmap-filter-bar" aria-label="Bộ lọc lộ trình">
                        <div className="roadmap-filter-group">
                            <span className="roadmap-filter-group__label">
                                <Filter size={14} />
                                <span>Kỹ năng:</span>
                            </span>
                            {/* Lặp render các nút lọc kỹ năng */}
                            {SECTION_FILTER_OPTIONS.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    className={`roadmap-filter-chip ${sectionParam === option.value ? 'is-active' : ''}`}
                                    onClick={() => handleFilterChange('section', option.value)}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>

                        <div className="roadmap-filter-group">
                            <span className="roadmap-filter-group__label">Trạng thái:</span>
                            {/* Lặp render các nút lọc trạng thái mô-đun */}
                            {STATUS_FILTER_OPTIONS.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    className={`roadmap-filter-chip ${statusParam === option.value ? 'is-active' : ''}`}
                                    onClick={() => handleFilterChange('status', option.value)}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Dòng thời gian danh sách các mô-đun sau khi áp dụng bộ lọc */}
                    {filteredModules.length > 0 ? (
                        <div className="roadmap-timeline">
                            {filteredModules.map((moduleItem, index) => (
                                <ModuleTimelineItem
                                    key={moduleItem.id}
                                    item={moduleItem}
                                    isLast={index === filteredModules.length - 1}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="roadmap-state-card is-compact">
                            <p className="roadmap-state-card__desc">
                                Không có mô-đun nào khớp với bộ lọc hiện tại.
                            </p>
                            {/* Hiện nút đặt lại bộ lọc nếu người dùng đang lọc */}
                            {isFiltered && (
                                <button
                                    type="button"
                                    className="roadmap-btn-secondary"
                                    onClick={handleResetFilters}
                                >
                                    Xóa bộ lọc
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
