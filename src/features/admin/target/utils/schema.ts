import axios from 'axios';
import { z } from 'zod';

/**
 * Schema Zod kiểm tra dữ liệu biểu mẫu Tạo / Sửa mốc mục tiêu AIM,
 * đồng bộ chặt chẽ với ràng buộc Bean Validation của Backend (10 - 990 điểm, mô tả tối đa 500 ký tự).
 */
export const targetProfileSchema = z.object({
  // Điểm mục tiêu bắt buộc là số nguyên trong thang TOEIC 10 - 990
  aimScore: z
    .number({ message: 'Vui lòng nhập điểm mục tiêu AIM hợp lệ' })
    .int('Điểm mục tiêu AIM phải là số nguyên')
    .min(10, 'Điểm mục tiêu AIM tối thiểu là 10')
    .max(990, 'Điểm mục tiêu AIM tối đa là 990'),
  // Mô tả không bắt buộc nhưng giới hạn tối đa 500 ký tự khớp cột DB
  description: z
    .string()
    .max(500, 'Mô tả mục tiêu không được vượt quá 500 ký tự')
    .optional(),
});

// Kiểu dữ liệu suy diễn từ schema để dùng cho React Hook Form
export type TargetProfileFormValues = z.infer<typeof targetProfileSchema>;

/**
 * Trích xuất thông điệp lỗi an toàn từ ngoại lệ Axios hoặc trả về câu thông báo dự phòng.
 *
 * @param error Đối tượng lỗi bắt được từ catch
 * @param fallbackMessage Thông báo mặc định khi server không trả message cụ thể
 * @returns Chuỗi thông báo lỗi tiếng Việt an toàn để hiển thị lên UI
 */
export function extractTargetErrorMessage(error: unknown, fallbackMessage: string): string {
  // Kiểm tra lỗi có xuất phát từ Axios hay không
  if (axios.isAxiosError(error)) {
    // Đọc payload phản hồi từ Backend với kiểu an toàn
    const responseData = error.response?.data as { message?: string } | undefined;
    // Ưu tiên hiển thị message chi tiết do Backend trả về nếu không rỗng
    if (responseData?.message && responseData.message.trim().length > 0) {
      return responseData.message;
    }
  }
  // Trả về thông báo dự phòng nếu không đọc được chi tiết lỗi
  return fallbackMessage;
}
