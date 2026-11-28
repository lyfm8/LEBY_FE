import { useEffect, useMemo, useState } from 'react';
import type React from 'react';
import { Link } from 'react-router-dom';
import {
    MAX_MISTAKE_RETRY_LIMIT,
    useMistakeNotebook,
} from '../hooks/useMistakeNotebook';
import {
    MISTAKE_SOURCE_LABELS,
    type MistakeGroupBy,
    type MistakeSourceType,
} from '../types/mistakeTypes';
import { MistakeQuestionCard } from './MistakeQuestionCard';
import { MistakeRetryView } from './MistakeRetryView';
import '@/shared/exam/examRoom.css';

// Kiểu props nhận vào của tab Sổ tay câu hỏi làm sai trên trang Hồ sơ
interface ProfileMistakesTabProps {
    isActive: boolean;
}

// Danh sách 3 chế độ gom nhóm luôn hiển thị cố định trên Tầng 1
const GROUP_BY_OPTIONS: ReadonlyArray<{ value: MistakeGroupBy; label: string }> = [
    { value: 'part', label: 'Theo Phần thi' },
    { value: 'ability', label: 'Theo Kỹ năng' },
    { value: 'source', label: 'Theo Nguồn bài thi' },
];

// Danh sách 2 nguồn bài thi hợp lệ của Sổ tay câu sai: Bài thi vượt ải & Bài thi thử TOEIC
const ALL_MISTAKE_SOURCES: readonly MistakeSourceType[] = [
    'MODULE_TEST',
    'FULL_MOCK_TEST',
];

/**
 * Rút gọn tên phần thi (VD: "Part 1: Photographs" -> "Part 1") để thẻ nhóm ngắn gọn, dễ quét mắt.
 */
function formatShortPartName(partName: string, partId: number): string {
    const matched = partName.match(/Part\s*\d+/i);
    if (matched) {
        return matched[0].replace(/\s+/g, ' ');
    }
    return partId > 0 ? `Part ${partId}` : partName;
}

/**
 * Định dạng nhãn nút Làm lại khớp chính xác số câu thực tế sẽ nạp vào phiên (tối đa 50 câu/phiên).
 */
function formatRetryButtonLabel(count: number): string {
    if (count > MAX_MISTAKE_RETRY_LIMIT) {
        return `Làm lại ${MAX_MISTAKE_RETRY_LIMIT} câu gần nhất`;
    }
    return `Làm lại (${count} câu)`;
}

/**
 * Container Tab: Sổ tay câu hỏi làm sai 2 tầng tích hợp trên trang Hồ sơ cá nhân.
 * Tổng hợp câu sai trong quá trình học (Bài thi vượt ải) và Bài thi thử TOEIC.
 * - Luôn hiển thị thanh 3 tab gom nhóm (Theo Phần thi / Theo Kỹ năng / Theo Nguồn bài thi).
 * - Tầng 1: Xem tổng quan theo nhóm & bấm Làm lại trực tiếp đúng từng nhóm.
 * - Tầng 2: Xem danh sách câu sai trong nhóm dạng Accordion gọn nhẹ (bấm mới mở audio/ảnh/lời giải).
 */
