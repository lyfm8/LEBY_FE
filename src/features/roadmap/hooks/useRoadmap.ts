import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { roadmapService } from '../services/roadmapService';
import type { RoadmapData } from '../types/roadmapTypes';

// Kiểu cấu trúc phản hồi lỗi chuẩn từ GlobalExceptionHandler phía Backend
interface BackendErrorPayload {
    code?: string;
    message?: string;
}

/**
 * Trích xuất thông điệp lỗi thân thiện từ đối tượng lỗi Axios mà không dùng kiểu any.
 *
 * @param err Ngoại lệ bắt được từ khối catch
 * @param fallback Thông điệp mặc định nếu không đọc được lỗi từ server
 * @returns Chuỗi thông báo lỗi hiển thị cho người dùng
 */
function extractErrorMessage(err: unknown, fallback: string): string {
    // Kiểm tra đúng đối tượng AxiosError trước khi đọc response.data
    if (axios.isAxiosError<BackendErrorPayload>(err)) {
        // Ưu tiên lấy message rõ ràng từ Backend trả về nếu có
        const serverMessage = err.response?.data?.message;
        // Chỉ sử dụng chuỗi không rỗng
        if (typeof serverMessage === 'string' && serverMessage.trim().length > 0) {
            return serverMessage;
        }
    }
    // Trả về câu thông báo dự phòng khi mất kết nối mạng hoặc lỗi không xác định
    return fallback;
}

/**
 * Custom Hook quản lý dữ liệu và 4 trạng thái (Loading, Error, Empty, Success) cho trang Lộ trình học.
 *
 * @returns Đối tượng chứa dữ liệu lộ trình, trạng thái tải, thông báo lỗi và hàm gọi lại API
 */
export function useRoadmap() {
    // Lưu dữ liệu lộ trình cá nhân (null khi học viên chưa làm bài chẩn đoán)
    const [data, setData] = useState<RoadmapData | null>(null);
    // Cờ trạng thái đang tải dữ liệu lần đầu hoặc khi nhấn Thử lại
    const [isLoading, setIsLoading] = useState<boolean>(true);
    // Thông báo lỗi thân thiện khi gọi API thất bại
    const [error, setError] = useState<string | null>(null);

    // Dùng useCallback giữ tham chiếu hàm ổn định để truyền vào useEffect và nút Thử lại
    const fetchRoadmap = useCallback(async () => {
        // Bật trạng thái đang tải và xóa lỗi cũ trước khi gọi API mới
        setIsLoading(true);
        setError(null);
        try {
            // Gọi service lấy lộ trình hiện hành từ Backend thật
            const res = await roadmapService.getRoadmap();
            // Nếu Backend phản hồi thành công -> cập nhật state (cho phép null với học viên mới)
            if (res.success) {
                setData(res.data ?? null);
            } else {
                // Nếu success = false -> hiển thị thông điệp lỗi Backend trả về
                setError(res.message || 'Không thể tải lộ trình học tập.');
            }
        } catch (err: unknown) {
            // Bóc tách thông điệp lỗi an toàn mà không ghi log rác ra console
            const friendlyMessage = extractErrorMessage(
                err,
                'Không thể kết nối đến máy chủ để tải lộ trình học của bạn. Vui lòng thử lại.'
            );
            setError(friendlyMessage);
        } finally {
            // Luôn tắt trạng thái đang tải dù thành công hay thất bại
            setIsLoading(false);
        }
    }, []);

    // Tự động gọi API tải lộ trình ngay khi component được gắn vào DOM
    useEffect(() => {
        void fetchRoadmap();
    }, [fetchRoadmap]);

    // Trả ra đầy đủ state và hàm refetch cho trang LearningPathPage
    return {
        data,
        isLoading,
        error,
        refetch: fetchRoadmap,
    };
}
