import { apiClient } from '@/core/api/apiClient';
import type { ApiResponse } from '@/core/api/apiResponse';
import type { QuestionListItemResponse } from '@/features/admin-question/types';

export const adminModuleTestService = {
  /**
   * Lấy danh sách câu hỏi test của 1 module
   */
  getTestQuestions(moduleId: number): Promise<ApiResponse<QuestionListItemResponse[]>> {
    return apiClient.get<ApiResponse<QuestionListItemResponse[]>>(`/api/v1/admin/modules/${moduleId}/test-questions`);
  },

  /**
   * Cập nhật toàn bộ danh sách câu hỏi (batch)
   */
  updateTestQuestions(moduleId: number, data: { questionIds: number[] }): Promise<ApiResponse<null>> {
    return apiClient.post<ApiResponse<null>>(`/api/v1/admin/modules/${moduleId}/test-questions/batch`, data);
  }
};
