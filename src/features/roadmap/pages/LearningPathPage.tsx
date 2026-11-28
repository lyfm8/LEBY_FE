import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
    AlertCircle,
    BookOpen,
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
import type { ModuleItem, SectionType } from '../types/roadmapTypes';
import '../roadmap.css';

type SectionFilter = 'ALL' | SectionType;

/**
 * 3 nhóm trạng thái chuẩn trên trang Lộ trình học:
 * - IN_PROGRESS (Mặc định): Mô-đun đang học và chưa mở khóa trong lộ trình
 * - COMPLETED: Mô-đun đã vượt qua module test và mô-đun được miễn học
 * - ALL: Toàn bộ mô-đun của chương trình sắp xếp theo sequence gốc
 */
type StatusFilter = 'ALL' | 'IN_PROGRESS' | 'COMPLETED';

const DEFAULT_STATUS_FILTER: StatusFilter = 'IN_PROGRESS';

const SECTION_FILTER_OPTIONS: ReadonlyArray<{ value: SectionFilter; label: string }> = [
    { value: 'ALL', label: 'Tất cả' },
    { value: 'LISTENING', label: 'Nghe hiểu' },
    { value: 'READING', label: 'Đọc hiểu' },
];

const STATUS_FILTER_OPTIONS: ReadonlyArray<{ value: StatusFilter; label: string }> = [
    { value: 'ALL', label: 'Tất cả' },
    { value: 'IN_PROGRESS', label: 'Đang học' },
    { value: 'COMPLETED', label: 'Đã hoàn thành' },
];

function parseSectionFilter(rawValue: string | null): SectionFilter {
    if (rawValue === 'LISTENING' || rawValue === 'READING') {
        return rawValue;
    }
    return 'ALL';
}

function parseStatusFilter(rawValue: string | null): StatusFilter {
    if (rawValue === 'ALL' || rawValue === 'IN_PROGRESS' || rawValue === 'COMPLETED') {
        return rawValue;
    }
    return DEFAULT_STATUS_FILTER;
}

function sortByGlobalSequence(modules: ModuleItem[]): ModuleItem[] {
    return [...modules].sort(
        (a, b) => (a.sequence ?? a.orderNo ?? 0) - (b.sequence ?? b.orderNo ?? 0)
    );
}

/**
 * Trang Lộ trình học cá nhân hóa thích ứng của học viên.
 */
