import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { diagnosticService } from '../services/diagnosticService';
import type {
    DiagnosticExamStep,
    DiagnosticTest,
    OptionKey,
    SubmitDiagnosticRequest,
} from '../types/diagnosticTypes';
import {
    buildExamSteps,
    buildQuestionToStepMap,
    checkAllListeningCompleted,
    clearDiagnosticDraft,
    clearPendingSubmit,
    getListeningAudioKeys,
    readDiagnosticDraft,
    readPendingSubmit,
    writeDiagnosticDraft,
    writePendingSubmit,
} from '../utils/diagnosticExamUtils';

/** Trạng thái màn hình chặn khi chưa đủ điều kiện vào phòng thi. */
export type RoomBlockState =
    | { type: 'ALREADY_COMPLETED'; message: string }
    | { type: 'NO_ACTIVE_EXAM'; message: string }
    | { type: 'NO_TARGET'; message: string }
    | { type: 'ERROR'; message: string };

// Chu kỳ đồng bộ thời gian còn lại từ phòng thi lên máy chủ (5 giây / lần)
const TIMER_SYNC_INTERVAL_MS = 5000;
// Khóa đồng bộ khởi tạo phiên thi tránh gọi /start 2 lần khi React StrictMode mount kép
let inFlightRoomInit: Promise<DiagnosticTest> | null = null;

/**
 * Custom hook quản lý toàn bộ trạng thái và nghiệp vụ Phòng thi chẩn đoán (UC06):
 * khôi phục phiên, gom chùm câu hỏi, điều phối audio liên tục, khóa/mở Palette Nghe-Đọc,
 * đồng bộ ngưng đọng đồng hồ và cho phép thi lại khi đã hoàn thành.
 */
