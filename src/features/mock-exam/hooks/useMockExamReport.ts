import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { parseExamApiError } from '@/shared/exam/utils/examErrorUtils';
import { mockExamService } from '../services/mockExamService';
import type { MockExamReportData } from '../types/mockExamTypes';

// Hook tải và điều phối dữ liệu Báo cáo kết quả thi thử ETS & đối sánh Trước/Sau (UC18)
export function useMockExamReport(attemptIdParam?: string) {
    // Hook điều hướng chuyển trang khi gặp lỗi xác thực
    const navigate = useNavigate();
    // Dữ liệu báo cáo chi tiết nhận từ Backend
    const [report, setReport] = useState<MockExamReportData | null>(null);
    // Trạng thái đang tải báo cáo từ API
    const [isLoading, setIsLoading] = useState<boolean>(true);
    // Thông báo lỗi hiển thị nếu không tải được báo cáo
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    // Số thứ tự Part đang được click lọc trên biểu đồ Radar (null = xem tất cả 7 Part)
    const [selectedPartNo, setSelectedPartNo] = useState<number | null>(null);

    // Tải báo cáo theo attemptId cụ thể hoặc lấy báo cáo mới nhất nếu không truyền tham số
    const fetchReport = useCallback(async () => {
        // Bật cờ loading và xóa lỗi trước khi thực hiện request
        setIsLoading(true);
        setErrorMessage(null);
        try {
            // Chuyển đổi attemptIdParam sang số để xác thực hợp lệ
            const numericAttemptId = attemptIdParam ? Number(attemptIdParam) : null;
            // Kiểm tra định dạng attemptId hợp lệ khi URL có truyền tham số
            if (
                attemptIdParam &&
                (numericAttemptId === null ||
                    !Number.isFinite(numericAttemptId) ||
                    numericAttemptId <= 0)
            ) {
                // Thông báo đường dẫn không hợp lệ ngay ở phía Client
                setErrorMessage('Mã lượt thi không hợp lệ để hiển thị báo cáo.');
                return;
            }
            // Gọi endpoint lấy báo cáo chi tiết hoặc báo cáo mới nhất
            const res = numericAttemptId
                ? await mockExamService.getReport(numericAttemptId)
                : await mockExamService.getLatestReport();
            // Cập nhật dữ liệu báo cáo vào state hiển thị
            setReport(res.data);
            // Đặt lại bộ lọc Part về mặc định khi đổi báo cáo
            setSelectedPartNo(null);
        } catch (err) {
            // Phân tích thông báo lỗi từ Axios / ApiResponse
            const parsed = parseExamApiError(
                err,
                'Không thể tải báo cáo kết quả bài thi thử lúc này.'
            );
            // Điều hướng về trang đăng nhập nếu mất phiên
            if (parsed.status === 401) {
                navigate('/login', { replace: true });
                return;
            }
            // Ghi nhận thông báo lỗi phục vụ nút Thử lại
            setErrorMessage(parsed.message);
        } finally {
            // Luôn tắt trạng thái loading khi kết thúc fetch
            setIsLoading(false);
        }
    }, [attemptIdParam, navigate]);

    // Tự động tải báo cáo khi tham số đường dẫn thay đổi
    useEffect(() => {
        // Kích hoạt hàm tải dữ liệu báo cáo
        void fetchReport();
    }, [fetchReport]);

    // Bật/tắt lọc theo một Part cụ thể khi người dùng click trên biểu đồ Radar
    const handleTogglePartFilter = useCallback((partNo: number) => {
        // Nếu click lại đúng Part đang chọn thì bỏ lọc về trạng thái toàn bộ 7 Part
        setSelectedPartNo((prev) => (prev === partNo ? null : partNo));
    }, []);

    // Trả về state và hàm thao tác cho MockExamReportPage
    return {
        report,
        isLoading,
        errorMessage,
        selectedPartNo,
        setSelectedPartNo,
        handleTogglePartFilter,
        retryLoad: fetchReport,
    };
}
