import { apiClient } from '@/core/api/apiClient';
import type { ApiResponse } from '@/core/api/apiResponse';
import { ENV } from '@/core/config/env.config';
import type {
    MockExamListData,
    MockExamReportData,
    MockExamReviewData,
    MockExamRoomData,
    MockExamSubmitResponse,
    SaveMockExamDraftRequest,
    StartMockExamRequest,
    StartMockExamResponse,
    SubmitMockExamRequest,
} from '../types/mockExamTypes';

// Tập hợp các phương thức giao tiếp trực tiếp với Backend cho Phòng thi thử ETS & Báo cáo đầu ra (UC17 & UC18)
export const mockExamService = {
    // Tải danh sách đề thi thử, trạng thái mở khóa đề đầu ra và lịch sử làm bài
    async listMockExams(): Promise<ApiResponse<MockExamListData>> {
        // Gọi API GET danh sách phòng thi thử của học viên hiện tại
        return apiClient.get<ApiResponse<MockExamListData>>('/api/users/mock-exam/list');
    },

    // Bắt đầu lượt thi thử mới hoặc tiếp tục phiên đang dở theo diagnosticTestId
    async startMockExam(
        payload: StartMockExamRequest
    ): Promise<ApiResponse<StartMockExamResponse>> {
        // Gọi API POST khởi tạo phiên thi thử chuẩn ETS
        return apiClient.post<ApiResponse<StartMockExamResponse>>(
            '/api/users/mock-exam/start',
            payload
        );
    },

    // Kiểm tra và lấy dữ liệu phiên thi thử đang làm dở (nếu có)
    async resumeMockExam(): Promise<ApiResponse<MockExamRoomData | null>> {
        // Gọi API GET lấy phiên làm bài IN_PROGRESS gần nhất
        return apiClient.get<ApiResponse<MockExamRoomData | null>>('/api/users/mock-exam/resume');
    },

    // Lấy toàn bộ đề thi 200 câu, thời gian còn lại và bản nháp của lượt thi
    async getMockExamRoom(attemptId: number | string): Promise<ApiResponse<MockExamRoomData>> {
        // Gọi API GET dữ liệu phòng thi theo attemptId
        return apiClient.get<ApiResponse<MockExamRoomData>>(
            `/api/users/mock-exam/${attemptId}/exam`
        );
    },

    // Lưu nháp tức thì các đáp án đã chọn và cờ đánh dấu lên máy chủ (BR12)
    async saveDraftAnswers(payload: SaveMockExamDraftRequest): Promise<ApiResponse<void>> {
        // Gọi API PUT cập nhật bảng diagnostic_answers cho phiên đang diễn ra
        return apiClient.put<ApiResponse<void>>('/api/users/mock-exam/answers/draft', payload);
    },

    // Đồng bộ thời gian làm bài còn lại lên máy chủ định kỳ mỗi 5 giây
    async syncTimer(attemptId: number, remainingSeconds: number): Promise<ApiResponse<number>> {
        // Làm tròn xuống về số giây nguyên không âm trước khi gửi
        const safeSeconds = Math.max(0, Math.floor(remainingSeconds));
        // Gọi API POST cập nhật remainingSeconds phía Backend
        return apiClient.post<ApiResponse<number>>('/api/users/mock-exam/timer/sync', {
            attemptId,
            remainingSeconds: safeSeconds,
        });
    },

    // Đồng bộ thời gian lần cuối bằng fetch keepalive khi học viên đóng tab/thoát trang đột ngột
    syncTimerOnExit(attemptId: number, remainingSeconds: number): void {
        // Tạo URL tuyệt đối tới endpoint đồng bộ timer của Backend
        const url = `${ENV.API_URL}/api/users/mock-exam/timer/sync`;
        // Bảo vệ bằng try/catch để không làm gián đoạn sự kiện thoát trang của trình duyệt
        try {
            // Dùng keepalive giúp trình duyệt hoàn tất request ngay cả khi tab đã đóng
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
            // Bỏ qua lỗi mạng khi tab đang hủy để tránh chặn người dùng rời trang
        }
    },

    // Nộp bài thi thử ETS 200 câu để chấm điểm quy đổi 990 (UC17)
    async submitMockExam(
        payload: SubmitMockExamRequest
    ): Promise<ApiResponse<MockExamSubmitResponse>> {
        // Gọi API POST nộp bài và nhận kết quả chấm điểm tức thì
        return apiClient.post<ApiResponse<MockExamSubmitResponse>>(
            '/api/users/mock-exam/submit',
            payload
        );
    },

    // Tải báo cáo kết quả lần thi thử gần nhất
    async getLatestReport(): Promise<ApiResponse<MockExamReportData>> {
        // Gọi API GET báo cáo kết quả thi thử mới nhất của học viên
        return apiClient.get<ApiResponse<MockExamReportData>>('/api/users/mock-exam/report/latest');
    },

    // Tải báo cáo kết quả và đối sánh Trước/Sau theo attemptId (UC18)
    async getReport(attemptId: number | string): Promise<ApiResponse<MockExamReportData>> {
        // Gọi API GET báo cáo chi tiết của lượt thi cụ thể
        return apiClient.get<ApiResponse<MockExamReportData>>(
            `/api/users/mock-exam/${attemptId}/report`
        );
    },

    // Tải danh sách 200 câu hỏi kèm đáp án đúng và lời giải cho màn hình Xem lại (BR14)
    async getReview(attemptId: number | string): Promise<ApiResponse<MockExamReviewData>> {
        // Gọi API GET dữ liệu xem lại đáp án của lượt thi
        return apiClient.get<ApiResponse<MockExamReviewData>>(
            `/api/users/mock-exam/${attemptId}/review`
        );
    },
};
