import { Link } from 'react-router-dom';
import {
    AlertCircle,
    BookOpen,
    Compass,
    Filter,
    Headphones,
    Layers,
    RotateCcw,
    Search,
    Sparkles,
    X,
} from 'lucide-react';
import { SidebarNav } from '@/features/roadmap/components/SidebarNav';
import { RoadmapSkeleton } from '@/features/roadmap/components/RoadmapSkeleton';
import {
    ModuleTimelineItem,
    type TimelineCatalogExtension,
} from '@/features/roadmap/components/ModuleTimelineItem';
import type { ModuleItem } from '@/features/roadmap/types/roadmapTypes';
import { useCourseCatalog, type CatalogStatusFilter } from '../hooks/useCourseCatalog';
import type {
    CatalogModuleItem,
    CatalogScopeFilter,
    CatalogSectionFilter,
} from '../types/catalogTypes';
import '@/features/roadmap/roadmap.css';
import '../catalog.css';

// Danh sách tùy chọn lọc theo kỹ năng (đồng nhất phong cách trang Lộ trình)
const SECTION_FILTER_OPTIONS: ReadonlyArray<{ value: CatalogSectionFilter; label: string }> = [
    { value: 'ALL', label: 'Tất cả' },
    { value: 'LISTENING', label: 'Nghe hiểu' },
    { value: 'READING', label: 'Đọc hiểu' },
];

// Danh sách tùy chọn lọc theo phạm vi đối chiếu với lộ trình cá nhân
const SCOPE_FILTER_OPTIONS: ReadonlyArray<{ value: CatalogScopeFilter; label: string }> = [
    { value: 'ALL', label: 'Tất cả' },
    { value: 'ROADMAP', label: 'Trọng tâm cần học' },
    { value: 'FREE_STUDY', label: 'Học tự do' },
];

// Danh sách tùy chọn lọc theo trạng thái hoàn thành mô-đun (giống hệt trang Lộ trình)
const STATUS_FILTER_OPTIONS: ReadonlyArray<{ value: CatalogStatusFilter; label: string }> = [
    { value: 'ALL', label: 'Tất cả' },
    { value: 'IN_PROGRESS', label: 'Đang mở / Đang học' },
    { value: 'COMPLETED', label: 'Đã hoàn thành' },
    { value: 'LOCKED', label: 'Chưa mở khóa' },
];

/**
 * Rút gọn tên phần thi trên thanh nút lọc nhanh thành dạng ngắn "Part 1", "Part 2",...
 *
 * @param fullPartName Tên đầy đủ của phần thi (VD: "Part 1: Photographs")
 * @param fallbackIndex Số thứ tự dự phòng nếu tên không chứa tiền tố "Part N"
 * @returns Chuỗi nhãn ngắn gọn (VD: "Part 1")
 */
function formatShortPartLabel(fullPartName: string, fallbackIndex: number): string {
    // Khớp mẫu "Part N" ở đầu tên phần thi để bỏ phần mô tả tiếng Anh phía sau
    const matched = fullPartName.match(/Part\s*\d+/i);
    if (matched) {
        return matched[0].replace(/\s+/g, ' ');
    }
    // Nếu có dấu hai chấm thì lấy vế trước dấu hai chấm
    const colonIdx = fullPartName.indexOf(':');
    if (colonIdx > 0) {
        return fullPartName.slice(0, colonIdx).trim();
    }
    // Dự phòng an toàn theo thứ tự phần thi
    return fullPartName.trim() || `Part ${fallbackIndex + 1}`;
}

/**
 * Chuyển đổi dữ liệu một mô-đun từ API Thư viện sang cấu trúc ModuleItem
 * để tái sử dụng trực tiếp component ModuleTimelineItem của trang Lộ trình.
 *
 * @param mod Dữ liệu mô-đun nhận từ GET /api/users/catalog
 * @returns Cặp dữ liệu (item chuẩn Roadmap, phần mở rộng Thư viện)
 */
