/**
 * Thông tin một mốc mục tiêu điểm TOEIC (TargetProfile / AIM) trả về từ Backend.
 */
export interface TargetProfileResponse {
  // ID định danh duy nhất của mốc mục tiêu
  id: number;
  // Mốc điểm TOEIC mục tiêu (thang 10 - 990)
  aimScore: number;
  // Mô tả chi tiết định hướng của mốc mục tiêu
  description: string;
  // Tổng số học viên hiện đang chọn mốc mục tiêu này
  totalUsers: number;
}

/**
 * Payload gửi lên Backend khi tạo mới hoặc cập nhật mốc mục tiêu AIM.
 */
export interface CreateTargetProfileRequest {
  // Mốc điểm TOEIC mục tiêu cần lưu
  aimScore: number;
  // Mô tả ngắn cho mốc mục tiêu (không bắt buộc)
  description?: string;
}
