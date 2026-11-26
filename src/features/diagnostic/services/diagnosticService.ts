import { apiClient } from '@/core/api/apiClient';
import { ENV } from '@/core/config/env.config';
import type { ApiResponse } from '@/core/api/apiResponse';
import type {
    DiagnosticTest,
    StartDiagnosticRequest,
    StartDiagnosticResponse,
    SubmitDiagnosticRequest,
    SubmitDiagnosticResponse,
    SyncDiagnosticTimerRequest,
    DiagnosticResult,
} from '../types/diagnosticTypes';

/**
 * Service giao tiếp API Backend cho Phòng thi chẩn đoán (UC06) và Báo cáo năng lực (UC07).
 */
export const diagnosticService = {
    /**
     * Khởi tạo lượt làm bài chẩn đoán mới (hoặc tái sử dụng phiên IN_PROGRESS / làm lại khi forceRetake = true).
     */
    async startDiagnostic(
        data: StartDiagnosticRequest = {}
    ): Promise<ApiResponse<StartDiagnosticResponse>> {
        // Gửi yêu cầu khởi tạo lượt thi chẩn đoán tới Backend
        return apiClient.post<ApiResponse<StartDiagnosticResponse>>(
            '/api/users/diagnostic/start',
            data
        );
    },

    /**
     * Kiểm tra và khôi phục phiên làm bài chẩn đoán đang diễn ra nếu học viên từng thoát/mất mạng (Luồng 5a).
     */
    async getActiveSession(): Promise<ApiResponse<DiagnosticTest | null>> {
        // Gọi API lấy phiên làm bài IN_PROGRESS gần nhất (kèm remainingSeconds đã ngưng đọng)
        return apiClient.get<ApiResponse<DiagnosticTest | null>>('/api/users/diagnostic/resume');
    },

    /**
     * Tải danh sách câu hỏi phòng thi theo attemptId đã khởi tạo.
     */
    async getExamForAttempt(attemptId: number): Promise<ApiResponse<DiagnosticTest>> {
        // Nạp toàn bộ câu hỏi và thời gian còn lại cho attemptId tương ứng
        return apiClient.get<ApiResponse<DiagnosticTest>>(
            `/api/users/diagnostic/exam/${attemptId}`
        );
    },

    /**
     * Đồng bộ số giây còn lại lên Backend để ngưng đọng đồng hồ khi tạm dừng hoặc mất kết nối.
     */
    async syncTimer(data: SyncDiagnosticTimerRequest): Promise<ApiResponse<number>> {
        // Gửi số giây còn lại hiện tại qua apiClient tiêu chuẩn
        return apiClient.post<ApiResponse<number>>('/api/users/diagnostic/timer/sync', data);
    },

    /**
     * Đồng bộ gấp số giây còn lại bằng fetch keepalive khi người dùng tắt tab, reload hoặc chuyển trang đột ngột.
     */
    syncTimerOnExit(data: SyncDiagnosticTimerRequest): void {
        // Gửi request với keepalive: true và credentials cookie để trình duyệt hoàn tất ngay cả khi tab đang đóng
        void fetch(`${ENV.API_URL}/api/users/diagnostic/timer/sync`, {
            method: 'POST',
            credentials: 'include',
            keepalive: true,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        }).catch(() => {
            // Bỏ qua lỗi mạng khi trình duyệt đang đóng hoặc mất kết nối
        });
    },

    /**
     * Nộp bài thi chẩn đoán, thực hiện chấm điểm 2 tầng và sinh lộ trình thích ứng.
     */
    async submitTest(
        data: SubmitDiagnosticRequest
    ): Promise<ApiResponse<SubmitDiagnosticResponse>> {
        // Gửi toàn bộ đáp án và cờ đánh dấu lên Backend chấm điểm
        return apiClient.post<ApiResponse<SubmitDiagnosticResponse>>(
            '/api/users/diagnostic/submit',
            data
        );
    },

    /**
     * Lấy báo cáo kết quả chi tiết và Radar 7 chiều theo attemptId (UC07).
     */
    async getResults(attemptId: number | string): Promise<ApiResponse<DiagnosticResult>> {
        // Truy vấn báo cáo chi tiết cho một lượt thi cụ thể
        return apiClient.get<ApiResponse<DiagnosticResult>>(
            `/api/users/diagnostic/results/${attemptId}`
        );
    },

    /**
     * Lấy báo cáo kết quả chẩn đoán gần nhất đã hoàn thành của học viên (UC07 Luồng 1a & 1b).
     */
    async getLatestResults(): Promise<ApiResponse<DiagnosticResult>> {
        // Truy vấn báo cáo của lượt thi chẩn đoán gần nhất
        return apiClient.get<ApiResponse<DiagnosticResult>>('/api/users/diagnostic/results/latest');
    },
};