function mapCatalogModuleToTimelineProps(mod: CatalogModuleItem): {
    item: ModuleItem;
    catalogExt: TimelineCatalogExtension;
} {
    // Dựng đối tượng ModuleItem tương thích 100% với ModuleTimelineItem
    const item: ModuleItem = {
        id: mod.id,
        orderNo: mod.roadmapOrderNo ?? 0,
        sequence: mod.sequence,
        title: mod.title,
        description: mod.description,
        partId: mod.partId ?? undefined,
        partName: mod.partName,
        section: mod.section,
        abilityName: mod.abilities.length > 0 ? mod.abilities.join(' • ') : null,
        reason: mod.roadmapReason,
        totalLessons: mod.totalLessons,
        completedLessons: mod.completedLessons,
        progressPercent: mod.progressPercent,
        status: mod.status ?? 'LOCKED',
        statusLabel: mod.statusLabel,
    };

    // Dựng thông tin mở rộng phục vụ hiển thị nhãn Trọng tâm/Học tự do và đề cương xổ xuống
    const catalogExt: TimelineCatalogExtension = {
        accessMode: mod.accessMode,
        categoryLabel: mod.categoryLabel,
        canAccess: mod.canAccess,
        lockReason: mod.lockReason,
        videoLessonCount: mod.videoLessonCount,
        practiceLessonCount: mod.practiceLessonCount,
        totalDurationSeconds: mod.totalDurationSeconds,
        lessonPreviews: mod.lessonPreviews,
    };

    return { item, catalogExt };
}

/**
 * Trang Thư viện khóa học TOEIC (khám phá trọn bộ 7 Part).
 * Tái sử dụng trực tiếp cấu trúc bố cục, hệ thống thẻ Timeline và Skeleton của trang Lộ trình học,
 * mở rộng thêm bộ lọc đầy đủ theo 7 Part, Kỹ năng, Phạm vi (Trọng tâm / Học tự do), Trạng thái và Tìm kiếm.
 */
