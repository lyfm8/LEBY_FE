import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { OptionKey } from '@/shared/exam/types/examTypes';
import { mistakeNotebookService } from '../services/mistakeNotebookService';
import type {
    MistakeNotebookData,
    MistakeRetrySetData,
    MistakeRetrySubmitData,
    MistakeSourceType,
} from '../types/mistakeTypes';

// Số câu hỏi hiển thị mặc định trên mỗi trang Sổ tay
const DEFAULT_PAGE_SIZE = 10;
// Số câu tối đa lấy vào 1 phiên làm lại nguyên bộ câu sai
const DEFAULT_RETRY_LIMIT = 30;
// Tập hợp mã nguồn hợp lệ để kiểm tra tham số đọc từ URL
const VALID_SOURCE_TYPES: readonly MistakeSourceType[] = [
    'DIAGNOSTIC',
    'MODULE_TEST',
    'FULL_MOCK_TEST',
];

/**
 * Chuyển chuỗi query param trên URL sang số nguyên dương hợp lệ (trả undefined nếu không hợp lệ).
 *
 * @param raw Chuỗi giá trị từ URLSearchParams
 * @returns Số nguyên dương hoặc undefined
 */
function parsePositiveIntParam(raw: string | null): number | undefined {
    // Bỏ qua nếu tham số rỗng
    if (!raw) {
        return undefined;
    }
    // Ép kiểu sang số nguyên hệ cơ số 10
    const parsed = Number.parseInt(raw, 10);
    // Chỉ chấp nhận số nguyên dương hợp lệ
    return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

/**
 * Chuyển chuỗi query param sang chỉ số trang không âm (mặc định 0).
 *
 * @param raw Chuỗi giá trị trang từ URLSearchParams
 * @returns Chỉ số trang >= 0
 */
function parsePageParam(raw: string | null): number {
    // Mặc định trang đầu tiên là 0 nếu không có trên URL
    if (!raw) {
        return 0;
    }
    // Ép kiểu và kẹp về >= 0
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
    // Trả undefined nếu trống
    if (!raw) {
        return undefined;
    }
    // Đối chiếu với danh sách hằng số nguồn hợp lệ
    return VALID_SOURCE_TYPES.includes(raw as MistakeSourceType)
        ? (raw as MistakeSourceType)
        : undefined;
}

/**
 * Custom Hook quản lý toàn bộ nghiệp vụ Sổ tay câu hỏi làm sai và phiên làm lại trực tiếp:
 * - Đồng bộ bộ lọc (part, ability, source, q, page) với URL Search Params để F5 không mất ngữ cảnh.
 * - Nạp danh sách câu sai phân trang từ Backend.
 * - Điều phối mở phiên làm lại nguyên bộ câu sai, chọn đáp án và nộp bài chấm điểm phía server.
 *
 * @param isActive Cờ xác nhận tab Sổ tay câu sai đang được mở (tránh gọi API thừa khi đang ở tab khác)
 */
export function useMistakeNotebook(isActive: boolean) {
    // Đọc và cập nhật các tham số bộ lọc trực tiếp trên URL
    const [searchParams, setSearchParams] = useSearchParams();

    // Lưu dữ liệu Sổ tay câu sai tải từ Backend
    const [data, setData] = useState<MistakeNotebookData | null>(null);
    // Trạng thái đang tải danh sách câu sai
    const [isLoading, setIsLoading] = useState<boolean>(false);
    // Thông báo lỗi nếu tải Sổ tay thất bại
    const [error, setError] = useState<string | null>(null);

    // Dữ liệu bộ đề đang mở ở chế độ Làm lại ngay nguyên bộ câu sai
    const [retrySet, setRetrySet] = useState<MistakeRetrySetData | null>(null);
    // Cờ đang gọi API khởi tạo bộ câu làm lại
    const [isLoadingRetrySet, setIsLoadingRetrySet] = useState<boolean>(false);
    // Lỗi khi mở hoặc nộp phiên làm lại
    const [retryError, setRetryError] = useState<string | null>(null);
    // Lưu phương án học viên chọn trong phiên làm lại theo từng questionId
    const [retryAnswers, setRetryAnswers] = useState<Record<number, OptionKey>>({});
    // Cờ đang gửi bài làm lại lên máy chủ chấm điểm
    const [isSubmittingRetry, setIsSubmittingRetry] = useState<boolean>(false);
    // Kết quả chấm điểm và lời giải chi tiết trả về sau khi nộp phiên làm lại
    const [retrySubmitResult, setRetrySubmitResult] = useState<MistakeRetrySubmitData | null>(null);

    // Trích xuất từng tiêu chí lọc từ URL Search Params (trạng thái dẫn xuất, không lưu trùng state)
    const partId = parsePositiveIntParam(searchParams.get('part'));
    const abilityId = parsePositiveIntParam(searchParams.get('ability'));
    const sourceType = parseSourceParam(searchParams.get('source'));
    const keyword = searchParams.get('q') ?? '';
    const page = parsePageParam(searchParams.get('page'));

    // Ô nhập tìm kiếm cục bộ đồng bộ với URL để gõ mượt rồi áp dụng
    const [searchInput, setSearchInput] = useState<string>(keyword);

    // Đồng bộ lại ô nhập nếu URL thay đổi (ví dụ bấm nút xóa bộ lọc hoặc quay lại trình duyệt)
    useEffect(() => {
        setSearchInput(keyword);
    }, [keyword]);

    // Hàm gọi API tải danh sách Sổ tay câu hỏi làm sai theo bộ lọc hiện tại
    const fetchNotebook = useCallback(async () => {
        // Bật trạng thái đang tải và xóa lỗi cũ
        setIsLoading(true);
        setError(null);
        try {
            // Gọi Backend lấy danh sách câu sai theo đúng bộ lọc đang áp dụng
            const res = await mistakeNotebookService.getMistakeNotebook({
                partId,
                abilityId,
                sourceType,
                keyword,
                page,
                size: DEFAULT_PAGE_SIZE,
            });
            // Lưu dữ liệu nếu phản hồi thành công
            if (res.success && res.data) {
                setData(res.data);
            } else {
                setError(res.message || 'Không thể tải sổ tay câu hỏi làm sai.');
            }
        } catch {
            // Hiển thị thông điệp thân thiện khi gặp lỗi kết nối
            setError('Không thể kết nối đến máy chủ để tải sổ tay câu hỏi làm sai.');
        } finally {
            // Tắt trạng thái tải sau khi kết thúc request
            setIsLoading(false);
        }
    }, [partId, abilityId, sourceType, keyword, page]);

    // Tự động nạp lại dữ liệu mỗi khi mở tab Sổ tay hoặc thay đổi bộ lọc / trang
    useEffect(() => {
        // Không gọi API khi người dùng chưa chuyển sang tab Sổ tay
        if (!isActive) {
            return;
        }
        void fetchNotebook();
    }, [isActive, fetchNotebook]);

    /**
     * Cập nhật một hoặc nhiều tham số lọc trên URL và tự động đưa về trang 0 khi đổi điều kiện lọc.
     *
     * @param updates Tập các cặp khóa-giá trị cần cập nhật lên URL
     */
    const updateFilterParams = useCallback(
        (updates: {
            part?: number | null;
            ability?: number | null;
            source?: MistakeSourceType | null;
            q?: string | null;
            page?: number | null;
        }) => {
            setSearchParams((prev) => {
                // Tạo bản sao URLSearchParams để tránh mutate trực tiếp
                const next = new URLSearchParams(prev);
                // Giữ cố định đang đứng ở tab Sổ tay câu sai
                next.set('tab', 'mistakes');

                // Cập nhật bộ lọc Phần thi và tự xóa bộ lọc kỹ năng nếu đổi Phần thi
                if ('part' in updates) {
                    if (updates.part) {
                        next.set('part', String(updates.part));
                    } else {
                        next.delete('part');
                    }
                }
                // Cập nhật bộ lọc Kỹ năng
                if ('ability' in updates) {
                    if (updates.ability) {
                        next.set('ability', String(updates.ability));
                    } else {
                        next.delete('ability');
                    }
                }
                // Cập nhật bộ lọc Nguồn bài thi
                if ('source' in updates) {
                    if (updates.source) {
                        next.set('source', updates.source);
                    } else {
                        next.delete('source');
                    }
                }
                // Cập nhật từ khóa tìm kiếm
                if ('q' in updates) {
                    const trimmed = updates.q?.trim() ?? '';
                    if (trimmed) {
                        next.set('q', trimmed);
                    } else {
                        next.delete('q');
                    }
                }
                // Cập nhật trang hiện tại (xóa param nếu về trang đầu 0 để URL gọn đẹp)
                if ('page' in updates) {
                    if (updates.page && updates.page > 0) {
                        next.set('page', String(updates.page));
                    } else {
                        next.delete('page');
                    }
                } else {
                    // Mặc định reset về trang đầu khi người dùng thay đổi điều kiện lọc
                    next.delete('page');
                }
                return next;
            });
        },
        [setSearchParams]
    );

    // Xóa sạch toàn bộ điều kiện lọc đang áp dụng
    const resetFilters = useCallback(() => {
        // Xóa trắng ô nhập tìm kiếm ngay lập tức
        setSearchInput('');
        // Xóa tất cả query param lọc trên URL
        updateFilterParams({
            part: null,
            ability: null,
            source: null,
            q: null,
            page: 0,
        });
    }, [updateFilterParams]);

    // Áp dụng từ khóa tìm kiếm khi người dùng nhấn Enter hoặc nút Tìm
    const applySearchKeyword = useCallback(() => {
        updateFilterParams({ q: searchInput });
    }, [searchInput, updateFilterParams]);

    // Khởi tạo phiên làm lại ngay nguyên bộ câu sai theo đúng bộ lọc đang chọn
    const startRetrySession = useCallback(async () => {
        // Bật loading khởi tạo phiên làm lại và xóa trạng thái cũ
        setIsLoadingRetrySet(true);
        setRetryError(null);
        setRetrySubmitResult(null);
        setRetryAnswers({});
        try {
            // Lấy bộ đề làm lại đã ẩn đáp án từ Backend
            const res = await mistakeNotebookService.getRetrySet(
                { partId, abilityId, sourceType, keyword },
                DEFAULT_RETRY_LIMIT
            );
            if (res.success && res.data && res.data.questions.length > 0) {
                setRetrySet(res.data);
            } else {
                setRetryError('Không có câu hỏi phù hợp để bắt đầu phiên làm lại.');
            }
        } catch {
            // Báo lỗi rõ ràng nếu gọi API thất bại
            setRetryError('Không thể khởi tạo phiên làm lại lúc này. Vui lòng thử lại.');
        } finally {
            setIsLoadingRetrySet(false);
        }
    }, [partId, abilityId, sourceType, keyword]);

    // Ghi nhận đáp án học viên chọn cho 1 câu trong phiên làm lại
    const selectRetryOption = useCallback((questionId: number, option: OptionKey) => {
        // Không cho sửa đáp án nếu phiên đã được nộp chấm điểm
        setRetryAnswers((prev) => ({
            ...prev,
            [questionId]: option,
        }));
    }, []);

    // Nộp toàn bộ đáp án của phiên làm lại lên Backend chấm điểm tức thì
    const submitRetrySession = useCallback(async () => {
        // Bảo vệ nếu không có bộ câu hỏi đang mở
        if (!retrySet || retrySet.questions.length === 0) {
            return;
        }
        // Bật trạng thái đang nộp bài
        setIsSubmittingRetry(true);
        setRetryError(null);
        try {
            // Đóng gói danh sách câu trả lời theo đúng thứ tự bộ câu hỏi trong phiên
            const payload = {
                answers: retrySet.questions.map((q) => ({
                    questionId: q.questionId,
                    selectedAnswer: retryAnswers[q.questionId] ?? null,
                })),
            };
            // Gọi Backend chấm điểm và nhận lời giải chi tiết cho từng câu
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

    // Làm lại ngay 1 lượt mới trên cùng bộ câu hỏi hiện tại (xóa đáp án đã chọn & kết quả cũ)
    const restartCurrentRetrySession = useCallback(() => {
        setRetryAnswers({});
        setRetrySubmitResult(null);
        setRetryError(null);
    }, []);

    // Thoát chế độ làm lại và quay về danh sách xem lại Sổ tay
    const exitRetrySession = useCallback(() => {
        setRetrySet(null);
        setRetryAnswers({});
        setRetrySubmitResult(null);
        setRetryError(null);
    }, []);

    // Lọc danh sách kỹ năng trong dropdown theo Part đang chọn (nếu người dùng đã chọn Part)
    const availableAbilities = useMemo(() => {
        const allAbilities = data?.filterOptions.abilities ?? [];
        if (!partId) {
            return allAbilities;
        }
        return allAbilities.filter((ab) => ab.partId === partId);
    }, [data, partId]);

    // Kiểm tra có đang bật bất kỳ điều kiện lọc nào hay không
    const hasActiveFilters = Boolean(partId || abilityId || sourceType || keyword.trim());

    return {
        data,
        isLoading,
        error,
        partId,
        abilityId,
        sourceType,
        keyword,
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
        refetch: fetchNotebook,
        updateFilterParams,
        resetFilters,
        applySearchKeyword,
        startRetrySession,
        selectRetryOption,
        submitRetrySession,
        restartCurrentRetrySession,
        exitRetrySession,
    };
}
