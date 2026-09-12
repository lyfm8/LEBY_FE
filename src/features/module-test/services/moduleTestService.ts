import { apiClient } from '@/core/api/apiClient';
import type { ApiResponse } from '@/core/api/apiResponse';
import type {
    ModuleTestData,
    SubmitModuleTestRequest,
    ModuleTestResult,
    ModuleTestPerformanceReport,
} from '../types/moduleTestTypes';

export const moduleTestService = {
    getModuleTest(moduleId: number | string): Promise<ApiResponse<ModuleTestData>> {
        return apiClient.get<ApiResponse<ModuleTestData>>(`/api/v1/modules/${moduleId}/test`);
    },

    submitModuleTest(data: SubmitModuleTestRequest): Promise<ApiResponse<{ attemptId: number; score: number; passScore: number; isPassed: boolean; redirectUrl: string }>> {
        return apiClient.post<ApiResponse<{ attemptId: number; score: number; passScore: number; isPassed: boolean; redirectUrl: string }>>(
            `/api/v1/modules/${data.moduleId}/test/submit`,
            data
        );
    },

    submitTest(moduleId: number | string, data: SubmitModuleTestRequest): Promise<ApiResponse<{ attemptId: number; score: number; passScore: number; isPassed: boolean; redirectUrl: string }>> {
        return apiClient.post<ApiResponse<{ attemptId: number; score: number; passScore: number; isPassed: boolean; redirectUrl: string }>>(
            `/api/v1/modules/${moduleId}/test/submit`,
            data
        );
    },

    getTestReview(param1: number | string, param2?: number | string): Promise<ApiResponse<ModuleTestResult>> {
        const attemptId = param2 !== undefined ? param2 : param1;
        return apiClient.get<ApiResponse<ModuleTestResult>>(`/api/v1/modules/0/test/review/${attemptId}`);
    },

    getPerformanceReport(attemptId: number | string, moduleId?: number | string): Promise<ApiResponse<ModuleTestPerformanceReport>> {
        const modId = moduleId ?? 2;
        return apiClient.get<ApiResponse<ModuleTestPerformanceReport>>(`/api/v1/modules/${modId}/test/results/${attemptId}`);
    },

    getLatestPerformanceReport(): Promise<ApiResponse<ModuleTestPerformanceReport>> {
        return apiClient.get<ApiResponse<ModuleTestPerformanceReport>>('/api/v1/learning-results/latest');
    },
};
