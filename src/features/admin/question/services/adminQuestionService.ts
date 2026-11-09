import { apiClient } from '@/core/api/apiClient';
import type { ApiResponse } from '@/core/api/apiResponse';
import type {
    CreateQuestionGroupPayload,
    CreateStandaloneQuestionPayload,
    QuestionDetail,
    QuestionFilterParams,
    QuestionListItem,
    UpdateQuestionGroupPayload,
    UpdateStandaloneQuestionPayload,
} from '../types';

const BASE_URL = '/api/admin/questions';

/**
 * Service kết nối toàn bộ API Quản lý Ngân hàng câu hỏi (UC A04).
 * Tuân thủ quy chuẩn không dùng /v1 và bọc kết quả qua ApiResponse<T>.
 */
export const adminQuestionService = {
    /**
     * Lấy danh sách câu hỏi gốc với bộ lọc đa tiêu chí và phân trang.
     */
    getQuestions(params: QuestionFilterParams = {}): Promise<ApiResponse<QuestionListItem[]>> {
        return apiClient.get<ApiResponse<QuestionListItem[]>>(BASE_URL, { params });
    },

    /**
     * Lấy chi tiết câu hỏi (đơn hoặc chùm kèm danh sách câu con).
     */
    getById(id: number): Promise<ApiResponse<QuestionDetail>> {
        return apiClient.get<ApiResponse<QuestionDetail>>(`${BASE_URL}/${id}`);
    },

    /**
     * Tạo mới câu hỏi đơn lập (Part 1, 2, 5).
     */
    createStandalone(payload: CreateStandaloneQuestionPayload): Promise<ApiResponse<QuestionDetail>> {
        return apiClient.post<ApiResponse<QuestionDetail>>(`${BASE_URL}/standalone`, payload);
    },

    /**
     * Cập nhật câu hỏi đơn lập.
     */
    updateStandalone(id: number, payload: UpdateStandaloneQuestionPayload): Promise<ApiResponse<QuestionDetail>> {
        return apiClient.put<ApiResponse<QuestionDetail>>(`${BASE_URL}/standalone/${id}`, payload);
    },

    /**
     * Tạo mới chùm câu hỏi chung ngữ cảnh (Part 3, 4, 6, 7).
     */
    createGroup(payload: CreateQuestionGroupPayload): Promise<ApiResponse<QuestionDetail>> {
        return apiClient.post<ApiResponse<QuestionDetail>>(`${BASE_URL}/groups`, payload);
    },

    /**
     * Cập nhật chùm câu hỏi và toàn bộ các câu con.
     */
    updateGroup(id: number, payload: UpdateQuestionGroupPayload): Promise<ApiResponse<QuestionDetail>> {
        return apiClient.put<ApiResponse<QuestionDetail>>(`${BASE_URL}/groups/${id}`, payload);
    },

    /**
     * Xóa câu hỏi (câu đơn hoặc chùm câu hỏi).
     * Bị chặn (HTTP 409) nếu câu hỏi đang nằm trong đề thi.
     */
    delete(id: number): Promise<ApiResponse<void>> {
        return apiClient.delete<ApiResponse<void>>(`${BASE_URL}/${id}`);
    },
};