export default function LearningPathPage() {
    const { data, isLoading, error, refetch } = useRoadmap();
    const [searchParams, setSearchParams] = useSearchParams();

    const sectionParam = parseSectionFilter(searchParams.get('section'));
    const statusParam = parseStatusFilter(searchParams.get('status'));

    const handleFilterChange = (key: 'section' | 'status', value: string) => {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            const isDefaultValue =
                (key === 'section' && value === 'ALL') ||
                (key === 'status' && value === DEFAULT_STATUS_FILTER);

            if (isDefaultValue) {
                next.delete(key);
            } else {
                next.set(key, value);
            }
            return next;
        });
    };

    const handleResetFilters = () => {
        setSearchParams({});
    };

    const filteredModules = useMemo(() => {
        if (!data) {
            return [];
        }

        const roadmapModules: ModuleItem[] = (data.modules ?? []).map((m) => ({
            ...m,
            inRoadmap: true,
        }));
        const exemptedModules: ModuleItem[] = (data.exemptedModules ?? []).map((m) => ({
            ...m,
            inRoadmap: false,
        }));

        let statusMatched: ModuleItem[];
        if (statusParam === 'IN_PROGRESS') {
            statusMatched = roadmapModules.filter(
                (m) => m.status === 'IN_PROGRESS' || m.status === 'UNLOCKED' || m.status === 'LOCKED'
            );
        } else if (statusParam === 'COMPLETED') {
            const passedRoadmap = roadmapModules.filter((m) => m.status === 'COMPLETED');
            statusMatched = sortByGlobalSequence([...passedRoadmap, ...exemptedModules]);
        } else {
            statusMatched = sortByGlobalSequence([...roadmapModules, ...exemptedModules]);
        }

        return statusMatched.filter(
            (m) => sectionParam === 'ALL' || m.section === sectionParam
        );
    }, [data, sectionParam, statusParam]);

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

    const isPassedAllParts =
        Boolean(data.isPassedAllParts) || (data.status === 'COMPLETED' && data.modules.length === 0);

    const isViewingExemptedAfterFullPass =
        isPassedAllParts && (statusParam === 'ALL' || statusParam === 'COMPLETED');

    if (isPassedAllParts && !isViewingExemptedAfterFullPass) {
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
                            200 câu để kiểm chứng kết quả đầu ra hoặc mở lại các mô-đun để ôn tập tự do.
                        </p>
                        <div className="roadmap-state-card__actions">
                            <Link to="/mock-exam" className="roadmap-btn-primary">
                                <span>Làm bài thi thử TOEIC 200 câu</span>
                                <ArrowRight size={16} />
                            </Link>
                            <button
                                type="button"
                                className="roadmap-btn-secondary"
                                onClick={() => handleFilterChange('status', 'COMPLETED')}
                            >
                                <BookOpen size={16} />
                                <span>Xem toàn bộ mô-đun (Ôn tập tự do)</span>
                            </button>
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

    const isFiltered = sectionParam !== 'ALL' || statusParam !== DEFAULT_STATUS_FILTER;
    const isRoadmapCompleted = data.status === 'COMPLETED' && data.totalModules > 0;

    return (
        <div className="app-layout">
            <SidebarNav />

            <main className="roadmap-main">
                <div className="roadmap-container">
                    {(isRoadmapCompleted || isPassedAllParts) && (
                        <section className="roadmap-completed-banner" aria-label="Hoàn thành lộ trình">
                            <div className="roadmap-completed-banner__left">
                                <CheckCircle2 size={24} className="roadmap-completed-banner__icon" />
                                <div>
                                    <h2 className="roadmap-completed-banner__title">
                                        {isPassedAllParts
                                            ? `Bạn đã đạt chuẩn toàn bộ mục tiêu ${data.targetScore} điểm!`
                                            : 'Bạn đã hoàn thành toàn bộ lộ trình học!'}
                                    </h2>
                                    <p className="roadmap-completed-banner__desc">
                                        Bài thi thử TOEIC 200 câu đã sẵn sàng hoặc bạn có thể ôn tập tự do các mô-đun bên dưới.
                                    </p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                                <Link to="/mock-exam" className="roadmap-btn-primary">
                                    <span>Làm bài thi đầu ra ETS</span>
                                    <ArrowRight size={16} />
                                </Link>
                                <Link to="/target-selection" className="roadmap-btn-secondary">
                                    <Target size={16} />
                                    <span>Đổi mục tiêu mới</span>
                                </Link>
                            </div>
                        </section>
                    )}

                    <section className="roadmap-filter-bar" aria-label="Bộ lọc lộ trình">
                        <div className="roadmap-filter-group">
                            <span className="roadmap-filter-group__label">
                                <Filter size={14} />
                                <span>Kỹ năng:</span>
                            </span>
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
                                {(isRoadmapCompleted || isPassedAllParts) && statusParam === 'IN_PROGRESS'
                                    ? 'Không còn mô-đun nào đang học dở hoặc chưa mở khóa.'
                                    : 'Không có mô-đun nào khớp với bộ lọc hiện tại.'}
                            </p>
                            <div className="roadmap-state-card__actions">
                                {(isRoadmapCompleted || isPassedAllParts) && statusParam === 'IN_PROGRESS' && (
                                    <button
                                        type="button"
                                        className="roadmap-btn-primary"
                                        onClick={() => handleFilterChange('status', 'COMPLETED')}
                                    >
                                        Xem các mô-đun đã hoàn thành
                                    </button>
                                )}
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
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
