import { useState, useEffect, useCallback } from 'react';
import { roadmapService } from '../services/roadmapService';
import type { ModuleDetailData } from '../types/roadmapTypes';

/**
 * Custom Hook quản lý dữ liệu chi tiết của một Module trong lộ trình học.
 * Đảm bảo tách biệt logic fetching/error handling khỏi UI component.
 *
 * @param moduleId ID của Module từ URL params
 */
export function useModuleDetail(moduleId: string | undefined) {
    const [data, setData] = useState<ModuleDetailData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Phụ thuộc vào moduleId để tự động gọi lại API khi người dùng chuyển sang Module khác trên URL
    const fetchModuleDetail = useCallback(async () => {
        // Guard Clause: Chặn sớm các URL sai định dạng (VD: /modules/abc) trước khi gửi request vô ích lên BE
        if (!moduleId || !/^\d+$/.test(moduleId)) {
            setError('Mã Module không hợp lệ.');
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const res = await roadmapService.getModuleDetail(moduleId);
            if (res.success && res.data) {
                setData(res.data);
            } else {
                setError(res.message || 'Không tìm thấy thông tin Module.');
            }
        } catch (err: unknown) {
            console.error('[useModuleDetail] Lỗi tải chi tiết module:', err);
            setError('Không thể tải thông tin chi tiết Module. Vui lòng thử lại sau.');
        } finally {
            setIsLoading(false);
        }
    }, [moduleId]);

    // Tự động nạp lại chi tiết Module mỗi khi moduleId thay đổi
    useEffect(() => {
        fetchModuleDetail();
    }, [fetchModuleDetail]);

    return {
        data,
        isLoading,
        error,
        refetch: fetchModuleDetail,
    };
}
