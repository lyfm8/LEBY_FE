import { apiClient } from '@/core/api/apiClient';
import type { ApiResponse } from '@/core/api/apiResponse';
import type { 
  DiagnosticTestListItemResponse, 
  DiagnosticTestDetailResponse, 
  CreateDiagnosticTestRequest 
} from '../types';

export const adminDiagnosticTestService = {
  getAll(): Promise<ApiResponse<DiagnosticTestListItemResponse[]>> {
    return apiClient.get('/api/v1/admin/diagnostic-tests');
  },

  getById(id: number): Promise<ApiResponse<DiagnosticTestDetailResponse>> {
    return apiClient.get(`/api/v1/admin/diagnostic-tests/${id}`);
  },

  create(data: CreateDiagnosticTestRequest): Promise<ApiResponse<DiagnosticTestListItemResponse>> {
    return apiClient.post('/api/v1/admin/diagnostic-tests', data);
  },

  update(id: number, data: CreateDiagnosticTestRequest): Promise<ApiResponse<DiagnosticTestListItemResponse>> {
    return apiClient.put(`/api/v1/admin/diagnostic-tests/${id}`, data);
  },

  delete(id: number): Promise<ApiResponse<null>> {
    return apiClient.delete(`/api/v1/admin/diagnostic-tests/${id}`);
  }
};
