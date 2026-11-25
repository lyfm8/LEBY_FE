import { apiClient } from '@/core/api/apiClient';
import type { ApiResponse } from '@/core/api/apiResponse';
import type {
    DiagnosticTest,
    StartDiagnosticRequest,
    StartDiagnosticResponse,
    SubmitDiagnosticRequest,
    SubmitDiagnosticResponse,
    DiagnosticResult,
} from '../types/diagnosticTypes';

/**
 * Service giao tiếp API Backend cho Phòng thi chẩn đoán (UC06) và Báo cáo năng lực (UC07).
 */
export const diagnosticService = {
    /**
     * Khởi tạo lượt làm bài chẩn đoán mới (hoặc tái sử dụng phiên IN_PROGRESS nếu đang tồn tại).
     */
    async startDiagnostic(
        data: StartDiagnosticRequest = {}
    ): Promise<ApiResponse<StartDiagnosticResponse>> {
        return apiClient.post<ApiResponse<StartDiagnosticResponse>>(
            '/api/users/diagnostic/start',
            data
        );
    },

    /**
     * Kiểm tra và khôi phục phiên làm bài chẩn đoán đang diễn ra nếu học viên từng thoát/mất mạng (Luồng 5a).
     */
    async getActiveSession(): Promise<ApiResponse<DiagnosticTest | null>> {
        return apiClient.get<ApiResponse<DiagnosticTest | null>>('/api/users/diagnostic/resume');
    },

    /**
     * Tải danh sách câu hỏi phòng thi theo attemptId đã khởi tạo.
     */
    async getExamForAttempt(attemptId: number): Promise<ApiResponse<DiagnosticTest>> {
        return apiClient.get<ApiResponse<DiagnosticTest>>(
            `/api/users/diagnostic/exam/${attemptId}`
        );
    },

    /**
     * Nộp bài thi chẩn đoán, thực hiện chấm điểm 2 tầng và sinh lộ trình thích ứng.
     */
    async submitTest(
        data: SubmitDiagnosticRequest
    ): Promise<ApiResponse<SubmitDiagnosticResponse>> {
        return apiClient.post<ApiResponse<SubmitDiagnosticResponse>>(
            '/api/users/diagnostic/submit',
            data
        );
    },

    /**
     * Lấy báo cáo kết quả chi tiết và Radar 7 chiều theo attemptId (UC07).
     */
    async getResults(attemptId: number | string): Promise<ApiResponse<DiagnosticResult>> {
        return apiClient.get<ApiResponse<DiagnosticResult>>(
            `/api/users/diagnostic/results/${attemptId}`
        );
    },

    /**
     * Lấy báo cáo kết quả chẩn đoán gần nhất đã hoàn thành của học viên (UC07 Luồng 1a & 1b).
     */
    async getLatestResults(): Promise<ApiResponse<DiagnosticResult>> {
        return apiClient.get<ApiResponse<DiagnosticResult>>('/api/users/diagnostic/results/latest');
    },
};
