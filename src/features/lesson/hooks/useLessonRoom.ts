import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { lessonService } from '../services/lessonService';
import type {
    LessonDetail,
    LessonProgressResult,
    LessonRoomErrorType,
} from '../types/lessonTypes';

/**
 * Cấu trúc phản hồi lỗi chuẩn hóa mà Backend LEBY trả về khi có ngoại lệ nghiệp vụ.
 */
interface BackendErrorPayload {
    /** Thông điệp lỗi thân thiện từ Backend. */
    message?: string;
    /** Mã lỗi định danh (ví dụ CONTENT_LOCKED, RESOURCE_NOT_FOUND). */
    errorCode?: string;
    /** Mã trạng thái HTTP dự phòng nếu có. */
    code?: number | string;
}

/**
 * Phân loại lỗi Axios khi gọi API tải phòng học để giao diện hiển thị đúng trạng thái phản hồi.
 *
 * @param err Lỗi phát sinh từ lời gọi HTTP
 * @returns Cặp loại lỗi và thông điệp tiếng Việt thân thiện cho người dùng
 */
function parseLessonRoomError(err: unknown): {
    type: LessonRoomErrorType;
    message: string;
} {
    // Kiểm tra xem ngoại lệ có phải là lỗi chuẩn của Axios hay không
    if (axios.isAxiosError<BackendErrorPayload>(err)) {
        // Lấy mã HTTP status từ phản hồi máy chủ (nếu có)
        const status = err.response?.status;
        // Lấy phần thân dữ liệu lỗi do Backend gửi về
        const payload = err.response?.data;
        // Lấy mã lỗi nghiệp vụ dạng chuỗi in hoa để so khớp an toàn
        const rawCode = String(payload?.errorCode ?? payload?.code ?? '').toUpperCase();
        // Lấy câu thông báo từ máy chủ nếu tồn tại
        const serverMessage = payload?.message;

        // Trường hợp phiên đăng nhập đã hết hạn hoặc chưa xác thực (HTTP 401)
        if (status === 401) {
            return {
                type: 'UNAUTHORIZED',
                message: 'Phiên làm việc của bạn đã hết hạn. Vui lòng đăng nhập lại để tiếp tục học.',
            };
        }

        // Trường hợp học viên truy cập vào mô-đun đang bị khóa (HTTP 422 CONTENT_LOCKED)
        if (status === 422 || rawCode === 'CONTENT_LOCKED' || rawCode === 'DIAGNOSTIC_NOT_COMPLETED') {
            return {
                type: 'LOCKED',
                message:
                    serverMessage ||
                    'Mô-đun này hiện chưa được mở khóa. Bạn cần hoàn thành các mô-đun phía trước để tiếp tục.',
            };
        }

        // Trường hợp bài học không tồn tại, đang ẩn hoặc không thuộc lộ trình hiện tại (HTTP 404)
        if (status === 404 || rawCode === 'RESOURCE_NOT_FOUND') {
            return {
                type: 'NOT_FOUND',
                message:
                    serverMessage ||
                    'Nội dung bài học không tồn tại hoặc hiện chưa sẵn sàng.',
            };
        }

        // Các lỗi kết nối mạng hoặc lỗi máy chủ khác
        return {
            type: 'GENERIC',
            message:
                serverMessage ||
                'Không thể tải nội dung bài học do lỗi kết nối. Vui lòng thử lại.',
        };
    }

    // Trường hợp ngoại lệ không xác định khác ngoài Axios
    return {
        type: 'GENERIC',
        message: 'Đã xảy ra sự cố ngoài ý muốn khi tải bài giảng. Vui lòng thử lại.',
    };
}

/**
 * Custom Hook quản lý tải dữ liệu phòng học bài giảng, xử lý phân loại lỗi
 * và cập nhật tức thì trạng thái bài học / mô-đun sau mỗi nhịp đồng bộ tiến độ.
 *
 * @param lessonId Mã bài học lấy từ đường dẫn URL
 * @returns Trạng thái dữ liệu phòng học, trạng thái tải, thông tin lỗi và các hàm cập nhật
 */
