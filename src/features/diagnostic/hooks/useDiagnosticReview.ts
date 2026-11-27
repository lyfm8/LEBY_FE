import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { diagnosticService } from '../services/diagnosticService';
import type {
    DiagnosticExamStep,
    DiagnosticReviewData,
    DiagnosticReviewQuestion,
    OptionKey,
} from '../types/diagnosticTypes';
import { buildExamSteps, buildQuestionToStepMap } from '../utils/diagnosticExamUtils';

/**
 * Custom hook quản lý toàn bộ trạng thái và thao tác trong chế độ Xem lại bài thi chẩn đoán (UC07 - BR14):
 * - Tải dữ liệu bài làm kèm đáp án đúng và giải thích chi tiết theo attemptId.
 * - Không chạy đồng hồ đếm ngược, không nộp bài, không khóa audio hay khóa chuyển câu.
 * - Cho phép học viên gắn cờ lại tạm thời trên giao diện và nhảy tự do giữa các câu Nghe/Đọc.
 *
 * @param attemptId ID lượt thi chẩn đoán cần xem lại từ URL params
 */
export function useDiagnosticReview(attemptId: string | undefined) {
    // Lưu dữ liệu tổng hợp của phiên xem lại trả về từ Backend
    const [reviewData, setReviewData] = useState<DiagnosticReviewData | null>(null);
    // Lưu chỉ số màn hình/chùm câu hỏi đang hiển thị (bắt đầu từ 0)
    const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
    // Lưu số thứ tự câu hỏi vừa bấm trên Palette để tự cuộn tới đúng vị trí trong chùm
    const [focusedOrderNo, setFocusedOrderNo] = useState<number | null>(null);
    // Lưu tập hợp các số thứ tự câu hỏi đang được đánh dấu cờ (khởi tạo theo cờ đã lưu khi thi)
    const [flagged, setFlagged] = useState<Set<number>>(new Set());
    // Lưu trạng thái thu gọn/mở rộng bảng bản đồ câu hỏi bên phải
    const [isPaletteCollapsed, setIsPaletteCollapsed] = useState<boolean>(false);
    // Lưu trạng thái đang tải dữ liệu xem lại từ máy chủ
    const [isLoading, setIsLoading] = useState<boolean>(true);
    // Lưu thông báo lỗi nếu gọi API thất bại
    const [error, setError] = useState<string>('');
    // Đánh dấu trường hợp người dùng truy cập lượt thi chưa hoàn thành
    const [notCompletedYet, setNotCompletedYet] = useState<boolean>(false);

    // Hàm gọi API nạp dữ liệu xem lại cho attemptId tương ứng
    const fetchReviewData = useCallback(async () => {
        // Kiểm tra nếu thiếu attemptId trên đường dẫn thì báo lỗi ngay
        if (!attemptId) {
            setError('Không tìm thấy mã lượt thi chẩn đoán cần xem lại.');
            setIsLoading(false);
            return;
        }

        // Bật trạng thái loading và xóa thông báo lỗi cũ trước khi tải lại
        setIsLoading(true);
        setError('');
        setNotCompletedYet(false);

        try {
            // Gọi service lấy danh sách câu hỏi, đáp án đúng, đáp án chọn và giải thích
            const res = await diagnosticService.getReviewData(attemptId);
            if (res.success && res.data) {
                // Lưu dữ liệu xem lại vào state
                setReviewData(res.data);
                // Đưa con trỏ xem lại về màn hình đầu tiên
                setCurrentStepIndex(0);
                // Xóa câu focus cũ
                setFocusedOrderNo(null);
                // Khởi tạo tập cờ theo trạng thái isFlagged học viên đã gắn trong lúc làm bài
                const initialFlags = new Set<number>();
                for (const question of res.data.questions) {
                    if (question.isFlagged) {
                        initialFlags.add(question.orderNo);
                    }
                }
                setFlagged(initialFlags);
            } else {
                // Ghi nhận thông báo lỗi trả về từ Backend
                setError(res.message || 'Không thể tải dữ liệu xem lại bài thi.');
            }
        } catch (err: unknown) {
            // Phân loại lỗi Axios để hiển thị thông điệp thân thiện đúng ngữ cảnh UC07
            if (axios.isAxiosError(err)) {
                const data = err.response?.data as { code?: string; message?: string } | undefined;
                if (data?.code === 'DIAGNOSTIC_NOT_COMPLETED') {
                    setNotCompletedYet(true);
                    setError(
                        data.message ||
                            'Bạn chưa hoàn thành lượt thi này nên chưa thể xem lại bài làm.'
                    );
                    return;
                }
                setError(data?.message || 'Không thể tải dữ liệu xem lại bài thi. Vui lòng thử lại.');
            } else {
                setError('Đã xảy ra lỗi khi tải dữ liệu xem lại bài thi.');
            }
        } finally {
            // Tắt trạng thái loading sau khi hoàn tất xử lý
            setIsLoading(false);
        }
    }, [attemptId]);

    // Tự động kích hoạt tải dữ liệu khi trang mount hoặc khi attemptId thay đổi
    useEffect(() => {
        void fetchReviewData();
    }, [fetchReviewData]);

    // Gom danh sách câu hỏi xem lại thành từng trang/chùm (Part 3, 4, 6, 7 hiển thị cùng trang)
    const steps: DiagnosticExamStep<DiagnosticReviewQuestion>[] = useMemo(
        () => buildExamSteps(reviewData?.questions ?? []),
        [reviewData]
    );

    // Tạo bảng ánh xạ orderNo -> stepIndex để click bất kỳ ô nào trên Palette đều nhảy đúng trang
    const questionToStepMap = useMemo(() => buildQuestionToStepMap(steps), [steps]);

    // Lấy thông tin trang/chùm câu hỏi đang xem hiện tại
    const currentStep = steps[currentStepIndex] ?? null;

    // Tạo bản đồ đáp án học viên đã chọn theo orderNo để truyền xuống QuestionCard & QuestionPalette
    const answers = useMemo(() => {
        const map: Record<number, OptionKey | null> = {};
        for (const question of reviewData?.questions ?? []) {
            map[question.orderNo] = question.userAnswer;
        }
        return map;
    }, [reviewData]);

    // Tạo bản đồ dữ liệu review đầy đủ theo orderNo để QuestionCard tra cứu đáp án đúng & giải thích O(1)
    const reviewQuestionMap = useMemo(() => {
        const map: Record<number, DiagnosticReviewQuestion> = {};
        for (const question of reviewData?.questions ?? []) {
            map[question.orderNo] = question;
        }
        return map;
    }, [reviewData]);

    // Tạo bản đồ trạng thái đúng/sai theo orderNo để QuestionPalette tô màu xanh lá / đỏ
    const reviewStatusMap = useMemo(() => {
        const map: Record<number, boolean> = {};
        for (const question of reviewData?.questions ?? []) {
            map[question.orderNo] = question.isCorrect;
        }
        return map;
    }, [reviewData]);

    // Tập hợp các số thứ tự câu hỏi đang hiển thị trên màn hình hiện tại
    const activeQuestionOrderNos = useMemo(
        () => new Set(currentStep?.questions.map((q) => q.orderNo) ?? []),
        [currentStep]
    );

    // Hàm bật hoặc tắt cờ đánh dấu tạm thời cho một câu hỏi trong lúc xem lại
    const handleToggleFlag = useCallback((orderNo: number) => {
        // Sao chép Set cũ và đảo trạng thái cờ cho số thứ tự câu hỏi tương ứng
        setFlagged((prev) => {
            const next = new Set(prev);
            if (next.has(orderNo)) {
                next.delete(orderNo);
            } else {
                next.add(orderNo);
            }
            return next;
        });
    }, []);

    // Hàm chuyển về trang/chùm câu hỏi phía trước (không bị khóa trong chế độ xem lại)
    const handlePrevStep = useCallback(() => {
        // Xóa trạng thái focus câu cũ trước khi đổi trang
        setFocusedOrderNo(null);
        // Lùi lại tối thiểu về chỉ số 0
        setCurrentStepIndex((prev) => Math.max(0, prev - 1));
    }, []);

    // Hàm chuyển sang trang/chùm câu hỏi kế tiếp (không bị khóa trong chế độ xem lại)
    const handleNextStep = useCallback(() => {
        // Xóa trạng thái focus câu cũ trước khi đổi trang
        setFocusedOrderNo(null);
        // Tiến tới tối đa là trang cuối cùng
        setCurrentStepIndex((prev) => Math.min(steps.length - 1, prev + 1));
    }, [steps.length]);

    // Hàm nhảy thẳng tới câu hỏi bất kỳ (cả Listening lẫn Reading) khi bấm ô trên bảng Palette
    const handleSelectQuestionFromPalette = useCallback(
        (orderNo: number) => {
            // Tra stepIndex tương ứng với số câu hỏi được chọn
            const targetStep = questionToStepMap.get(orderNo);
            // Nếu hợp lệ thì chuyển màn hình tới step đó và cuộn đúng vào câu hỏi được chọn
            if (targetStep !== undefined) {
                setCurrentStepIndex(targetStep);
                setFocusedOrderNo(orderNo);
            }
        },
        [questionToStepMap]
    );

    // Trả ra toàn bộ state và hàm điều khiển cho trang DiagnosticReviewPage sử dụng
    return {
        reviewData,
        steps,
        currentStep,
        currentStepIndex,
        focusedOrderNo,
        answers,
        reviewQuestionMap,
        reviewStatusMap,
        activeQuestionOrderNos,
        flagged,
        isPaletteCollapsed,
        isLoading,
        error,
        notCompletedYet,
        setIsPaletteCollapsed,
        handleToggleFlag,
        handlePrevStep,
        handleNextStep,
        handleSelectQuestionFromPalette,
        retryFetch: fetchReviewData,
    };
}
