import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type { ExamStep } from '../../../shared/exam/types/examTypes';
import { parseExamApiError } from '../../../shared/exam/utils/examErrorUtils';
import {
    buildExamSteps,
    buildQuestionToStepMap,
    checkAllListeningCompleted,
    getListeningAudioKeys,
} from '../../../shared/exam/utils/examStepUtils';
import { moduleTestService } from '../services/moduleTestService';
import type {
    ModuleTestBlockedState,
    ModuleTestRoomData,
    ModuleTestRoomQuestion,
    OptionKey,
    SubmitModuleTestAnswerItem,
    SubmitModuleTestRequest,
} from '../types/moduleTestTypes';
import {
    clearModuleTestDraft,
    clearPendingModuleTestSubmit,
    readModuleTestDraft,
    readPendingModuleTestSubmit,
    writeModuleTestDraft,
    writePendingModuleTestSubmit,
} from '../utils/moduleTestDraftUtils';

function mapBlockedError(error: unknown): ModuleTestBlockedState {
    const parsed = parseExamApiError(
        error,
        'Không thể tải phòng thi vượt ải mô-đun. Vui lòng thử lại sau.'
    );

    if (parsed.code === 'MODULE_TEST_PREREQUISITE_NOT_MET') {
        return {
            kind: 'PREREQUISITE',
            code: parsed.code,
            status: parsed.status,
            message: parsed.message,
        };
    }

    if (parsed.code === 'MODULE_TEST_NOT_CONFIGURED') {
        return {
            kind: 'NOT_CONFIGURED',
            code: parsed.code,
            status: parsed.status,
            message: parsed.message,
        };
    }

    if (parsed.code === 'MODULE_TEST_ALREADY_SUBMITTED') {
        return {
            kind: 'ALREADY_SUBMITTED',
            code: parsed.code,
            status: parsed.status,
            message: parsed.message,
        };
    }

    if (parsed.status === 403 || parsed.code === 'CONTENT_LOCKED') {
        return {
            kind: 'CONTENT_LOCKED',
            code: parsed.code,
            status: parsed.status ?? 403,
            message: parsed.message,
        };
    }

    if (parsed.status === 404) {
        return {
            kind: 'NOT_FOUND',
            code: parsed.code,
            status: 404,
            message: parsed.message,
        };
    }

    return {
        kind: 'GENERIC',
        code: parsed.code,
        status: parsed.status,
        message: parsed.message,
    };
}

/**
 * Hook điều phối Phòng thi vượt ải mô-đun (UC13):
 * - Tự động khôi phục phiên thi dở dang (resume) hoặc khởi tạo phiên mới.
 * - Lưu nháp tức thì (answers + flag) lên Backend & localStorage.
 * - Đồng bộ đồng hồ mỗi 5s, hỗ trợ Tạm dừng (Pause) và tự thu bài khi hết giờ (BR07).
 * - Audio Listening dùng policy ONCE như Diagnostic (BR13); Reading mở chuyển câu tự do.
 */
