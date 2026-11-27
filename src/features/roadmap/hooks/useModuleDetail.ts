import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { roadmapService } from '../services/roadmapService';
import type { ModuleDetailData, ModuleDetailErrorType } from '../types/roadmapTypes';

// Kiểu dữ liệu lỗi chuẩn trả về từ GlobalExceptionHandler của Backend
interface BackendErrorPayload {
    code?: string;
    message?: string;
}

// Kết quả phân loại lỗi để UI hiển thị đúng biểu tượng và nút điều hướng phù hợp
interface ParsedModuleError {
    type: ModuleDetailErrorType;
    message: string;
}

/**
 * Phân loại lỗi trả về từ API chi tiết mô-đun thành 3 nhóm: bị khóa tuần tự, không tồn tại, hoặc lỗi mạng chung.
 *
 * @param err Ngoại lệ bắt được từ khối catch
 * @returns Đối tượng gồm loại lỗi và thông điệp thân thiện hiển thị cho người dùng
 */
function parseModuleDetailError(err: unknown): ParsedModuleError {
    // Kiểm tra xem lỗi có phải AxiosError có payload từ server hay không
    if (axios.isAxiosError<BackendErrorPayload>(err)) {
        // Lấy mã trạng thái HTTP và mã lỗi nghiệp vụ do Backend trả về
        const status = err.response?.status;
        const code = err.response?.data?.code;
        const serverMessage = err.response?.data?.message;

        // Trường hợp 1: Học viên truy cập trực tiếp URL của mô-đun đang bị khóa (HTTP 422 CONTENT_LOCKED)
        if (code === 'CONTENT_LOCKED' || status === 422) {
            return {
                type: 'LOCKED',
                message:
                    serverMessage ||
                    'Mô-đun này đang bị khóa. Bạn cần hoàn thành các mô-đun phía trước để mở khóa.',
            };
        }

        // Trường hợp 2: Mô-đun không tồn tại trong hệ thống hoặc không nằm trong lộ trình (HTTP 404)
        if (code === 'RESOURCE_NOT_FOUND' || status === 404) {
            return {
                type: 'NOT_FOUND',
                message:
                    serverMessage || 'Nội dung mô-đun không tồn tại hoặc đã được gỡ bỏ.',
            };
        }

        // Trường hợp 3: Các lỗi phản hồi khác có thông điệp từ server
        if (typeof serverMessage === 'string' && serverMessage.trim().length > 0) {
            return {
                type: 'GENERIC',
                message: serverMessage,
            };
        }
    }

    // Fallback khi mất kết nối mạng hoặc máy chủ tạm thời không phản hồi
    return {
        type: 'GENERIC',
        message: 'Mất kết nối khi tải dữ liệu mô-đun. Vui lòng kiểm tra mạng và thử lại.',
    };
}

/**
 * Custom Hook quản lý dữ liệu và trạng thái lỗi chi tiết cho màn hình Chi tiết Module.
 *
 * @param moduleId ID mô-đun lấy từ tham số đường dẫn URL
 * @returns Dữ liệu chi tiết mô-đun, cờ đang tải, thông báo lỗi, phân loại lỗi và hàm tải lại
 */
export function useModuleDetail(moduleId: string | undefined) {
    // Lưu dữ liệu chi tiết mô-đun sau khi tải thành công
    const [data, setData] = useState<ModuleDetailData | null>(null);
    // Cờ báo đang tải dữ liệu từ Backend
    const [isLoading, setIsLoading] = useState<boolean>(true);
    // Thông điệp lỗi thân thiện để hiển thị lên UI
    const [error, setError] = useState<string | null>(null);
    // Phân loại lỗi (LOCKED / NOT_FOUND / GENERIC) để render đúng icon và hành động
    const [errorType, setErrorType] = useState<ModuleDetailErrorType | null>(null);

    // Phụ thuộc vào moduleId để tự động nạp lại mỗi khi người dùng đổi sang mô-đun khác
    const fetchModuleDetail = useCallback(async () => {
        // Chặn sớm các đường dẫn sai định dạng số nguyên dương trước khi gửi request vô ích
        if (!moduleId || !/^\d+$/.test(moduleId)) {
            setData(null);
            setErrorType('NOT_FOUND');
            setError('Đường dẫn mô-đun không hợp lệ.');
            setIsLoading(false);
            return;
        }

        // Khởi tạo lại trạng thái tải và xóa lỗi cũ
        setIsLoading(true);
        setError(null);
        setErrorType(null);
        try {
            // Gọi API Backend lấy chi tiết mô-đun của học viên hiện tại
            const res = await roadmapService.getModuleDetail(moduleId);
            // Nếu phản hồi hợp lệ và có dữ liệu -> lưu vào state
            if (res.success && res.data) {
                setData(res.data);
            } else {
                // Nếu Backend trả về rỗng -> xem như không tìm thấy mô-đun
                setData(null);
                setErrorType('NOT_FOUND');
                setError(res.message || 'Nội dung mô-đun không tồn tại hoặc đã được gỡ bỏ.');
            }
        } catch (err: unknown) {
            // Phân tích chi tiết lỗi HTTP (422 khóa / 404 không tồn tại / lỗi mạng)
            const parsed = parseModuleDetailError(err);
            setData(null);
            setErrorType(parsed.type);
            setError(parsed.message);
        } finally {
            // Kết thúc trạng thái đang tải
            setIsLoading(false);
        }
    }, [moduleId]);

    // Tự động nạp dữ liệu chi tiết mô-đun khi component mount hoặc moduleId thay đổi
    useEffect(() => {
        void fetchModuleDetail();
    }, [fetchModuleDetail]);

    // Trả về các giá trị cần thiết cho trang ModuleDetailPage
    return {
        data,
        isLoading,
        error,
        errorType,
        refetch: fetchModuleDetail,
    };
}
