import { apiClient } from '@/core/api/apiClient';
import { axiosInstance } from '@/core/api/axios';
import type { ApiResponse } from '@/core/api/apiResponse';
import type {
    CreateQuestionGroupPayload,
    CreateStandaloneQuestionPayload,
    ImportRowError,
    QuestionDetail,
    QuestionFilterParams,
    QuestionImportResult,
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

    /**
     * Tải xuống file Excel (.xlsx) mẫu để nhập câu hỏi hàng loạt.
     */
    async downloadImportTemplate(): Promise<Blob> {
        const response = await axiosInstance.get<Blob>(`${BASE_URL}/import/template`, {
            responseType: 'blob',
        });
        return response.data;
    },

    /**
     * Tải lên file Excel (.xlsx) để kiểm tra và import hàng loạt câu hỏi.
     */
    async importFromExcel(file: File): Promise<ApiResponse<QuestionImportResult>> {
        const formData = new FormData();
        formData.append('file', file);
        const response = await axiosInstance.post<ApiResponse<QuestionImportResult>>(
            `${BASE_URL}/import`,
            formData,
            {
                headers: { 'Content-Type': 'multipart/form-data' },
                timeout: 60000,
            }
        );
        return response.data;
    },

    /**
     * Xuất danh sách lỗi import ra file Excel (.xlsx) để quản trị viên tải về điều chỉnh.
     */
    async downloadErrorReport(errors: ImportRowError[]): Promise<Blob> {
        const response = await axiosInstance.post<Blob>(
            `${BASE_URL}/import/error-report`,
            { errors },
            { responseType: 'blob' }
        );
        return response.data;
    },
};
