import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type { ExamStep, OptionKey } from '@/shared/exam/types/examTypes';
import { parseExamApiError } from '@/shared/exam/utils/examErrorUtils';
import {
    buildExamSteps,
    buildQuestionToStepMap,
    checkAllListeningCompleted,
    getListeningAudioKeys,
} from '@/shared/exam/utils/examStepUtils';
import { mockExamService } from '../services/mockExamService';
import type {
    MockExamQuestion,
    MockExamRoomData,
    SubmitMockExamAnswerItem,
    SubmitMockExamRequest,
} from '../types/mockExamTypes';
import {
    clearMockExamLocalDraft,
    clearPendingMockExamSubmit,
    parseMockExamOptionKey,
    readMockExamLocalDraft,
    readPendingMockExamSubmit,
    saveMockExamLocalDraft,
    savePendingMockExamSubmit,
    toMockExamJsonAnswer,
} from '../utils/mockExamDraftUtils';

// Trạng thái phòng thi bị chặn hoặc không khả dụng (chưa mở khóa đầu ra, đã nộp bài, không tìm thấy)
export interface MockExamBlockedState {
    // Phân loại lý do bị chặn để render hành động nút bấm phù hợp
    kind: 'OUTPUT_LOCKED' | 'ALREADY_SUBMITTED' | 'NOT_FOUND' | 'NETWORK_OR_SERVER';
    // Nội dung thông báo lỗi thân thiện với học viên
    message: string;
}

