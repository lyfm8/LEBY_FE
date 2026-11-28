import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { dashboardService } from '../services/dashboardService';
import type { DashboardErrorType, DashboardSummary } from '../types/dashboardTypes';

// Kiểu dữ liệu phản hồi lỗi chuẩn từ GlobalExceptionHandler phía Backend
interface BackendErrorPayload {
    code?: string;
    message?: string;
}

/**
 * Trích xuất thông điệp lỗi thân thiện và phân loại mã lỗi HTTP từ đối tượng ngoại lệ Axios.
 *
 * @param err Ngoại lệ bắt được trong khối catch
 * @returns Cặp thông điệp lỗi và loại lỗi (UNAUTHORIZED hoặc GENERIC)
 */
function parseDashboardError(err: unknown): { message: string; errorType: DashboardErrorType } {
    // Kiểm tra đúng kiểu AxiosError trước khi truy cập response để đảm bảo type safety
    if (axios.isAxiosError<BackendErrorPayload>(err)) {
        // Lấy mã trạng thái HTTP nếu có phản hồi từ máy chủ
        const status = err.response?.status;
        // Lấy chuỗi thông báo nghiệp vụ do Backend trả về
        const serverMessage = err.response?.data?.message;

        // Nếu phiên đăng nhập hết hạn (401) -> phân loại UNAUTHORIZED để mời đăng nhập lại
        if (status === 401) {
            return {
                errorType: 'UNAUTHORIZED',
                message: 'Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại để tiếp tục học tập.',
            };
        }

        // Nếu Backend có thông điệp rõ ràng -> hiển thị nguyên văn cho học viên
        if (typeof serverMessage === 'string' && serverMessage.trim().length > 0) {
            return {
                errorType: 'GENERIC',
                message: serverMessage,
            };
        }
    }

    // Thông báo dự phòng khi mất kết nối mạng hoặc máy chủ tạm thời không phản hồi
    return {
        errorType: 'GENERIC',
        message: 'Không thể kết nối đến máy chủ để tải dữ liệu học tập. Vui lòng kiểm tra mạng và thử lại.',
    };
}

/**
 * Custom Hook quản lý toàn bộ luồng nạp dữ liệu và 4 trạng thái (Loading, Error, Empty, Success)
 * cho màn hình Dashboard học tập cá nhân.
 *
 * @returns Đối tượng gồm dữ liệu Dashboard, cờ loading, thông tin lỗi và hàm tải lại refetch
 */
export function useDashboard() {
    // Lưu dữ liệu tổng hợp Dashboard trả về từ Backend
    const [data, setData] = useState<DashboardSummary | null>(null);
    // Cờ trạng thái đang tải dữ liệu để hiển thị Skeleton thay cho spinner quay tròn
    const [isLoading, setIsLoading] = useState<boolean>(true);
    // Thông điệp lỗi hiển thị khi yêu cầu gặp sự cố kết nối hoặc hết phiên
    const [error, setError] = useState<string | null>(null);
    // Phân loại lỗi (UNAUTHORIZED vs GENERIC) để hiển thị nút hành động phù hợp
    const [errorType, setErrorType] = useState<DashboardErrorType | null>(null);

    // Tạo hàm nạp dữ liệu ổn định bằng useCallback để dùng cho cả lần tải đầu và nút Tải lại trang
    const fetchDashboard = useCallback(async () => {
        // Bật trạng thái đang tải và xóa sạch lỗi cũ trước mỗi lần gọi API
        setIsLoading(true);
        setError(null);
        setErrorType(null);

        try {
            // Gọi service lấy dữ liệu tổng hợp Dashboard từ Backend thật
            const res = await dashboardService.getSummary();
            // Kiểm tra phản hồi thành công và có payload data hợp lệ
            if (res.success && res.data) {
                setData(res.data);
            } else {
                // Nếu Backend báo success = false -> chuyển sang trạng thái lỗi có nút tải lại
                setData(null);
                setErrorType('GENERIC');
                setError(res.message || 'Không thể tải dữ liệu bảng điều khiển học tập.');
            }
        } catch (err: unknown) {
            // Bóc tách loại lỗi và thông điệp thân thiện mà không in log rác ra console
            const parsed = parseDashboardError(err);
            setData(null);
            setErrorType(parsed.errorType);
            setError(parsed.message);
        } finally {
            // Luôn kết thúc trạng thái loading dù thành công hay thất bại để không bao giờ bị treo màn hình
            setIsLoading(false);
        }
    }, []);

    // Tự động kích hoạt nạp dữ liệu ngay khi trang Dashboard được gắn vào giao diện
    useEffect(() => {
        void fetchDashboard();
    }, [fetchDashboard]);

    // Trả về đầy đủ state và hàm refetch cho DashboardPage
    return {
        data,
        isLoading,
        error,
        errorType,
        refetch: fetchDashboard,
    };
}
