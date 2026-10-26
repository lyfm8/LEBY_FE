import { apiClient } from '@/core/api/apiClient';
import type { ApiResponse } from '@/core/api/apiResponse';
import type { 
  DiagnosticTestListItemResponse, 
  DiagnosticTestDetailResponse, 
  CreateDiagnosticTestRequest 
} from '../types';

/**
 * Service xử lý giao tiếp API với Backend cho tính năng quản lý Đề kiểm tra chẩn đoán.
 */
export const adminDiagnosticTestService = {
  
  /**
   * Lấy danh sách rút gọn các Đề thi (không chứa nội dung câu hỏi) dùng cho trang danh sách.
   * 
   * @returns {Promise<ApiResponse<DiagnosticTestListItemResponse[]>>} Danh sách đề thi
   */
  getAll(): Promise<ApiResponse<DiagnosticTestListItemResponse[]>> {
    return apiClient.get('/api/v1/admin/diagnostic-tests');
  },

  /**
   * Lấy chi tiết toàn bộ thông tin Đề thi, bao gồm cả mảng `questionIds` để load lên giao diện Form.
   * 
   * @param id ID của đề thi cần lấy chi tiết
   */
  getById(id: number): Promise<ApiResponse<DiagnosticTestDetailResponse>> {
    return apiClient.get(`/api/v1/admin/diagnostic-tests/${id}`);
  },

  /**
   * Tạo mới một đề thi chẩn đoán (Diagnostic Test).
   * 
   * @param data Payload tạo đề thi (chứa mảng questionIds)
   */
  create(data: CreateDiagnosticTestRequest): Promise<ApiResponse<DiagnosticTestListItemResponse>> {
    return apiClient.post('/api/v1/admin/diagnostic-tests', data);
  },

  /**
   * Cập nhật thông tin và danh sách câu hỏi của đề thi chẩn đoán.
   * NOTE: Việc sync danh sách câu hỏi mới và cũ sẽ được Backend xử lý (Xóa bản ghi bảng phụ cũ, thêm mới).
   */
  update(id: number, data: CreateDiagnosticTestRequest): Promise<ApiResponse<DiagnosticTestListItemResponse>> {
    return apiClient.put(`/api/v1/admin/diagnostic-tests/${id}`, data);
  },

  /**
   * Xóa đề thi chẩn đoán.
   * LƯU Ý BẢO MẬT: Backend sẽ kiểm tra xem đề này đã có học viên (DiagnosticAttempt) làm hay chưa. 
   * Nếu đã làm, BE sẽ ném lỗi, FE cần hiển thị thông báo thay vì force xóa.
   */
  delete(id: number): Promise<ApiResponse<null>> {
    return apiClient.delete(`/api/v1/admin/diagnostic-tests/${id}`);
  }
};

