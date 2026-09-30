import { apiClient } from '@/core/api/apiClient';
import type { ApiResponse } from '@/core/api/apiResponse';
import type { 
  TargetProfileResponse, 
  CreateTargetProfileRequest, 
  ThresholdMatrixResponse, 
  BatchUpdateThresholdRequest 
} from '../types';

export const adminTargetService = {
  // --- Target Profiles ---
  getAllProfiles(): Promise<ApiResponse<TargetProfileResponse[]>> {
    return apiClient.get('/api/v1/admin/target-profiles');
  },

  createProfile(data: CreateTargetProfileRequest): Promise<ApiResponse<TargetProfileResponse>> {
    return apiClient.post('/api/v1/admin/target-profiles', data);
  },

  updateProfile(id: number, data: CreateTargetProfileRequest): Promise<ApiResponse<TargetProfileResponse>> {
    return apiClient.put(`/api/v1/admin/target-profiles/${id}`, data);
  },

  deleteProfile(id: number): Promise<ApiResponse<null>> {
    return apiClient.delete(`/api/v1/admin/target-profiles/${id}`);
  },

  // --- Module Target Thresholds ---
  getThresholdMatrix(): Promise<ApiResponse<ThresholdMatrixResponse>> {
    return apiClient.get('/api/v1/admin/module-target-thresholds');
  },

  batchUpdateThresholds(data: BatchUpdateThresholdRequest): Promise<ApiResponse<null>> {
    return apiClient.put('/api/v1/admin/module-target-thresholds', data);
  }
};