export function useLessonRoom(lessonId?: string) {
    // Lưu toàn bộ dữ liệu chi tiết của phòng học hiện tại
    const [lesson, setLesson] = useState<LessonDetail | null>(null);
    // Lưu cờ đang tải dữ liệu lần đầu hoặc khi chuyển bài
    const [isLoading, setIsLoading] = useState<boolean>(true);
    // Lưu phân loại lỗi hiện tại nếu tải thất bại
    const [errorType, setErrorType] = useState<LessonRoomErrorType | null>(null);
    // Lưu câu thông báo lỗi hiển thị cho học viên
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    /**
     * Hàm gọi API lấy thông tin bài học theo lessonId từ Backend thật.
     */
    const fetchLesson = useCallback(async () => {
        // Nếu đường dẫn thiếu hoặc sai định dạng lessonId thì báo lỗi không tìm thấy ngay
        if (!lessonId || Number.isNaN(Number(lessonId)) || Number(lessonId) <= 0) {
            setLesson(null);
            setErrorType('NOT_FOUND');
            setErrorMessage('Đường dẫn bài học không hợp lệ.');
            setIsLoading(false);
            return;
        }

        // Bật trạng thái đang tải và xóa sạch lỗi cũ trước khi gọi API mới
        setIsLoading(true);
        setErrorType(null);
        setErrorMessage(null);

        try {
            // Gọi service tải chi tiết bài giảng và lịch sử xem từ Backend
            const response = await lessonService.getLessonDetail(lessonId);
            // Nếu phản hồi thành công và có dữ liệu hợp lệ thì cập nhật state
            if (response.success && response.data) {
                setLesson(response.data);
            } else {
                // Nếu Backend trả về cờ thất bại mà không ném ngoại lệ HTTP
                setLesson(null);
                setErrorType('GENERIC');
                setErrorMessage(response.message || 'Không thể tải nội dung bài học.');
            }
        } catch (err: unknown) {
            // Chuyển đổi lỗi nhận được sang phân loại và thông điệp thân thiện
            const parsed = parseLessonRoomError(err);
            setLesson(null);
            setErrorType(parsed.type);
            setErrorMessage(parsed.message);
        } finally {
            // Luôn tắt trạng thái đang tải dù thành công hay thất bại
            setIsLoading(false);
        }
    }, [lessonId]);

    // Tự động tải lại nội dung phòng học mỗi khi lessonId trên URL thay đổi
    useEffect(() => {
        void fetchLesson();
    }, [fetchLesson]);

    /**
     * Hợp nhất kết quả tiến độ vừa đồng bộ từ server vào state lesson hiện tại
     * để thanh tiêu đề, thanh tiến độ mô-đun và danh sách bài bên phải cập nhật ngay lập tức.
     *
     * @param result Kết quả tiến độ trả về từ PUT /api/users/lessons/{lessonId}/progress
     */
    const applyProgressUpdate = useCallback((result: LessonProgressResult) => {
        // Dùng functional state update để tránh đọc nhầm bản chụp state cũ
        setLesson((prev) => {
            // Bảo vệ tránh ghi đè nếu người dùng đã chuyển sang bài học khác trong lúc request đang bay
            if (!prev || prev.id !== result.lessonId) {
                return prev;
            }

            // Cập nhật lại trạng thái hoàn thành và % xem của đúng bài học này trong danh sách sidebar
            const updatedModuleLessons = prev.moduleLessons.map((navItem) =>
                navItem.id === result.lessonId
                    ? {
                          ...navItem,
                          isCompleted: result.isCompleted,
                          watchPercent: result.watchPercent,
                      }
                    : navItem
            );

            // Trả về bản sao LessonDetail đã được cập nhật toàn bộ chỉ số tiến độ mới nhất
            return {
                ...prev,
                durationSeconds:
                    result.durationSeconds > 0 ? result.durationSeconds : prev.durationSeconds,
                watchedSeconds: result.watchedSeconds,
                lastPositionSeconds: result.lastPositionSeconds,
                watchPercent: result.watchPercent,
                requiredWatchPercent: result.requiredWatchPercent,
                isCompleted: result.isCompleted,
                completedAt: result.completedAt ?? prev.completedAt,
                moduleProgressPercent: result.moduleProgressPercent,
                completedVideoLessons: result.completedVideoLessons,
                totalVideoLessons: result.totalVideoLessons,
                requiredCompletionRate: result.requiredCompletionRate,
                moduleTestUnlocked: result.moduleTestUnlocked,
                moduleLessons: updatedModuleLessons,
            };
        });
    }, []);

    // Trả ra state và các hàm điều khiển cho LessonRoomPage sử dụng
    return {
        lesson,
        isLoading,
        errorType,
        errorMessage,
        refetch: fetchLesson,
        applyProgressUpdate,
    };
}
