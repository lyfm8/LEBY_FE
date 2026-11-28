import { useCallback, useEffect, useState } from 'react';
import { publicCatalogService } from '../services/publicCatalogService';
import type { PublicCatalogData } from '../types/publicCatalogTypes';

interface UsePublicCatalogResult {
    data: PublicCatalogData | null;
    isLoading: boolean;
    error: string | null;
    refetch: () => void;
}

/**
 * Hook tải dữ liệu chương trình 7 Part công khai cho Landing Page với đủ 4 trạng thái Loading/Success/Error/Empty.
 */
export function usePublicCatalog(): UsePublicCatalogResult {
    const [data, setData] = useState<PublicCatalogData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCatalog = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await publicCatalogService.getPublicCatalog();
            if (response.success) {
                setData(response.data ?? null);
            } else {
                setError(response.message || 'Không thể tải danh mục chương trình học.');
            }
        } catch {
            setError('Không thể kết nối máy chủ để tải danh mục chương trình học.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        void fetchCatalog();
    }, [fetchCatalog]);

    return { data, isLoading, error, refetch: fetchCatalog };
}
