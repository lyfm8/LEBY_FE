/**
 * Thông tin một mốc mục tiêu điểm TOEIC (AIM) hiển thị trên màn hình lựa chọn (UC05).
 */
export interface TargetProfile {
    id: number;
    targetTotalScore: number;
    description: string;
    status: boolean;
    isRecommended?: boolean;
}

/**
 * Payload gửi lên khi học viên chọn hoặc thay đổi mục tiêu AIM.
 */
export interface SelectTargetRequest {
    targetProfileId: number;
}

/**
 * Chỉ dẫn điều hướng từ Backend sau khi chọn/đổi mục tiêu AIM.
 */
export type RedirectAction = 'GO_DIAGNOSTIC' | 'GO_LEARNING_PATH';

/**
 * Dữ liệu phản hồi sau khi xác nhận mục tiêu AIM thành công.
 */
export interface SelectTargetResponse {
    userId: number;
    targetProfileId: number;
    targetTotalScore: number;
    redirectAction: RedirectAction;
    learningPathId: number | null;
}
