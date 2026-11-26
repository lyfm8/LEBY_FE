import { useCallback, useEffect, useState } from 'react';
import { mediaService } from '../services/mediaService';
import type { SavedMedia } from '../types';

const DEFAULT_PAGE_SIZE = 5;

export interface UseMediaHistoryReturn {
    items: SavedMedia[];
    page: number;
    totalPages: number;
    totalItems: number;
    isLoading: boolean;
    errorMessage: string | null;
    setPage: (nextPage: number) => void;
    refetch: () => Promise<void>;
}

/**
 * Custom hook nạp danh sách lịch sử media đã upload có phân trang (5 mục/trang).
 */
export function useMediaHistory(enabled: boolean, pageSize: number = DEFAULT_PAGE_SIZE): UseMediaHistoryReturn {
    const [items, setItems] = useState<SavedMedia[]>([]);
    const [page, setPage] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [totalItems, setTotalItems] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const fetchHistory = useCallback(async () => {
        if (!enabled) return;
        setIsLoading(true);
        setErrorMessage(null);
        try {
            const res = await mediaService.getMedias({ page, size: pageSize });
            if (res.success && res.data) {
                setItems(res.data);
                if (res.pagination) {
                    setTotalPages(Math.max(res.pagination.totalPages || 1, 1));
                    setTotalItems(res.pagination.totalItems || 0);
                }
            }
        } catch (err: unknown) {
            const message =
                (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                (err as { message?: string })?.message ||
                'Không thể tải lịch sử tệp media';
            setErrorMessage(message);
        } finally {
            setIsLoading(false);
        }
    }, [enabled, page, pageSize]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    return {
        items,
        page,
        totalPages,
        totalItems,
        isLoading,
        errorMessage,
        setPage,
        refetch: fetchHistory,
    };
}
