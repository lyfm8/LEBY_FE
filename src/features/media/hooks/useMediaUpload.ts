import { useState, useCallback } from 'react';
import { mediaService } from '../services/mediaService';
import type { SavedMedia } from '../types';

export interface UseMediaUploadReturn {
    /**
     * Tải nhiều tệp tin cùng lúc lên Cloudinary và lưu vào cơ sở dữ liệu.
     */
    upload: (files: File[]) => Promise<SavedMedia[]>;

    /**
     * Tải một tệp tin đơn lẻ (tiện dụng cho upload ảnh đại diện hoặc audio câu hỏi).
     */
    uploadSingle: (file: File) => Promise<SavedMedia>;

    /**
     * Cờ trạng thái đang thực hiện tải lên.
     */
    isUploading: boolean;

    /**
     * Đối tượng lỗi nếu quá trình upload gặp sự cố.
     */
    error: Error | null;

    /**
     * Xóa trạng thái lỗi.
     */
    clearError: () => void;
}

/**
 * Hook xử lý tải lên media qua Cloudinary trực tiếp, tự động lấy chữ ký và lưu metadata PENDING.
 */
export const useMediaUpload = (): UseMediaUploadReturn => {
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const upload = useCallback(async (files: File[]): Promise<SavedMedia[]> => {
        if (!files || files.length === 0) {
            return [];
        }

        setIsUploading(true);
        setError(null);

        try {
            return await mediaService.upload(files);
        } catch (err) {
            const errorObj = err instanceof Error ? err : new Error(String(err));
            setError(errorObj);
            throw errorObj;
        } finally {
            setIsUploading(false);
        }
    }, []);

    const uploadSingle = useCallback(async (file: File): Promise<SavedMedia> => {
        const results = await upload([file]);
        if (!results || results.length === 0) {
            throw new Error('Tải tệp tin thất bại, không nhận được dữ liệu phản hồi');
        }
        return results[0];
    }, [upload]);

    return {
        upload,
        uploadSingle,
        isUploading,
        error,
        clearError,
    };
};
