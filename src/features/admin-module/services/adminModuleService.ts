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

export const adminModuleService = {
  getModules(params?: ModuleFilterParams): Promise<ApiResponse<ModuleResponse[]>> {
    return apiClient.get<ApiResponse<ModuleResponse[]>>('/api/v1/admin/modules', { params });
  },

  getLessons(moduleId: number): Promise<ApiResponse<LessonResponse[]>> {
    return apiClient.get<ApiResponse<LessonResponse[]>>(`/api/v1/admin/modules/${moduleId}/lessons`);
  },

  createModule(data: CreateModuleRequest): Promise<ApiResponse<ModuleResponse>> {
    return apiClient.post<ApiResponse<ModuleResponse>>('/api/v1/admin/modules', data);
  },

  updateModule(id: number, data: CreateModuleRequest): Promise<ApiResponse<ModuleResponse>> {
    return apiClient.put<ApiResponse<ModuleResponse>>(`/api/v1/admin/modules/${id}`, data);
  },

  deleteModule(id: number): Promise<ApiResponse<null>> {
    return apiClient.delete<ApiResponse<null>>(`/api/v1/admin/modules/${id}`);
  },

  createVideoLesson(moduleId: number, data: CreateVideoLessonRequest): Promise<ApiResponse<LessonResponse>> {
    return apiClient.post<ApiResponse<LessonResponse>>(`/api/v1/admin/modules/${moduleId}/lessons/video`, data);
  },

  createPracticeLesson(moduleId: number, data: CreatePracticeLessonRequest): Promise<ApiResponse<LessonResponse>> {
    return apiClient.post<ApiResponse<LessonResponse>>(`/api/v1/admin/modules/${moduleId}/lessons/practice`, data);
  },

  updateLesson(id: number, data: any): Promise<ApiResponse<LessonResponse>> {
    return apiClient.put<ApiResponse<LessonResponse>>(`/api/v1/admin/lessons/${id}`, data);
  },

  deleteLesson(id: number): Promise<ApiResponse<null>> {
    return apiClient.delete<ApiResponse<null>>(`/api/v1/admin/lessons/${id}`);
  },

  reorderLessons(moduleId: number, orderedLessonIds: number[]): Promise<ApiResponse<null>> {
    return apiClient.patch<ApiResponse<null>>(`/api/v1/admin/modules/${moduleId}/reorder-lessons`, { orderedLessonIds });
  }
};
