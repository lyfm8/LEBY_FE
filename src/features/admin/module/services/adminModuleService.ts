import { apiClient } from '@/core/api/apiClient';
import type { ApiResponse } from '@/core/api/apiResponse';
import type { 
  ModuleFilterParams, 
  ModuleResponse, 
  LessonResponse,
  CreateModuleRequest,
  CreateVideoLessonRequest,
  CreatePracticeLessonRequest
} from '../types';

/**
 * Service quản lý gọi API liên quan đến Module học tập và các bài học bên trong (UC-05).
 */
export const adminModuleService = {
  /**
   * Lấy danh sách các Module.
   * @param params Bộ lọc truy vấn.
   */
  getModules(params?: ModuleFilterParams): Promise<ApiResponse<ModuleResponse[]>> {
    return apiClient.get<ApiResponse<ModuleResponse[]>>('/api/v1/admin/modules', { params });
  },

  /**
   * Lấy danh sách toàn bộ các bài học (Lessons) bên trong một Module cụ thể.
   * @param moduleId ID của Module.
   */
  getLessons(moduleId: number): Promise<ApiResponse<LessonResponse[]>> {
    return apiClient.get<ApiResponse<LessonResponse[]>>(`/api/v1/admin/modules/${moduleId}/lessons`);
  },

  /**
   * Tạo mới một Module học tập.
   */
  createModule(data: CreateModuleRequest): Promise<ApiResponse<ModuleResponse>> {
    return apiClient.post<ApiResponse<ModuleResponse>>('/api/v1/admin/modules', data);
  },

  updateModule(id: number, data: CreateModuleRequest): Promise<ApiResponse<ModuleResponse>> {
    return apiClient.put<ApiResponse<ModuleResponse>>(`/api/v1/admin/modules/${id}`, data);
  },

  /**
   * Xóa Module. 
   * LƯU Ý NGHIỆP VỤ: Xóa module có thể cascade xóa các bài học bên trong tùy thuộc vào cấu hình DB.
   */
  deleteModule(id: number): Promise<ApiResponse<null>> {
    return apiClient.delete<ApiResponse<null>>(`/api/v1/admin/modules/${id}`);
  },

  // =====================================
  // LESSON MANAGEMENT
  // =====================================

  /**
   * Tạo bài học dạng Video (Lý thuyết).
   */
  createVideoLesson(moduleId: number, data: CreateVideoLessonRequest): Promise<ApiResponse<LessonResponse>> {
    return apiClient.post<ApiResponse<LessonResponse>>(`/api/v1/admin/modules/${moduleId}/lessons/video`, data);
  },

  /**
   * Tạo bài học dạng Bài tập (Practice).
   */
  createPracticeLesson(moduleId: number, data: CreatePracticeLessonRequest): Promise<ApiResponse<LessonResponse>> {
    return apiClient.post<ApiResponse<LessonResponse>>(`/api/v1/admin/modules/${moduleId}/lessons/practice`, data);
  },

  /**
   * Cập nhật thông tin bài học (Dùng chung cho cả Video và Practice).
   */
  updateLesson(id: number, data: any): Promise<ApiResponse<LessonResponse>> {
    return apiClient.put<ApiResponse<LessonResponse>>(`/api/v1/admin/lessons/${id}`, data);
  },

  deleteLesson(id: number): Promise<ApiResponse<null>> {
    return apiClient.delete<ApiResponse<null>>(`/api/v1/admin/lessons/${id}`);
  },

  /**
   * Cập nhật lại thứ tự các bài học trong một Module sau khi user kéo thả.
   * @param orderedLessonIds Mảng ID bài học đã được sắp xếp theo đúng thứ tự mới.
   */
  reorderLessons(moduleId: number, orderedLessonIds: number[]): Promise<ApiResponse<null>> {
    return apiClient.patch<ApiResponse<null>>(`/api/v1/admin/modules/${moduleId}/reorder-lessons`, { orderedLessonIds });
  }
};

