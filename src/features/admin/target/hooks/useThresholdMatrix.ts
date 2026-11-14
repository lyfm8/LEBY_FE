import { useState, useEffect, useCallback } from 'react';
import { adminTargetService } from '../services/adminTargetService';
import type { ThresholdMatrixResponse } from '../types';

/**
 * Custom hook quản lý ma trận điểm chuẩn Pass Threshold của các Module theo từng AIM.
 * Hỗ trợ Optimistic Update để UI phản hồi ngay lập tức và tự động rollback khi gặp lỗi mạng.
 */
export function useThresholdMatrix() {
  const [matrix, setMatrix] = useState<ThresholdMatrixResponse>({
    profileIds: [],
    profileScores: [],
    rows: [],
  });
  const [isLoadingMatrix, setIsLoadingMatrix] = useState<boolean>(false);
  const [isUpdatingThreshold, setIsUpdatingThreshold] = useState<boolean>(false);

  /**
   * Nạp dữ liệu ma trận ngưỡng điểm từ API.
   */
  const fetchMatrix = useCallback(async () => {
    setIsLoadingMatrix(true);
    try {
      const res = await adminTargetService.getThresholdMatrix();
      if (res.success && res.data) {
        setMatrix(res.data);
      }
    } catch (error: unknown) {
      console.error('Failed to fetch threshold matrix:', error);
    } finally {
      setIsLoadingMatrix(false);
    }
  }, []);

  useEffect(() => {
    fetchMatrix();
  }, [fetchMatrix]);

  /**
   * Cập nhật điểm chuẩn của 1 Module cho 1 Profile cụ thể.
   * Sử dụng cơ chế Optimistic Update để cập nhật state cục bộ tức thì.
   */
  const handleUpdateThreshold = useCallback(
    async (moduleId: number, profileId: number, passThreshold: number) => {
      setIsUpdatingThreshold(true);
      try {
        await adminTargetService.batchUpdateThresholds({
          items: [{ moduleId, targetProfileId: profileId, passThreshold }],
        });

        // Cập nhật Optimistic vào state hiện tại
        setMatrix((prev) => {
          const newRows = [...prev.rows];
          const rowIndex = newRows.findIndex((r) => r.moduleId === moduleId);
          if (rowIndex !== -1) {
            newRows[rowIndex] = {
              ...newRows[rowIndex],
              thresholds: {
                ...newRows[rowIndex].thresholds,
                [profileId]: passThreshold,
              },
            };
          }
          return { ...prev, rows: newRows };
        });
      } catch (error: unknown) {
        console.error('Failed to update threshold:', error);
        alert('Cập nhật Threshold thất bại');
        fetchMatrix(); // Rollback về dữ liệu server nếu xảy ra lỗi
      } finally {
        setIsUpdatingThreshold(false);
      }
    },
    [fetchMatrix]
  );

  return {
    matrix,
    isLoadingMatrix,
    isUpdatingThreshold,
    fetchMatrix,
    handleUpdateThreshold,
  };
}