export function ProfileMistakesTab({ isActive }: ProfileMistakesTabProps) {
    const {
        data,
        isLoading,
        error,
        groupBy,
        isGroupDetailView,
        partId,
        abilityId,
        sourceType,
        keyword,
        searchInput,
        page,
        availableAbilities,
        retrySet,
        isLoadingRetrySet,
        retryError,
        retryAnswers,
        isSubmittingRetry,
        retrySubmitResult,
        setSearchInput,
        refetch,
        setGroupBy,
        openGroup,
        backToGroups,
        updateFilterParams,
        applySearchKeyword,
        startRetrySession,
        selectRetryOption,
        submitRetrySession,
        restartCurrentRetrySession,
        exitRetrySession,
    } = useMistakeNotebook(isActive);

    // Tập ID các câu hỏi đang được bấm mở rộng trong Tầng 2 (mặc định thu gọn toàn bộ)
    const [expandedIds, setExpandedIds] = useState<Record<number, boolean>>({});

    useEffect(() => {
        setExpandedIds({});
    }, [partId, abilityId, sourceType, keyword, page]);

    // Gom danh sách kỹ năng theo từng partId để hiển thị xem trước trên thẻ nhóm Phần thi
    const abilitiesByPartId = useMemo(() => {
        const grouped = new Map<number, NonNullable<typeof data>['filterOptions']['abilities']>();
        const allAbilities = data?.filterOptions.abilities ?? [];
        for (const ab of allAbilities) {
            if (!ab.partId) {
                continue;
            }
            const bucket = grouped.get(ab.partId) ?? [];
            bucket.push(ab);
            grouped.set(ab.partId, bucket);
        }
        return grouped;
    }, [data]);

    // Bản đồ số câu sai theo từng nguồn bài thi để tab Nguồn luôn hiển thị đủ 2 thẻ sạch đẹp
    const sourceCountMap = useMemo(() => {
        const map = new Map<MistakeSourceType, number>();
        for (const src of data?.filterOptions.sources ?? []) {
            map.set(src.sourceType, src.count);
        }
        return map;
    }, [data]);

    // Tiêu đề nhóm đang mở ở Tầng 2
    const activeGroupTitle = useMemo(() => {
        if (!data) {
            return 'Danh sách câu hỏi làm sai';
        }
        if (abilityId) {
            const matchedAb = data.filterOptions.abilities.find((ab) => ab.abilityId === abilityId);
            if (matchedAb) {
                const partPrefix = matchedAb.partId ? `Part ${matchedAb.partId} • ` : '';
                return `${partPrefix}${matchedAb.abilityName}`;
            }
        }
        if (partId) {
            const matchedPart = data.filterOptions.parts.find((p) => p.partId === partId);
            return matchedPart
                ? formatShortPartName(matchedPart.partName, matchedPart.partId)
                : `Part ${partId}`;
        }
        if (sourceType) {
            return MISTAKE_SOURCE_LABELS[sourceType];
        }
        if (keyword.trim()) {
            return `Kết quả tìm kiếm "${keyword.trim()}"`;
        }
        return 'Danh sách câu hỏi làm sai';
    }, [data, abilityId, partId, sourceType, keyword]);

    function handleSearchSubmit(event: React.FormEvent) {
        event.preventDefault();
        applySearchKeyword();
    }

    function toggleQuestionExpand(questionId: number) {
        setExpandedIds((prev) => ({
            ...prev,
            [questionId]: !prev[questionId],
        }));
    }

    const visibleItems = data?.items ?? [];
    const areAllExpanded =
        visibleItems.length > 0 && visibleItems.every((item) => Boolean(expandedIds[item.questionId]));

    function handleToggleAllQuestions() {
        if (areAllExpanded) {
            setExpandedIds({});
            return;
        }
        const next: Record<number, boolean> = {};
        for (const item of visibleItems) {
            next[item.questionId] = true;
        }
        setExpandedIds(next);
    }

    // Nếu học viên đang mở phiên Làm lại theo nhóm -> hiển thị giao diện làm bài trực tiếp
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

    // Trạng thái 1: Đang tải lần đầu
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

    // Trạng thái 2: Lỗi kết nối khi tải sổ tay
    if (error && !data) {
        return (
            <div className="pf-tab-content">
                <div className="pf-card pf-mistake-state">
                    <h4 className="pf-empty-title">Không thể tải sổ tay câu hỏi làm sai</h4>
                    <p className="pf-empty-desc">{error}</p>
                    <button type="button" className="pf-btn-save" onClick={() => void refetch()}>
                        Tải lại sổ tay
                    </button>
                </div>
            </div>
        );
    }

    const totalWrongCount = data?.totalWrongCount ?? 0;

    // Trạng thái rỗng gọn gàng cho tab Phần thi / Kỹ năng (vẫn giữ nguyên thanh 3 tab phía trên)
    function renderCleanEmptyCard() {
        return (
            <div className="pf-card pf-mistake-state">
                <h4 className="pf-empty-title">
                    Hiện tại bạn chưa có câu hỏi nào bị làm sai
                </h4>
                <div className="pf-mistake-state-actions">
                    <Link to="/learning-path" className="pf-btn-save pf-mistake-cta-link">
                        Học theo lộ trình
                    </Link>
                    <Link to="/mock-exam" className="pf-btn-edit pf-mistake-cta-link">
                        Làm đề thi thử TOEIC
                    </Link>
                </div>
            </div>
        );
    }

    // ════════════════════════════════════════════════════════════════════════
    // TẦNG 1: LUÔN HIỂN THỊ THANH 3 TAB GOM NHÓM + NỘI DUNG NHÓM TƯƠNG ỨNG
    // ════════════════════════════════════════════════════════════════════════
    if (!isGroupDetailView) {
        return (
            <div className="pf-tab-content">
                <section className="pf-card pf-mistake-toolbar-card">
                    <div className="pf-mistake-header-row">
                        <div>
                            <h3 className="pf-card__title">Sổ tay câu hỏi làm sai</h3>
                            <p className="pf-card__sub">
                                {totalWrongCount > 0
                                    ? `Tổng cộng ${totalWrongCount} câu sai.`
                                    : 'Tổng hợp câu hỏi làm sai trong quá trình học.'}
                            </p>
                        </div>

                        {/* Bộ chuyển 3 tab gom nhóm luôn hiển thị cố định */}
                        <div className="pf-mistake-group-tabs" role="tablist" aria-label="Cách gom nhóm câu sai">
                            {GROUP_BY_OPTIONS.map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    role="tab"
                                    aria-selected={groupBy === opt.value}
                                    className={`pf-mistake-group-tab ${groupBy === opt.value ? 'is-active' : ''}`}
                                    onClick={() => setGroupBy(opt.value)}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {totalWrongCount > 0 && (
                        <form className="pf-mistake-search-form pf-mistake-search-form--full" onSubmit={handleSearchSubmit}>
                            <div className="pf-mistake-search-box">
                                <input
                                    type="text"
                                    className="pf-mistake-search-input"
                                    placeholder="Tìm nhanh theo tên bài thi, kỹ năng hoặc tên phần thi..."
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                />
                                {searchInput && (
                                    <button
                                        type="button"
                                        className="pf-mistake-search-clear"
                                        aria-label="Xóa từ khóa"
                                        onClick={() => setSearchInput('')}
                                    >
                                        Xóa
                                    </button>
                                )}
                            </div>
                            <button type="submit" className="pf-btn-edit pf-mistake-search-btn">
                                Tìm câu sai
                            </button>
                        </form>
                    )}

                    {retryError && (
                        <div className="pf-alert-error" role="alert">
                            <span>{retryError}</span>
                        </div>
                    )}
                </section>

                {/* Tab 1: Theo Phần thi (Part 1 - Part 7) */}
                {groupBy === 'part' && (
                    data && data.filterOptions.parts.length > 0 ? (
                        <div className="pf-mistake-group-grid">
                            {data.filterOptions.parts.map((part) => {
                                const partAbilities = (abilitiesByPartId.get(part.partId) ?? [])
                                    .slice()
                                    .sort((a, b) => b.count - a.count);
                                const topAbilities = partAbilities.slice(0, 3);
                                const remainingAbilityCount = Math.max(0, partAbilities.length - topAbilities.length);

                                return (
                                    <article key={part.partId} className="pf-mistake-group-card">
                                        <div className="pf-mistake-group-card__top">
                                            <div className="pf-mistake-group-card__title-wrap">
                                                <div>
                                                    <h4 className="pf-mistake-group-card__title">
                                                        {formatShortPartName(part.partName, part.partId)}
                                                    </h4>
                                                    <span className="pf-mistake-group-card__subtitle">
                                                        {partAbilities.length > 0
                                                            ? `${partAbilities.length} kỹ năng cần ôn lại`
                                                            : 'Tổng hợp câu làm sai trong phần thi'}
                                                    </span>
                                                </div>
                                            </div>

                                            <span className="pf-mistake-group-card__count">
                                                {part.count} câu sai
                                            </span>
                                        </div>

                                        {topAbilities.length > 0 && (
                                            <div className="pf-mistake-group-card__chips">
                                                {topAbilities.map((ab) => (
                                                    <button
                                                        key={ab.abilityId}
                                                        type="button"
                                                        className="pf-mistake-group-chip"
                                                        onClick={() =>
                                                            openGroup({
                                                                groupBy: 'ability',
                                                                ability: ab.abilityId,
                                                            })
                                                        }
                                                        title={`Mở riêng ${ab.count} câu sai của kỹ năng này`}
                                                    >
                                                        <span>{ab.abilityName}</span>
                                                        <span className="pf-mistake-group-chip__num">{ab.count}</span>
                                                    </button>
                                                ))}
                                                {remainingAbilityCount > 0 && (
                                                    <span className="pf-mistake-group-chip is-muted">
                                                        +{remainingAbilityCount} kỹ năng khác
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        <div className="pf-mistake-group-card__actions">
                                            <button
                                                type="button"
                                                className="pf-btn-edit pf-mistake-group-btn"
                                                onClick={() => openGroup({ groupBy: 'part', part: part.partId })}
                                            >
                                                <span>Xem {part.count} câu</span>
                                            </button>

                                            <button
                                                type="button"
                                                className="pf-btn-save pf-mistake-group-btn"
                                                disabled={isLoadingRetrySet}
                                                onClick={() =>
                                                    void startRetrySession({ partId: part.partId })
                                                }
                                            >
                                                <span>{formatRetryButtonLabel(part.count)}</span>
                                            </button>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    ) : (
                        renderCleanEmptyCard()
                    )
                )}

                {/* Tab 2: Theo Kỹ năng (Ability) */}
                {groupBy === 'ability' && (
                    data && data.filterOptions.abilities.length > 0 ? (
                        <div className="pf-mistake-group-grid">
                            {data.filterOptions.abilities.map((ab) => (
                                <article key={ab.abilityId} className="pf-mistake-group-card">
                                    <div className="pf-mistake-group-card__top">
                                        <div className="pf-mistake-group-card__title-wrap">
                                            <div>
                                                <h4 className="pf-mistake-group-card__title">{ab.abilityName}</h4>
                                                <span className="pf-mistake-group-card__subtitle">
                                                    {ab.partId ? `Thuộc Part ${ab.partId}` : 'Kỹ năng TOEIC'}
                                                </span>
                                            </div>
                                        </div>

                                        <span className="pf-mistake-group-card__count">
                                            {ab.count} câu sai
                                        </span>
                                    </div>

                                    <div className="pf-mistake-group-card__actions">
                                        <button
                                            type="button"
                                            className="pf-btn-edit pf-mistake-group-btn"
                                            onClick={() =>
                                                openGroup({ groupBy: 'ability', ability: ab.abilityId })
                                            }
                                        >
                                            <span>Xem {ab.count} câu</span>
                                        </button>

                                        <button
                                            type="button"
                                            className="pf-btn-save pf-mistake-group-btn"
                                            disabled={isLoadingRetrySet}
                                            onClick={() =>
                                                void startRetrySession({ abilityId: ab.abilityId })
                                            }
                                        >
                                            <span>{formatRetryButtonLabel(ab.count)}</span>
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    ) : (
                        renderCleanEmptyCard()
                    )
                )}

                {/* Tab 3: Theo Nguồn bài thi — chỉ hiển thị đúng 2 nguồn (Bài thi vượt ải & Bài thi thử TOEIC) */}
                {groupBy === 'source' && (
                    <div className="pf-mistake-group-grid">
                        {ALL_MISTAKE_SOURCES.map((srcType) => {
                            const count = sourceCountMap.get(srcType) ?? 0;
                            const label = MISTAKE_SOURCE_LABELS[srcType];
                            const subtitle =
                                srcType === 'MODULE_TEST'
                                    ? 'Các câu làm sai trong quá trình học và thi vượt ải mô-đun'
                                    : 'Các câu làm sai trong đề luyện tập & thi thử TOEIC 200 câu';

                            return (
                                <article key={srcType} className="pf-mistake-group-card">
                                    <div className="pf-mistake-group-card__top">
                                        <div className="pf-mistake-group-card__title-wrap">
                                            <div>
                                                <h4 className="pf-mistake-group-card__title">{label}</h4>
                                                <span className="pf-mistake-group-card__subtitle">
                                                    {subtitle}
                                                </span>
                                            </div>
                                        </div>

                                        {count > 0 ? (
                                            <span className="pf-mistake-group-card__count">
                                                {count} câu sai
                                            </span>
                                        ) : (
                                            <span className="pf-mistake-group-card__count is-zero">
                                                0 câu sai
                                            </span>
                                        )}
                                    </div>

                                    <div className="pf-mistake-group-card__actions">
                                        {count > 0 ? (
                                            <>
                                                <button
                                                    type="button"
                                                    className="pf-btn-edit pf-mistake-group-btn"
                                                    onClick={() =>
                                                        openGroup({ groupBy: 'source', source: srcType })
                                                    }
                                                >
                                                    <span>Xem {count} câu</span>
                                                </button>

                                                <button
                                                    type="button"
                                                    className="pf-btn-save pf-mistake-group-btn"
                                                    disabled={isLoadingRetrySet}
                                                    onClick={() =>
                                                        void startRetrySession({ sourceType: srcType })
                                                    }
                                                >
                                                    <span>{formatRetryButtonLabel(count)}</span>
                                                </button>
                                            </>
                                        ) : (
                                            <span className="pf-mistake-source-empty-note">
                                                Chưa có câu làm sai nào ở nguồn này
                                            </span>
                                        )}
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    }

    // ════════════════════════════════════════════════════════════════════════
    // TẦNG 2: MÀN HÌNH CHI TIẾT 1 NHÓM CÂU SAI (ACCORDION + LÀM LẠI NHÓM NÀY)
    // ════════════════════════════════════════════════════════════════════════
    const matchedCount = data?.totalElements ?? 0;

    return (
        <div className="pf-tab-content">
            <section className="pf-card pf-mistake-toolbar-card">
                <div className="pf-mistake-detail-bar">
                    <div className="pf-mistake-detail-bar__left">
                        <button
                            type="button"
                            className="pf-mistake-back-btn"
                            onClick={backToGroups}
                        >
                            <span>Tất cả nhóm</span>
                        </button>
                        <div>
                            <h3 className="pf-card__title">{activeGroupTitle}</h3>
                            <p className="pf-card__sub">
                                {matchedCount} câu hỏi làm sai trong nhóm — bấm từng câu để xem audio, đáp án và lời giải chi tiết.
                            </p>
                        </div>
                    </div>

                    <div className="pf-mistake-detail-bar__actions">
                        {visibleItems.length > 0 && (
                            <button
                                type="button"
                                className="pf-btn-edit pf-mistake-expand-all-btn"
                                onClick={handleToggleAllQuestions}
                            >
                                <span>{areAllExpanded ? 'Thu gọn tất cả' : 'Mở tất cả'}</span>
                            </button>
                        )}

                        <button
                            type="button"
                            className="pf-btn-save pf-mistake-retry-cta"
                            onClick={() => void startRetrySession()}
                            disabled={matchedCount === 0 || isLoadingRetrySet}
                        >
                            <span>
                                {isLoadingRetrySet
                                    ? 'Đang chuẩn bị bài...'
                                    : formatRetryButtonLabel(matchedCount)}
                            </span>
                        </button>
                    </div>
                </div>

                {retryError && (
                    <div className="pf-alert-error" role="alert">
                        <span>{retryError}</span>
                    </div>
                )}

                <div className="pf-mistake-filters">
                    {partId && availableAbilities.length > 0 && (
                        <select
                            className="pf-form__select pf-mistake-filter-select"
                            aria-label="Lọc thêm theo kỹ năng trong phần thi"
                            value={abilityId ?? ''}
                            onChange={(e) => {
                                const nextAbility = e.target.value ? Number(e.target.value) : null;
                                updateFilterParams({ ability: nextAbility });
                            }}
                        >
                            <option value="">Tất cả kỹ năng trong nhóm</option>
                            {availableAbilities.map((ab) => (
                                <option key={ab.abilityId} value={ab.abilityId}>
                                    {ab.abilityName} ({ab.count})
                                </option>
                            ))}
                        </select>
                    )}

                    <form className="pf-mistake-search-form" onSubmit={handleSearchSubmit}>
                        <div className="pf-mistake-search-box">
                            <input
                                type="text"
                                className="pf-mistake-search-input"
                                placeholder="Lọc theo tên bài thi hoặc kỹ năng..."
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
                                    Xóa
                                </button>
                            )}
                        </div>
                        <button type="submit" className="pf-btn-edit pf-mistake-search-btn">
                            Tìm
                        </button>
                    </form>
                </div>
            </section>

            {isLoading ? (
                <div className="pf-card">
                    <div className="pf-skeleton-bar is-lg" />
                    <div className="pf-skeleton-bar is-md" />
                </div>
            ) : visibleItems.length === 0 ? (
                <div className="pf-card pf-mistake-state">
                    <h4 className="pf-empty-title">Không tìm thấy câu hỏi phù hợp trong nhóm này</h4>
                    <p className="pf-empty-desc">
                        Thử xóa từ khóa tìm kiếm hoặc quay lại danh sách nhóm để chọn phần thi khác.
                    </p>
                    <button type="button" className="pf-btn-edit" onClick={backToGroups}>
                        Quay lại danh sách nhóm
                    </button>
                </div>
            ) : (
                <>
                    <div className="pf-mistake-list pf-mistake-list--compact">
                        {visibleItems.map((item, idx) => {
                            const displayIndex = (data?.page ?? 0) * (data?.size ?? 10) + idx + 1;
                            return (
                                <MistakeQuestionCard
                                    key={item.questionId}
                                    item={item}
                                    displayIndex={displayIndex}
                                    isExpanded={Boolean(expandedIds[item.questionId])}
                                    onToggleExpand={() => toggleQuestionExpand(item.questionId)}
                                />
                            );
                        })}
                    </div>

                    {data && data.totalPages > 1 && (
                        <nav className="pf-mistake-pagination" aria-label="Phân trang sổ tay câu sai">
                            <button
                                type="button"
                                className="pf-btn-edit"
                                disabled={!data.hasPrevious}
                                onClick={() => updateFilterParams({ page: Math.max(0, page - 1) })}
                            >
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
                            </button>
                        </nav>
                    )}
                </>
            )}
        </div>
    );
}