// Hook điều phối toàn bộ Phòng thi thử TOEIC chuẩn ETS 200 câu (UC17 - nhân bản đầy đủ logic Diagnostic)
export function useMockExamRoom(attemptIdParam?: string) {
    // Hook điều hướng chuyển trang khi nộp bài hoặc lỗi xác thực
    const navigate = useNavigate();
    // Lấy thông tin người dùng hiện tại để phân tách key lưu nháp localStorage
    const { user } = useAuth();
    // ID học viên hiện tại
    const userId = user?.id;
    // Chuyển attemptId trên URL sang kiểu số nếu có
    const numericAttemptId = attemptIdParam ? Number(attemptIdParam) : null;

    // Dữ liệu đề thi thử và danh sách 200 câu hỏi
    const [roomData, setRoomData] = useState<MockExamRoomData | null>(null);
    // Số giây khởi tạo đồng hồ đếm ngược (120 phút hoặc thời gian còn lại khi resume)
    const [initialSeconds, setInitialSeconds] = useState<number>(7200);
    // Bản đồ đáp án đang chọn theo orderNo (1..200)
    const [answers, setAnswers] = useState<Record<number, OptionKey | null>>({});
    // Tập số thứ tự câu hỏi đã gắn cờ đánh dấu
    const [flagged, setFlagged] = useState<Set<number>>(new Set());
    // Tập khóa audio đã phát xong hết một lượt (BR08 - mỗi file chỉ nghe 1 lần)
    const [playedAudios, setPlayedAudios] = useState<Set<string>>(new Set());
    // Chỉ số bước hiển thị câu hỏi hiện tại
    const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
    // Câu hỏi đơn lẻ được chọn để tô viền focus khi nhảy từ Palette
    const [focusedOrderNo, setFocusedOrderNo] = useState<number | null>(null);

    // Đánh dấu người dùng đã tương tác bấm nút phát audio đầu tiên để hỗ trợ tự phát nối tiếp
    const [hasInteractedAudio, setHasInteractedAudio] = useState<boolean>(false);
    // Trạng thái thu gọn bảng câu hỏi theo Part bên phải
    const [isPaletteCollapsed, setIsPaletteCollapsed] = useState<boolean>(false);
    // Trạng thái tạm dừng đồng hồ làm bài
    const [isPaused, setIsPaused] = useState<boolean>(false);
    // Trạng thái mở hộp thoại xác nhận nộp bài
    const [isSubmitModalOpen, setIsSubmitModalOpen] = useState<boolean>(false);
    // Trạng thái đang gửi API nộp bài thủ công
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    // Trạng thái hệ thống đang tự động thu bài khi hết 120 phút (BR07)
    const [isAutoSubmitting, setIsAutoSubmitting] = useState<boolean>(false);
    // Cờ xác nhận đã chạm 00:00 để khóa mọi thao tác chọn đáp án
    const [isTimedOut, setIsTimedOut] = useState<boolean>(false);
    // Cờ báo hiệu mất kết nối mạng tạm thời (BR12)
    const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
    // Trạng thái đang tải đề thi
    const [isLoading, setIsLoading] = useState<boolean>(true);
    // Thông báo trạng thái bị chặn nếu không vào được phòng thi
    const [blockedState, setBlockedState] = useState<MockExamBlockedState | null>(null);
    // Lỗi hiển thị khi thao tác nộp bài thất bại
    const [submitError, setSubmitError] = useState<string | null>(null);

    // Ref lưu attemptId hiện tại phục vụ timer interval và listener pagehide
    const attemptIdRef = useRef<number | null>(null);
    // Ref theo dõi số giây còn lại mới nhất mà không làm re-render cả phòng thi mỗi giây
    const secondsLeftRef = useRef<number>(7200);
    // Ref đánh dấu đã nộp bài thành công để tránh syncTimerOnExit chạy đè
    const isSubmittedRef = useRef<boolean>(false);
    // Ref quản lý timeout chuyển câu tự động sau khi file audio kết thúc
    const audioAdvanceTimerRef = useRef<number | null>(null);

    // Chuyển đổi dữ liệu phòng thi từ Backend kết hợp bản nháp cục bộ (ưu tiên bản mới nhất/giữ lại đáp án chưa đồng bộ)
    const hydrateRoomState = useCallback(
        (room: MockExamRoomData, activeUserId: number) => {
            // Lưu attemptId vào ref cho các effect đồng bộ đồng hồ
            attemptIdRef.current = room.attemptId;
            // Đặt lại cờ chưa nộp bài cho phiên mới khởi tạo/khôi phục
            isSubmittedRef.current = false;
            // Cập nhật dữ liệu phòng thi chính
            setRoomData(room);

            // Đọc bản nháp đáp án và cờ đã lưu trên Backend
            const serverAnswers: Record<number, OptionKey | null> = {};
            const serverFlagged = new Set<number>();
            // Duyệt từng dòng draftAnswers trả về từ API phòng thi
            for (const draftItem of room.draftAnswers ?? []) {
                // Giải mã an toàn OptionKey A/B/C/D
                const parsedOpt = parseMockExamOptionKey(draftItem.selectedOption);
                // Lưu đáp án nếu hợp lệ
                if (parsedOpt) {
                    serverAnswers[draftItem.orderNo] = parsedOpt;
                }
                // Ghi nhận cờ đánh dấu nếu true
                if (draftItem.isFlagged) {
                    serverFlagged.add(draftItem.orderNo);
                }
            }

            // Đọc thêm bản nháp cục bộ lưu trên trình duyệt của học viên (nếu vừa F5 hoặc mất mạng)
            const localDraft = readMockExamLocalDraft(activeUserId, room.attemptId);
            // Hợp nhất đáp án giữa server và bản nháp cục bộ
            const mergedAnswers: Record<number, OptionKey | null> = {
                ...serverAnswers,
                ...(localDraft?.answers ?? {}),
            };
            // Hợp nhất danh sách câu gắn cờ
            const mergedFlagged = new Set<number>([
                ...serverFlagged,
                ...(localDraft?.flagged ?? []),
            ]);
            // Khôi phục danh sách audio đã nghe xong hết 1 lần (BR08/BR13)
            const mergedPlayed = new Set<string>(localDraft?.playedAudios ?? []);

            // Tính toán số giây còn lại thận trọng (chọn giá trị nhỏ hơn giữa server và local tránh gian lận)
            const serverRemaining = Math.max(0, Math.floor(room.remainingSeconds));
            const localRemaining =
                localDraft?.secondsLeft !== undefined
                    ? Math.max(0, Math.floor(localDraft.secondsLeft))
                    : serverRemaining;
            const resolvedRemaining = Math.min(serverRemaining, localRemaining);

            // Cập nhật ref và state đồng hồ, đáp án, cờ, audio đã nghe
            secondsLeftRef.current = resolvedRemaining;
            setInitialSeconds(resolvedRemaining);
            setAnswers(mergedAnswers);
            setFlagged(mergedFlagged);
            setPlayedAudios(mergedPlayed);

            // Khôi phục vị trí bước đang làm gần nhất nếu hợp lệ trong tổng số bước
            const computedSteps = buildExamSteps(room.questions);
            const safeStep = Math.min(
                Math.max(0, localDraft?.currentStepIndex ?? 0),
                Math.max(0, computedSteps.length - 1)
            );
            setCurrentStepIndex(safeStep);
        },
        []
    );

    // Quy đổi lỗi HTTP từ Backend thành BlockedState rõ ràng cho giao diện phòng thi
    const mapBlockedError = (err: unknown): MockExamBlockedState => {
        // Parse lỗi chuẩn hóa từ shared examErrorUtils
        const parsed = parseExamApiError(
            err,
            'Không thể mở phòng thi thử ETS lúc này. Vui lòng thử lại.'
        );
        // Xử lý lỗi khóa đề đầu ra hoặc thiếu quyền truy cập
        if (parsed.status === 403 || parsed.code === 'MOCK_EXAM_OUTPUT_LOCKED') {
            return { kind: 'OUTPUT_LOCKED', message: parsed.message };
        }
        // Xử lý lỗi phiên thi đã được nộp trước đó
        if (parsed.code === 'MOCK_EXAM_ALREADY_SUBMITTED' || parsed.status === 409) {
            return { kind: 'ALREADY_SUBMITTED', message: parsed.message };
        }
        // Xử lý lỗi không tìm thấy phiên thi
        if (parsed.status === 404 || parsed.code === 'MOCK_EXAM_ATTEMPT_NOT_FOUND') {
            return { kind: 'NOT_FOUND', message: parsed.message };
        }
        // Các lỗi mạng hoặc máy chủ khác cho phép thử lại
        return { kind: 'NETWORK_OR_SERVER', message: parsed.message };
    };

    // Điều hướng tới trang kết quả đúng với loại đề (OUTPUT -> Báo cáo đối sánh, PRACTICE -> Kết quả tóm tắt)
    const getReportRouteByTag = (examTag: string | undefined, attemptId: number): string => {
        // Đề đầu ra mở trang Báo cáo nghiệm thu Trước vs Sau (UC18)
        if (examTag === 'OUTPUT') {
            return `/mock-exam/report/${attemptId}`;
        }
        // Đề luyện tập mở trang kết quả điểm TOEIC & 7 Part
        return `/mock-exam/results/${attemptId}`;
    };

    // Khởi tạo hoặc khôi phục phòng thi khi vào trang
    const initializeRoom = useCallback(async () => {
        // Chờ tới khi AuthContext giải quyết xong userId
        if (typeof userId !== 'number' || !Number.isFinite(userId) || userId <= 0) {
            return;
        }
        // Kiểm tra attemptId trên URL nếu có truyền vào
        if (attemptIdParam && (!numericAttemptId || !Number.isFinite(numericAttemptId) || numericAttemptId <= 0)) {
            setIsLoading(false);
            setBlockedState({
                kind: 'NOT_FOUND',
                message: 'Mã phiên thi thử không hợp lệ.',
            });
            return;
        }

        // Đặt lại state tải dữ liệu và dọn lỗi cũ
        setRoomData(null);
        setIsLoading(true);
        setBlockedState(null);
        setSubmitError(null);

        try {
            // Bước 1: Kiểm tra xem có bài nộp treo do mất mạng ở lượt trước không (BR12)
            const pendingPayload = readPendingMockExamSubmit(userId);
            if (pendingPayload) {
                try {
                    // Thử đẩy lại bài nộp đang chờ lên Backend
                    const pendingRes = await mockExamService.submitMockExam(pendingPayload);
                    // Xóa hàng đợi và nháp cục bộ sau khi thành công
                    clearPendingMockExamSubmit(userId);
                    clearMockExamLocalDraft(userId, pendingPayload.attemptId);
                    isSubmittedRef.current = true;
                    // Chuyển thẳng sang trang báo cáo kết quả
                    navigate(getReportRouteByTag(pendingRes.data.examTag, pendingRes.data.attemptId), {
                        replace: true,
                    });
                    return;
                } catch (pendingErr) {
                    const parsedPending = parseExamApiError(pendingErr, '');
                    // Nếu hết hạn đăng nhập thì chuyển về /login (vẫn giữ pendingPayload để lần sau nộp tiếp)
                    if (parsedPending.status === 401) {
                        navigate('/login', { replace: true });
                        return;
                    }
                    // Nếu server từ chối vì lượt thi đã kết thúc trước đó thì xóa hàng đợi tránh kẹt vòng lặp
                    if (parsedPending.status && parsedPending.status >= 400 && parsedPending.status < 500) {
                        clearPendingMockExamSubmit(userId);
                    }
                }
            }

            // Bước 2: Tải dữ liệu phòng thi theo attemptId cụ thể hoặc khôi phục phiên IN_PROGRESS gần nhất
            if (numericAttemptId) {
                // Gọi API lấy phòng thi theo attemptId trên URL
                const roomRes = await mockExamService.getMockExamRoom(numericAttemptId);
                hydrateRoomState(roomRes.data, userId);
                return;
            }

            // Nếu vào thẳng /mock-exam/room không kèm ID thì kiểm tra phiên làm dở
            const resumeRes = await mockExamService.resumeMockExam();
            if (resumeRes.data) {
                hydrateRoomState(resumeRes.data, userId);
                return;
            }

            // Không có phiên đang dở nào -> đưa học viên về sảnh chọn đề thi thử ETS
            navigate('/mock-exam', { replace: true });
        } catch (err) {
            const parsed = parseExamApiError(err, '');
            // Nếu chưa đăng nhập thì chuyển hướng trang login
            if (parsed.status === 401) {
                navigate('/login', { replace: true });
                return;
            }
            // Ánh xạ lỗi nghiệp vụ sang trạng thái BlockedState tương ứng
            setBlockedState(mapBlockedError(err));
        } finally {
            setIsLoading(false);
        }
    }, [userId, attemptIdParam, numericAttemptId, hydrateRoomState, navigate]);

    // Kích hoạt khởi tạo phòng thi khi hook mount hoặc tham số URL đổi
    useEffect(() => {
        void initializeRoom();
    }, [initializeRoom]);

    // Theo dõi trạng thái mạng online/offline của trình duyệt để cảnh báo tức thời (BR12)
    useEffect(() => {
        // Cập nhật cờ mất mạng khi trình duyệt báo offline
        const handleOffline = () => setIsOffline(true);
        // Xóa cờ mất mạng khi có internet trở lại
        const handleOnline = () => setIsOffline(false);
        // Gắn listener sự kiện mạng lên đối tượng window
        window.addEventListener('offline', handleOffline);
        window.addEventListener('online', handleOnline);
        // Hủy listener khi unmount
        return () => {
            window.removeEventListener('offline', handleOffline);
            window.removeEventListener('online', handleOnline);
        };
    }, []);

    // Gom nhóm câu hỏi theo chùm parentId giống hệt phòng thi chẩn đoán
    const steps: ExamStep<MockExamQuestion>[] = useMemo(() => {
        // Trả về danh sách rỗng nếu phòng thi chưa tải xong
        if (!roomData?.questions) return [];
        // Dùng util chia step chuẩn TOEIC
        return buildExamSteps(roomData.questions);
    }, [roomData]);

    // Bản đồ ánh xạ orderNo -> stepIndex phục vụ bấm nhảy câu trên Palette
    const questionToStepMap = useMemo(() => buildQuestionToStepMap(steps), [steps]);
    // Bước hiển thị hiện tại trong phòng thi
    const currentStep = steps[currentStepIndex] ?? null;

    // Danh sách toàn bộ audioKey thuộc phần Listening (Part 1-4)
    const listeningAudioKeys = useMemo(() => getListeningAudioKeys(steps), [steps]);

    // Xác định toàn bộ phần Nghe đã chạy hết hay chưa (điều kiện mở khóa chuyển câu tự do - BR13)
    const isListeningCompleted = useMemo(
        () => checkAllListeningCompleted(listeningAudioKeys, playedAudios),
        [listeningAudioKeys, playedAudios]
    );

    // Tập hợp số thứ tự câu hỏi thuộc bước đang hiển thị trên màn hình chính
    const activeOrderNos = useMemo(() => {
        // Trả về Set rỗng nếu chưa có bước hợp lệ
        if (!currentStep) return new Set<number>();
        // Trả về toàn bộ orderNo trong bước hiện tại
        return new Set(currentStep.questions.map((q) => q.orderNo));
    }, [currentStep]);

    // Đếm tổng số câu đã chọn đáp án trên toàn bộ đề thi 200 câu
    const answeredCount = useMemo(() => {
        // Trả về 0 nếu phòng thi chưa sẵn sàng
        if (!roomData?.questions) return 0;
        // Lọc các câu có đáp án khác null/undefined
        return roomData.questions.filter(
            (q) => answers[q.orderNo] !== null && answers[q.orderNo] !== undefined
        ).length;
    }, [roomData, answers]);

    // Tự động lưu bản nháp xuống localStorage mỗi khi đáp án, cờ, audio hoặc bước hiện tại thay đổi
    useEffect(() => {
        // Chỉ lưu khi đã có phòng thi, chưa nộp bài và biết rõ userId
        if (!roomData || isSubmittedRef.current || typeof userId !== 'number' || userId <= 0) {
            return;
        }
        // Ghi bản nháp trạng thái làm bài mới nhất vào localStorage
        saveMockExamLocalDraft(userId, roomData.attemptId, {
            answers,
            flagged: Array.from(flagged),
            playedAudios: Array.from(playedAudios),
            currentStepIndex,
            secondsLeft: secondsLeftRef.current,
            updatedAt: Date.now(),
        });
    }, [roomData, userId, answers, flagged, playedAudios, currentStepIndex]);

    // Đồng bộ đồng hồ đếm ngược lên Backend định kỳ mỗi 5 giây khi đang thi
    useEffect(() => {
        // Ngừng đồng bộ khi tạm dừng, đang nộp hoặc đã hết giờ
        if (!roomData || isPaused || isSubmitting || isAutoSubmitting || isTimedOut) {
            return;
        }
        // Khởi tạo timer chạy mỗi 5000ms
        const interval = window.setInterval(async () => {
            // Lấy attemptId đang giữ trong ref
            const currentAttemptId = attemptIdRef.current;
            // Dừng nếu thiếu ID hoặc đã hoàn tất nộp bài
            if (!currentAttemptId || isSubmittedRef.current) return;
            try {
                // Gửi thời gian còn lại lên máy chủ
                await mockExamService.syncTimer(currentAttemptId, secondsLeftRef.current);
                // Xác nhận trạng thái kết nối ổn định
                setIsOffline(false);
            } catch (err) {
                const parsed = parseExamApiError(err, '');
                // Đánh dấu banner ngoại tuyến nếu lỗi mạng
                if (parsed.isNetworkError) {
                    setIsOffline(true);
                }
            }
        }, 5000);
        // Dọn timer khi dependencies thay đổi hoặc rời trang
        return () => window.clearInterval(interval);
    }, [roomData, isPaused, isSubmitting, isAutoSubmitting, isTimedOut]);

    // Lưu thời gian còn lại bằng fetch keepalive khi học viên ẩn tab, đóng trình duyệt hoặc chuyển route
    useEffect(() => {
        // Bỏ qua khi chưa tải xong phòng thi
        if (!roomData) return;

        // Hàm gửi đồng bộ cuối cùng khi trình duyệt chuẩn bị rời trang
        const handlePageExit = () => {
            if (isSubmittedRef.current || !attemptIdRef.current) return;
            mockExamService.syncTimerOnExit(attemptIdRef.current, secondsLeftRef.current);
        };

        // Đồng bộ ngay khi tab chuyển sang trạng thái ẩn (chuyển tab / khóa màn hình)
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                handlePageExit();
            }
        };

        // Gắn listener pagehide và visibilitychange
        window.addEventListener('pagehide', handlePageExit);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Dọn dẹp listener và gửi thêm 1 nhịp sync khi unmount SPA
        return () => {
            window.removeEventListener('pagehide', handlePageExit);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            if (!isSubmittedRef.current && attemptIdRef.current) {
                void mockExamService
                    .syncTimer(attemptIdRef.current, secondsLeftRef.current)
                    .catch(() => undefined);
            }
        };
    }, [roomData]);

    // Dọn dẹp timer chuyển câu tự động khi unmount component
    useEffect(() => {
        return () => {
            if (audioAdvanceTimerRef.current !== null) {
                window.clearTimeout(audioAdvanceTimerRef.current);
            }
        };
    }, []);

    // Lưu nháp từng câu hỏi ngay lập tức lên Backend khi học viên chọn đáp án hoặc gắn cờ (BR12)
    const persistSingleDraft = useCallback(
        (orderNo: number, selectedOption: OptionKey | null, isFlagged: boolean) => {
            // Không lưu khi chưa có dữ liệu hoặc đã nộp bài
            if (!roomData || isSubmittedRef.current) return;
            // Tìm câu hỏi tương ứng với orderNo để lấy questionId
            const targetQuestion = roomData.questions.find((q) => q.orderNo === orderNo);
            if (!targetQuestion) return;

            // Gọi API PUT cập nhật nháp câu đơn lẻ
            void mockExamService
                .saveDraftAnswers({
                    attemptId: roomData.attemptId,
                    answers: [
                        {
                            questionId: targetQuestion.questionId,
                            selectedOption: selectedOption ?? '',
                            isFlagged,
                        },
                    ],
                })
                .then(() => {
                    // Xóa cảnh báo ngoại tuyến khi lưu thành công
                    setIsOffline(false);
                })
                .catch((err) => {
                    const parsed = parseExamApiError(err, '');
                    // Hiển thị banner mất mạng nếu request thất bại do kết nối
                    if (parsed.isNetworkError) {
                        setIsOffline(true);
                    }
                });
        },
        [roomData]
    );

    // Xử lý khi học viên chọn đáp án A/B/C/D cho một câu hỏi
    const handleSelectOption = useCallback(
        (orderNo: number, option: OptionKey) => {
            // Chặn sửa bài khi đang tạm dừng, đang nộp hoặc đã hết giờ
            if (isPaused || isSubmitting || isAutoSubmitting || isTimedOut) return;
            // Cập nhật ngay đáp án vào state giao diện
            setAnswers((prev) => ({
                ...prev,
                [orderNo]: option,
            }));
            // Đồng bộ ngay đáp án vừa chọn lên Backend
            persistSingleDraft(orderNo, option, flagged.has(orderNo));
        },
        [isPaused, isSubmitting, isAutoSubmitting, isTimedOut, flagged, persistSingleDraft]
    );

    // Xử lý bật/tắt cờ đánh dấu xem lại trên câu hỏi
    const handleToggleFlag = useCallback(
        (orderNo: number) => {
            // Chặn sửa bài khi phòng thi đang bị khóa tương tác
            if (isPaused || isSubmitting || isAutoSubmitting || isTimedOut) return;
            // Tính trạng thái cờ đảo ngược hiện tại
            const nextIsFlagged = !flagged.has(orderNo);
            // Cập nhật Set cờ trong state
            setFlagged((prev) => {
                const next = new Set(prev);
                if (nextIsFlagged) {
                    next.add(orderNo);
                } else {
                    next.delete(orderNo);
                }
                return next;
            });
            // Đồng bộ trạng thái cờ lên Backend
            persistSingleDraft(orderNo, answers[orderNo] ?? null, nextIsFlagged);
        },
        [isPaused, isSubmitting, isAutoSubmitting, isTimedOut, flagged, answers, persistSingleDraft]
    );

    // Bật/tắt tạm dừng đồng hồ thi và đồng bộ ngay thời gian xuống server khi tạm dừng
    const handleTogglePause = useCallback(() => {
        if (!roomData || isSubmitting || isAutoSubmitting || isTimedOut) return;
        setIsPaused((prev) => {
            const nextPaused = !prev;
            // Khi chuyển sang tạm dừng thì đồng bộ ngay giây hiện tại lên Backend
            if (nextPaused && attemptIdRef.current) {
                void mockExamService
                    .syncTimer(attemptIdRef.current, secondsLeftRef.current)
                    .catch(() => undefined);
            }
            return nextPaused;
        });
    }, [roomData, isSubmitting, isAutoSubmitting, isTimedOut]);

    // Cập nhật ref số giây còn lại do ExamHeader bắn ra mỗi giây
    const handleSecondsChange = useCallback((secondsLeft: number) => {
        secondsLeftRef.current = secondsLeft;
    }, []);

    // Xử lý khi bản ghi âm Listening kết thúc: khóa phát lại (BR08) và tự chuyển câu kế tiếp
    const handleAudioEnded = useCallback(
        (audioKey: string | null) => {
            // Bỏ qua nếu không có audioKey
            if (!audioKey) return;
            // Đánh dấu audioKey này đã phát xong 1 lượt duy nhất
            setPlayedAudios((prev) => {
                if (prev.has(audioKey)) return prev;
                const next = new Set(prev);
                next.add(audioKey);
                return next;
            });

            // Trong phần Nghe, tự động chuyển sang câu/chùm câu tiếp theo sau 550ms
            if (currentStepIndex < steps.length - 1) {
                if (audioAdvanceTimerRef.current !== null) {
                    window.clearTimeout(audioAdvanceTimerRef.current);
                }
                audioAdvanceTimerRef.current = window.setTimeout(() => {
                    setFocusedOrderNo(null);
                    setCurrentStepIndex((prev) => Math.min(steps.length - 1, prev + 1));
                }, 550);
            }
        },
        [currentStepIndex, steps.length]
    );

    // Chuyển lùi về câu trước (chỉ cho phép sau khi toàn bộ phần Nghe đã hoàn thành)
    const handlePrevStep = useCallback(() => {
        if (!isListeningCompleted || currentStepIndex <= 0) return;
        setFocusedOrderNo(null);
        setCurrentStepIndex((prev) => Math.max(0, prev - 1));
    }, [isListeningCompleted, currentStepIndex]);

    // Chuyển tiến sang câu tiếp theo (khóa trong khi phần Nghe chưa chạy xong)
    const handleNextStep = useCallback(() => {
        if (!isListeningCompleted || currentStepIndex >= steps.length - 1) return;
        setFocusedOrderNo(null);
        setCurrentStepIndex((prev) => Math.min(steps.length - 1, prev + 1));
    }, [isListeningCompleted, currentStepIndex, steps.length]);

    // Chọn nhanh câu hỏi trên Palette theo Part (chỉ cho phép khi phần Nghe đã xong hết)
    const handleSelectQuestion = useCallback(
        (orderNo: number) => {
            if (!isListeningCompleted) return;
            const targetStep = questionToStepMap.get(orderNo);
            if (targetStep === undefined) return;
            setFocusedOrderNo(orderNo);
            setCurrentStepIndex(targetStep);
        },
        [isListeningCompleted, questionToStepMap]
    );

    // Nộp bài thi thử ETS 200 câu lên Backend để chấm điểm quy đổi 990 (UC17)
    const submitExam = useCallback(
        async (timedOut: boolean) => {
            if (!roomData || isSubmittedRef.current) return;

            setSubmitError(null);
            // Phân biệt loading auto-submit hết giờ với nộp bài chủ động
            if (timedOut) {
                setIsAutoSubmitting(true);
            } else {
                setIsSubmitting(true);
            }

            // Tính tổng thời gian làm bài thực tế tính bằng giây (tối đa 14400s theo validator Backend)
            const totalSecondsBudget = Math.max(0, roomData.durationMinutes * 60);
            const elapsedSeconds = Math.max(
                0,
                Math.min(14400, totalSecondsBudget - Math.max(0, secondsLeftRef.current))
            );

            // Chuẩn hóa danh sách đáp án gửi lên API nộp bài
            const answerItems: SubmitMockExamAnswerItem[] = roomData.questions.map((q) => ({
                questionId: q.questionId,
                userAnswer: toMockExamJsonAnswer(answers[q.orderNo]),
                isFlagged: flagged.has(q.orderNo),
            }));

            // Đóng gói payload SubmitMockExamRequest chuẩn Backend
            const payload: SubmitMockExamRequest = {
                attemptId: roomData.attemptId,
                targetProfileId: roomData.targetProfileId ?? undefined,
                durationSeconds: elapsedSeconds,
                isTimedOut: timedOut,
                answers: answerItems,
            };

            try {
                // Gọi API POST nộp bài thi thử
                const res = await mockExamService.submitMockExam(payload);
                // Đánh dấu đã nộp thành công để chặn sync khi unmount
                isSubmittedRef.current = true;
                // Dọn sạch bản nháp và hàng đợi pending trên trình duyệt
                if (typeof userId === 'number' && userId > 0) {
                    clearMockExamLocalDraft(userId, roomData.attemptId);
                    clearPendingMockExamSubmit(userId);
                }
                setIsSubmitModalOpen(false);
                // Chuyển hướng sang Báo cáo đầu ra (OUTPUT) hoặc Tóm tắt điểm (PRACTICE)
                navigate(getReportRouteByTag(res.data.examTag, res.data.attemptId), {
                    replace: true,
                });
            } catch (err) {
                const parsed = parseExamApiError(
                    err,
                    'Không thể nộp bài lúc này. Vui lòng thử lại.'
                );
                // Nếu hết phiên đăng nhập hoặc rớt mạng, lưu hàng đợi pending để tự động nộp lại (BR12)
                if (typeof userId === 'number' && userId > 0 && (parsed.status === 401 || parsed.isNetworkError)) {
                    savePendingMockExamSubmit(userId, payload);
                }
                if (parsed.status === 401) {
                    navigate('/login', { replace: true });
                    return;
                }
                if (parsed.isNetworkError) {
                    setIsOffline(true);
                    setSubmitError(
                        'Mất kết nối mạng khi nộp bài — bài làm đã được lưu an toàn để gửi lại ngay khi có mạng.'
                    );
                } else {
                    setSubmitError(parsed.message);
                }
                setIsSubmitModalOpen(false);
            } finally {
                setIsSubmitting(false);
                setIsAutoSubmitting(false);
            }
        },
        [roomData, userId, answers, flagged, navigate]
    );

    // Tự động thu bài ngay khi đồng hồ đếm ngược chạm 00:00 (BR07)
    const handleTimeOut = useCallback(() => {
        if (isTimedOut || isSubmittedRef.current) return;
        setIsTimedOut(true);
        setIsPaused(false);
        setIsSubmitModalOpen(false);
        void submitExam(true);
    }, [isTimedOut, submitExam]);

    // Số thứ tự đầu tiên và cuối cùng của bước hiện tại cho nhãn Header
    const firstOrderNo = currentStep?.questions[0]?.orderNo ?? 1;
    const lastOrderNo =
        currentStep?.questions[currentStep.questions.length - 1]?.orderNo ?? firstOrderNo;
    // Nhãn gộp khoảng câu hỏi đối với các chùm câu Part 3, 4, 6, 7
    const questionLabel =
        currentStep && currentStep.questions.length > 1
            ? `Câu ${firstOrderNo}–${lastOrderNo} / ${roomData?.totalQuestions ?? 0}`
            : undefined;

    // Khóa nút phát lại nếu audioKey của bước hiện tại đã từng phát xong hết 1 lượt
    const isCurrentAudioLocked = Boolean(
        currentStep?.audioKey && playedAudios.has(currentStep.audioKey)
    );

    // Trả về đầy đủ state và hành động điều khiển cho MockExamRoomPage
    return {
        roomData,
        steps,
        currentStep,
        currentStepIndex,
        initialSeconds,
        focusedOrderNo,
        answers,
        flagged,
        activeOrderNos,
        answeredCount,
        isListeningCompleted,
        isCurrentAudioLocked,
        hasInteractedAudio,
        isPaletteCollapsed,
        isPaused,
        isSubmitModalOpen,
        isSubmitting,
        isAutoSubmitting,
        isTimedOut,
        isOffline,
        isLoading,
        blockedState,
        submitError,
        questionLabel,
        firstOrderNo,
        isPrevDisabled: currentStepIndex <= 0,
        isLastStep: steps.length > 0 && currentStepIndex === steps.length - 1,
        retryInit: initializeRoom,
        togglePaletteCollapse: () => setIsPaletteCollapsed((prev) => !prev),
        openSubmitModal: () => setIsSubmitModalOpen(true),
        closeSubmitModal: () => setIsSubmitModalOpen(false),
        handleSelectOption,
        handleToggleFlag,
        handleTogglePause,
        handleSecondsChange,
        handleUserStartedAudio: () => setHasInteractedAudio(true),
        handleAudioEnded,
        handlePrevStep,
        handleNextStep,
        handleSelectQuestion,
        submitExam,
        handleTimeOut,
    };
}
