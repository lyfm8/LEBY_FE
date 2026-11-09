import { apiClient } from '@/core/api/apiClient';
import type { ApiResponse } from '@/core/api/apiResponse';
import type {
    CloudinaryUploadResult,
    MediaUploadSignature,
    SavedMedia,
    SaveMediaRequest,
} from '../types';

const BUFFER_TIME_MS = 5 * 60 * 1000; // 5 phút trừ hao an toàn trước khi chữ ký hết hạn

/**
 * Service xử lý toàn bộ vòng đời tải lên và lưu trữ media qua Cloudinary.
 */
export class MediaService {
    private cachedSignature: MediaUploadSignature | null = null;
    private signatureExpireTime: number | null = null;

    /**
     * Lấy chữ ký upload từ Backend LEBY kèm bộ nhớ đệm cache để tránh request dư thừa.
     */
    async getUploadSignature(): Promise<MediaUploadSignature> {
        if (
            this.cachedSignature &&
            this.signatureExpireTime &&
            Date.now() < this.signatureExpireTime
        ) {
            return this.cachedSignature;
        }

        const res = await apiClient.get<ApiResponse<MediaUploadSignature>>('/api/media/signature');
        if (!res.success || !res.data) {
            throw new Error(res.message || 'Không thể lấy chữ ký tải lên Cloudinary');
        }

        this.cachedSignature = res.data;
        const expiresInSeconds = res.data.expiresIn || 3600;
        this.signatureExpireTime = Date.now() + expiresInSeconds * 1000 - BUFFER_TIME_MS;

        return this.cachedSignature;
    }

    /**
     * Tải tệp tin trực tiếp từ trình duyệt lên Cloudinary thông qua FormData.
     */
    private async uploadToCloudinary(
        file: File,
        signatureData: MediaUploadSignature
    ): Promise<CloudinaryUploadResult> {
        // Hỗ trợ chế độ giả lập Mock khi dev offline
        if (import.meta.env.VITE_USE_MOCK === 'true') {
            return new Promise((resolve) => {
                setTimeout(() => {
                    const ext = file.name.split('.').pop() || 'png';
                    const isVideo = file.type.startsWith('video') || file.type.startsWith('audio');
                    resolve({
                        public_id: `mock_media_${Date.now()}_${Math.random().toString(36).substring(7)}`,
                        secure_url: URL.createObjectURL(file),
                        format: ext,
                        resource_type: isVideo ? 'video' : 'image',
                        bytes: file.size,
                        original_filename: file.name,
                        duration: isVideo ? 78 : undefined,
                        tags: ['tmp'],
                    });
                }, 800);
            });
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('api_key', signatureData.apiKey);
        formData.append('timestamp', signatureData.timestamp.toString());
        formData.append('signature', signatureData.signature);
        formData.append('tags', 'tmp');

        const uploadUrl = `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/auto/upload`;
        const response = await fetch(uploadUrl, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Tải tệp tin lên Cloudinary thất bại (${response.status}): ${errorText}`);
        }

        return (await response.json()) as CloudinaryUploadResult;
    }

    /**
     * Gửi danh sách metadata của các file đã upload về Backend để lưu trữ trạng thái PENDING.
     */
    async saveMedias(requests: SaveMediaRequest[]): Promise<SavedMedia[]> {
        const res = await apiClient.post<ApiResponse<SavedMedia[]>>('/api/media/save', requests);
        if (!res.success || !res.data) {
            throw new Error(res.message || 'Không thể lưu thông tin media vào hệ thống');
        }
        return res.data;
    }

    /**
     * Quy trình upload trọn gói: Xin chữ ký -> Đẩy trực tiếp lên Cloudinary -> Lưu metadata PENDING về BE.
     */
    async upload(files: File[]): Promise<SavedMedia[]> {
        if (!files || files.length === 0) {
            return [];
        }

        // Bước 1: Kiểm tra tính duy nhất của tên file trong danh sách tải lên
        const nameSet = new Set<string>();
        const duplicates: string[] = [];
        for (const file of files) {
            const cleanName = file.name.trim().toLowerCase();
            if (nameSet.has(cleanName)) {
                duplicates.push(file.name);
            } else {
                nameSet.add(cleanName);
            }
        }
        if (duplicates.length > 0) {
            throw new Error(`Danh sách tải lên chứa các file trùng tên: ${Array.from(new Set(duplicates)).join(', ')}`);
        }

        try {
            // Bước 2: Lấy chữ ký bảo mật
            const signatureData = await this.getUploadSignature();

            // Bước 3: Tải song song tất cả các file lên Cloudinary
            const uploadPromises = files.map((file) => this.uploadToCloudinary(file, signatureData));
            const cloudinaryResults = await Promise.all(uploadPromises);

            // Bước 4: Chuyển đổi và lưu metadata về Backend
            const saveRequests: SaveMediaRequest[] = cloudinaryResults.map((result, idx) => ({
                public_id: result.public_id,
                secure_url: result.secure_url,
                resource_type: result.resource_type,
                format: result.format,
                bytes: result.bytes,
                width: result.width,
                height: result.height,
                original_filename: result.original_filename || files[idx]?.name,
                duration: result.duration,
            }));

            return await this.saveMedias(saveRequests);
        } catch (error) {
            this.cachedSignature = null;
            this.signatureExpireTime = null;
            throw error;
        }
    }
}

export const mediaService = new MediaService();
