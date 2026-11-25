import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    AlertTriangle,
    Award,
    ChevronLeft,
    ChevronRight,
    Compass,
    Flag,
    PauseCircle,
    Play,
    WifiOff,
} from 'lucide-react';
import { DiagnosticHeader } from '../components/DiagnosticHeader';
import { AudioPlayer } from '../components/AudioPlayer';
import { QuestionCard } from '../components/QuestionCard';
import { QuestionPalette } from '../components/QuestionPalette';
import { SubmitModal } from '../components/SubmitModal';
import { diagnosticService } from '../services/diagnosticService';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type {
    DiagnosticTest,
    OptionKey,
    SubmitDiagnosticRequest,
} from '../types/diagnosticTypes';
import '../diagnostic.css';

const DRAFT_STORAGE_PREFIX = 'leby_diag_draft_';
const PENDING_SUBMIT_KEY = 'leby_diag_pending_submit';

interface DiagnosticDraft {
    answers: Record<number, OptionKey | null>;
    flagged: number[];
    playedAudios: string[];
}

interface PendingSubmitPayload {
    userId: number;
    request: SubmitDiagnosticRequest;
}

type RoomBlockState =
    | { type: 'ALREADY_COMPLETED'; message: string }
    | { type: 'NO_ACTIVE_EXAM'; message: string }
    | { type: 'NO_TARGET'; message: string }
    | { type: 'ERROR'; message: string };

// Khóa đồng bộ khởi tạo phiên thi tránh gọi /start 2 lần khi React StrictMode mount kép
let inFlightRoomInit: Promise<DiagnosticTest> | null = null;

function readDraft(attemptId: number): DiagnosticDraft | null {
    try {
        const raw = localStorage.getItem(`${DRAFT_STORAGE_PREFIX}${attemptId}`);
        if (!raw) return null;
        return JSON.parse(raw) as DiagnosticDraft;
    } catch {
        return null;
    }
}

function writeDraft(attemptId: number, draft: DiagnosticDraft) {
    try {
        localStorage.setItem(`${DRAFT_STORAGE_PREFIX}${attemptId}`, JSON.stringify(draft));
    } catch {
        // Bỏ qua nếu bộ nhớ trình duyệt bị đầy
    }
}

function clearDraft(attemptId: number) {
    try {
        localStorage.removeItem(`${DRAFT_STORAGE_PREFIX}${attemptId}`);
    } catch {
        // Không xử lý thêm
    }
}

/**
 * Trang Phòng thi chẩn đoán trực tuyến (UC06).
 * Tích hợp đầy đủ: khôi phục phiên (Luồng 5a), lưu nháp real-time localStorage (BR12),
 * audio phát 1 lần duy nhất (BR13), tạm dừng client-side (Luồng 4b), tự động nộp bài khi hết giờ (BR07),
 * cảnh báo mất kết nối (Ngoại lệ 5b) và tự nộp bài sau khi đăng nhập lại (Ngoại lệ 9a).
 */
