import { apiClient } from '@/core/api/apiClient';
import type { ApiResponse } from '@/core/api/apiResponse';
import type {
  AutoSelectModuleTestQuestionsRequest,
  ModuleTestConfigDetail,
  ModuleTestOverviewItem,
  ModuleTestQuestionItem,
  SaveModuleTestConfigRequest,
} from '../types';

/**
 * Service gọi API quản lý và cấu hình Bài thi vượt ải mô-đun.
 * Kết nối trực tiếp tới hệ thống Backend thật theo chuẩn tiền tố /api/admin/module-tests.
 */
export const adminModuleTestService = {
  /**
   * Lấy danh sách tổng quan trạng thái bài thi vượt ải của tất cả các mô-đun.
   */
  getOverviewList(): Promise<ApiResponse<ModuleTestOverviewItem[]>> {
    // Gửi request GET lấy danh sách toàn bộ mô-đun kèm trạng thái đề thi vượt ải
    return apiClient.get<ApiResponse<ModuleTestOverviewItem[]>>('/api/admin/module-tests');
  },

  /**
   * Lấy chi tiết cấu hình bài thi vượt ải và danh sách câu hỏi hiện tại của một mô-đun.
   */
  getConfigDetail(moduleId: number): Promise<ApiResponse<ModuleTestConfigDetail>> {
    // Gửi request GET lấy tham số và bộ câu hỏi vượt ải của mô-đun theo moduleId
    return apiClient.get<ApiResponse<ModuleTestConfigDetail>>(`/api/admin/module-tests/${moduleId}`);
  },

  /**
   * Lưu cấu hình tham số và danh sách câu hỏi cho bài thi vượt ải mô-đun.
   */
  saveConfig(
    moduleId: number,
    payload: SaveModuleTestConfigRequest
  ): Promise<ApiResponse<ModuleTestConfigDetail>> {
    // Gửi request PUT cập nhật tham số thời gian, số câu, xáo trộn và bộ câu hỏi
    return apiClient.put<ApiResponse<ModuleTestConfigDetail>>(
      `/api/admin/module-tests/${moduleId}`,
      payload
    );
  },

  /**
   * Tự động bốc ngẫu nhiên danh sách câu hỏi từ kho câu hỏi thuộc năng lực của mô-đun.
   */
  autoSelectQuestions(
    moduleId: number,
    payload: AutoSelectModuleTestQuestionsRequest
  ): Promise<ApiResponse<ModuleTestQuestionItem[]>> {
    // Gửi request POST yêu cầu Backend bốc ngẫu nhiên N câu hỏi khả dụng
    return apiClient.post<ApiResponse<ModuleTestQuestionItem[]>>(
      `/api/admin/module-tests/${moduleId}/auto-select`,
      payload
    );
  },
};
