import { apiClient } from '@/core/api/apiClient';
import type { ApiResponse } from '@/core/api/apiResponse';
import type {
    MistakeNotebookData,
    MistakeQueryParams,
    MistakeRetrySetData,
    MistakeRetrySubmitData,
    SubmitMistakeRetryPayload,
} from '../types/mistakeTypes';

/**
 * Service giao tiếp trực tiếp với Backend cho Sổ tay câu hỏi làm sai và phiên làm lại trực tiếp.
 */
export const mistakeNotebookService = {
    /**
     * Tải danh sách câu hỏi làm sai có phân trang và bộ lọc theo Part, Kỹ năng, Nguồn bài thi.
     *
     * @param params Bộ tham số lọc và phân trang
     * @returns Phản hồi chuẩn ApiResponse chứa dữ liệu MistakeNotebookData
     */
    async getMistakeNotebook(params: MistakeQueryParams): Promise<ApiResponse<MistakeNotebookData>> {
        // Tạo đối tượng tham số sạch, chỉ gắn các tiêu chí người dùng đang lọc
        const query: Record<string, string | number> = {};
        if (params.partId) {
            query.partId = params.partId;
        }
        if (params.abilityId) {
            query.abilityId = params.abilityId;
        }
        if (params.sourceType) {
            query.sourceType = params.sourceType;
        }
        if (params.keyword && params.keyword.trim()) {
            query.keyword = params.keyword.trim();
        }
        if (typeof params.page === 'number') {
            query.page = params.page;
        }
        if (typeof params.size === 'number') {
            query.size = params.size;
        }
        // Gọi trực tiếp endpoint GET /api/users/mistakes của Backend
        return apiClient.get<ApiResponse<MistakeNotebookData>>('/api/users/mistakes', {
            params: query,
        });
    },

    /**
     * Khởi tạo bộ câu hỏi làm lại theo bộ lọc hiện tại (Backend ẩn hoàn toàn đáp án và lời giải).
     *
     * @param params Bộ lọc hiện tại trên Sổ tay
     * @param limit  Số câu tối đa trong phiên làm lại (mặc định 20, tối đa 50)
     * @returns Phản hồi ApiResponse chứa bộ câu hỏi làm lại
     */
    async getRetrySet(
        params: Omit<MistakeQueryParams, 'page' | 'size'>,
        limit = 20
    ): Promise<ApiResponse<MistakeRetrySetData>> {
        // Chuẩn bị query params gửi kèm giới hạn số câu làm lại
        const query: Record<string, string | number> = { limit };
        if (params.partId) {
            query.partId = params.partId;
        }
        if (params.abilityId) {
            query.abilityId = params.abilityId;
        }
        if (params.sourceType) {
            query.sourceType = params.sourceType;
        }
        if (params.keyword && params.keyword.trim()) {
            query.keyword = params.keyword.trim();
        }
        // Gọi endpoint lấy bộ câu làm lại đã ẩn đáp án
        return apiClient.get<ApiResponse<MistakeRetrySetData>>('/api/users/mistakes/retry-set', {
            params: query,
        });
    },

    /**
     * Nộp toàn bộ đáp án của phiên làm lại lên máy chủ để chấm điểm và nhận lời giải chi tiết.
     *
     * @param payload Danh sách cặp mã câu hỏi và đáp án học viên chọn
     * @returns Phản hồi ApiResponse chứa điểm tổng và chi tiết từng câu
     */
    async submitRetryAnswers(
        payload: SubmitMistakeRetryPayload
    ): Promise<ApiResponse<MistakeRetrySubmitData>> {
        // Gửi POST chấm điểm phía server (chống lộ đáp án và bảo vệ IDOR)
        return apiClient.post<ApiResponse<MistakeRetrySubmitData>>(
            '/api/users/mistakes/retry-submit',
            payload
        );
    },
};
