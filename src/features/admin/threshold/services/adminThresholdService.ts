import { apiClient } from '@/core/api/apiClient';
import type { ApiResponse } from '@/core/api/apiResponse';
import type {
  AimPartThresholdMatrix,
  SavePartThresholdsBatchRequest,
  AimAbilityRuleMatrix,
  SaveAbilityRulesBatchRequest,
  ThresholdValidationResult,
} from '../types';

/**
 * Service API giao tiếp với Backend cho Module Cấu hình Ngưỡng & Quy tắc Đánh giá (A08 & A10).
 */
export const adminThresholdService = {
  // =========================================================================
  // A08: CẤU HÌNH NGƯỠNG ĐÁNH GIÁ PART THEO AIM
  // =========================================================================

  /**
   * Lấy ma trận 7 Part thresholds của một mục tiêu AIM.
   */
  getPartThresholdMatrix(targetProfileId: number): Promise<ApiResponse<AimPartThresholdMatrix>> {
    return apiClient.get('/api/admin/threshold-config/parts', {
      params: { targetProfileId },
    });
  },

  /**
   * Lưu hàng loạt (Batch Upsert) 7 Part thresholds cho mục tiêu AIM.
   */
  savePartThresholdsBatch(data: SavePartThresholdsBatchRequest): Promise<ApiResponse<AimPartThresholdMatrix>> {
    return apiClient.post('/api/admin/threshold-config/parts/batch', data);
  },

  /**
   * Kiểm tra tính hợp lệ toán học của bộ ngưỡng Part (Confirm < Pass).
   */
  validatePartThresholds(data: SavePartThresholdsBatchRequest): Promise<ApiResponse<ThresholdValidationResult>> {
    return apiClient.post('/api/admin/threshold-config/parts/validate', data);
  },

  // =========================================================================
  // A10: CẤU HÌNH QUY TẮC ĐÁNH GIÁ NĂNG LỰC THEO AIM
  // =========================================================================

  /**
   * Lấy ma trận quy tắc toàn bộ Năng lực của một mục tiêu AIM.
   */
  getAbilityRuleMatrix(targetProfileId: number): Promise<ApiResponse<AimAbilityRuleMatrix>> {
    return apiClient.get('/api/admin/threshold-config/abilities', {
      params: { targetProfileId },
    });
  },

  /**
   * Lưu hàng loạt quy tắc đánh giá Năng lực cho mục tiêu AIM.
   */
  saveAbilityRulesBatch(data: SaveAbilityRulesBatchRequest): Promise<ApiResponse<AimAbilityRuleMatrix>> {
    return apiClient.post('/api/admin/threshold-config/abilities/batch', data);
  },

  /**
   * Kiểm tra tính hợp lệ của bộ quy tắc Năng lực (0 < stableMin <= 100).
   */
  validateAbilityRules(data: SaveAbilityRulesBatchRequest): Promise<ApiResponse<ThresholdValidationResult>> {
    return apiClient.post('/api/admin/threshold-config/abilities/validate', data);
  },
};