export function useDiagnosticRoom() {
    // Hook điều hướng trang sau khi nộp bài hoặc quay lại báo cáo/lộ trình
    const navigate = useNavigate();
    // Thông tin học viên đang đăng nhập từ AuthContext
    const { user } = useAuth();

    // Dữ liệu đề thi và lượt làm bài hiện tại từ Backend
    const [test, setTest] = useState<DiagnosticTest | null>(null);
    // Chỉ số màn hình/chùm câu hỏi đang hiển thị (bắt đầu từ 0)
    const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
    // Số thứ tự câu hỏi vừa được click chọn trên Palette để tự cuộn tới đúng câu trong chùm
    const [focusedOrderNo, setFocusedOrderNo] = useState<number | null>(null);
    // Bản đồ đáp án học viên đã chọn theo orderNo
    const [answers, setAnswers] = useState<Record<number, OptionKey | null>>({});
    // Tập hợp các số thứ tự câu hỏi đang được đánh dấu cờ
    const [flagged, setFlagged] = useState<Set<number>>(new Set());
    // Tập hợp khóa audio của các câu/chùm Nghe đã chạy xong 1 lượt (BR13)
    const [playedAudios, setPlayedAudios] = useState<Set<string>>(new Set());
    // Số giây đếm ngược khởi tạo khi nạp phòng thi
    const [initialSeconds, setInitialSeconds] = useState<number>(45 * 60);

    // Trạng thái đang tải dữ liệu đề thi ban đầu
    const [isLoading, setIsLoading] = useState<boolean>(true);
    // Trạng thái đang gửi bài lên Backend chấm điểm
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    // Trạng thái tự động nộp bài khi chạm mốc 00:00 (BR07)
    const [isAutoSubmitting, setIsAutoSubmitting] = useState<boolean>(false);
    // Trạng thái đang khởi tạo lượt thi lại khi người dùng bấm Làm lại
    const [isRetaking, setIsRetaking] = useState<boolean>(false);
    // Trạng thái tạm dừng phòng thi chủ động
    const [isPaused, setIsPaused] = useState<boolean>(false);
    // Trạng thái thu gọn/mở rộng bảng câu hỏi Palette
    const [isPaletteCollapsed, setIsPaletteCollapsed] = useState<boolean>(false);
    // Trạng thái mở hộp thoại xác nhận nộp bài
    const [isSubmitModalOpen, setIsSubmitModalOpen] = useState<boolean>(false);
    // Trạng thái mở hộp thoại xác nhận làm lại bài thi chẩn đoán
    const [isRetakeConfirmOpen, setIsRetakeConfirmOpen] = useState<boolean>(false);
    // Trạng thái mất kết nối internet trên trình duyệt (Ngoại lệ 5b)
    const [isOffline, setIsOffline] = useState<boolean>(() => !navigator.onLine);
    // Trạng thái chặn vào phòng thi (đã thi xong / chưa có AIM / đề chưa kích hoạt / lỗi)
    const [blockState, setBlockState] = useState<RoomBlockState | null>(null);
    // Thông báo lỗi phát sinh khi nộp bài hoặc thi lại
    const [submitError, setSubmitError] = useState<string>('');
    // Cờ ghi nhận người dùng đã bấm tương tác phát audio ít nhất 1 lần trong phiên (để browser cho autoplay kế tiếp)
    const [hasStartedAudio, setHasStartedAudio] = useState<boolean>(false);

    // Ref giữ số giây còn lại mới nhất để đồng bộ tức thì khi pause/thoát mà không gây re-render thừa
    const remainingSecondsRef = useRef<number>(45 * 60);

    // Tính toán danh sách màn hình câu đơn / chùm câu từ danh sách câu hỏi gốc
    const steps: DiagnosticExamStep[] = useMemo(
        () => buildExamSteps(test?.questions ?? []),
        [test]
    );
    // Tạo bảng ánh xạ orderNo -> stepIndex phục vụ click nhanh trên bảng Palette
    const questionToStepMap = useMemo(() => buildQuestionToStepMap(steps), [steps]);
    // Trích xuất toàn bộ khóa audio của phần Nghe trong đề
    const listeningAudioKeys = useMemo(() => getListeningAudioKeys(steps), [steps]);
    // Xác định xem toàn bộ audio phần Nghe đã chạy xong hết hay chưa
    const isListeningCompleted = useMemo(
        () => checkAllListeningCompleted(listeningAudioKeys, playedAudios),
        [listeningAudioKeys, playedAudios]
    );

    // Lấy thông tin màn hình/chùm câu hiện tại theo chỉ số hợp lệ
    const currentStep = steps[currentStepIndex] ?? null;
    // Tổng số câu hỏi toàn đề dùng cho đồng hồ/header/modal nộp bài
    const totalQuestions = test?.totalQuestions || test?.questions.length || 0;
    // Tổng số câu đã có đáp án
    const answeredCount = useMemo(
        () => Object.values(answers).filter((v) => v !== null && v !== undefined).length,
        [answers]
    );
    // Tập các số thứ tự câu hỏi đang hiển thị trên màn hình hiện tại (1 câu đơn hoặc 2-5 câu chùm)
    const activeQuestionOrderNos = useMemo(
        () => new Set(currentStep?.questions.map((q) => q.orderNo) ?? []),
        [currentStep]
    );

    // Khóa nhận diện audio của màn hình hiện tại
    const currentAudioKey = currentStep?.audioKey ?? '';
    // Audio hiện tại đã phát xong 1 lượt rồi thì bị khóa nghe lại (BR13)
    const isCurrentAudioLocked = currentAudioKey ? playedAudios.has(currentAudioKey) : false;
    // Khi phần Nghe chưa chạy xong hết và đang ở màn Nghe có audio chưa phát xong → khóa nút chuyển câu
    const isListeningTransitionLocked =
        !isListeningCompleted &&
        currentStep?.section === 'LISTENING' &&
        Boolean(currentStep.audioUrl) &&
        !isCurrentAudioLocked;
    // Khóa mọi thao tác khi đang tạm dừng hoặc đang gửi bài
    const isInteractionLocked = isPaused || isSubmitting || isAutoSubmitting;

    // Hàm nạp dữ liệu phòng thi vào state kèm khôi phục bản nháp localStorage
    const applyLoadedRoom = useCallback(
        (roomData: DiagnosticTest, resetDraft = false) => {
            // Tính danh sách bước tạm để giới hạn chỉ số stepIndex hợp lệ khi khôi phục
            const loadedSteps = buildExamSteps(roomData.questions);
            // Tính thời gian còn lại ưu tiên từ server
            const serverRemaining =
                roomData.remainingSeconds !== undefined
                    ? roomData.remainingSeconds
                    : roomData.durationMinutes * 60;
            // Cập nhật thông tin đề thi vào state
            setTest(roomData);
            // Xóa trạng thái chặn nếu có trước đó
            setBlockState(null);
            // Xóa thông báo lỗi cũ
            setSubmitError('');
            // Gán thời gian đếm ngược ban đầu cho Header
            setInitialSeconds(serverRemaining);
            // Đồng bộ ngay vào ref giữ thời gian còn lại
            remainingSecondsRef.current = serverRemaining;
            // Đảm bảo phòng thi ở trạng thái đang chạy
            setIsPaused(false);
            // Reset trạng thái bắt đầu audio khi tải phòng mới
            setHasStartedAudio(false);

            // Nếu yêu cầu làm mới nháp hoàn toàn (khi học viên bấm Làm lại bài thi)
            if (resetDraft) {
                // Xóa nháp cũ của lượt thi mới nếu vô tình tồn tại
                clearDiagnosticDraft(roomData.attemptId);
                // Đưa về bước câu hỏi đầu tiên
                setCurrentStepIndex(0);
                // Xóa chọn câu focus
                setFocusedOrderNo(null);
                // Đặt đáp án rỗng
                setAnswers({});
                // Đặt cờ đánh dấu rỗng
                setFlagged(new Set());
                // Đặt danh sách audio đã nghe rỗng
                setPlayedAudios(new Set());
                // Kết thúc sớm tại đây
                return;
            }

            // Đọc lại bản nháp đã lưu cục bộ (BR12)
            const draft = readDiagnosticDraft(roomData.attemptId);
            // Nếu có bản nháp hợp lệ thì khôi phục lại toàn bộ tiến độ
            if (draft) {
                // Khôi phục đáp án đã chọn
                setAnswers(draft.answers || {});
                // Khôi phục các câu đã gắn cờ
                setFlagged(new Set(draft.flagged || []));
                // Khôi phục các audio đã phát xong
                setPlayedAudios(new Set(draft.playedAudios || []));
                // Giới hạn stepIndex nằm trong biên mảng steps hiện tại
                const savedStep =
                    typeof draft.currentStepIndex === 'number' && loadedSteps.length > 0
                        ? Math.max(0, Math.min(loadedSteps.length - 1, draft.currentStepIndex))
                        : 0;
                // Khôi phục đúng màn hình câu hỏi đang làm trước khi F5/crash
                setCurrentStepIndex(savedStep);
            } else {
                // Khởi tạo trạng thái sạch cho lượt thi mới hoàn toàn
                setCurrentStepIndex(0);
                setFocusedOrderNo(null);
                setAnswers({});
                setFlagged(new Set());
                setPlayedAudios(new Set());
            }
        },
        []
    );

    // Chuyển đổi mã lỗi từ Backend sang màn hình thông báo chặn thân thiện
    const applyErrorBlockState = useCallback((err: unknown) => {
        // Kiểm tra lỗi trả về từ Axios
        if (axios.isAxiosError(err)) {
            // Trích xuất code và message chuẩn hóa từ ApiResponse của BE
            const data = err.response?.data as { code?: string; message?: string } | undefined;
            const errCode = data?.code;
            const errMsg = data?.message;

            // Trường hợp học viên đã hoàn thành bài chẩn đoán ở mục tiêu AIM này (BR02)
            if (errCode === 'DIAGNOSTIC_ALREADY_COMPLETED') {
                setBlockState({
                    type: 'ALREADY_COMPLETED',
                    message:
                        errMsg ||
                        'Bạn đã hoàn thành bài thi chẩn đoán cho mục tiêu này. Vui lòng xem lại báo cáo, vào lộ trình học hoặc chọn làm lại bài thi mới.',
                });
                return;
            }
            // Trường hợp chưa có đề thi chẩn đoán ACTIVE
            if (errCode === 'EXAM_NOT_ACTIVE' || errCode === 'EXAM_NOT_FOUND') {
                setBlockState({
                    type: 'NO_ACTIVE_EXAM',
                    message:
                        errMsg ||
                        'Đề thi chẩn đoán hiện đang được ban chuyên môn chuẩn bị. Vui lòng quay lại sau ít phút hoặc liên hệ quản trị viên.',
                });
                return;
            }
            // Các lỗi API khác
            setBlockState({
                type: 'ERROR',
                message: errMsg || 'Không thể tải bài thi chẩn đoán. Vui lòng thử lại.',
            });
        } else {
            // Lỗi không xác định (mất mạng hoặc lỗi runtime)
            setBlockState({
                type: 'ERROR',
                message: 'Không thể tải bài thi chẩn đoán. Vui lòng tải lại trang.',
            });
        }
    }, []);

    // Lắng nghe trạng thái kết nối mạng (UC06 Ngoại lệ 5b)
    useEffect(() => {
        // Cập nhật trạng thái offline khi mất mạng
        const handleOffline = () => setIsOffline(true);
        // Cập nhật trạng thái online khi có mạng trở lại
        const handleOnline = () => setIsOffline(false);
        // Đăng ký sự kiện trên window
        window.addEventListener('offline', handleOffline);
        window.addEventListener('online', handleOnline);
        // Hủy đăng ký sự kiện khi unmount
        return () => {
            window.removeEventListener('offline', handleOffline);
            window.removeEventListener('online', handleOnline);
        };
    }, []);

    // Nạp phiên làm bài hiện tại hoặc khởi tạo mới khi vào phòng thi
    // Tách sẵn hai trường nguyên thủy từ user để dependency của effect ổn định và sạch cảnh báo hook
    const userId = user?.id;
    const userTargetProfileId = user?.targetProfileId;

    useEffect(() => {
        // Biến cờ tránh cập nhật state sau khi component unmount
        let isMounted = true;

        // Hàm bất đồng bộ khởi tạo và khôi phục phòng thi
        async function bootstrapRoom() {
            // Bước 1: Kiểm tra payload nộp bài bị kẹt do hết phiên 401 ở lần trước (Ngoại lệ 9a)
            const pending = readPendingSubmit();
            if (pending && userId !== undefined && pending.userId === userId && pending.request?.attemptId) {
                try {
                    // Đánh dấu đang nộp lại bài
                    setIsSubmitting(true);
                    // Gọi API nộp lại bài
                    const submitRes = await diagnosticService.submitTest(pending.request);
                    // Xóa payload tạm khi nộp thành công
                    clearPendingSubmit();
                    // Xóa nháp của lượt đã nộp
                    clearDiagnosticDraft(pending.request.attemptId);
                    // Điều hướng thẳng sang trang kết quả báo cáo
                    if (submitRes.success && submitRes.data) {
                        navigate(`/diagnostic/results/${submitRes.data.attemptId}`, { replace: true });
                        return;
                    }
                } catch (err: unknown) {
                    // Chỉ giữ pending nếu vẫn lỗi 401; lỗi khác thì xóa tránh lặp vô hạn
                    if (!axios.isAxiosError(err) || err.response?.status !== 401) {
                        clearPendingSubmit();
                    }
                } finally {
                    // Tắt cờ nộp lại nếu component vẫn đang mounted
                    if (isMounted) setIsSubmitting(false);
                }
            }

            // Bước 2: Nếu học viên chưa thiết lập mục tiêu AIM -> yêu cầu chọn AIM trước
            if (userId !== undefined && !userTargetProfileId) {
                if (isMounted) {
                    setBlockState({
                        type: 'NO_TARGET',
                        message:
                            'Bạn cần thiết lập mốc điểm mục tiêu TOEIC (AIM) trước khi tham gia bài thi chẩn đoán.',
                    });
                    setIsLoading(false);
                }
                return;
            }

            // Bước 3: Kiểm tra phiên IN_PROGRESS để khôi phục hoặc tạo lượt thi mới
            try {
                // Dùng singleton promise tránh React StrictMode mount kép gọi /start 2 lần
                if (!inFlightRoomInit) {
                    inFlightRoomInit = (async () => {
                        // Thử lấy phiên đang dang dở từ Backend
                        const resumeRes = await diagnosticService.getActiveSession();
                        if (resumeRes.success && resumeRes.data) {
                            return resumeRes.data;
                        }
                        // Nếu chưa có phiên dở, gọi khởi tạo lượt thi chẩn đoán mới
                        const startRes = await diagnosticService.startDiagnostic({
                            targetProfileId: userTargetProfileId ?? undefined,
                        });
                        if (!startRes.success || !startRes.data) {
                            throw new Error(startRes.message || 'Không thể khởi tạo bài thi chẩn đoán.');
                        }
                        // Tải danh sách câu hỏi cho lượt vừa tạo
                        const examRes = await diagnosticService.getExamForAttempt(startRes.data.attemptId);
                        if (!examRes.success || !examRes.data) {
                            throw new Error(examRes.message || 'Không thể tải danh sách câu hỏi bài thi.');
                        }
                        return examRes.data;
                    })();
                }

                // Chờ kết quả nạp phòng thi
                const roomData = await inFlightRoomInit;
                // Bỏ qua nếu component đã unmount
                if (!isMounted) return;
                // Áp dữ liệu phòng thi và khôi phục nháp vào state
                applyLoadedRoom(roomData, false);
            } catch (err: unknown) {
                // Bỏ qua nếu component đã unmount
                if (!isMounted) return;
                // Hiển thị màn hình trạng thái tương ứng mã lỗi
                applyErrorBlockState(err);
            } finally {
                // Giải phóng lock khởi tạo phòng thi
                inFlightRoomInit = null;
                // Kết thúc trạng thái loading
                if (isMounted) setIsLoading(false);
            }
        }

        // Kích hoạt quá trình nạp phòng thi
        void bootstrapRoom();
        // Trả trạng thái đã mount về false khi unmount
        return () => {
            isMounted = false;
        };
    }, [userId, userTargetProfileId, navigate, applyLoadedRoom, applyErrorBlockState]);

    // BR12: Lưu tự động đáp án, cờ, audio đã phát và vị trí màn hình vào localStorage
    useEffect(() => {
        // Chỉ lưu khi đã có thông tin lượt thi hợp lệ
        if (!test) return;
        // Ghi toàn bộ trạng thái làm bài hiện tại vào nháp
        writeDiagnosticDraft(test.attemptId, {
            answers,
            flagged: Array.from(flagged),
            playedAudios: Array.from(playedAudios),
            currentStepIndex,
        });
    }, [test, answers, flagged, playedAudios, currentStepIndex]);

    // Đồng bộ định kỳ số giây còn lại lên server để ngưng đọng đồng hồ nếu crash/thoát ngang
    useEffect(() => {
        // Không gửi heartbeat khi chưa có bài thi, đang tạm dừng hoặc đang nộp bài
        if (!test || isPaused || isSubmitting || isAutoSubmitting) return;

        // Cứ mỗi 5 giây gửi lại số giây còn lại mới nhất lên Backend
        const intervalId = window.setInterval(() => {
            // Bỏ qua nếu trình duyệt đang rớt mạng
            if (!navigator.onLine) return;
            // Gửi yêu cầu đồng bộ đồng hồ nhưng không chặn luồng làm bài nếu gặp lỗi tạm thời
            void diagnosticService
                .syncTimer({
                    attemptId: test.attemptId,
                    remainingSeconds: Math.max(0, Math.floor(remainingSecondsRef.current)),
                })
                .catch(() => {
                    // Lần sync tiếp theo sẽ cập nhật bù
                });
        }, TIMER_SYNC_INTERVAL_MS);

        // Xóa interval khi tạm dừng, nộp bài hoặc unmount
        return () => window.clearInterval(intervalId);
    }, [test, isPaused, isSubmitting, isAutoSubmitting]);

    // Đồng bộ ngay lập tức bằng keepalive khi học viên đóng tab, reload (F5) hoặc chuyển sang ứng dụng khác
    useEffect(() => {
        // Chỉ đăng ký khi đang có phiên thi hoạt động
        if (!test || isSubmitting || isAutoSubmitting) return;

        // Hàm gửi số giây hiện tại qua fetch keepalive
        const syncOnBrowserHideOrUnload = () => {
            // Gọi endpoint syncTimer bằng keepalive để giữ nguyên thời gian lúc rời đi
            diagnosticService.syncTimerOnExit({
                attemptId: test.attemptId,
                remainingSeconds: Math.max(0, Math.floor(remainingSecondsRef.current)),
            });
        };

        // Xử lý sự kiện ẩn tab / chuyển cửa sổ
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                syncOnBrowserHideOrUnload();
            }
        };

        // Lắng nghe cả visibilitychange và pagehide để phủ đủ cả desktop lẫn mobile browser
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('pagehide', syncOnBrowserHideOrUnload);
        // Dọn dẹp listener khi unmount hoặc trạng thái bài thi đổi
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('pagehide', syncOnBrowserHideOrUnload);
        };
    }, [test, isSubmitting, isAutoSubmitting]);

    // Ghi nhận chọn đáp án cho một câu hỏi cụ thể (hỗ trợ cả câu đơn lẫn câu trong chùm)
    const handleSelectOption = useCallback(
        (orderNo: number, opt: OptionKey) => {
            // Khóa chọn khi đang tạm dừng hoặc đang nộp bài
            if (isInteractionLocked) return;
            // Cập nhật đáp án theo đúng orderNo của câu hỏi được chọn
            setAnswers((prev) => ({
                ...prev,
                [orderNo]: opt,
            }));
        },
        [isInteractionLocked]
    );

    // Bật hoặc tắt icon Flag đánh dấu cho một câu hỏi cụ thể
    const handleToggleFlag = useCallback(
        (orderNo: number) => {
            // Khóa thao tác khi đang tạm dừng hoặc đang nộp bài
            if (isInteractionLocked) return;
            // Sao chép Set cũ và đảo trạng thái gắn cờ của câu hỏi tương ứng
            setFlagged((prev) => {
                const next = new Set(prev);
                if (next.has(orderNo)) {
                    next.delete(orderNo);
                } else {
                    next.add(orderNo);
                }
                return next;
            });
        },
        [isInteractionLocked]
    );

    // Xử lý khi bản ghi âm hiện tại phát xong: khóa audio đó và tự động chuyển sang trang/câu tiếp theo
    const handleAudioEnded = useCallback(() => {
        // Nếu có khóa audio ở bước hiện tại thì ghi nhận đã phát xong (BR13)
        if (currentAudioKey) {
            setPlayedAudios((prev) => {
                if (prev.has(currentAudioKey)) return prev;
                const next = new Set(prev);
                next.add(currentAudioKey);
                return next;
            });
        }
        // Reset focus cuộn câu cũ trước khi qua màn hình mới
        setFocusedOrderNo(null);
        // Tự động chuyển sang bước/câu tiếp theo nếu chưa phải màn cuối cùng
        setCurrentStepIndex((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, [currentAudioKey, steps.length]);

    // Chuyển về trang/chùm câu hỏi phía trước (chỉ cho phép khi không bị khóa chuyển câu phần Nghe)
    const handlePrevStep = useCallback(() => {
        // Chặn chuyển lùi khi đang tạm dừng hoặc đang chạy audio phần Nghe chưa hoàn thành
        if (isInteractionLocked || isListeningTransitionLocked) return;
        // Xóa focus cuộn câu cũ
        setFocusedOrderNo(null);
        // Lùi về step trước đó
        setCurrentStepIndex((prev) => Math.max(0, prev - 1));
    }, [isInteractionLocked, isListeningTransitionLocked]);

    // Chuyển sang trang/chùm câu hỏi kế tiếp (phần Đọc luôn cho nhảy thẳng không bắt điền hết đáp án)
    const handleNextStep = useCallback(() => {
        // Chặn chuyển tiến khi đang tạm dừng hoặc đang chạy audio phần Nghe chưa hoàn thành
        if (isInteractionLocked || isListeningTransitionLocked) return;
        // Xóa focus cuộn câu cũ
        setFocusedOrderNo(null);
        // Tiến tới step kế tiếp
        setCurrentStepIndex((prev) => Math.min(steps.length - 1, prev + 1));
    }, [isInteractionLocked, isListeningTransitionLocked, steps.length]);

    // Nhảy tới đúng màn hình chứa câu hỏi khi học viên click trên bảng Palette
    const handleSelectQuestionFromPalette = useCallback(
        (orderNo: number) => {
            // Khóa click Palette khi đang tạm dừng hoặc khi toàn bộ phần Nghe chưa chạy xong hết audio
            if (isInteractionLocked || !isListeningCompleted) return;
            // Tra stepIndex chứa câu hỏi orderNo tương ứng
            const targetStep = questionToStepMap.get(orderNo);
            // Nếu tìm thấy thì chuyển trang và đánh dấu câu cần cuộn tới
            if (targetStep !== undefined) {
                setCurrentStepIndex(targetStep);
                setFocusedOrderNo(orderNo);
            }
        },
        [isInteractionLocked, isListeningCompleted, questionToStepMap]
    );

    // Cập nhật số giây còn lại từ DiagnosticHeader vào ref
    const handleSecondsChange = useCallback((secs: number) => {
        remainingSecondsRef.current = secs;
    }, []);

    // Bật hoặc tắt trạng thái Tạm dừng đồng thời đồng bộ ngay số giây hiện tại lên Backend
    const handleTogglePause = useCallback(() => {
        // Không cho bật/tắt Pause khi đang nộp bài
        if (isSubmitting || isAutoSubmitting) return;
        // Nếu đang chuẩn bị tạm dừng hoặc tiếp tục -> gửi ngay remainingSeconds hiện tại về server
        if (test && navigator.onLine) {
            void diagnosticService
                .syncTimer({
                    attemptId: test.attemptId,
                    remainingSeconds: Math.max(0, Math.floor(remainingSecondsRef.current)),
                })
                .catch(() => {
                    // Giữ trải nghiệm tạm dừng mượt ngay cả khi mạng chập chờn
                });
        }
        // Đảo trạng thái isPaused trên giao diện
        setIsPaused((prev) => !prev);
    }, [test, isSubmitting, isAutoSubmitting]);

    // Thực hiện nộp toàn bộ bài thi lên Backend chấm điểm 2 tầng và chuyển trang kết quả
    const submitExamPayload = useCallback(
        async (isTimeoutAuto: boolean) => {
            // Tránh gọi trùng khi bài thi chưa tải xong hoặc đang nộp dở
            if (!test || isSubmitting) return;

            // Xác định ID mục tiêu AIM hợp lệ gắn với lượt thi
            const resolvedTargetId = test.targetProfileId ?? user?.targetProfileId;
            if (!resolvedTargetId) {
                setSubmitError('Không xác định được mục tiêu điểm TOEIC (AIM) để chấm điểm bài thi.');
                setIsSubmitModalOpen(false);
                return;
            }

            // Đánh dấu trạng thái tự động thu bài nếu hết giờ
            if (isTimeoutAuto) {
                setIsAutoSubmitting(true);
            }
            // Bật spinner nộp bài và xóa lỗi cũ
            setIsSubmitting(true);
            setSubmitError('');

            // Tính số giây thực tế đã làm (loại trừ khoảng thời gian đã ngưng đọng khi crash/tạm dừng)
            const totalSecondsAllowed = (test.durationMinutes || 45) * 60;
            const elapsedSeconds = Math.max(1, totalSecondsAllowed - Math.floor(remainingSecondsRef.current));

            // Đóng gói danh sách câu trả lời kèm trạng thái isFlagged cho từng câu hỏi
            const formattedAnswers = test.questions.map((q) => {
                const selected = answers[q.orderNo];
                return {
                    questionId: q.questionId,
                    userAnswer: selected ? JSON.stringify({ selected }) : null,
                    isFlagged: flagged.has(q.orderNo),
                };
            });

            // Tạo request payload hoàn chỉnh
            const requestPayload: SubmitDiagnosticRequest = {
                attemptId: test.attemptId,
                targetProfileId: resolvedTargetId,
                durationSeconds: elapsedSeconds,
                answers: formattedAnswers,
            };

            // UC06 Ngoại lệ 9a: Lưu tạm payload để tự nộp lại nếu hết phiên 401
            if (user?.id) {
                writePendingSubmit({ userId: user.id, request: requestPayload });
            }

            try {
                // Gửi bài thi lên Backend
                const res = await diagnosticService.submitTest(requestPayload);
                // Xóa payload tạm khi thành công
                clearPendingSubmit();

                if (res.success && res.data) {
                    // Xóa nháp bài làm sau khi chấm điểm hoàn tất
                    clearDiagnosticDraft(test.attemptId);
                    // Chuyển sang trang Báo cáo kết quả UC07
                    navigate(`/diagnostic/results/${res.data.attemptId}`, { replace: true });
                } else {
                    // Hiển thị thông báo lỗi từ server
                    setSubmitError(res.message || 'Lỗi khi nộp bài.');
                    setIsSubmitModalOpen(false);
                    setIsAutoSubmitting(false);
                }
            } catch (err: unknown) {
                // Chỉ giữ pending khi gặp 401 hết phiên; các lỗi khác xóa tránh nộp nhầm lần sau
                if (!axios.isAxiosError(err) || err.response?.status !== 401) {
                    clearPendingSubmit();
                }
                const serverMsg = axios.isAxiosError(err)
                    ? (err.response?.data as { message?: string } | undefined)?.message
                    : undefined;
                setSubmitError(serverMsg || 'Đã xảy ra lỗi nộp bài. Vui lòng thử lại.');
                setIsSubmitModalOpen(false);
                setIsAutoSubmitting(false);
            } finally {
                // Tắt trạng thái đang gửi
                setIsSubmitting(false);
            }
        },
        [test, isSubmitting, user, answers, flagged, navigate]
    );

    // BR07: Cưỡng chế thu bài ngay lập tức khi đồng hồ chạm 00:00
    const handleTimeOut = useCallback(() => {
        // Đóng các modal phụ đang mở
        setIsSubmitModalOpen(false);
        setIsPaused(false);
        // Nộp bài tự động
        void submitExamPayload(true);
    }, [submitExamPayload]);

    // Khởi tạo một lượt thi chẩn đoán mới khi người dùng xác nhận "Làm lại bài thi"
    const handleConfirmRetake = useCallback(async () => {
        // Tránh bấm đúp khi đang khởi tạo lượt thi mới
        if (isRetaking) return;
        // Bật trạng thái loading cho nút làm lại
        setIsRetaking(true);
        // Xóa lỗi cũ nếu có
        setSubmitError('');

        try {
            // Gọi startDiagnostic kèm cờ forceRetake: true để bỏ qua chặn BR02
            const startRes = await diagnosticService.startDiagnostic({
                targetProfileId: user?.targetProfileId ?? undefined,
                forceRetake: true,
            });
            if (!startRes.success || !startRes.data) {
                throw new Error(startRes.message || 'Không thể khởi tạo lượt thi chẩn đoán mới.');
            }
            // Tải đề thi của lượt vừa tạo
            const examRes = await diagnosticService.getExamForAttempt(startRes.data.attemptId);
            if (!examRes.success || !examRes.data) {
                throw new Error(examRes.message || 'Không thể tải danh sách câu hỏi bài thi mới.');
            }
            // Đóng hộp thoại xác nhận làm lại
            setIsRetakeConfirmOpen(false);
            // Nạp phòng thi mới với nháp sạch hoàn toàn
            applyLoadedRoom(examRes.data, true);
        } catch (err: unknown) {
            // Đóng modal xác nhận và hiển thị lỗi nếu không khởi tạo được
            setIsRetakeConfirmOpen(false);
            const serverMsg = axios.isAxiosError(err)
                ? (err.response?.data as { message?: string } | undefined)?.message
                : undefined;
            setSubmitError(serverMsg || 'Không thể bắt đầu lại bài thi chẩn đoán. Vui lòng thử lại.');
        } finally {
            // Tắt trạng thái loading làm lại
            setIsRetaking(false);
        }
    }, [isRetaking, user, applyLoadedRoom]);

    // Trả toàn bộ state và handler ra cho trang DiagnosticRoomPage tiêu thụ
    return {
        test,
        steps,
        currentStep,
        currentStepIndex,
        focusedOrderNo,
        totalQuestions,
        answeredCount,
        activeQuestionOrderNos,
        answers,
        flagged,
        initialSeconds,
        isLoading,
        isSubmitting,
        isAutoSubmitting,
        isRetaking,
        isPaused,
        isPaletteCollapsed,
        isSubmitModalOpen,
        isRetakeConfirmOpen,
        isOffline,
        blockState,
        submitError,
        hasStartedAudio,
        isCurrentAudioLocked,
        isListeningCompleted,
        isListeningTransitionLocked,
        isInteractionLocked,
        setIsPaletteCollapsed,
        setIsSubmitModalOpen,
        setIsRetakeConfirmOpen,
        setHasStartedAudio,
        handleSelectOption,
        handleToggleFlag,
        handleAudioEnded,
        handlePrevStep,
        handleNextStep,
        handleSelectQuestionFromPalette,
        handleSecondsChange,
        handleTogglePause,
        submitExamPayload,
        handleTimeOut,
        handleConfirmRetake,
    };
}
