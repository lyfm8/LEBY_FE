import { useState, useEffect, useCallback } from 'react';
import { roadmapService } from '../services/roadmapService';
import type { RoadmapData } from '../types/roadmapTypes';

/**
 * Custom Hook quản lý dữ liệu và trạng thái cho trang Lộ trình học thích ứng.
 * Đóng gói 4 trạng thái chuẩn (Loading, Error, Empty, Success) tách biệt khỏi UI Component.
 */
export function useRoadmap() {
    const [data, setData] = useState<RoadmapData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Dùng useCallback để giữ tham chiếu hàm ổn định cho useEffect và nút "Thử lại" (refetch)
    const fetchRoadmap = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await roadmapService.getRoadmap();
            if (res.success) {
                // BE có thể trả data = null nếu học viên chưa làm bài chẩn đoán -> UI hiển thị Empty State
                setData(res.data ?? null);
            } else {
                setError(res.message || 'Không thể tải lộ trình học tập');
            }
        } catch (err: unknown) {
            console.error('[useRoadmap] Lỗi tải lộ trình:', err);
            setError('Không thể kết nối đến máy chủ để tải lộ trình học của bạn.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Tự động tải lộ trình ngay khi component mount lần đầu
    useEffect(() => {
        fetchRoadmap();
    }, [fetchRoadmap]);

    return {
        data,
        isLoading,
        error,
        refetch: fetchRoadmap,
    };
}
