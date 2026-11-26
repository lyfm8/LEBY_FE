import axios from 'axios';
import { z } from 'zod';
import type { UserRole } from '../types';

// Schema Zod kiểm tra giá trị vai trò hợp lệ khi nâng/hạ quyền (chỉ STUDENT <-> TEACHER)
export const updateUserRoleSchema = z.object({
  // Chỉ chấp nhận hai vai trò STUDENT hoặc TEACHER
  role: z.enum(['STUDENT', 'TEACHER']),
});

// Kiểu dữ liệu trích xuất từ schema cập nhật vai trò
export type UpdateUserRoleFormValues = z.infer<typeof updateUserRoleSchema>;

// Bảng ánh xạ mã vai trò sang tên hiển thị tiếng Việt thống nhất toàn phân hệ
export const ROLE_LABELS: Record<UserRole, string> = {
  STUDENT: 'Học viên',
  TEACHER: 'Giáo viên',
  ADMIN: 'Quản trị viên',
};

// Trích xuất thông điệp lỗi chuẩn từ phản hồi Axios hoặc trả về thông điệp mặc định
export function extractApiErrorMessage(error: unknown, fallbackMessage: string): string {
  // Kiểm tra xem lỗi có phải từ Axios hay không
  if (axios.isAxiosError(error)) {
    // Ép kiểu an toàn phần body trả về để đọc trường message và status
    const responseData = error.response?.data as { message?: string; code?: string } | undefined;
    // Nếu server có trả về message tiếng Việt rõ ràng thì ưu tiên hiển thị
    if (responseData?.message && responseData.message.trim().length > 0) {
      return responseData.message;
    }
  }
  // Trả về thông báo dự phòng nếu không lấy được thông tin chi tiết từ server
  return fallbackMessage;
}

// Kiểm tra lỗi trả về có phải mã HTTP và code cụ thể từ Backend hay không
export function isApiErrorCode(error: unknown, status: number, code?: string): boolean {
  // Nếu không phải lỗi Axios thì chắc chắn không khớp
  if (!axios.isAxiosError(error)) {
    return false;
  }
  // So khớp mã HTTP status (ví dụ 404 hoặc 409)
  const matchesStatus = error.response?.status === status;
  // Nếu không yêu cầu kiểm tra thêm errorCode nội bộ thì trả kết quả theo HTTP status
  if (!code) {
    return matchesStatus;
  }
  // Đọc mã code trong JSON ErrorResponse
  const responseData = error.response?.data as { code?: string } | undefined;
  // Khớp cả HTTP status lẫn mã lỗi nghiệp vụ
  return matchesStatus && responseData?.code === code;
}

// Định dạng số giây thành chuỗi thời gian dễ đọc (ví dụ: "45 phút" hoặc "12 phút 30 giây")
export function formatDurationSeconds(durationSeconds: number | null | undefined): string {
  // Trả về dấu gạch ngang nếu chưa ghi nhận thời gian làm bài
  if (durationSeconds === null || durationSeconds === undefined || durationSeconds < 0) {
    return '—';
  }
  // Tính số phút nguyên bằng phép chia lấy phần nguyên
  const minutes = Math.floor(durationSeconds / 60);
  // Tính số giây lẻ còn lại
  const seconds = durationSeconds % 60;
  // Nếu dưới 1 phút thì hiển thị trực tiếp theo giây
  if (minutes === 0) {
    return `${seconds} giây`;
  }
  // Nếu tròn phút thì chỉ hiển thị phút
  if (seconds === 0) {
    return `${minutes} phút`;
  }
  // Hiển thị đầy đủ phút và giây
  return `${minutes} phút ${seconds} giây`;
}

// Định dạng ngày giờ ISO sang chuẩn hiển thị Việt Nam
export function formatDateTimeVi(dateTime: string | null | undefined, includeTime = true): string {
  // Trả về dấu gạch ngang khi chưa có mốc thời gian
  if (!dateTime) {
    return '—';
  }
  // Khởi tạo đối tượng Date từ chuỗi ISO Backend
  const parsed = new Date(dateTime);
  // Nếu chuỗi không parse được thành ngày hợp lệ thì trả về dấu gạch ngang
  if (Number.isNaN(parsed.getTime())) {
    return '—';
  }
  // Nếu cần hiện cả giờ phút (dùng cho lịch sử thi)
  if (includeTime) {
    return parsed.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  // Chỉ hiện ngày/tháng/năm (dùng cho bảng danh sách người dùng)
  return parsed.toLocaleDateString('vi-VN');
}
