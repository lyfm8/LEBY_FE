import axios from 'axios';

/**
 * Kích hoạt trình duyệt tải xuống một đối tượng Blob với tên tệp chỉ định.
 */
export function triggerBlobDownload(blob: Blob, filename: string): void {
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(downloadUrl);
}

/**
 * Trích xuất thông điệp lỗi từ response Axios (bao gồm trường hợp responseType = 'blob').
 */
export async function extractRequestErrorMessage(error: unknown, fallback: string): Promise<string> {
    if (axios.isAxiosError(error)) {
        const data = error.response?.data;
        if (data instanceof Blob) {
            try {
                const text = await data.text();
                const parsed = JSON.parse(text) as { message?: string };
                if (parsed.message && parsed.message.trim().length > 0) {
                    return parsed.message;
                }
            } catch {
                // Bỏ qua nếu blob lỗi không phải JSON hợp lệ
            }
        } else if (data && typeof data === 'object' && 'message' in data) {
            const msg = (data as { message?: unknown }).message;
            if (typeof msg === 'string' && msg.trim().length > 0) {
                return msg;
            }
        }
        if (error.message && error.message.trim().length > 0) {
            return error.message;
        }
    } else if (error instanceof Error && error.message.trim().length > 0) {
        return error.message;
    }
    return fallback;
}
