import { apiClient } from '@/core/api/apiClient';
import type { ApiResponse } from '@/core/api/apiResponse';
import { ENV } from '@/core/config/env.config';
import type {
    ModuleTestPerformanceReport,
    ModuleTestReviewData,
    ModuleTestRoomData,
    SaveModuleTestDraftRequest,
    StartModuleTestResponse,
    SubmitModuleTestRequest,
    SubmitModuleTestResponse,
} from '../types/moduleTestTypes';

/**
 * Service gọi trực tiếp Backend thật cho Phòng thi vượt ải mô-đun & Báo cáo kết quả (UC13 & UC14).
 */
export const moduleTestService = {
    async startModuleTest(moduleId: number | string): Promise<ApiResponse<StartModuleTestResponse>> {
        return apiClient.post<ApiResponse<StartModuleTestResponse>>(
            `/api/users/modules/${moduleId}/test/start`
        );
    },

    async resumeModuleTest(
        moduleId: number | string
    ): Promise<ApiResponse<ModuleTestRoomData | null>> {
        return apiClient.get<ApiResponse<ModuleTestRoomData | null>>(
            `/api/users/modules/${moduleId}/test/resume`
        );
    },

    async getExamRoom(
        moduleId: number | string,
        attemptId: number | string
    ): Promise<ApiResponse<ModuleTestRoomData>> {
        return apiClient.get<ApiResponse<ModuleTestRoomData>>(
            `/api/users/modules/${moduleId}/test/exam/${attemptId}`
        );
    },

    async saveDraftAnswers(
        moduleId: number | string,
        payload: SaveModuleTestDraftRequest
    ): Promise<ApiResponse<void>> {
        return apiClient.put<ApiResponse<void>>(
            `/api/users/modules/${moduleId}/test/answers/draft`,
            payload
        );
    },

    async syncTimer(
        moduleId: number | string,
        attemptId: number,
        remainingSeconds: number
    ): Promise<ApiResponse<number>> {
        return apiClient.post<ApiResponse<number>>(
            `/api/users/modules/${moduleId}/test/timer/sync`,
            {
                attemptId,
                remainingSeconds: Math.max(0, Math.floor(remainingSeconds)),
            }
        );
    },

    /**
     * Đồng bộ đồng hồ bằng fetch keepalive khi học viên đóng tab/trình duyệt (Luồng 7a).
     */
    syncTimerOnExit(
        moduleId: number | string,
        attemptId: number,
        remainingSeconds: number
    ): void {
        const url = `${ENV.API_URL}/api/users/modules/${moduleId}/test/timer/sync`;
        try {
            void fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                keepalive: true,
                body: JSON.stringify({
                    attemptId,
                    remainingSeconds: Math.max(0, Math.floor(remainingSeconds)),
                }),
            });
        } catch {
            // Không chặn luồng đóng tab của trình duyệt
        }
    },

    async submitTest(
        moduleId: number | string,
        payload: SubmitModuleTestRequest
    ): Promise<ApiResponse<SubmitModuleTestResponse>> {
        return apiClient.post<ApiResponse<SubmitModuleTestResponse>>(
            `/api/users/modules/${moduleId}/test/submit`,
            payload
        );
    },

    async getPerformanceReport(
        attemptId: number | string,
        moduleId: number | string
    ): Promise<ApiResponse<ModuleTestPerformanceReport>> {
        return apiClient.get<ApiResponse<ModuleTestPerformanceReport>>(
            `/api/users/modules/${moduleId}/test/results/${attemptId}`
        );
    },

    async getTestReview(
        moduleId: number | string,
        attemptId: number | string
    ): Promise<ApiResponse<ModuleTestReviewData>> {
        return apiClient.get<ApiResponse<ModuleTestReviewData>>(
            `/api/users/modules/${moduleId}/test/review/${attemptId}`
        );
    },
};
