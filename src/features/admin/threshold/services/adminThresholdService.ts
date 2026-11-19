import { apiClient } from '@/core/api/apiClient';
import type { ApiResponse } from '@/core/api/apiResponse';
import type {
  ModuleThresholdMatrixResponse,
  BatchUpdateModuleThresholdRequest,
  ModuleTargetThresholdResponse,
  AbilityEvaluationRuleResponse,
  CreateAbilityEvaluationRuleRequest,
  UpdateAbilityEvaluationRuleRequest,
  TargetPartThresholdResponse,
  CreateTargetPartThresholdRequest,
  UpdateTargetPartThresholdRequest,
} from '../types';

/**
 * Service quản lý toàn bộ cấu hình Ngưỡng (Thresholds) và Quy tắc Đánh giá Năng lực (Rules).
 * URL prefix chuẩn: /api/admin/... (Tuân thủ nghiêm ngặt chuẩn kiến trúc không dùng /v1).
 */
export const adminThresholdService = {
  // ===========================================================================
  // 1. MODULE TARGET THRESHOLDS (MA TRẬN ĐIỂM ĐỖ MODULE THEO AIM)
  // ===========================================================================

  /**
   * Lấy ma trận điểm đỗ Module x TargetProfile, hỗ trợ lọc theo Part.
   */
  getModuleThresholdMatrix(partId?: number): Promise<ApiResponse<ModuleThresholdMatrixResponse>> {
    return apiClient.get<ApiResponse<ModuleThresholdMatrixResponse>>(
      '/api/admin/module-target-thresholds/matrix',
      { params: partId ? { partId } : undefined }
    );
  },

  /**
   * Cập nhật hàng loạt nhiều ô trong ma trận điểm đỗ.
   */
  batchUpdateModuleThresholds(data: BatchUpdateModuleThresholdRequest): Promise<ApiResponse<ModuleTargetThresholdResponse[]>> {
    return apiClient.post<ApiResponse<ModuleTargetThresholdResponse[]>>(
      '/api/admin/module-target-thresholds/batch',
      data
    );
  },

  /**
   * Cập nhật điểm đỗ của một Module cụ thể tại một Profile AIM.
   */
  updateSingleModuleThreshold(
    moduleId: number,
    targetProfileId: number,
    passScore?: number | null
  ): Promise<ApiResponse<ModuleTargetThresholdResponse>> {
    return apiClient.put<ApiResponse<ModuleTargetThresholdResponse>>(
      '/api/admin/module-target-thresholds/single',
      null,
      { params: { moduleId, targetProfileId, passScore } }
    );
  },

  /**
   * Xóa cấu hình tùy biến để Module tự động khôi phục về điểm đỗ mặc định (defaultPassScore).
   */
  resetModuleThreshold(moduleId: number, targetProfileId: number): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(
      '/api/admin/module-target-thresholds/reset',
      { params: { moduleId, targetProfileId } }
    );
  },

  // ===========================================================================
  // 2. ABILITY EVALUATION RULES (QUY TẮC ĐÁNH GIÁ NĂNG LỰC)
  // ===========================================================================

  /**
   * Lấy danh sách toàn bộ quy tắc đánh giá Ability.
   */
  getAbilityRules(): Promise<ApiResponse<AbilityEvaluationRuleResponse[]>> {
    return apiClient.get<ApiResponse<AbilityEvaluationRuleResponse[]>>(
      '/api/admin/ability-evaluation-rules'
    );
  },

  /**
   * Lấy chi tiết một quy tắc đánh giá Ability theo ID.
   */
  getAbilityRuleById(id: number): Promise<ApiResponse<AbilityEvaluationRuleResponse>> {
    return apiClient.get<ApiResponse<AbilityEvaluationRuleResponse>>(
      `/api/admin/ability-evaluation-rules/${id}`
    );
  },

  /**
   * Tạo mới quy tắc đánh giá Ability.
   */
  createAbilityRule(data: CreateAbilityEvaluationRuleRequest): Promise<ApiResponse<AbilityEvaluationRuleResponse>> {
    return apiClient.post<ApiResponse<AbilityEvaluationRuleResponse>>(
      '/api/admin/ability-evaluation-rules',
      data
    );
  },

  /**
   * Cập nhật quy tắc đánh giá Ability.
   */
  updateAbilityRule(id: number, data: UpdateAbilityEvaluationRuleRequest): Promise<ApiResponse<AbilityEvaluationRuleResponse>> {
    return apiClient.put<ApiResponse<AbilityEvaluationRuleResponse>>(
      `/api/admin/ability-evaluation-rules/${id}`,
      data
    );
  },

  /**
   * Xóa quy tắc đánh giá Ability.
   */
  deleteAbilityRule(id: number): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(
      `/api/admin/ability-evaluation-rules/${id}`
    );
  },

  // ===========================================================================
  // 3. TARGET PART THRESHOLDS (NGƯỠNG ĐIỂM PART DIAGNOSTIC)
  // ===========================================================================

  /**
   * Lấy danh sách toàn bộ cấu hình ngưỡng điểm Part theo AIM.
   */
  getPartThresholds(): Promise<ApiResponse<TargetPartThresholdResponse[]>> {
    return apiClient.get<ApiResponse<TargetPartThresholdResponse[]>>(
      '/api/admin/target-part-thresholds'
    );
  },

  /**
   * Lấy danh sách cấu hình ngưỡng điểm Part theo Target Profile ID.
   */
  getPartThresholdsByProfile(targetProfileId: number): Promise<ApiResponse<TargetPartThresholdResponse[]>> {
    return apiClient.get<ApiResponse<TargetPartThresholdResponse[]>>(
      `/api/admin/target-part-thresholds/by-profile/${targetProfileId}`
    );
  },

  /**
   * Tạo mới cấu hình ngưỡng điểm Part.
   */
  createPartThreshold(data: CreateTargetPartThresholdRequest): Promise<ApiResponse<TargetPartThresholdResponse>> {
    return apiClient.post<ApiResponse<TargetPartThresholdResponse>>(
      '/api/admin/target-part-thresholds',
      data
    );
  },

  /**
   * Cập nhật cấu hình ngưỡng điểm Part.
   */
  updatePartThreshold(id: number, data: UpdateTargetPartThresholdRequest): Promise<ApiResponse<TargetPartThresholdResponse>> {
    return apiClient.put<ApiResponse<TargetPartThresholdResponse>>(
      `/api/admin/target-part-thresholds/${id}`,
      data
    );
  },

  /**
   * Xóa cấu hình ngưỡng điểm Part.
   */
  deletePartThreshold(id: number): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(
      `/api/admin/target-part-thresholds/${id}`
    );
  },
};
