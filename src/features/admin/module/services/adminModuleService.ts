import { apiClient } from '@/core/api/apiClient';
import type { ApiResponse } from '@/core/api/apiResponse';
import type { PartResponse, AbilityResponse } from '@/features/admin/part/types';
import type {
  ModuleFilterParams,
  ModuleResponse,
  LessonResponse,
  CreateModuleRequest,
  CreateLessonRequest,
  UpdateModuleThresholdsRequest,
  LessonScriptDto,
} from '../types';

/**
 * Service quản lý gọi API liên quan đến Module học tập, Lesson và Script (Use Case A05).
 * URL prefix chuẩn: /api/admin/... (Không chứa /v1).
 */
export const adminModuleService = {
  // =====================================
  // MODULE MANAGEMENT
  // =====================================

  /**
   * Lấy danh sách toàn bộ các Module kèm bài học con theo thứ tự hiển thị sư phạm.
   */
  getModules(params?: ModuleFilterParams): Promise<ApiResponse<ModuleResponse[]>> {
    return apiClient.get<ApiResponse<ModuleResponse[]>>('/api/admin/modules', { params });
  },

  /**
   * Lấy chi tiết thông tin của một Module theo ID.
   */
  getModuleById(id: number): Promise<ApiResponse<ModuleResponse>> {
    return apiClient.get<ApiResponse<ModuleResponse>>(`/api/admin/modules/${id}`);
  },

  /**
   * Tạo mới một Module học tập.
   */
  createModule(data: CreateModuleRequest): Promise<ApiResponse<ModuleResponse>> {
    return apiClient.post<ApiResponse<ModuleResponse>>('/api/admin/modules', data);
  },

  /**
   * Cập nhật thông tin toàn diện của Module.
   */
  updateModule(id: number, data: CreateModuleRequest): Promise<ApiResponse<ModuleResponse>> {
    return apiClient.put<ApiResponse<ModuleResponse>>(`/api/admin/modules/${id}`, data);
  },

  /**
   * Cập nhật nhanh các tham số động của Module (Điểm đỗ mặc định và Tỷ lệ bài giảng hoàn thành).
   */
  updateModuleThresholds(id: number, data: UpdateModuleThresholdsRequest): Promise<ApiResponse<ModuleResponse>> {
    return apiClient.patch<ApiResponse<ModuleResponse>>(`/api/admin/modules/${id}/thresholds`, data);
  },

  /**
   * Xóa Module (chặn xóa nếu có học viên theo học trong lộ trình).
   */
  deleteModule(id: number): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/api/admin/modules/${id}`);
  },

  /**
   * Sắp xếp lại thứ tự sư phạm tuần tự giữa các Module sau khi kéo thả.
   */
  reorderModules(orderedModuleIds: number[]): Promise<ApiResponse<void>> {
    return apiClient.patch<ApiResponse<void>>('/api/admin/modules/reorder', { orderedModuleIds });
  },

  // =====================================
  // LESSON MANAGEMENT
  // =====================================

  /**
   * Lấy danh sách toàn bộ các bài học (Lessons) bên trong một Module cụ thể.
   */
  getLessons(moduleId: number): Promise<ApiResponse<LessonResponse[]>> {
    return apiClient.get<ApiResponse<LessonResponse[]>>(`/api/admin/modules/${moduleId}/lessons`);
  },

  /**
   * Lấy thông tin chi tiết một bài học (kèm kịch bản phụ đề).
   */
  getLessonById(lessonId: number): Promise<ApiResponse<LessonResponse>> {
    return apiClient.get<ApiResponse<LessonResponse>>(`/api/admin/lessons/${lessonId}`);
  },

  /**
   * Tạo bài học mới trong một Module.
   */
  createLesson(moduleId: number, data: CreateLessonRequest): Promise<ApiResponse<LessonResponse>> {
    return apiClient.post<ApiResponse<LessonResponse>>(`/api/admin/modules/${moduleId}/lessons`, data);
  },

  /**
   * Cập nhật thông tin bài học.
   */
  updateLesson(id: number, data: CreateLessonRequest): Promise<ApiResponse<LessonResponse>> {
    return apiClient.put<ApiResponse<LessonResponse>>(`/api/admin/lessons/${id}`, data);
  },

  /**
   * Xóa bài học.
   */
  deleteLesson(id: number): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/api/admin/lessons/${id}`);
  },

  /**
   * Cập nhật lại thứ tự các bài học trong một Module sau khi kéo thả.
   */
  reorderLessons(moduleId: number, orderedLessonIds: number[]): Promise<ApiResponse<void>> {
    return apiClient.patch<ApiResponse<void>>(`/api/admin/modules/${moduleId}/reorder-lessons`, { orderedLessonIds });
  },

  /**
   * Lưu hoặc cập nhật toàn bộ kịch bản phụ đề (Script) cho bài nghe.
   */
  saveLessonScripts(lessonId: number, scripts: LessonScriptDto[]): Promise<ApiResponse<LessonResponse>> {
    return apiClient.put<ApiResponse<LessonResponse>>(`/api/admin/lessons/${lessonId}/scripts`, { scripts });
  },

  /**
   * Lấy danh sách Phần thi TOEIC (Part) phục vụ dropdown liên kết.
   */
  getParts(): Promise<ApiResponse<PartResponse[]>> {
    return apiClient.get<ApiResponse<PartResponse[]>>('/api/admin/parts');
  },

  /**
   * Lấy danh sách Năng lực rèn luyện (Ability) theo Part.
   */
  getAbilities(partId: number): Promise<ApiResponse<AbilityResponse[]>> {
    return apiClient.get<ApiResponse<AbilityResponse[]>>(`/api/admin/parts/${partId}/abilities`);
  },
};