export function useModuleTestRoom(moduleIdParam?: string) {
    const navigate = useNavigate();
    const { user } = useAuth();
    const userId = user?.id;
    const numericModuleId = Number(moduleIdParam);

    const [roomData, setRoomData] = useState<ModuleTestRoomData | null>(null);
    const [initialSeconds, setInitialSeconds] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [blockedState, setBlockedState] = useState<ModuleTestBlockedState | null>(null);

    const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
    const [focusedOrderNo, setFocusedOrderNo] = useState<number | null>(null);
    const [answers, setAnswers] = useState<Record<number, OptionKey | null>>({});
    const [flagged, setFlagged] = useState<Set<number>>(new Set());
    const [playedAudios, setPlayedAudios] = useState<Set<string>>(new Set());
    const [hasInteractedAudio, setHasInteractedAudio] = useState<boolean>(false);

    const [isPaletteCollapsed, setIsPaletteCollapsed] = useState<boolean>(false);
    const [isPaused, setIsPaused] = useState<boolean>(false);
    const [isSubmitModalOpen, setIsSubmitModalOpen] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [isAutoSubmitting, setIsAutoSubmitting] = useState<boolean>(false);
    const [isTimedOut, setIsTimedOut] = useState<boolean>(false);
    const [isOffline, setIsOffline] = useState<boolean>(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const attemptIdRef = useRef<number | null>(null);
    const secondsLeftRef = useRef<number>(0);
    const isSubmittedRef = useRef<boolean>(false);
    const audioAdvanceTimerRef = useRef<number | null>(null);

    const hydrateRoomState = useCallback(
        (room: ModuleTestRoomData, activeUserId: number) => {
            attemptIdRef.current = room.attemptId;
            isSubmittedRef.current = false;
            setRoomData(room);

            const nextAnswers: Record<number, OptionKey | null> = {};
            const nextFlagged = new Set<number>();

            for (const draftItem of room.draftAnswers ?? []) {
                if (draftItem.selectedOption) {
                    nextAnswers[draftItem.orderNo] = draftItem.selectedOption;
                }
                if (draftItem.isFlagged) {
                    nextFlagged.add(draftItem.orderNo);
                }
            }

            const localDraft = readModuleTestDraft(activeUserId, room.attemptId);
            const mergedAnswers = {
                ...nextAnswers,
                ...(localDraft?.answers ?? {}),
            };
            const mergedFlagged = new Set<number>([
                ...nextFlagged,
                ...(localDraft?.flagged ?? []),
            ]);
            const mergedPlayed = new Set<string>(localDraft?.playedAudios ?? []);

            const serverRem = Math.max(0, Math.floor(room.remainingSeconds));
            const localRem =
                localDraft?.secondsLeft !== undefined ? Math.max(0, Math.floor(localDraft.secondsLeft)) : serverRem;
            const resolvedRemaining = Math.min(serverRem, localRem);

            secondsLeftRef.current = resolvedRemaining;
            setInitialSeconds(resolvedRemaining);
            setAnswers(mergedAnswers);
            setFlagged(mergedFlagged);
            setPlayedAudios(mergedPlayed);

            const computedSteps = buildExamSteps(room.questions);
            const safeStep = Math.min(
                Math.max(0, localDraft?.currentStepIndex ?? 0),
                Math.max(0, computedSteps.length - 1)
            );
            setCurrentStepIndex(safeStep);
        },
        []
    );

    const initializeRoom = useCallback(async () => {
        if (!moduleIdParam || !Number.isFinite(numericModuleId) || numericModuleId <= 0) {
            setIsLoading(false);
            setBlockedState({
                kind: 'NOT_FOUND',
                message: 'Mã mô-đun không hợp lệ.',
            });
            return;
        }
        if (typeof userId !== 'number' || !Number.isFinite(userId) || userId <= 0) {
            return;
        }

        setRoomData(null);
        setIsLoading(true);
        setBlockedState(null);
        setSubmitError(null);

        try {
            const pendingPayload = readPendingModuleTestSubmit(userId, numericModuleId);
            if (pendingPayload) {
                try {
                    const pendingResult = await moduleTestService.submitTest(
                        numericModuleId,
                        pendingPayload
                    );
                    clearPendingModuleTestSubmit(userId, numericModuleId);
                    clearModuleTestDraft(userId, pendingPayload.attemptId);
                    isSubmittedRef.current = true;
                    navigate(`/modules/${numericModuleId}/test/result/${pendingResult.data.attemptId}`, {
                        replace: true,
                    });
                    return;
                } catch (pendingErr) {
                    const parsedPending = parseExamApiError(pendingErr, '');
                    if (parsedPending.status === 401) {
                        navigate('/login', { replace: true });
                        return;
                    }
                    clearPendingModuleTestSubmit(userId, numericModuleId);
                }
            }

            const resumeRes = await moduleTestService.resumeModuleTest(numericModuleId);
            if (resumeRes.data) {
                hydrateRoomState(resumeRes.data, userId);
                return;
            }

            const startRes = await moduleTestService.startModuleTest(numericModuleId);
            const examRes = await moduleTestService.getExamRoom(
                numericModuleId,
                startRes.data.attemptId
            );
            hydrateRoomState(examRes.data, userId);
        } catch (err) {
            const parsed = parseExamApiError(err, '');
            if (parsed.status === 401) {
                navigate('/login', { replace: true });
                return;
            }
            setBlockedState(mapBlockedError(err));
        } finally {
            setIsLoading(false);
        }
    }, [moduleIdParam, numericModuleId, userId, hydrateRoomState, navigate]);

    useEffect(() => {
        void initializeRoom();
    }, [initializeRoom]);

    const steps: ExamStep<ModuleTestRoomQuestion>[] = useMemo(() => {
        if (!roomData?.questions) return [];
        return buildExamSteps(roomData.questions);
    }, [roomData]);

    const questionToStepMap = useMemo(() => buildQuestionToStepMap(steps), [steps]);
    const currentStep = steps[currentStepIndex] ?? null;

    const listeningAudioKeys = useMemo(() => getListeningAudioKeys(steps), [steps]);

    const isListeningCompleted = useMemo(
        () => checkAllListeningCompleted(listeningAudioKeys, playedAudios),
        [listeningAudioKeys, playedAudios]
    );

    const activeOrderNos = useMemo(() => {
        if (!currentStep) return new Set<number>();
        return new Set(currentStep.questions.map((q) => q.orderNo));
    }, [currentStep]);

    const answeredCount = useMemo(() => {
        if (!roomData?.questions) return 0;
        return roomData.questions.filter(
            (q) => answers[q.orderNo] !== null && answers[q.orderNo] !== undefined
        ).length;
    }, [roomData, answers]);

    // Lưu localStorage mỗi khi trạng thái bài làm thay đổi
    useEffect(() => {
        if (!roomData || isSubmittedRef.current || typeof userId !== 'number' || userId <= 0) {
            return;
        }
        writeModuleTestDraft(userId, roomData.attemptId, {
            answers,
            flagged: Array.from(flagged),
            playedAudios: Array.from(playedAudios),
            currentStepIndex,
            secondsLeft: secondsLeftRef.current,
        });
    }, [roomData, userId, answers, flagged, playedAudios, currentStepIndex]);

    // Đồng bộ đồng hồ lên Backend mỗi 5 giây khi đang làm bài
    useEffect(() => {
        if (!roomData || isPaused || isSubmitting || isAutoSubmitting || isTimedOut) {
            return;
        }

        const interval = window.setInterval(async () => {
            const attemptId = attemptIdRef.current;
            if (!attemptId || isSubmittedRef.current) return;
            try {
                await moduleTestService.syncTimer(
                    roomData.moduleId,
                    attemptId,
                    secondsLeftRef.current
                );
                setIsOffline(false);
            } catch (err) {
                const parsed = parseExamApiError(err, '');
                if (parsed.isNetworkError) {
                    setIsOffline(true);
                }
            }
        }, 5000);

        return () => window.clearInterval(interval);
    }, [roomData, isPaused, isSubmitting, isAutoSubmitting, isTimedOut]);

    // Lưu thời gian còn lại khi thoát tab hoặc điều hướng SPA
    useEffect(() => {
        if (!roomData) return;

        const handlePageExit = () => {
            if (isSubmittedRef.current || !attemptIdRef.current) return;
            moduleTestService.syncTimerOnExit(
                roomData.moduleId,
                attemptIdRef.current,
                secondsLeftRef.current
            );
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                handlePageExit();
            }
        };

        window.addEventListener('pagehide', handlePageExit);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            window.removeEventListener('pagehide', handlePageExit);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            if (!isSubmittedRef.current && attemptIdRef.current) {
                void moduleTestService
                    .syncTimer(roomData.moduleId, attemptIdRef.current, secondsLeftRef.current)
                    .catch(() => undefined);
            }
        };
    }, [roomData]);

    useEffect(() => {
        return () => {
            if (audioAdvanceTimerRef.current !== null) {
                window.clearTimeout(audioAdvanceTimerRef.current);
            }
        };
    }, []);

    const persistSingleDraft = useCallback(
        (orderNo: number, selectedOption: OptionKey | null, isFlagged: boolean) => {
            if (!roomData || isSubmittedRef.current) return;
            const targetQuestion = roomData.questions.find((q) => q.orderNo === orderNo);
            if (!targetQuestion) return;

            void moduleTestService
                .saveDraftAnswers(roomData.moduleId, {
                    attemptId: roomData.attemptId,
                    answers: [
                        {
                            questionId: targetQuestion.questionId,
                            selectedOption,
                            isFlagged,
                        },
                    ],
                })
                .then(() => {
                    setIsOffline(false);
                })
                .catch((err) => {
                    const parsed = parseExamApiError(err, '');
                    if (parsed.isNetworkError) {
                        setIsOffline(true);
                    }
                });
        },
        [roomData]
    );

    const handleSelectOption = useCallback(
        (orderNo: number, option: OptionKey) => {
            if (isPaused || isSubmitting || isAutoSubmitting || isTimedOut) return;
            setAnswers((prev) => ({
                ...prev,
                [orderNo]: option,
            }));
            persistSingleDraft(orderNo, option, flagged.has(orderNo));
        },
        [isPaused, isSubmitting, isAutoSubmitting, isTimedOut, flagged, persistSingleDraft]
    );

    const handleToggleFlag = useCallback(
        (orderNo: number) => {
            if (isPaused || isSubmitting || isAutoSubmitting || isTimedOut) return;
            const nextIsFlagged = !flagged.has(orderNo);
            setFlagged((prev) => {
                const next = new Set(prev);
                if (nextIsFlagged) {
                    next.add(orderNo);
                } else {
                    next.delete(orderNo);
                }
                return next;
            });
            persistSingleDraft(orderNo, answers[orderNo] ?? null, nextIsFlagged);
        },
        [isPaused, isSubmitting, isAutoSubmitting, isTimedOut, flagged, answers, persistSingleDraft]
    );

    const handleTogglePause = useCallback(() => {
        if (!roomData || isSubmitting || isAutoSubmitting || isTimedOut) return;
        setIsPaused((prev) => {
            const nextPaused = !prev;
            if (nextPaused && attemptIdRef.current) {
                void moduleTestService
                    .syncTimer(roomData.moduleId, attemptIdRef.current, secondsLeftRef.current)
                    .catch(() => undefined);
            }
            return nextPaused;
        });
    }, [roomData, isSubmitting, isAutoSubmitting, isTimedOut]);

    const handleSecondsChange = useCallback((secondsLeft: number) => {
        secondsLeftRef.current = secondsLeft;
    }, []);

    const handleAudioEnded = useCallback(
        (audioKey: string | null) => {
            if (!audioKey) return;
            setPlayedAudios((prev) => {
                if (prev.has(audioKey)) return prev;
                const next = new Set(prev);
                next.add(audioKey);
                return next;
            });

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

    const handlePrevStep = useCallback(() => {
        if (!isListeningCompleted || currentStepIndex <= 0) return;
        setFocusedOrderNo(null);
        setCurrentStepIndex((prev) => Math.max(0, prev - 1));
    }, [isListeningCompleted, currentStepIndex]);

    const handleNextStep = useCallback(() => {
        if (!isListeningCompleted || currentStepIndex >= steps.length - 1) return;
        setFocusedOrderNo(null);
        setCurrentStepIndex((prev) => Math.min(steps.length - 1, prev + 1));
    }, [isListeningCompleted, currentStepIndex, steps.length]);

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

    const submitExam = useCallback(
        async (timedOut: boolean) => {
            if (!roomData || isSubmittedRef.current) return;

            setSubmitError(null);
            if (timedOut) {
                setIsAutoSubmitting(true);
            } else {
                setIsSubmitting(true);
            }

            const totalSecondsBudget = Math.max(0, roomData.durationMinutes * 60);
            const elapsedSeconds = Math.max(
                0,
                Math.min(7200, totalSecondsBudget - Math.max(0, secondsLeftRef.current))
            );

            const answerItems: SubmitModuleTestAnswerItem[] = roomData.questions.map((q) => ({
                questionId: q.questionId,
                userAnswer: answers[q.orderNo] ?? null,
                isFlagged: flagged.has(q.orderNo),
            }));

            const payload: SubmitModuleTestRequest = {
                attemptId: roomData.attemptId,
                durationSeconds: elapsedSeconds,
                isTimedOut: timedOut,
                answers: answerItems,
            };

            try {
                const res = await moduleTestService.submitTest(roomData.moduleId, payload);
                isSubmittedRef.current = true;
                if (typeof userId === 'number' && userId > 0) {
                    clearModuleTestDraft(userId, roomData.attemptId);
                    clearPendingModuleTestSubmit(userId, roomData.moduleId);
                }
                setIsSubmitModalOpen(false);
                navigate(`/modules/${roomData.moduleId}/test/result/${res.data.attemptId}`, {
                    replace: true,
                });
            } catch (err) {
                const parsed = parseExamApiError(
                    err,
                    'Không thể nộp bài lúc này. Vui lòng thử lại.'
                );
                if (parsed.status === 401) {
                    if (typeof userId === 'number' && userId > 0) {
                        writePendingModuleTestSubmit(userId, roomData.moduleId, payload);
                    }
                    navigate('/login', { replace: true });
                    return;
                }
                if (parsed.isNetworkError) {
                    setIsOffline(true);
                }
                setSubmitError(parsed.message);
                setIsSubmitModalOpen(false);
            } finally {
                setIsSubmitting(false);
                setIsAutoSubmitting(false);
            }
        },
        [roomData, userId, answers, flagged, navigate]
    );

    const handleTimeOut = useCallback(() => {
        if (isTimedOut || isSubmittedRef.current) return;
        setIsTimedOut(true);
        setIsPaused(false);
        setIsSubmitModalOpen(false);
        void submitExam(true);
    }, [isTimedOut, submitExam]);

    const firstOrderNo = currentStep?.questions[0]?.orderNo ?? 1;
    const lastOrderNo = currentStep?.questions[currentStep.questions.length - 1]?.orderNo ?? firstOrderNo;
    const questionLabel =
        currentStep && currentStep.questions.length > 1
            ? `Câu ${firstOrderNo}–${lastOrderNo} / ${roomData?.totalQuestions ?? 0}`
            : undefined;

    const isCurrentAudioLocked = Boolean(
        currentStep?.audioKey && playedAudios.has(currentStep.audioKey)
    );

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
