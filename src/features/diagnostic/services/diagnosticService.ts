import { apiClient } from '@/core/api/apiClient';
import type { ApiResponse } from '@/core/api/apiResponse';
import type {
    DiagnosticTest,
    SubmitDiagnosticRequest,
    SubmitDiagnosticResponse,
    DiagnosticResult,
} from '../types/diagnosticTypes';

export const diagnosticService = {
    async getComprehensiveTest(): Promise<ApiResponse<DiagnosticTest>> {
        return apiClient.get<ApiResponse<DiagnosticTest>>('/api/v1/diagnostic/comprehensive-test');
    },

    async submitTest(data: SubmitDiagnosticRequest): Promise<ApiResponse<SubmitDiagnosticResponse>> {
        return apiClient.post<ApiResponse<SubmitDiagnosticResponse>>('/api/v1/diagnostic/submit', data);
    },

    async getResults(attemptId: number | string): Promise<ApiResponse<DiagnosticResult>> {
        return apiClient.get<ApiResponse<DiagnosticResult>>(`/api/v1/diagnostic/results/${attemptId}`);
    },
};