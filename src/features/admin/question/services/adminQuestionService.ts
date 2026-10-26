import { apiClient } from '@/core/api/apiClient';
import type { ApiResponse } from '@/core/api/apiResponse';
import type { 
  QuestionFilterParams, 
  QuestionListItemResponse, 
  QuestionDetailResponse 
} from '../types';

/**
 * Service quản lý gọi API liên quan đến Ngân hàng câu hỏi (UC-04).
 */
export const adminQuestionService = {
  /**
   * Lấy danh sách câu hỏi có phân trang và bộ lọc (theo Part, Ability, Type, Difficulty).
   * 
   * @param params Bộ lọc truy vấn.
   * @returns {Promise<ApiResponse<QuestionListItemResponse[]>>}
   */
  getQuestions(params: QuestionFilterParams): Promise<ApiResponse<QuestionListItemResponse[]>> {
    return apiClient.get<ApiResponse<QuestionListItemResponse[]>>('/api/v1/admin/questions', { params });
  },

  /**
   * Lấy chi tiết toàn bộ dữ liệu của một câu hỏi (bao gồm cả schema JSON).
   * 
   * @param id ID câu hỏi.
   */
  getById(id: number): Promise<ApiResponse<QuestionDetailResponse>> {
    return apiClient.get<ApiResponse<QuestionDetailResponse>>(`/api/v1/admin/questions/${id}`);
  },

  /**
   * Tạo câu hỏi mới trong Ngân hàng câu hỏi.
   * 
   * @param data Payload tạo mới (Lưu ý: questionData và correctAnswer phải là Object thuần, không phải string JSON khi gửi đi).
   */
  create(data: Omit<QuestionDetailResponse, 'id'>): Promise<ApiResponse<QuestionDetailResponse>> {
    return apiClient.post<ApiResponse<QuestionDetailResponse>>('/api/v1/admin/questions', data);
  },

  /**
   * Cập nhật thông tin câu hỏi.
   */
  update(id: number, data: Omit<QuestionDetailResponse, 'id'>): Promise<ApiResponse<QuestionDetailResponse>> {
    return apiClient.put<ApiResponse<QuestionDetailResponse>>(`/api/v1/admin/questions/${id}`, data);
  },

  /**
   * Xóa câu hỏi khỏi hệ thống.
   * LƯU Ý NGHIỆP VỤ: Sẽ bị chặn (HTTP 400) nếu câu hỏi này đã được sử dụng trong bất kỳ Bài kiểm tra (Module Test / Diagnostic Test) nào.
   */
  delete(id: number): Promise<ApiResponse<null>> {
    return apiClient.delete<ApiResponse<null>>(`/api/v1/admin/questions/${id}`);
  }
};

