import type React from 'react';
import { Link } from 'react-router-dom';
import {
    AlertCircle,
    BookCheck,
    ChevronLeft,
    ChevronRight,
    PlayCircle,
    RotateCcw,
    Search,
    X,
} from 'lucide-react';
import { useMistakeNotebook } from '../hooks/useMistakeNotebook';
import type { MistakeSourceType } from '../types/mistakeTypes';
import { MistakeQuestionCard } from './MistakeQuestionCard';
import { MistakeRetryView } from './MistakeRetryView';
import '@/shared/exam/examRoom.css';

// Kiểu props nhận vào của tab Sổ tay câu hỏi làm sai trên trang Hồ sơ
interface ProfileMistakesTabProps {
    isActive: boolean;
}

/**
 * Container Tab: Sổ tay câu hỏi làm sai tích hợp trên trang Hồ sơ cá nhân.
 * Gồm 2 chế độ liền mạch: Xem lại (lọc theo Part/Kỹ năng/Nguồn + giải thích) và Làm lại ngay nguyên bộ câu sai.
 */
export function ProfileMistakesTab({ isActive }: ProfileMistakesTabProps) {
    // Khởi chạy custom hook điều phối dữ liệu Sổ tay, bộ lọc URL và phiên làm lại
    const {
        data,
        isLoading,
        error,
        partId,
        abilityId,
        sourceType,
        searchInput,
        page,
        hasActiveFilters,
        availableAbilities,
        retrySet,
        isLoadingRetrySet,
        retryError,
        retryAnswers,
        isSubmittingRetry,
        retrySubmitResult,
        setSearchInput,
        refetch,
        updateFilterParams,
        resetFilters,
        applySearchKeyword,
        startRetrySession,
        selectRetryOption,
        submitRetrySession,
        restartCurrentRetrySession,
        exitRetrySession,
    } = useMistakeNotebook(isActive);

    // Xử lý bấm Enter trong ô tìm kiếm để áp dụng bộ lọc từ khóa
    function handleSearchSubmit(event: React.FormEvent) {
        event.preventDefault();
        applySearchKeyword();
    }

    // Nếu học viên đang ở chế độ Làm lại ngay nguyên bộ câu sai thì hiển thị giao diện làm lại
    if (retrySet) {
        return (
            <div className="pf-tab-content">
                <MistakeRetryView
                    retrySet={retrySet}
                    answers={retryAnswers}
                    isSubmitting={isSubmittingRetry}
                    submitError={retryError}
                    submitResult={retrySubmitResult}
                    onSelectOption={selectRetryOption}
                    onSubmit={() => void submitRetrySession()}
                    onRestart={restartCurrentRetrySession}
                    onExit={exitRetrySession}
                />
            </div>
        );
    }

    // Trạng thái 1: Đang tải lần đầu — hiển thị khung Skeleton khớp bố cục sổ tay
    if (isLoading && !data) {
        return (
            <div className="pf-tab-content">
                <div className="pf-card">
                    <div className="pf-skeleton-bar is-lg" />
                    <div className="pf-skeleton-bar is-md" />
                    <div className="pf-skeleton-grid">
                        <div className="pf-skeleton-box" />
                        <div className="pf-skeleton-box" />
                    </div>
                </div>
            </div>
        );
    }

    // Trạng thái 2: Lỗi kết nối khi tải sổ tay — hiển thị thông báo kèm nút Thử lại
    if (error && !data) {
        return (
            <div className="pf-tab-content">
                <div className="pf-card pf-mistake-state">
                    <AlertCircle size={40} color="#ef4444" />
                    <h4 className="pf-empty-title">Không thể tải sổ tay câu hỏi làm sai</h4>
                    <p className="pf-empty-desc">{error}</p>
                    <button type="button" className="pf-btn-save" onClick={() => void refetch()}>
                        <RotateCcw size={15} />
                        <span>Tải lại sổ tay</span>
                    </button>
                </div>
            </div>
        );
    }

    // Trạng thái 3: Sổ tay trống hoàn toàn (học viên chưa làm sai câu nào)
    if (!data || data.totalWrongCount === 0) {
        return (
            <div className="pf-tab-content">
                <div className="pf-card pf-mistake-state">
                    <div className="pf-mistake-empty-badge">
                        <BookCheck size={34} />
                    </div>
                    <h4 className="pf-empty-title">
                        Tuyệt vời! Hiện tại bạn không có câu hỏi nào bị làm sai trong sổ tay
                    </h4>
                    <p className="pf-empty-desc">
                        Mọi câu trả lời sai từ bài thi chẩn đoán, bài thi vượt ải và bài thi thử sẽ tự động được tổng hợp tại đây để bạn xem lại lời giải và luyện tập lại bất cứ lúc nào.
                    </p>
                    <Link to="/learning-path" className="pf-btn-save pf-mistake-cta-link">
                        Quay lại lộ trình học
                    </Link>
                </div>
            </div>
        );
    }

    // Số lượng câu phù hợp với bộ lọc hiện tại (hiển thị trực tiếp trên nút Làm lại ngay)
    const matchedCount = data.totalElements;

    return (
        <div className="pf-tab-content">
            {/* Khối tổng quan + nút Làm lại ngay nguyên bộ câu sai + thanh lọc đa tiêu chí */}
            <section className="pf-card pf-mistake-toolbar-card">
                <div className="pf-mistake-header-row">
                    <div>
                        <h3 className="pf-card__title">Sổ tay câu hỏi làm sai</h3>
                        <p className="pf-card__sub">
                            Tổng hợp {data.totalWrongCount} câu từng làm sai từ các bài thi của bạn để xem lại lời giải hoặc làm lại ngay.
                        </p>
                    </div>

                    {/* Nút chính mở ngay phiên làm lại nguyên bộ câu sai theo đúng bộ lọc hiện tại */}
                    <button
                        type="button"
                        className="pf-btn-save pf-mistake-retry-cta"
                        onClick={() => void startRetrySession()}
                        disabled={matchedCount === 0 || isLoadingRetrySet}
                    >
                        <PlayCircle size={17} />
                        <span>
                            {isLoadingRetrySet
                                ? 'Đang chuẩn bị bài...'
                                : `Làm lại ngay (${matchedCount} câu)`}
                        </span>
                    </button>
                </div>

                {/* Thông báo lỗi nhẹ nếu thao tác khởi tạo phiên làm lại gặp sự cố */}
                {retryError && (
                    <div className="pf-alert-error" role="alert">
                        <AlertCircle size={16} />
                        <span>{retryError}</span>
                    </div>
                )}

                {/* Thanh lọc theo Phần thi, Kỹ năng, Nguồn bài thi và Từ khóa */}
                <div className="pf-mistake-filters">
                    {/* Lọc theo Phần thi (Part 1 - Part 7) */}
                    <select
                        className="pf-form__select pf-mistake-filter-select"
                        aria-label="Lọc theo phần thi"
                        value={partId ?? ''}
                        onChange={(e) => {
                            const nextPart = e.target.value ? Number(e.target.value) : null;
                            updateFilterParams({ part: nextPart, ability: null });
                        }}
                    >
                        <option value="">Tất cả phần thi ({data.totalWrongCount})</option>
                        {data.filterOptions.parts.map((part) => (
                            <option key={part.partId} value={part.partId}>
                                {part.partName} ({part.count})
                            </option>
                        ))}
                    </select>

                    {/* Lọc theo Kỹ năng TOEIC */}
                    <select
                        className="pf-form__select pf-mistake-filter-select"
                        aria-label="Lọc theo kỹ năng"
                        value={abilityId ?? ''}
                        onChange={(e) => {
                            const nextAbility = e.target.value ? Number(e.target.value) : null;
                            updateFilterParams({ ability: nextAbility });
                        }}
                    >
                        <option value="">Tất cả kỹ năng</option>
                        {availableAbilities.map((ab) => (
                            <option key={ab.abilityId} value={ab.abilityId}>
                                {ab.abilityName} ({ab.count})
                            </option>
                        ))}
                    </select>

                    {/* Lọc theo Nguồn bài thi */}
                    <select
                        className="pf-form__select pf-mistake-filter-select"
                        aria-label="Lọc theo nguồn bài thi"
                        value={sourceType ?? ''}
                        onChange={(e) => {
                            const nextSource = e.target.value
                                ? (e.target.value as MistakeSourceType)
                                : null;
                            updateFilterParams({ source: nextSource });
                        }}
                    >
                        <option value="">Tất cả nguồn bài thi</option>
                        {data.filterOptions.sources.map((src) => (
                            <option key={src.sourceType} value={src.sourceType}>
                                {src.label} ({src.count})
                            </option>
                        ))}
                    </select>

                    {/* Ô tìm kiếm từ khóa theo nội dung/tên bài thi */}
                    <form className="pf-mistake-search-form" onSubmit={handleSearchSubmit}>
                        <div className="pf-mistake-search-box">
                            <Search size={15} className="pf-mistake-search-icon" />
                            <input
                                type="text"
                                className="pf-mistake-search-input"
                                placeholder="Tìm theo tên bài thi, kỹ năng..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                            />
                            {searchInput && (
                                <button
                                    type="button"
                                    className="pf-mistake-search-clear"
                                    aria-label="Xóa từ khóa"
                                    onClick={() => {
                                        setSearchInput('');
                                        updateFilterParams({ q: null });
                                    }}
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                        <button type="submit" className="pf-btn-edit pf-mistake-search-btn">
                            Tìm
                        </button>
                    </form>

                    {/* Nút xóa toàn bộ bộ lọc khi người dùng đang lọc */}
                    {hasActiveFilters && (
                        <button
                            type="button"
                            className="pf-btn-cancel pf-mistake-reset-btn"
                            onClick={resetFilters}
                        >
                            <X size={14} />
                            <span>Xóa bộ lọc</span>
                        </button>
                    )}
                </div>
            </section>

            {/* Danh sách câu hỏi làm sai hoặc trạng thái rỗng theo bộ lọc */}
            {isLoading ? (
                <div className="pf-card">
                    <div className="pf-skeleton-bar is-lg" />
                    <div className="pf-skeleton-bar is-md" />
                </div>
            ) : data.items.length === 0 ? (
                <div className="pf-card pf-mistake-state">
                    <AlertCircle size={34} color="#94a3b8" />
                    <h4 className="pf-empty-title">Không tìm thấy câu hỏi phù hợp với bộ lọc</h4>
                    <p className="pf-empty-desc">
                        Thử bỏ bớt điều kiện lọc hoặc đổi từ khóa để xem lại toàn bộ các câu hỏi đã làm sai.
                    </p>
                    <button type="button" className="pf-btn-edit" onClick={resetFilters}>
                        Xóa bộ lọc
                    </button>
                </div>
            ) : (
                <>
                    <div className="pf-mistake-list">
                        {data.items.map((item, idx) => {
                            // Tính số thứ tự liên tục xuyên suốt các trang phân trang
                            const displayIndex = data.page * data.size + idx + 1;
                            return (
                                <MistakeQuestionCard
                                    key={item.questionId}
                                    item={item}
                                    displayIndex={displayIndex}
                                />
                            );
                        })}
                    </div>

                    {/* Thanh phân trang gọn gàng khi có nhiều hơn 1 trang */}
                    {data.totalPages > 1 && (
                        <nav className="pf-mistake-pagination" aria-label="Phân trang sổ tay câu sai">
                            <button
                                type="button"
                                className="pf-btn-edit"
                                disabled={!data.hasPrevious}
                                onClick={() => updateFilterParams({ page: Math.max(0, page - 1) })}
                            >
                                <ChevronLeft size={15} />
                                <span>Trang trước</span>
                            </button>
                            <span className="pf-mistake-page-info">
                                Trang {data.page + 1} / {data.totalPages} ({data.totalElements} câu)
                            </span>
                            <button
                                type="button"
                                className="pf-btn-edit"
                                disabled={!data.hasNext}
                                onClick={() => updateFilterParams({ page: page + 1 })}
                            >
                                <span>Trang sau</span>
                                <ChevronRight size={15} />
                            </button>
                        </nav>
                    )}
                </>
            )}
        </div>
    );
}
