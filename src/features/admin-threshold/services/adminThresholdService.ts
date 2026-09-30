import { apiClient } from '@/core/api/apiClient';
import type { ApiResponse } from '@/core/api/apiResponse';
import type { 
  TargetPartThresholdResponse, 
  CreatePartThresholdRequest, 
  AbilityEvaluationRuleResponse, 
  CreateAbilityRuleRequest 
} from '../types';

export const adminThresholdService = {
  // --- Target Part Thresholds ---
  getPartThresholds(): Promise<ApiResponse<TargetPartThresholdResponse[]>> {
    return apiClient.get('/api/v1/admin/target-part-thresholds');
  },

  createPartThreshold(data: CreatePartThresholdRequest): Promise<ApiResponse<TargetPartThresholdResponse>> {
    return apiClient.post('/api/v1/admin/target-part-thresholds', data);
  },

  updatePartThreshold(id: number, data: CreatePartThresholdRequest): Promise<ApiResponse<TargetPartThresholdResponse>> {
    return apiClient.put(`/api/v1/admin/target-part-thresholds/${id}`, data);
  },

  deletePartThreshold(id: number): Promise<ApiResponse<null>> {
    return apiClient.delete(`/api/v1/admin/target-part-thresholds/${id}`);
  },

  // --- Ability Evaluation Rules ---
  getAbilityRules(): Promise<ApiResponse<AbilityEvaluationRuleResponse[]>> {
    return apiClient.get('/api/v1/admin/ability-evaluation-rules');
  },

  createAbilityRule(data: CreateAbilityRuleRequest): Promise<ApiResponse<AbilityEvaluationRuleResponse>> {
    return apiClient.post('/api/v1/admin/ability-evaluation-rules', data);
  },

  updateAbilityRule(id: number, data: CreateAbilityRuleRequest): Promise<ApiResponse<AbilityEvaluationRuleResponse>> {
    return apiClient.put(`/api/v1/admin/ability-evaluation-rules/${id}`, data);
  },

  deleteAbilityRule(id: number): Promise<ApiResponse<null>> {
    return apiClient.delete(`/api/v1/admin/ability-evaluation-rules/${id}`);
  },
};