export default function CourseCatalogPage() {
    // Gọi custom hook nạp dữ liệu Thư viện và đồng bộ toàn bộ bộ lọc lên URL
    const {
        data,
        isLoading,
        error,
        refetch,
        sectionFilter,
        selectedPartId,
        scopeFilter,
        statusFilter,
        searchQuery,
        isFiltering,
        availablePartsForTabs,
        filteredParts,
        matchedModulesCount,
        setSectionFilter,
        setSelectedPartId,
        setScopeFilter,
        setStatusFilter,
        setSearchQuery,
        resetFilters,
    } = useCourseCatalog();

    // Trạng thái 1 (Loading): Tái sử dụng trực tiếp RoadmapSkeleton để đồng bộ hình dáng trang Lộ trình
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

    // Trạng thái 2 (Error): Tái sử dụng thẻ trạng thái lỗi chuẩn của trang Lộ trình
    if (error || !data) {
        return (
            <div className="app-layout">
                <SidebarNav />
                <main className="roadmap-main">
                    <div className="roadmap-state-card" role="alert">
                        <AlertCircle size={48} className="roadmap-state-card__icon is-error" />
                        <h2 className="roadmap-state-card__title">Không thể tải thư viện khóa học</h2>
                        <p className="roadmap-state-card__desc">
                            {error || 'Đã xảy ra sự cố kết nối. Vui lòng thử lại sau ít giây.'}
                        </p>
                        <button type="button" className="roadmap-btn-primary" onClick={() => void refetch()}>
                            <RotateCcw size={16} />
                            <span>Thử lại</span>
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    // Trạng thái 3 (Empty tổng thể): Hệ thống chưa có mô-đun nào được xuất bản
    if (data.parts.length === 0 || data.totalModules === 0) {
        return (
            <div className="app-layout">
                <SidebarNav />
                <main className="roadmap-main">
                    <div className="roadmap-state-card">
                        <Layers size={48} className="roadmap-state-card__icon is-empty" />
                        <h2 className="roadmap-state-card__title">Thư viện khóa học đang được cập nhật</h2>
                        <p className="roadmap-state-card__desc">
                            Hệ thống hiện chưa có mô-đun nào được xuất bản. Vui lòng quay lại sau.
                        </p>
                        <Link to="/dashboard" className="roadmap-btn-primary">
                            <span>Quay về trang tổng quan</span>
                        </Link>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="app-layout">
            {/* Thanh điều hướng ngang cố định dùng chung */}
            <SidebarNav />

            <main className="roadmap-main">
                <div className="roadmap-container">
                    {/* Banner gọn nhắc nhở học viên mới chưa làm bài đánh giá đầu vào */}
                    {!data.hasLearningPath && (
                        <section className="catalog-preview-banner" aria-label="Hướng dẫn mở khóa khóa học">
                            <div className="catalog-preview-banner__left">
                                <Sparkles size={20} className="catalog-preview-banner__icon" />
                                <div>
                                    <h2 className="catalog-preview-banner__title">
                                        Đang xem trước đề cương toàn bộ 7 phần thi
                                    </h2>
                                    <p className="catalog-preview-banner__desc">
                                        Bạn có thể bấm &ldquo;Xem đề cương&rdquo; trên từng mô-đun. Hoàn thành bài
                                        đánh giá đầu vào để mở lộ trình trọng tâm và các mô-đun học tự do.
                                    </p>
                                </div>
                            </div>
                            <Link to="/diagnostic/room" className="roadmap-btn-primary">
                                <Compass size={16} />
                                <span>Đánh giá đầu vào</span>
                            </Link>
                        </section>
                    )}

                    {/* Thanh bộ lọc mở rộng từ .roadmap-filter-bar: Tìm kiếm + Kỹ năng + Phạm vi + Trạng thái + 7 Part */}
                    <section className="roadmap-filter-bar catalog-filter-bar" aria-label="Bộ lọc thư viện">
                        {/* Hàng 1: Ô tìm kiếm tức thì và thống kê kết quả khớp */}
                        <div className="catalog-search-row">
                            <div className="catalog-search-input-wrap">
                                <Search size={16} className="catalog-search-input-wrap__icon" />
                                <input
                                    type="search"
                                    className="catalog-search-input"
                                    value={searchQuery}
                                    onChange={(event) => setSearchQuery(event.target.value)}
                                    placeholder="Tìm theo tên mô-đun, kỹ năng hoặc tên bài học..."
                                    aria-label="Tìm kiếm trong thư viện khóa học"
                                />
                                {searchQuery.trim().length > 0 && (
                                    <button
                                        type="button"
                                        className="catalog-search-clear"
                                        onClick={() => setSearchQuery('')}
                                        aria-label="Xóa từ khóa"
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                            </div>

                            <div className="catalog-search-meta">
                                <span>
                                    Hiển thị <strong>{matchedModulesCount}</strong>/{data.totalModules} mô-đun
                                </span>
                                {isFiltering && (
                                    <button
                                        type="button"
                                        className="catalog-reset-chip"
                                        onClick={resetFilters}
                                    >
                                        <RotateCcw size={13} />
                                        <span>Xóa bộ lọc</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Hàng 2: Các nhóm chip lọc dùng trực tiếp class .roadmap-filter-group & .roadmap-filter-chip */}
                        <div className="catalog-filter-chips-row">
                            <div className="roadmap-filter-group">
                                <span className="roadmap-filter-group__label">
                                    <Filter size={14} />
                                    <span>Kỹ năng:</span>
                                </span>
                                {SECTION_FILTER_OPTIONS.map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        className={`roadmap-filter-chip ${sectionFilter === option.value ? 'is-active' : ''}`}
                                        onClick={() => setSectionFilter(option.value)}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>

                            {/* Bộ lọc Phạm vi (Trọng tâm / Học tự do) và Trạng thái khi đã có lộ trình */}
                            {data.hasLearningPath && (
                                <>
                                    <div className="roadmap-filter-group">
                                        <span className="roadmap-filter-group__label">Phạm vi:</span>
                                        {SCOPE_FILTER_OPTIONS.map((option) => (
                                            <button
                                                key={option.value}
                                                type="button"
                                                className={`roadmap-filter-chip ${scopeFilter === option.value ? 'is-active' : ''}`}
                                                onClick={() => setScopeFilter(option.value)}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="roadmap-filter-group">
                                        <span className="roadmap-filter-group__label">Trạng thái:</span>
                                        {STATUS_FILTER_OPTIONS.map((option) => (
                                            <button
                                                key={option.value}
                                                type="button"
                                                className={`roadmap-filter-chip ${statusFilter === option.value ? 'is-active' : ''}`}
                                                onClick={() => setStatusFilter(option.value)}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Hàng 3: Thanh chọn nhanh 7 Part TOEIC rút gọn chỉ hiển thị Part 1 -> Part 7 */}
                        <div className="catalog-part-pills" role="tablist" aria-label="Lọc theo phần thi TOEIC">
                            <button
                                type="button"
                                role="tab"
                                aria-selected={selectedPartId === null}
                                className={`roadmap-filter-chip ${selectedPartId === null ? 'is-active' : ''}`}
                                onClick={() => setSelectedPartId(null)}
                            >
                                Tất cả
                            </button>

                            {availablePartsForTabs.map((part, idx) => (
                                <button
                                    key={part.partId}
                                    type="button"
                                    role="tab"
                                    aria-selected={selectedPartId === part.partId}
                                    className={`roadmap-filter-chip ${selectedPartId === part.partId ? 'is-active' : ''}`}
                                    onClick={() => setSelectedPartId(part.partId)}
                                    title={part.partName}
                                >
                                    {formatShortPartLabel(part.partName, idx)}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Danh sách 7 Part dùng trực tiếp trục Timeline & ModuleTimelineItem giống trang Lộ trình */}
                    {filteredParts.length > 0 && matchedModulesCount > 0 ? (
                        <div className="catalog-part-list">
                            {filteredParts.map((partGroup) => {
                                // Phân biệt phần thi Nghe hiểu và Đọc hiểu để hiển thị icon tương ứng
                                const isListening = partGroup.section === 'LISTENING';

                                return (
                                    <section
                                        key={partGroup.partId}
                                        className="catalog-part-group"
                                        aria-labelledby={`part-heading-${partGroup.partId}`}
                                    >
                                        {/* Dòng phân tách đầu mỗi Part */}
                                        <div className="catalog-part-group__head">
                                            <div className="catalog-part-group__title-wrap">
                                                <span
                                                    className={`catalog-part-group__icon ${isListening ? 'is-listening' : 'is-reading'}`}
                                                    aria-hidden="true"
                                                >
                                                    {isListening ? <Headphones size={16} /> : <BookOpen size={16} />}
                                                </span>
                                                <div>
                                                    <h2
                                                        id={`part-heading-${partGroup.partId}`}
                                                        className="catalog-part-group__title"
                                                    >
                                                        {partGroup.partName}
                                                    </h2>
                                                    {partGroup.partDescription && (
                                                        <p className="catalog-part-group__desc">
                                                            {partGroup.partDescription}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <span className="catalog-part-group__count">
                                                {partGroup.modules.length} mô-đun
                                            </span>
                                        </div>

                                        {/* Tái sử dụng hoàn toàn .roadmap-timeline và ModuleTimelineItem */}
                                        {partGroup.modules.length > 0 ? (
                                            <div className="roadmap-timeline">
                                                {partGroup.modules.map((mod, idx) => {
                                                    // Chuyển đổi dữ liệu sang props chuẩn của ModuleTimelineItem
                                                    const { item, catalogExt } = mapCatalogModuleToTimelineProps(mod);
                                                    return (
                                                        <ModuleTimelineItem
                                                            key={mod.id}
                                                            item={item}
                                                            isLast={idx === partGroup.modules.length - 1}
                                                            catalogExt={catalogExt}
                                                        />
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="roadmap-state-card is-compact">
                                                <p className="roadmap-state-card__desc">
                                                    Học liệu cho phần thi này đang được cập nhật.
                                                </p>
                                            </div>
                                        )}
                                    </section>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="roadmap-state-card is-compact">
                            <p className="roadmap-state-card__desc">
                                Không có mô-đun nào khớp với bộ lọc hoặc từ khóa hiện tại.
                            </p>
                            {isFiltering && (
                                <button
                                    type="button"
                                    className="roadmap-btn-secondary"
                                    onClick={resetFilters}
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
