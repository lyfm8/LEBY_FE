import { apiClient } from '@/core/api/apiClient';
import type { ApiResponse } from '@/core/api/apiResponse';
import type { PracticeRoomData } from '../types/practiceTypes';

/**
 * Service kết nối API Phòng luyện tập bài thực hành (UC12).
 */
export const practiceService = {
    /**
     * Tải toàn bộ câu hỏi thực hành, đáp án và lời giải của một bài PRACTICE.
     */
    async getPracticeRoom(lessonId: number | string): Promise<ApiResponse<PracticeRoomData>> {
        return apiClient.get<ApiResponse<PracticeRoomData>>(
            `/api/users/practice/lessons/${lessonId}`
        );
    },
};