export default function DiagnosticRoomPage() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [test, setTest] = useState<DiagnosticTest | null>(null);
    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const [answers, setAnswers] = useState<Record<number, OptionKey | null>>({});
    const [flagged, setFlagged] = useState<Set<number>>(new Set());
    const [playedAudios, setPlayedAudios] = useState<Set<string>>(new Set());
    const [initialSeconds, setInitialSeconds] = useState<number>(45 * 60);

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [isAutoSubmitting, setIsAutoSubmitting] = useState<boolean>(false);
    const [isPaused, setIsPaused] = useState<boolean>(false);
    const [isPaletteCollapsed, setIsPaletteCollapsed] = useState<boolean>(false);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isOffline, setIsOffline] = useState<boolean>(() => !navigator.onLine);
    const [blockState, setBlockState] = useState<RoomBlockState | null>(null);
    const [submitError, setSubmitError] = useState<string>('');

    const remainingSecondsRef = useRef<number>(45 * 60);

    // Lắng nghe trạng thái kết nối mạng (UC06 Ngoại lệ 5b)
    useEffect(() => {
        const handleOffline = () => setIsOffline(true);
        const handleOnline = () => setIsOffline(false);
        window.addEventListener('offline', handleOffline);
        window.addEventListener('online', handleOnline);
        return () => {
            window.removeEventListener('offline', handleOffline);
            window.removeEventListener('online', handleOnline);
        };
    }, []);

    // Nạp phiên làm bài hiện tại hoặc khởi tạo phiên mới (kèm tự nộp bài nếu vừa đăng nhập lại từ Ngoại lệ 9a)
    useEffect(() => {
        let isMounted = true;

        async function bootstrapRoom() {
            // Bước 1: Kiểm tra xem học viên vừa bị hết phiên đúng lúc bấm nộp bài ở lần trước hay không (Ngoại lệ 9a)
            const rawPending = localStorage.getItem(PENDING_SUBMIT_KEY);
            if (rawPending && user) {
                try {
                    const pending = JSON.parse(rawPending) as PendingSubmitPayload;
                    if (pending.userId === user.id && pending.request?.attemptId) {
                        setIsSubmitting(true);
                        const submitRes = await diagnosticService.submitTest(pending.request);
                        localStorage.removeItem(PENDING_SUBMIT_KEY);
                        clearDraft(pending.request.attemptId);
                        if (submitRes.success && submitRes.data) {
                            navigate(`/diagnostic/results/${submitRes.data.attemptId}`, { replace: true });
                            return;
                        }
                    }
                } catch (err: unknown) {
                    if (!axios.isAxiosError(err) || err.response?.status !== 401) {
                        localStorage.removeItem(PENDING_SUBMIT_KEY);
                    }
                } finally {
                    if (isMounted) setIsSubmitting(false);
                }
            }

            // Bước 2: Nếu user chưa chọn mục tiêu AIM -> báo yêu cầu thiết lập AIM trước (BR01)
            if (user && !user.targetProfileId) {
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

            // Bước 3: Kiểm tra phiên làm bài đang diễn ra hoặc tạo mới lượt thi
            try {
                if (!inFlightRoomInit) {
                    inFlightRoomInit = (async () => {
                        const resumeRes = await diagnosticService.getActiveSession();
                        if (resumeRes.success && resumeRes.data) {
                            return resumeRes.data;
                        }

                        const startRes = await diagnosticService.startDiagnostic({
                            targetProfileId: user?.targetProfileId ?? undefined,
                        });
                        if (!startRes.success || !startRes.data) {
                            throw new Error(startRes.message || 'Không thể khởi tạo bài thi chẩn đoán.');
                        }

                        const examRes = await diagnosticService.getExamForAttempt(startRes.data.attemptId);
                        if (!examRes.success || !examRes.data) {
                            throw new Error(examRes.message || 'Không thể tải danh sách câu hỏi bài thi.');
                        }
                        return examRes.data;
                    })();
                }

                const roomData = await inFlightRoomInit;
                if (!isMounted) return;

                setTest(roomData);
                const serverRemaining =
                    roomData.remainingSeconds !== undefined
                        ? roomData.remainingSeconds
                        : roomData.durationMinutes * 60;
                setInitialSeconds(serverRemaining);
                remainingSecondsRef.current = serverRemaining;

                // Khôi phục đáp án, cờ đánh dấu và danh sách audio đã phát từ localStorage (BR12 & BR13)
                const draft = readDraft(roomData.attemptId);
                if (draft) {
                    setAnswers(draft.answers || {});
                    setFlagged(new Set(draft.flagged || []));
                    setPlayedAudios(new Set(draft.playedAudios || []));
                } else {
                    setAnswers({});
                    setFlagged(new Set());
                    setPlayedAudios(new Set());
                }
            } catch (err: unknown) {
                if (!isMounted) return;
                if (axios.isAxiosError(err)) {
                    const data = err.response?.data as { code?: string; message?: string } | undefined;
                    const errCode = data?.code;
                    const errMsg = data?.message;

                    if (errCode === 'DIAGNOSTIC_ALREADY_COMPLETED') {
                        setBlockState({
                            type: 'ALREADY_COMPLETED',
                            message:
                                errMsg ||
                                'Bạn đã hoàn thành bài thi chẩn đoán cho mục tiêu này. Vui lòng xem lại báo cáo hoặc tiến hành học theo lộ trình.',
                        });
                        return;
                    }
                    if (errCode === 'EXAM_NOT_ACTIVE' || errCode === 'EXAM_NOT_FOUND') {
                        setBlockState({
                            type: 'NO_ACTIVE_EXAM',
                            message:
                                errMsg ||
                                'Đề thi chẩn đoán hiện đang được ban chuyên môn chuẩn bị. Vui lòng quay lại sau ít phút hoặc liên hệ quản trị viên.',
                        });
                        return;
                    }
                    setBlockState({
                        type: 'ERROR',
                        message: errMsg || 'Không thể tải bài thi chẩn đoán. Vui lòng thử lại.',
                    });
                } else {
                    setBlockState({
                        type: 'ERROR',
                        message: 'Không thể tải bài thi chẩn đoán. Vui lòng tải lại trang.',
                    });
                }
            } finally {
                inFlightRoomInit = null;
                if (isMounted) setIsLoading(false);
            }
        }

        void bootstrapRoom();

        return () => {
            isMounted = false;
        };
    }, [user, navigate]);

    // BR12: Tự động lưu nháp đáp án, cờ đánh dấu và audio đã phát vào localStorage ngay khi thay đổi
    useEffect(() => {
        if (!test) return;
        writeDraft(test.attemptId, {
            answers,
            flagged: Array.from(flagged),
            playedAudios: Array.from(playedAudios),
        });
    }, [test, answers, flagged, playedAudios]);

    const currentQuestion = test?.questions[currentIndex];
    const totalQuestions = test?.totalQuestions || test?.questions.length || 0;
    const currentQNo = currentQuestion?.orderNo ?? currentIndex + 1;
    const isCurrentFlagged = flagged.has(currentQNo);

    // Key nhận diện audio duy nhất (dùng audioUrl để nhóm các câu Part 3/4 chung 1 đoạn nghe)
    const currentAudioKey = currentQuestion?.audioUrl
        ? currentQuestion.audioUrl
        : currentQuestion
          ? `q_${currentQuestion.questionId}`
          : '';
    const isCurrentAudioLocked = currentAudioKey ? playedAudios.has(currentAudioKey) : false;

    const handleSelectOption = useCallback(
        (opt: OptionKey) => {
            if (isPaused || isSubmitting || isAutoSubmitting) return;
            setAnswers((prev) => ({
                ...prev,
                [currentQNo]: opt,
            }));
        },
        [currentQNo, isPaused, isSubmitting, isAutoSubmitting]
    );

    const handleToggleFlag = useCallback(() => {
        if (isPaused || isSubmitting || isAutoSubmitting) return;
        setFlagged((prev) => {
            const next = new Set(prev);
            if (next.has(currentQNo)) {
                next.delete(currentQNo);
            } else {
                next.add(currentQNo);
            }
            return next;
        });
    }, [currentQNo, isPaused, isSubmitting, isAutoSubmitting]);

    const handleAudioEnded = useCallback(() => {
        if (!currentAudioKey) return;
        setPlayedAudios((prev) => {
            const next = new Set(prev);
            next.add(currentAudioKey);
            return next;
        });
    }, [currentAudioKey]);

    const handlePrev = useCallback(() => {
        setCurrentIndex((prev) => Math.max(0, prev - 1));
    }, []);

    const handleNext = useCallback(() => {
        setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1));
    }, [totalQuestions]);

    const handleSecondsChange = useCallback((secs: number) => {
        remainingSecondsRef.current = secs;
    }, []);

    const submitExamPayload = useCallback(
        async (isTimeoutAuto: boolean) => {
            if (!test || isSubmitting) return;

            const resolvedTargetId = test.targetProfileId ?? user?.targetProfileId;
            if (!resolvedTargetId) {
                setSubmitError('Không xác định được mục tiêu điểm TOEIC (AIM) để chấm điểm bài thi.');
                setIsModalOpen(false);
                return;
            }

            if (isTimeoutAuto) {
                setIsAutoSubmitting(true);
            }
            setIsSubmitting(true);
            setSubmitError('');

            const totalSecondsAllowed = (test.durationMinutes || 45) * 60;
            const elapsedSeconds = Math.max(1, totalSecondsAllowed - remainingSecondsRef.current);

            const formattedAnswers = test.questions.map((q) => {
                const selected = answers[q.orderNo];
                return {
                    questionId: q.questionId,
                    userAnswer: selected ? JSON.stringify({ selected }) : null,
                    isFlagged: flagged.has(q.orderNo),
                };
            });

            const requestPayload: SubmitDiagnosticRequest = {
                attemptId: test.attemptId,
                targetProfileId: resolvedTargetId,
                durationSeconds: elapsedSeconds,
                answers: formattedAnswers,
            };

            // UC06 Ngoại lệ 9a: Lưu tạm payload trước khi gọi API để bảo toàn nếu hết phiên 401 đúng lúc nộp bài
            if (user?.id) {
                localStorage.setItem(
                    PENDING_SUBMIT_KEY,
                    JSON.stringify({ userId: user.id, request: requestPayload })
                );
            }

            try {
                const res = await diagnosticService.submitTest(requestPayload);
                localStorage.removeItem(PENDING_SUBMIT_KEY);

                if (res.success && res.data) {
                    clearDraft(test.attemptId);
                    navigate(`/diagnostic/results/${res.data.attemptId}`, { replace: true });
                } else {
                    setSubmitError(res.message || 'Lỗi khi nộp bài.');
                    setIsModalOpen(false);
                    setIsAutoSubmitting(false);
                }
            } catch (err: unknown) {
                // Nếu 401 thì giữ PENDING_SUBMIT_KEY để error.interceptor đưa sang /login và nộp lại sau đăng nhập
                if (!axios.isAxiosError(err) || err.response?.status !== 401) {
                    localStorage.removeItem(PENDING_SUBMIT_KEY);
                }
                const serverMsg = axios.isAxiosError(err)
                    ? (err.response?.data as { message?: string } | undefined)?.message
                    : undefined;
                setSubmitError(serverMsg || 'Đã xảy ra lỗi nộp bài. Vui lòng thử lại.');
                setIsModalOpen(false);
                setIsAutoSubmitting(false);
            } finally {
                setIsSubmitting(false);
            }
        },
        [test, isSubmitting, user, answers, flagged, navigate]
    );

    // BR07: Cưỡng chế nộp bài tự động khi đồng hồ đếm ngược chạm 00:00
    const handleTimeOut = useCallback(() => {
        setIsModalOpen(false);
        setIsPaused(false);
        void submitExamPayload(true);
    }, [submitExamPayload]);

    if (isLoading) {
        return (
            <div className="diag-loading-page">
                <div className="diag-spinner" />
                <p>Đang chuẩn bị đề thi chẩn đoán toàn diện...</p>
            </div>
        );
    }

    if (blockState) {
        return (
            <div className="diag-state-page">
                <div className="diag-state-card">
                    <div className="diag-state-card__icon">
                        <AlertTriangle size={36} color="#ea580c" />
                    </div>
                    <h2 className="diag-state-card__title">
                        {blockState.type === 'ALREADY_COMPLETED'
                            ? 'Bạn đã hoàn thành bài thi chẩn đoán'
                            : blockState.type === 'NO_ACTIVE_EXAM'
                              ? 'Đề thi chẩn đoán đang được chuẩn bị'
                              : blockState.type === 'NO_TARGET'
                                ? 'Chưa thiết lập mục tiêu TOEIC'
                                : 'Không thể mở phòng thi'}
                    </h2>
                    <p className="diag-state-card__desc">{blockState.message}</p>

                    <div className="diag-state-card__actions">
                        {blockState.type === 'ALREADY_COMPLETED' && (
                            <>
                                <button
                                    type="button"
                                    className="diag-action-btn is-submit"
                                    onClick={() => navigate('/diagnostic/results')}
                                >
                                    <Award size={16} />
                                    <span>Xem báo cáo chẩn đoán</span>
                                </button>
                                <button
                                    type="button"
                                    className="diag-action-btn is-outline"
                                    onClick={() => navigate('/learning-path')}
                                >
                                    <Compass size={16} />
                                    <span>Tiến hành học theo lộ trình</span>
                                </button>
                            </>
                        )}
                        {blockState.type === 'NO_TARGET' && (
                            <button
                                type="button"
                                className="diag-action-btn is-submit"
                                onClick={() => navigate('/target-selection')}
                            >
                                Chọn mục tiêu AIM ngay
                            </button>
                        )}
                        {(blockState.type === 'NO_ACTIVE_EXAM' || blockState.type === 'ERROR') && (
                            <button
                                type="button"
                                className="diag-action-btn is-outline"
                                onClick={() => navigate('/dashboard')}
                            >
                                Quay về trang tổng quan
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    if (!test || !currentQuestion) {
        return (
            <div className="diag-error-page">
                <p>Không tìm thấy dữ liệu bài thi chẩn đoán.</p>
            </div>
        );
    }

    const answeredCount = Object.values(answers).filter((v) => v !== null && v !== undefined).length;
    const isInteractionLocked = isPaused || isSubmitting || isAutoSubmitting;

    return (
        <div className="diag-room-page">
            {/* UC06 Ngoại lệ 5b: Thông báo màu vàng khi mất kết nối internet */}
            {isOffline && (
                <div className="diag-offline-banner" role="alert">
                    <WifiOff size={16} />
                    <span>
                        Đang mất kết nối máy chủ. Câu trả lời của bạn đang được tạm lưu cục bộ, vui lòng không tắt trình duyệt.
                    </span>
                </div>
            )}

            <DiagnosticHeader
                title={test.title}
                currentQuestion={currentQNo}
                totalQuestions={totalQuestions}
                initialSeconds={initialSeconds}
                isPaused={isPaused}
                isLocked={isSubmitting || isAutoSubmitting}
                onTogglePause={() => setIsPaused((prev) => !prev)}
                onSecondsChange={handleSecondsChange}
                onTimeOut={handleTimeOut}
            />

            {submitError && (
                <div className="diag-submit-error-banner" role="alert">
                    <AlertTriangle size={16} />
                    <span>{submitError}</span>
                </div>
            )}

            <main className={`diag-room-layout ${isPaletteCollapsed ? 'is-palette-collapsed' : ''}`}>
                <section className="diag-main-column">
                    {currentQuestion.section === 'LISTENING' && currentQuestion.audioUrl && (
                        <AudioPlayer
                            src={currentQuestion.audioUrl}
                            isLocked={isCurrentAudioLocked}
                            isPaused={isPaused || isSubmitting || isAutoSubmitting}
                            onAudioEnded={handleAudioEnded}
                        />
                    )}

                    <QuestionCard
                        question={currentQuestion}
                        selectedOption={answers[currentQNo] ?? null}
                        disabled={isInteractionLocked}
                        onSelectOption={handleSelectOption}
                    />

                    <footer className="diag-action-bar">
                        <div className="diag-action-bar__left">
                            <button
                                type="button"
                                className="diag-action-btn is-outline"
                                onClick={handlePrev}
                                disabled={currentIndex === 0 || isInteractionLocked}
                            >
                                <ChevronLeft size={16} />
                                <span>Câu trước</span>
                            </button>

                            <button
                                type="button"
                                className="diag-action-btn is-outline"
                                onClick={handleNext}
                                disabled={currentIndex === totalQuestions - 1 || isInteractionLocked}
                            >
                                <span>Câu tiếp</span>
                                <ChevronRight size={16} />
                            </button>
                        </div>

                        <div className="diag-action-bar__right">
                            <button
                                type="button"
                                className={`diag-action-btn is-flag ${isCurrentFlagged ? 'is-active' : ''}`}
                                onClick={handleToggleFlag}
                                disabled={isInteractionLocked}
                            >
                                <Flag size={16} fill={isCurrentFlagged ? '#f59e0b' : 'none'} />
                                <span>Đánh dấu</span>
                            </button>

                            <button
                                type="button"
                                className="diag-action-btn is-submit"
                                onClick={() => setIsModalOpen(true)}
                                disabled={isInteractionLocked}
                            >
                                Nộp bài thi
                            </button>
                        </div>
                    </footer>
                </section>

                <section className="diag-sidebar-column">
                    <QuestionPalette
                        total={totalQuestions}
                        currentIndex={currentIndex}
                        answers={answers}
                        flagged={flagged}
                        isCollapsed={isPaletteCollapsed}
                        onToggleCollapse={() => setIsPaletteCollapsed((prev) => !prev)}
                        onSelectQuestion={(idx) => {
                            if (!isInteractionLocked) setCurrentIndex(idx);
                        }}
                    />
                </section>
            </main>

            {/* Modal xác nhận nộp bài (UC06 Bước 8 & Ngoại lệ 7a) */}
            <SubmitModal
                isOpen={isModalOpen}
                totalQuestions={totalQuestions}
                answeredCount={answeredCount}
                flaggedCount={flagged.size}
                isSubmitting={isSubmitting}
                onClose={() => setIsModalOpen(false)}
                onConfirm={() => void submitExamPayload(false)}
            />

            {/* Overlay Tạm dừng phòng thi (UC06 Luồng 4b - client-side) */}
            {isPaused && !isAutoSubmitting && (
                <div className="diag-modal-backdrop" role="dialog" aria-modal="true">
                    <div className="diag-modal-card">
                        <div className="diag-modal-card__icon">
                            <PauseCircle size={34} color="#ea580c" />
                        </div>
                        <h3 className="diag-modal-card__title">Bài thi đang tạm dừng</h3>
                        <p className="diag-modal-card__desc">
                            Đồng hồ đếm ngược và mọi thao tác câu hỏi đã được tạm khóa. Nếu bạn đóng trình duyệt, hệ thống sẽ bảo lưu đáp án đã chọn và khôi phục lại phiên làm bài khi quay lại.
                        </p>
                        <button
                            type="button"
                            className="diag-modal-btn is-confirm"
                            onClick={() => setIsPaused(false)}
                            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%' }}
                        >
                            <Play size={16} />
                            <span>Tiếp tục làm bài</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Overlay Cưỡng chế nộp bài khi hết giờ (BR07) */}
            {isAutoSubmitting && (
                <div className="diag-modal-backdrop" role="dialog" aria-modal="true">
                    <div className="diag-modal-card">
                        <div className="diag-spinner" style={{ margin: '0 auto 16px' }} />
                        <h3 className="diag-modal-card__title">Đã hết thời gian làm bài thi</h3>
                        <p className="diag-modal-card__desc">
                            Đã hết thời gian làm bài thi. Hệ thống đang tiến hành nộp bài tự động và phân tích năng lực của bạn...
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
