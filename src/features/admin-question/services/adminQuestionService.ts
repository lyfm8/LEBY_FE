import { apiClient } from '@/core/api/apiClient';
import type { ApiResponse } from '@/core/api/apiResponse';
import type { 
  QuestionFilterParams, 
  QuestionListItemResponse, 
  QuestionDetailResponse 
} from '../types';

export const adminQuestionService = {
  /**
   * Lấy danh sách câu hỏi có phân trang và bộ lọc
   */
  getQuestions(params: QuestionFilterParams): Promise<ApiResponse<QuestionListItemResponse[]>> {
    return apiClient.get<ApiResponse<QuestionListItemResponse[]>>('/api/v1/admin/questions', { params });
  },

  /**
   * Lấy chi tiết câu hỏi (để show lên form edit)
   */
  getById(id: number): Promise<ApiResponse<QuestionDetailResponse>> {
    return apiClient.get<ApiResponse<QuestionDetailResponse>>(`/api/v1/admin/questions/${id}`);
  },

  /**
   * Tạo câu hỏi mới
   * Lưu ý: Gọi API với payload là Object JSON (form parse JSON string trước khi gửi)
   */
  create(data: Omit<QuestionDetailResponse, 'id'>): Promise<ApiResponse<QuestionDetailResponse>> {
    return apiClient.post<ApiResponse<QuestionDetailResponse>>('/api/v1/admin/questions', data);
  },

  /**
   * Cập nhật câu hỏi
   */
  update(id: number, data: Omit<QuestionDetailResponse, 'id'>): Promise<ApiResponse<QuestionDetailResponse>> {
    return apiClient.put<ApiResponse<QuestionDetailResponse>>(`/api/v1/admin/questions/${id}`, data);
  },

  /**
   * Xóa câu hỏi (Sẽ fail nếu đang được sử dụng ở bài test)
   */
  delete(id: number): Promise<ApiResponse<null>> {
    return apiClient.delete<ApiResponse<null>>(`/api/v1/admin/questions/${id}`);
  }
};
