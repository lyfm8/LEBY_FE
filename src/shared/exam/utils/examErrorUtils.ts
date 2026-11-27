import { isAxiosError } from 'axios';

export interface ParsedApiError {
    status?: number;
    code?: string;
    message: string;
    isNetworkError: boolean;
}

interface BackendErrorBody {
    message?: unknown;
    errorCode?: unknown;
    code?: unknown;
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

/**
 * Chuẩn hóa thông tin lỗi trả về từ Axios / Backend ApiResponse mà không dùng `any`.
 */
export function parseExamApiError(error: unknown, fallbackMessage: string): ParsedApiError {
    if (isAxiosError(error)) {
        if (!error.response) {
            return {
                message: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra đường truyền mạng.',
                isNetworkError: true,
            };
        }

        const status = error.response.status;
        const rawData = error.response.data;
        let serverMessage = fallbackMessage;
        let serverCode: string | undefined;

        if (isObjectRecord(rawData)) {
            const body = rawData as BackendErrorBody;
            if (typeof body.message === 'string' && body.message.trim().length > 0) {
                serverMessage = body.message;
            }
            if (typeof body.errorCode === 'string' && body.errorCode.trim().length > 0) {
                serverCode = body.errorCode;
            } else if (typeof body.code === 'string' && body.code.trim().length > 0) {
                serverCode = body.code;
            }
        }

        return {
            status,
            code: serverCode,
            message: serverMessage,
            isNetworkError: false,
        };
    }

    if (error instanceof Error && error.message.trim().length > 0) {
        return {
            message: error.message,
            isNetworkError: false,
        };
    }

    return {
        message: fallbackMessage,
        isNetworkError: false,
    };
}
