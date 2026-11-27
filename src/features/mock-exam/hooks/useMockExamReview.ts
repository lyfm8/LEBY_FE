import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type {
    ExamRevealedInfo,
    ExamStep,
    OptionKey,
} from '@/shared/exam/types/examTypes';
import { parseExamApiError } from '@/shared/exam/utils/examErrorUtils';
import {
    buildExamSteps,
    buildQuestionToStepMap,
} from '@/shared/exam/utils/examStepUtils';
import { mockExamService } from '../services/mockExamService';
import type { MockExamReviewData, MockExamReviewQuestion } from '../types/mockExamTypes';

// Hook điều phối màn hình Xem lại chi tiết 200 câu bài thi thử ETS (BR14)
export function useMockExamReview(attemptIdParam?: string) {
    // Hook điều hướng chuyển trang khi gặp lỗi hoặc quay lại báo cáo
    const navigate = useNavigate();
    // Ép kiểu numericAttemptId từ tham số URL
    const numericAttemptId = Number(attemptIdParam);

    // Dữ liệu đề thi thử kèm đáp án đúng và lời giải chi tiết
    const [reviewData, setReviewData] = useState<MockExamReviewData | null>(null);
    // Trạng thái đang tải dữ liệu xem lại
    const [isLoading, setIsLoading] = useState<boolean>(true);
    // Thông báo lỗi nếu tải dữ liệu thất bại
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    // Đánh dấu bị khóa xem lời giải vì chưa đạt AIM ở bài thi đầu ra OUTPUT
    const [isReviewLocked, setIsReviewLocked] = useState<boolean>(false);

    // Chỉ số bước hiển thị câu hỏi/chùm câu hiện tại
    const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
    // Số thứ tự câu hỏi đang được làm nổi bật khi bấm từ bảng câu hỏi
    const [focusedOrderNo, setFocusedOrderNo] = useState<number | null>(null);
    // Tập các câu hỏi được học viên đánh dấu cờ ôn lại
    const [flagged, setFlagged] = useState<Set<number>>(new Set());
    // Trạng thái thu gọn bảng câu hỏi bên phải
    const [isPaletteCollapsed, setIsPaletteCollapsed] = useState<boolean>(false);

    // Tải toàn bộ danh sách 200 câu hỏi kèm lời giải từ Backend
    const fetchReview = useCallback(async () => {
        // Kiểm tra tính hợp lệ của tham số attemptId trên URL
        if (!attemptIdParam || !Number.isFinite(numericAttemptId) || numericAttemptId <= 0) {
            setIsLoading(false);
            setErrorMessage('Đường dẫn xem lại bài thi thử không hợp lệ.');
            return;
        }

        // Bật trạng thái loading và xóa lỗi cũ
        setIsLoading(true);
        setErrorMessage(null);
        setIsReviewLocked(false);

        try {
            // Gọi API GET danh sách câu hỏi và lời giải theo attemptId
            const res = await mockExamService.getReview(numericAttemptId);
            // Trích xuất dữ liệu phản hồi
            const data = res.data;
            // Cập nhật dữ liệu vào state chính
            setReviewData(data);
            // Khởi tạo tập câu đánh dấu dựa trên dữ liệu đã lưu ở lượt thi
            const initialFlagged = new Set<number>(
                data.questions.filter((q) => q.isFlagged).map((q) => q.orderNo)
            );
            // Gán lại cờ, vị trí bước đầu và bỏ focus cũ
            setFlagged(initialFlagged);
            setCurrentStepIndex(0);
            setFocusedOrderNo(null);
        } catch (err) {
            // Chuẩn hóa thông báo lỗi từ Backend
            const parsed = parseExamApiError(
                err,
                'Không thể tải dữ liệu xem lại bài thi thử.'
            );
            // Chuyển về trang đăng nhập nếu hết phiên làm việc
            if (parsed.status === 401) {
                navigate('/login', { replace: true });
                return;
            }
            // Ghi nhận trạng thái khóa riêng khi chưa đạt AIM ở đề đầu ra OUTPUT
            if (parsed.status === 403 || parsed.code === 'MOCK_EXAM_REVIEW_LOCKED') {
                setIsReviewLocked(true);
            }
            // Hiển thị lỗi cho người dùng thử tải lại hoặc quay về báo cáo
            setErrorMessage(parsed.message);
        } finally {
            // Tắt loading sau khi xong
            setIsLoading(false);
        }
    }, [attemptIdParam, numericAttemptId, navigate]);

    // Tự động gọi fetchReview mỗi khi attemptId trên URL thay đổi
    useEffect(() => {
        // Kích hoạt hàm tải dữ liệu xem lại
        void fetchReview();
    }, [fetchReview]);

    // Gom các câu hỏi cùng parentId thành từng màn hình bước giống phòng thi thật
    const steps: ExamStep<MockExamReviewQuestion>[] = useMemo(() => {
        // Trả về danh sách rỗng nếu dữ liệu chưa sẵn sàng
        if (!reviewData?.questions) return [];
        // Tái sử dụng hàm buildExamSteps từ module shared/exam
        return buildExamSteps(reviewData.questions);
    }, [reviewData]);

    // Tạo bản đồ ánh xạ orderNo -> stepIndex để bấm nhảy câu tức thì trên Palette
    const questionToStepMap = useMemo(() => buildQuestionToStepMap(steps), [steps]);
    // Lấy thông tin bước hiện tại đang hiển thị
    const currentStep = steps[currentStepIndex] ?? null;

    // Tập hợp các số thứ tự câu hỏi thuộc màn hình hiện tại (1 câu đơn hoặc 1 chùm 3-5 câu)
    const activeOrderNos = useMemo(() => {
        // Trả về Set rỗng nếu chưa có bước hợp lệ
        if (!currentStep) return new Set<number>();
        // Thu thập toàn bộ orderNo nằm trong bước hiện tại
        return new Set(currentStep.questions.map((q) => q.orderNo));
    }, [currentStep]);

    // Tạo bản đồ đáp án học viên đã chọn để truyền xuống thẻ câu hỏi và Palette
    const answers = useMemo<Record<number, OptionKey | null>>(() => {
        // Trả về map rỗng khi chưa có câu hỏi
        if (!reviewData?.questions) return {};
        // Khởi tạo map ánh xạ orderNo -> userAnswer
        const map: Record<number, OptionKey | null> = {};
        // Duyệt danh sách câu hỏi để điền lựa chọn cũ của học viên
        for (const q of reviewData.questions) {
            map[q.orderNo] = q.userAnswer;
        }
        return map;
    }, [reviewData]);

    // Tạo bản đồ kết quả đúng/sai và lời giải chi tiết cho ExamQuestionCard
    const reviewQuestionMap = useMemo<Record<number, ExamRevealedInfo>>(() => {
        // Trả về map rỗng nếu chưa có dữ liệu
        if (!reviewData?.questions) return {};
        // Khởi tạo bản đồ thông tin đáp án & giải thích theo orderNo
        const map: Record<number, ExamRevealedInfo> = {};
        // Chuyển đổi từng câu hỏi sang định dạng ExamRevealedInfo dùng chung
        for (const q of reviewData.questions) {
            map[q.orderNo] = {
                userAnswer: q.userAnswer,
                correctAnswer: q.correctAnswer,
                isCorrect: q.isCorrect,
                explanation: q.explanation,
            };
        }
        return map;
    }, [reviewData]);

    // Tạo bản đồ trạng thái đúng/sai boolean phục vụ tô màu xanh/đỏ trên Palette
    const reviewStatusMap = useMemo<Record<number, boolean>>(() => {
        // Trả về map rỗng khi chưa có dữ liệu
        if (!reviewData?.questions) return {};
        // Khởi tạo map orderNo -> isCorrect
        const map: Record<number, boolean> = {};
        // Điền trạng thái đúng/sai của từng câu hỏi
        for (const q of reviewData.questions) {
            map[q.orderNo] = q.isCorrect;
        }
        return map;
    }, [reviewData]);

    // Bật/tắt gắn cờ ghi chú cục bộ khi học viên ôn lại bài
    const handleToggleFlag = useCallback((orderNo: number) => {
        // Cập nhật Set cờ theo trạng thái đảo ngược
        setFlagged((prev) => {
            // Tạo bản sao Set mới giữ bất biến state
            const next = new Set(prev);
            // Xóa nếu đã tồn tại, ngược lại thêm mới
            if (next.has(orderNo)) {
                next.delete(orderNo);
            } else {
                next.add(orderNo);
            }
            return next;
        });
    }, []);

    // Chuyển lùi về bước câu hỏi trước đó
    const handlePrevStep = useCallback(() => {
        // Không xử lý nếu đã ở bước đầu tiên
        if (currentStepIndex <= 0) return;
        // Xóa focus câu đơn lẻ khi đổi sang bước khác
        setFocusedOrderNo(null);
        // Giảm chỉ số bước an toàn về tối thiểu 0
        setCurrentStepIndex((prev) => Math.max(0, prev - 1));
    }, [currentStepIndex]);

    // Chuyển tiến sang bước câu hỏi tiếp theo
    const handleNextStep = useCallback(() => {
        // Không xử lý nếu đã ở bước cuối cùng
        if (currentStepIndex >= steps.length - 1) return;
        // Xóa focus câu đơn lẻ trước khi chuyển bước
        setFocusedOrderNo(null);
        // Tăng chỉ số bước an toàn không vượt quá cuối mảng
        setCurrentStepIndex((prev) => Math.min(steps.length - 1, prev + 1));
    }, [currentStepIndex, steps.length]);

    // Nhảy trực tiếp đến câu hỏi bất kỳ khi người dùng bấm trên Palette theo Part
    const handleSelectQuestion = useCallback(
        (orderNo: number) => {
            // Tra cứu bước chứa câu hỏi orderNo tương ứng
            const targetStep = questionToStepMap.get(orderNo);
            // Dừng nếu không tìm thấy câu hỏi trong danh sách bước
            if (targetStep === undefined) return;
            // Đánh dấu nổi bật câu được bấm để người dùng dễ nhìn trong chùm câu
            setFocusedOrderNo(orderNo);
            // Chuyển thẳng tới bước chứa câu hỏi đó
            setCurrentStepIndex(targetStep);
        },
        [questionToStepMap]
    );

    // Số thứ tự đầu tiên của bước đang hiển thị
    const firstOrderNo = currentStep?.questions[0]?.orderNo ?? 1;
    // Số thứ tự cuối cùng của bước đang hiển thị (dùng cho chùm câu Part 3, 4, 6, 7)
    const lastOrderNo =
        currentStep?.questions[currentStep.questions.length - 1]?.orderNo ?? firstOrderNo;
    // Nhãn gộp khoảng câu hỏi hiển thị trên Header khi bước là chùm câu
    const questionLabel =
        currentStep && currentStep.questions.length > 1
            ? `Câu ${firstOrderNo}–${lastOrderNo} / ${reviewData?.totalQuestions ?? 0}`
            : undefined;

    // Đường dẫn quay lại báo cáo kết quả tương ứng với examTag (OUTPUT vs PRACTICE)
    const fallbackReportRoute =
        Number.isFinite(numericAttemptId) && numericAttemptId > 0
            ? `/mock-exam/report/${numericAttemptId}`
            : '/mock-exam';
    const reportRoute = reviewData
        ? reviewData.examTag === 'OUTPUT'
            ? `/mock-exam/report/${reviewData.attemptId}`
            : `/mock-exam/results/${reviewData.attemptId}`
        : fallbackReportRoute;

    // Trả về toàn bộ state và hành động điều khiển trang MockExamReviewPage
    return {
        reviewData,
        currentStep,
        focusedOrderNo,
        answers,
        flagged,
        activeOrderNos,
        reviewQuestionMap,
        reviewStatusMap,
        isPaletteCollapsed,
        isLoading,
        errorMessage,
        isReviewLocked,
        questionLabel,
        firstOrderNo,
        reportRoute,
        isPrevDisabled: currentStepIndex <= 0,
        isNextDisabled: steps.length === 0 || currentStepIndex >= steps.length - 1,
        retryLoad: fetchReview,
        togglePaletteCollapse: () => setIsPaletteCollapsed((prev) => !prev),
        handleToggleFlag,
        handlePrevStep,
        handleNextStep,
        handleSelectQuestion,
    };
}
