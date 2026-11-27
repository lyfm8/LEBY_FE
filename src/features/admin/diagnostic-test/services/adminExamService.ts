import { apiClient } from '@/core/api/apiClient';
import type { ApiResponse } from '@/core/api/apiResponse';
import type {
  AutoSelectResponse,
  ExamDetail,
  ExamFormPayload,
  ExamListItem,
  ExamMatrixAvailability,
  ExamStatus,
  ExamType,
} from '../types';

const BASE_URL = '/api/admin/exams';

export interface ExamQueryParams {
  page?: number;
  size?: number;
  keyword?: string;
  testType?: ExamType;
  examStatus?: ExamStatus;
}

/**
 * Service kết nối toàn bộ API Quản lý Đề thi (Diagnostic & Mock Test).
 * Base URL: /api/admin/exams
 */
export const adminExamService = {
  /**
   * Lấy danh sách đề thi kèm phân trang và bộ lọc.
   */
  getExams(params: ExamQueryParams = {}): Promise<ApiResponse<ExamListItem[]>> {
    return apiClient.get<ApiResponse<ExamListItem[]>>(BASE_URL, { params });
  },

  /**
   * Lấy số lượng đề thi trên các Tabs (Tất cả, Chẩn đoán, Thi thử).
   */
  getExamTabCounts(): Promise<ApiResponse<Record<string, number>>> {
    return apiClient.get<ApiResponse<Record<string, number>>>(`${BASE_URL}/tab-counts`);
  },

  /**
   * Lấy chi tiết đề thi kèm danh sách câu hỏi.
   */
  getById(id: number): Promise<ApiResponse<ExamDetail>> {
    return apiClient.get<ApiResponse<ExamDetail>>(`${BASE_URL}/${id}`);
  },

  /**
   * Tạo đề thi mới (DRAFT hoặc ARCHIVE).
   */
  create(payload: ExamFormPayload): Promise<ApiResponse<ExamDetail>> {
    return apiClient.post<ApiResponse<ExamDetail>>(BASE_URL, payload);
  },

  /**
   * Cập nhật thông tin đề thi.
   */
  update(id: number, payload: ExamFormPayload): Promise<ApiResponse<ExamDetail>> {
    return apiClient.put<ApiResponse<ExamDetail>>(`${BASE_URL}/${id}`, payload);
  },

  /**
   * Kích hoạt đề thi (CHỈ ADMIN).
   */
  activate(id: number): Promise<ApiResponse<void>> {
    return apiClient.patch<ApiResponse<void>>(`${BASE_URL}/${id}/activate`);
  },

  /**
   * Lưu trữ đề thi (CHỈ ADMIN).
   */
  archive(id: number): Promise<ApiResponse<void>> {
    return apiClient.patch<ApiResponse<void>>(`${BASE_URL}/${id}/archive`);
  },

  /**
   * Xóa đề thi (CHỈ ADMIN, chỉ khi chưa có lượt thi nào).
   */
  delete(id: number): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`${BASE_URL}/${id}`);
  },

  /**
   * Lấy số lượng câu hỏi khả dụng theo ma trận và Abilities trong DB.
   */
  getMatrixAvailability(): Promise<ApiResponse<ExamMatrixAvailability>> {
    return apiClient.get<ApiResponse<ExamMatrixAvailability>>(`${BASE_URL}/matrix-availability`);
  },

  /**
   * Tự động chọn câu hỏi ngẫu nhiên từ Question Bank theo ma trận.
   */
  autoSelect(payload: { testType: ExamType; totalQuestions?: number; customDistribution?: Record<number, number> }): Promise<ApiResponse<AutoSelectResponse>> {
    return apiClient.post<ApiResponse<AutoSelectResponse>>(`${BASE_URL}/auto-select`, payload);
  },
};

