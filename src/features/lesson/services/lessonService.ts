import { apiClient } from '@/core/api/apiClient';
import type { ApiResponse } from '@/core/api/apiResponse';
import type { LessonDetail, CompleteLessonResponse } from '../types/lessonTypes';

export const lessonService = {
    async getLesson(moduleId: number | string, lessonId: number | string): Promise<ApiResponse<LessonDetail>> {
        return apiClient.get<ApiResponse<LessonDetail>>(`/api/v1/modules/${moduleId}/lessons/${lessonId}`);
    },

    async completeLesson(moduleId: number | string, lessonId: number | string): Promise<ApiResponse<CompleteLessonResponse>> {
        return apiClient.post<ApiResponse<CompleteLessonResponse>>(`/api/v1/modules/${moduleId}/lessons/${lessonId}/complete`, {});
    },
};
