import { apiClient } from '@/core/api/apiClient';
import type { ApiResponse } from '@/core/api/apiResponse';
import type {
    LessonDetail,
    LessonProgressResult,
    UpdateLessonProgressPayload,
} from '../types/lessonTypes';

/**
 * Lớp dịch vụ gọi trực tiếp API Backend thật cho Phòng học bài giảng Video và Tiến độ học.
 */
export const lessonService = {
    /**
     * Tải toàn bộ thông tin chi tiết bài giảng, lịch sử tạm dừng và câu hỏi ôn tập củng cố.
     *
     * @param lessonId Mã định danh bài học cần mở
     * @returns Phản hồi chuẩn ApiResponse chứa dữ liệu LessonDetail
     */
    async getLessonDetail(lessonId: number | string): Promise<ApiResponse<LessonDetail>> {
        // Gọi API chuẩn /api/users/lessons/{lessonId} (không dùng tiền tố cũ /api/v1/)
        return apiClient.get<ApiResponse<LessonDetail>>(`/api/users/lessons/${lessonId}`);
    },

    /**
     * Đồng bộ nhịp tiến độ xem bài giảng Video lên Backend để lưu mốc tạm dừng và kiểm tra hoàn thành.
     *
     * @param lessonId Mã định danh bài giảng Video đang học
     * @param payload  Số giây xem thực tế tăng thêm, mốc vị trí hiện tại và tốc độ phát
     * @returns Phản hồi chuẩn ApiResponse chứa kết quả LessonProgressResult
     */
    async updateLessonProgress(
        lessonId: number | string,
        payload: UpdateLessonProgressPayload
    ): Promise<ApiResponse<LessonProgressResult>> {
        // Gọi API PUT cập nhật tiến độ xem thực tế và nhận trạng thái hoàn thành mới nhất từ server
        return apiClient.put<ApiResponse<LessonProgressResult>>(
            `/api/users/lessons/${lessonId}/progress`,
            payload
        );
    },
};
