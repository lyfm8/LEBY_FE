import { apiClient } from '@/core/api/apiClient';
import type { ApiResponse } from '@/core/api/apiResponse';
import type { TargetProfile, SelectTargetRequest, SelectTargetResponse } from '../types/targetTypes';

/**
 * Service giao tiếp với Backend cho nghiệp vụ Chọn / Thay đổi mục tiêu AIM (UC05).
 * Tuân thủ chuẩn endpoint /api/... (không dùng tiền tố /api/v1).
 */
export const targetService = {
    /**
     * Lấy danh sách các mốc mục tiêu TOEIC đang kích hoạt cho học viên lựa chọn.
     *
     * @returns Danh sách {@link TargetProfile} sắp xếp theo điểm tăng dần
     */
    async getTargets(): Promise<ApiResponse<TargetProfile[]>> {
        return apiClient.get<ApiResponse<TargetProfile[]>>('/api/targets');
    },

    /**
     * Xác nhận thiết lập mục tiêu lần đầu hoặc thay đổi mục tiêu AIM hiện tại.
     *
     * @param data ID mốc mục tiêu học viên đã chọn
     * @returns Chỉ dẫn điều hướng (làm bài chẩn đoán hoặc sang lộ trình mới)
     */
    async selectTarget(data: SelectTargetRequest): Promise<ApiResponse<SelectTargetResponse>> {
        return apiClient.post<ApiResponse<SelectTargetResponse>>('/api/targets/select', data);
    },
};
