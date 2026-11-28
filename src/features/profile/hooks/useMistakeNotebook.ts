import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { OptionKey } from '@/shared/exam/types/examTypes';
import { mistakeNotebookService } from '../services/mistakeNotebookService';
import type {
    MistakeGroupBy,
    MistakeNotebookData,
    MistakeRetrySetData,
    MistakeRetrySubmitData,
    MistakeSourceType,
} from '../types/mistakeTypes';

// Số câu hỏi hiển thị mặc định trên mỗi trang khi mở chi tiết 1 nhóm câu sai
const DEFAULT_PAGE_SIZE = 10;
// Số câu tối đa cho 1 phiên làm lại theo nhóm (khớp giới hạn tối đa 50 của Backend)
export const MAX_MISTAKE_RETRY_LIMIT = 50;
// Tập hợp mã nguồn hợp lệ để kiểm tra tham số đọc từ URL (chỉ Bài thi vượt ải & Bài thi thử TOEIC)
const VALID_SOURCE_TYPES: readonly MistakeSourceType[] = [
    'MODULE_TEST',
    'FULL_MOCK_TEST',
];
// Tập hợp chế độ gom nhóm hợp lệ đồng bộ qua ?groupBy=
const VALID_GROUP_BY: readonly MistakeGroupBy[] = ['part', 'ability', 'source'];

// Kiểu bộ lọc ghi đè khi bấm "Làm lại" trực tiếp từ một thẻ nhóm trên màn hình tổng quan
export interface MistakeRetryOverrideFilters {
    partId?: number;
    abilityId?: number;
    sourceType?: MistakeSourceType;
    keyword?: string;
}

/**
 * Chuyển chuỗi query param trên URL sang số nguyên dương hợp lệ (trả undefined nếu không hợp lệ).
 *
 * @param raw Chuỗi giá trị từ URLSearchParams
 * @returns Số nguyên dương hoặc undefined
 */
