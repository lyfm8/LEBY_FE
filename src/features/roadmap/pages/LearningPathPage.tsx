import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AlertCircle, Compass, RotateCcw, Target, Filter } from 'lucide-react';
import { SidebarNav } from '../components/SidebarNav';
import { ModuleTimelineItem } from '../components/ModuleTimelineItem';
import { useRoadmap } from '../hooks/useRoadmap';
import type { ModuleStatus, SectionType } from '../types/roadmapTypes';
import '../roadmap.css';

type SectionFilter = 'ALL' | SectionType;
type StatusFilter = 'ALL' | ModuleStatus;

/**
 * Trang Lộ trình học thích ứng cá nhân hóa (Adaptive Learning Path).
 * Hiển thị danh sách Module đã được thuật toán 2 tầng chọn lọc, khử trùng lặp và sắp xếp theo sequence sư phạm.
 * Tuân thủ đầy đủ 4 trạng thái UI (Loading, Error, Empty, Success) và đồng bộ bộ lọc lên URL.
 */
export default function LearningPathPage() {
    const { data, isLoading, error, refetch } = useRoadmap();
    const [searchParams, setSearchParams] = useSearchParams();

    // Đồng bộ bộ lọc kỹ năng (section) và trạng thái (status) lên URL Search Params
    // để người dùng F5 tải lại trang hoặc chia sẻ link vẫn giữ nguyên đúng trạng thái lọc
    const sectionParam = (searchParams.get('section') as SectionFilter) || 'ALL';
    const statusParam = (searchParams.get('status') as StatusFilter) || 'ALL';

    // Xóa param khỏi URL khi chọn lại "ALL" để URL luôn sạch gọn
    const handleFilterChange = (key: 'section' | 'status', value: string) => {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            if (value === 'ALL') {
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

    // Tối ưu: Dùng useMemo tránh lọc lại toàn bộ danh sách Module khi component re-render không đổi filter
    const filteredModules = useMemo(() => {
        if (!data?.modules) return [];
        return data.modules.filter((m) => {
            const matchSection = sectionParam === 'ALL' || m.section === sectionParam;
            const matchStatus = statusParam === 'ALL' || m.status === statusParam;
            return matchSection && matchStatus;
        });
    }, [data, sectionParam, statusParam]);

    // Trạng thái 1 (Loading): Hiển thị spinner trong lúc chờ API /api/users/roadmap phản hồi
    if (isLoading) {
        return (
            <div className="app-layout">
                <SidebarNav />
                <div className="roadmap-loading">
                    <div className="roadmap-spinner" />
                    <p>Đang tải lộ trình học thích ứng của bạn...</p>
                </div>
            </div>
        );
    }

    // Trạng thái 2 (Error): Lỗi mạng hoặc lỗi server -> hiển thị thẻ báo lỗi kèm nút "Thử lại"
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

    // Trạng thái 3 (Empty): Học viên mới chưa chọn AIM hoặc chưa làm bài chẩn đoán -> dẫn sang phòng thi đầu vào
    if (!data || data.modules.length === 0) {
        return (
            <div className="app-layout">
                <SidebarNav />
                <main className="roadmap-main">
                    <div className="roadmap-state-card">
                        <Compass size={52} className="roadmap-state-card__icon is-empty" />
                        <h2 className="roadmap-state-card__title">Bạn chưa có lộ trình học thích ứng</h2>
                        <p className="roadmap-state-card__desc">
                            Hãy chọn mục tiêu điểm TOEIC (AIM) và hoàn thành bài kiểm tra chẩn đoán đầu vào để
                            hệ thống phân tích năng lực 2 tầng và thiết kế lộ trình học riêng cho bạn.
                        </p>
                        <div className="roadmap-state-card__actions">
                            <Link to="/diagnostic/room" className="roadmap-btn-primary">
                                <Compass size={16} />
                                <span>Làm bài kiểm tra chẩn đoán</span>
                            </Link>
                            <Link to="/target-selection" className="roadmap-btn-secondary">
                                <Target size={16} />
                                <span>Thiết lập mục tiêu AIM</span>
                            </Link>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    const isFiltered = sectionParam !== 'ALL' || statusParam !== 'ALL';

    return (
        <div className="app-layout">
            <SidebarNav />

            <main className="roadmap-main">
                <div className="roadmap-container">
                    {/* Header Lộ trình */}
                    <header className="roadmap-header">
                        <div className="roadmap-header__left">
                            <div className="roadmap-header__eyebrow">
                                <span>LỘ TRÌNH CÁ NHÂN HÓA • PHIÊN BẢN #{data.version}</span>
                            </div>
                            <h1 className="roadmap-header__title">Lộ trình học thích ứng của bạn</h1>
                            <p className="roadmap-header__desc">
                                Hệ thống chọn lọc {data.totalModules} chặng học trọng tâm từ những năng lực bạn cần
                                cải thiện theo mục tiêu AIM {data.targetScore}.
                            </p>
                        </div>

                        <div className="roadmap-header__right">
                            <div className="roadmap-header__aim-badge">
                                <span className="roadmap-header__aim-label">MỤC TIÊU ĐẶT RA</span>
                                <span className="roadmap-header__aim-val">AIM {data.targetScore}</span>
                            </div>

                            <div className="roadmap-header__progress-box">
                                <div className="roadmap-header__progress-text">
                                    <span>
                                        HOÀN THÀNH {data.completedModules}/{data.totalModules} MODULE
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

                    {/* Bộ lọc Section & Trạng thái đồng bộ lên URL */}
                    <section className="roadmap-filter-bar" aria-label="Bộ lọc lộ trình">
                        <div className="roadmap-filter-group">
                            <span className="roadmap-filter-group__label">
                                <Filter size={14} />
                                <span>Kỹ năng:</span>
                            </span>
                            {(
                                [
                                    { value: 'ALL', label: 'Tất cả' },
                                    { value: 'LISTENING', label: 'Nghe hiểu (Listening)' },
                                    { value: 'READING', label: 'Đọc hiểu (Reading)' },
                                ] as const
                            ).map((option) => (
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
                            {(
                                [
                                    { value: 'ALL', label: 'Tất cả' },
                                    { value: 'IN_PROGRESS', label: 'Đang học' },
                                    { value: 'COMPLETED', label: 'Hoàn thành' },
                                    { value: 'LOCKED', label: 'Đang khóa' },
                                ] as const
                            ).map((option) => (
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

                    {/* Timeline các module */}
                    {filteredModules.length > 0 ? (
                        <div className="roadmap-timeline">
                            {filteredModules.map((m, idx) => (
                                <ModuleTimelineItem
                                    key={m.id}
                                    item={m}
                                    isLast={idx === filteredModules.length - 1}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="roadmap-state-card is-compact">
                            <p className="roadmap-state-card__desc">
                                Không có Module nào khớp với bộ lọc hiện tại.
                            </p>
                            {isFiltered && (
                                <button type="button" className="roadmap-btn-secondary" onClick={handleResetFilters}>
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