function parsePositiveIntParam(raw: string | null): number | undefined {
    if (!raw) {
        return undefined;
    }
    const parsed = Number.parseInt(raw, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

/**
 * Chuyển chuỗi query param sang chỉ số trang không âm (mặc định 0).
 *
 * @param raw Chuỗi giá trị trang từ URLSearchParams
 * @returns Chỉ số trang >= 0
 */
function parsePageParam(raw: string | null): number {
    if (!raw) {
        return 0;
    }
    const parsed = Number.parseInt(raw, 10);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

/**
 * Kiểm tra chuỗi nguồn trên URL có thuộc danh sách nguồn hợp lệ hay không.
 *
 * @param raw Chuỗi mã nguồn từ URLSearchParams
 * @returns MistakeSourceType hợp lệ hoặc undefined
 */
function parseSourceParam(raw: string | null): MistakeSourceType | undefined {
    if (!raw) {
        return undefined;
    }
    return VALID_SOURCE_TYPES.includes(raw as MistakeSourceType)
        ? (raw as MistakeSourceType)
        : undefined;
}

/**
 * Chuẩn hóa chế độ gom nhóm đọc từ URL (?groupBy=), mặc định gom theo Phần thi ('part').
 *
 * @param raw Chuỗi chế độ gom nhóm trên URL
 * @returns MistakeGroupBy hợp lệ
 */
function parseGroupByParam(raw: string | null): MistakeGroupBy {
    if (raw && VALID_GROUP_BY.includes(raw as MistakeGroupBy)) {
        return raw as MistakeGroupBy;
    }
    return 'part';
}

/**
 * Custom Hook quản lý toàn bộ nghiệp vụ Sổ tay câu hỏi làm sai 2 tầng và phiên làm lại theo nhóm:
 * - Tầng 1: Danh sách nhóm theo Phần thi / Kỹ năng / Nguồn bài thi đồng bộ ?groupBy= trên URL.
 * - Tầng 2: Chi tiết câu sai thuộc nhóm đã chọn kèm phân trang và bộ lọc bổ trợ.
 * - Hỗ trợ bấm "Làm lại" trực tiếp từ bất kỳ thẻ nhóm nào hoặc trong màn hình chi tiết nhóm.
 *
 * @param isActive Cờ xác nhận tab Sổ tay câu sai đang được mở (tránh gọi API thừa khi đang ở tab khác)
 */
export function useMistakeNotebook(isActive: boolean) {
    const [searchParams, setSearchParams] = useSearchParams();

    // Lưu dữ liệu Sổ tay câu sai tải từ Backend
    const [data, setData] = useState<MistakeNotebookData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Trạng thái phiên Làm lại theo nhóm
    const [retrySet, setRetrySet] = useState<MistakeRetrySetData | null>(null);
    const [isLoadingRetrySet, setIsLoadingRetrySet] = useState<boolean>(false);
    const [retryError, setRetryError] = useState<string | null>(null);
    const [retryAnswers, setRetryAnswers] = useState<Record<number, OptionKey>>({});
    const [isSubmittingRetry, setIsSubmittingRetry] = useState<boolean>(false);
    const [retrySubmitResult, setRetrySubmitResult] = useState<MistakeRetrySubmitData | null>(null);

    // Trích xuất toàn bộ trạng thái lọc và gom nhóm từ URL Search Params
    const groupBy = parseGroupByParam(searchParams.get('groupBy'));
    const partId = parsePositiveIntParam(searchParams.get('part'));
    const abilityId = parsePositiveIntParam(searchParams.get('ability'));
    const sourceType = parseSourceParam(searchParams.get('source'));
    const keyword = searchParams.get('q') ?? '';
    const page = parsePageParam(searchParams.get('page'));

    // Xác định đang đứng ở Tầng 2 (Chi tiết 1 nhóm / kết quả tìm kiếm) hay Tầng 1 (Danh sách nhóm)
    const isGroupDetailView = Boolean(partId || abilityId || sourceType || keyword.trim());

    // Ô nhập tìm kiếm cục bộ đồng bộ với URL
    const [searchInput, setSearchInput] = useState<string>(keyword);

    useEffect(() => {
        setSearchInput(keyword);
    }, [keyword]);

    // Nạp dữ liệu Sổ tay câu sai từ Backend (khi ở Tầng 1 chỉ cần size=1 để lấy nhanh bộ đếm các nhóm)
    const fetchNotebook = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await mistakeNotebookService.getMistakeNotebook({
                partId,
                abilityId,
                sourceType,
                keyword,
                page: isGroupDetailView ? page : 0,
                size: isGroupDetailView ? DEFAULT_PAGE_SIZE : 1,
            });
            if (res.success && res.data) {
                setData(res.data);
            } else {
                setError(res.message || 'Không thể tải sổ tay câu hỏi làm sai.');
            }
        } catch {
            setError('Không thể kết nối đến máy chủ để tải sổ tay câu hỏi làm sai.');
        } finally {
            setIsLoading(false);
        }
    }, [partId, abilityId, sourceType, keyword, page, isGroupDetailView]);

    useEffect(() => {
        if (!isActive) {
            return;
        }
        void fetchNotebook();
    }, [isActive, fetchNotebook]);

    /**
     * Cập nhật các tham số lọc & gom nhóm trên URL, tự reset về trang 0 khi đổi tiêu chí lọc.
     */
    const updateFilterParams = useCallback(
        (updates: {
            groupBy?: MistakeGroupBy;
            part?: number | null;
            ability?: number | null;
            source?: MistakeSourceType | null;
            q?: string | null;
            page?: number | null;
        }) => {
            setSearchParams((prev) => {
                const next = new URLSearchParams(prev);
                next.set('tab', 'mistakes');

                if ('groupBy' in updates && updates.groupBy) {
                    if (updates.groupBy === 'part') {
                        next.delete('groupBy');
                    } else {
                        next.set('groupBy', updates.groupBy);
                    }
                }
                if ('part' in updates) {
                    if (updates.part) {
                        next.set('part', String(updates.part));
                    } else {
                        next.delete('part');
                    }
                }
                if ('ability' in updates) {
                    if (updates.ability) {
                        next.set('ability', String(updates.ability));
                    } else {
                        next.delete('ability');
                    }
                }
                if ('source' in updates) {
                    if (updates.source) {
                        next.set('source', updates.source);
                    } else {
                        next.delete('source');
                    }
                }
                if ('q' in updates) {
                    const trimmed = updates.q?.trim() ?? '';
                    if (trimmed) {
                        next.set('q', trimmed);
                    } else {
                        next.delete('q');
                    }
                }
                if ('page' in updates) {
                    if (updates.page && updates.page > 0) {
                        next.set('page', String(updates.page));
                    } else {
                        next.delete('page');
                    }
                } else {
                    next.delete('page');
                }
                return next;
            });
        },
        [setSearchParams]
    );

    // Chuyển kiểu gom nhóm trên Tầng 1 (Theo Phần thi / Theo Kỹ năng / Theo Nguồn bài thi)
    const setGroupBy = useCallback(
        (nextGroupBy: MistakeGroupBy) => {
            setSearchInput('');
            updateFilterParams({
                groupBy: nextGroupBy,
                part: null,
                ability: null,
                source: null,
                q: null,
                page: 0,
            });
        },
        [updateFilterParams]
    );

    // Mở Tầng 2 cho một nhóm cụ thể (Part / Kỹ năng / Nguồn)
    const openGroup = useCallback(
        (target: {
            groupBy?: MistakeGroupBy;
            part?: number | null;
            ability?: number | null;
            source?: MistakeSourceType | null;
        }) => {
            setSearchInput('');
            updateFilterParams({
                groupBy: target.groupBy ?? groupBy,
                part: target.part ?? null,
                ability: target.ability ?? null,
                source: target.source ?? null,
                q: null,
                page: 0,
            });
        },
        [groupBy, updateFilterParams]
    );

    // Quay từ Tầng 2 (Chi tiết nhóm) về Tầng 1 (Danh sách nhóm) nhưng giữ nguyên chế độ gom nhóm
    const backToGroups = useCallback(() => {
        setSearchInput('');
        updateFilterParams({
            groupBy,
            part: null,
            ability: null,
            source: null,
            q: null,
            page: 0,
        });
    }, [groupBy, updateFilterParams]);

    // Áp dụng từ khóa tìm kiếm tức thì (tự chuyển vào màn hình kết quả Tầng 2)
    const applySearchKeyword = useCallback(() => {
        updateFilterParams({ q: searchInput });
    }, [searchInput, updateFilterParams]);

    // Khởi tạo phiên Làm lại cho đúng nhóm được chọn (hoặc nhóm đang mở trên Tầng 2)
    const startRetrySession = useCallback(
        async (overrideFilters?: MistakeRetryOverrideFilters) => {
            setIsLoadingRetrySet(true);
            setRetryError(null);
            setRetrySubmitResult(null);
            setRetryAnswers({});

            const targetParams = overrideFilters
                ? {
                      partId: overrideFilters.partId,
                      abilityId: overrideFilters.abilityId,
                      sourceType: overrideFilters.sourceType,
                      keyword: overrideFilters.keyword,
                  }
                : { partId, abilityId, sourceType, keyword };

            try {
                const res = await mistakeNotebookService.getRetrySet(
                    targetParams,
                    MAX_MISTAKE_RETRY_LIMIT
                );
                if (res.success && res.data && res.data.questions.length > 0) {
                    setRetrySet(res.data);
                } else {
                    setRetryError('Không có câu hỏi phù hợp trong nhóm này để bắt đầu phiên làm lại.');
                }
            } catch {
                setRetryError('Không thể khởi tạo phiên làm lại lúc này. Vui lòng thử lại.');
            } finally {
                setIsLoadingRetrySet(false);
            }
        },
        [partId, abilityId, sourceType, keyword]
    );

    const selectRetryOption = useCallback((questionId: number, option: OptionKey) => {
        setRetryAnswers((prev) => ({
            ...prev,
            [questionId]: option,
        }));
    }, []);

    const submitRetrySession = useCallback(async () => {
        if (!retrySet || retrySet.questions.length === 0) {
            return;
        }
        setIsSubmittingRetry(true);
        setRetryError(null);
        try {
            const payload = {
                answers: retrySet.questions.map((q) => ({
                    questionId: q.questionId,
                    selectedAnswer: retryAnswers[q.questionId] ?? null,
                })),
            };
            const res = await mistakeNotebookService.submitRetryAnswers(payload);
            if (res.success && res.data) {
                setRetrySubmitResult(res.data);
            } else {
                setRetryError(res.message || 'Không thể chấm điểm bài làm lại.');
            }
        } catch {
            setRetryError('Đã xảy ra lỗi khi gửi bài làm lại. Vui lòng thử lại.');
        } finally {
            setIsSubmittingRetry(false);
        }
    }, [retrySet, retryAnswers]);

    const restartCurrentRetrySession = useCallback(() => {
        setRetryAnswers({});
        setRetrySubmitResult(null);
        setRetryError(null);
    }, []);

    const exitRetrySession = useCallback(() => {
        setRetrySet(null);
        setRetryAnswers({});
        setRetrySubmitResult(null);
        setRetryError(null);
    }, []);

    // Lọc danh sách kỹ năng khả dụng trong Part đang chọn (dùng cho thanh lọc phụ ở Tầng 2)
    const availableAbilities = useMemo(() => {
        const allAbilities = data?.filterOptions.abilities ?? [];
        if (!partId) {
            return allAbilities;
        }
        return allAbilities.filter((ab) => ab.partId === partId);
    }, [data, partId]);

    return {
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
        refetch: fetchNotebook,
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
    };
}
