import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type { ExamRevealedInfo, ExamStep, OptionKey } from '../../../shared/exam/types/examTypes';
import { parseExamApiError } from '../../../shared/exam/utils/examErrorUtils';
import {
    buildExamSteps,
    buildQuestionToStepMap,
} from '../../../shared/exam/utils/examStepUtils';
import { practiceService } from '../services/practiceService';
import type {
    PracticeErrorState,
    PracticeLocalDraft,
    PracticeRoomData,
    PracticeRoomQuestion,
} from '../types/practiceTypes';

const PRACTICE_LEGACY_DRAFT_PREFIX = 'leby_practice_draft_';

function buildPracticeDraftKey(userId: number, lessonId: number): string {
    return `${PRACTICE_LEGACY_DRAFT_PREFIX}u${userId}_l${lessonId}`;
}

function isValidUserId(userId: number | undefined): userId is number {
    return typeof userId === 'number' && Number.isFinite(userId) && userId > 0;
}

function removeLegacyPracticeDraft(lessonId: number): void {
    try {
        localStorage.removeItem(`${PRACTICE_LEGACY_DRAFT_PREFIX}${lessonId}`);
    } catch {
        // Bỏ qua nếu trình duyệt chặn localStorage
    }
}

function readPracticeDraft(userId: number, lessonId: number): PracticeLocalDraft | null {
    removeLegacyPracticeDraft(lessonId);
    try {
        const raw = localStorage.getItem(buildPracticeDraftKey(userId, lessonId));
        if (!raw) return null;
        const parsed = JSON.parse(raw) as Partial<PracticeLocalDraft>;
        if (parsed.userId !== userId) {
            return null;
        }
        return {
            userId,
            answers: parsed.answers ?? {},
            revealedOrderNos: Array.isArray(parsed.revealedOrderNos) ? parsed.revealedOrderNos : [],
            flaggedOrderNos: Array.isArray(parsed.flaggedOrderNos) ? parsed.flaggedOrderNos : [],
            currentStepIndex: typeof parsed.currentStepIndex === 'number' ? parsed.currentStepIndex : 0,
        };
    } catch {
        return null;
    }
}

function writePracticeDraft(
    userId: number,
    lessonId: number,
    draft: Omit<PracticeLocalDraft, 'userId'>
): void {
    try {
        const payload: PracticeLocalDraft = { userId, ...draft };
        localStorage.setItem(buildPracticeDraftKey(userId, lessonId), JSON.stringify(payload));
    } catch {
        // Bỏ qua nếu trình duyệt chặn lưu trữ cục bộ
    }
}

function clearPracticeDraft(userId: number, lessonId: number): void {
    removeLegacyPracticeDraft(lessonId);
    try {
        localStorage.removeItem(buildPracticeDraftKey(userId, lessonId));
    } catch {
        // Không xử lý thêm
    }
}

function mapPracticeError(error: unknown): PracticeErrorState {
    const parsed = parseExamApiError(
        error,
        'Không thể tải dữ liệu bài luyện tập. Vui lòng thử lại sau.'
    );

    if (parsed.status === 401) {
        return {
            kind: 'UNAUTHORIZED',
            status: 401,
            code: parsed.code,
            message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
        };
    }

    if (parsed.status === 403 || parsed.code === 'CONTENT_LOCKED') {
        return {
            kind: 'FORBIDDEN',
            status: parsed.status ?? 403,
            code: parsed.code,
            message: parsed.message,
        };
    }

    if (parsed.status === 404 || parsed.code === 'PRACTICE_LESSON_NOT_FOUND') {
        return {
            kind: 'NOT_FOUND',
            status: parsed.status ?? 404,
            code: parsed.code,
            message: parsed.message,
        };
    }

    if (parsed.code === 'INVALID_LESSON_TYPE') {
        return {
            kind: 'INVALID_TYPE',
            status: parsed.status,
            code: parsed.code,
            message: parsed.message,
        };
    }

    return {
        kind: 'GENERIC',
        status: parsed.status,
        code: parsed.code,
        message: parsed.message,
    };
}

/**
 * Hook điều phối Phòng luyện tập bài thực hành (UC12):
 * - Tải danh sách câu hỏi thực hành kèm đáp án và lời giải từ Backend.
 * - Hỗ trợ kiểm tra đáp án tức thì từng câu (kể cả khi chưa chọn đáp án - Ngoại lệ 5a).
 * - Lưu nháp và danh sách câu đánh dấu ôn lại (Flag) trong phiên cục bộ.
 */
export function usePracticeRoom(lessonIdParam?: string) {
    const navigate = useNavigate();
    const { user } = useAuth();
    const userId = user?.id;
    const numericLessonId = Number(lessonIdParam);

    const [data, setData] = useState<PracticeRoomData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [errorState, setErrorState] = useState<PracticeErrorState | null>(null);

    const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
    const [focusedOrderNo, setFocusedOrderNo] = useState<number | null>(null);
    const [answers, setAnswers] = useState<Record<number, OptionKey | null>>({});
    const [revealedOrderNos, setRevealedOrderNos] = useState<Set<number>>(new Set());
    const [flagged, setFlagged] = useState<Set<number>>(new Set());
    const [isPaletteCollapsed, setIsPaletteCollapsed] = useState<boolean>(false);
    const [showSummary, setShowSummary] = useState<boolean>(false);

    const fetchPracticeRoom = useCallback(async () => {
        if (!lessonIdParam || !Number.isFinite(numericLessonId) || numericLessonId <= 0) {
            setIsLoading(false);
            setErrorState({
                kind: 'NOT_FOUND',
                message: 'Mã bài luyện tập không hợp lệ.',
            });
            return;
        }
        if (!isValidUserId(userId)) {
            return;
        }

        setData(null);
        setShowSummary(false);
        setFocusedOrderNo(null);
        setIsLoading(true);
        setErrorState(null);

        try {
            const response = await practiceService.getPracticeRoom(numericLessonId);
            const roomData = response.data;
            setData(roomData);

            const draft = readPracticeDraft(userId, numericLessonId);
            if (draft && roomData.questions.length > 0) {
                const maxStep = Math.max(0, buildExamSteps(roomData.questions).length - 1);
                setAnswers(draft.answers);
                setRevealedOrderNos(new Set(draft.revealedOrderNos));
                setFlagged(new Set(draft.flaggedOrderNos));
                setCurrentStepIndex(Math.min(Math.max(0, draft.currentStepIndex), maxStep));
            } else {
                setAnswers({});
                setRevealedOrderNos(new Set());
                setFlagged(new Set());
                setCurrentStepIndex(0);
            }
        } catch (err) {
            const mapped = mapPracticeError(err);
            if (mapped.kind === 'UNAUTHORIZED') {
                navigate('/login', { replace: true });
                return;
            }
            setErrorState(mapped);
        } finally {
            setIsLoading(false);
        }
    }, [lessonIdParam, numericLessonId, userId, navigate]);

    useEffect(() => {
        void fetchPracticeRoom();
    }, [fetchPracticeRoom]);

    useEffect(() => {
        if (!data || data.isEmpty || !Number.isFinite(numericLessonId) || !isValidUserId(userId)) {
            return;
        }
        writePracticeDraft(userId, numericLessonId, {
            answers,
            revealedOrderNos: Array.from(revealedOrderNos),
            flaggedOrderNos: Array.from(flagged),
            currentStepIndex,
        });
    }, [data, userId, numericLessonId, answers, revealedOrderNos, flagged, currentStepIndex]);

    const steps: ExamStep<PracticeRoomQuestion>[] = useMemo(() => {
        if (!data?.questions) return [];
        return buildExamSteps(data.questions);
    }, [data]);

    const questionToStepMap = useMemo(() => buildQuestionToStepMap(steps), [steps]);
    const currentStep = steps[currentStepIndex] ?? null;

    const activeOrderNos = useMemo(() => {
        if (!currentStep) return new Set<number>();
        return new Set(currentStep.questions.map((q) => q.orderNo));
    }, [currentStep]);

    const reviewQuestionMap = useMemo<Record<number, ExamRevealedInfo>>(() => {
        if (!data?.questions) return {};
        const map: Record<number, ExamRevealedInfo> = {};
        for (const q of data.questions) {
            const picked = answers[q.orderNo] ?? null;
            map[q.orderNo] = {
                userAnswer: picked,
                correctAnswer: q.correctAnswer,
                isCorrect: picked !== null && picked === q.correctAnswer,
                explanation: q.explanation ?? null,
            };
        }
        return map;
    }, [data, answers]);

    const reviewStatusMap = useMemo<Record<number, boolean>>(() => {
        if (!data?.questions) return {};
        const map: Record<number, boolean> = {};
        for (const q of data.questions) {
            const picked = answers[q.orderNo] ?? null;
            map[q.orderNo] = picked !== null && picked === q.correctAnswer;
        }
        return map;
    }, [data, answers]);

    const handleSelectOption = useCallback(
        (orderNo: number, option: OptionKey) => {
            if (revealedOrderNos.has(orderNo)) return;
            setAnswers((prev) => ({
                ...prev,
                [orderNo]: option,
            }));
        },
        [revealedOrderNos]
    );

    const handleCheckAnswer = useCallback((orderNo: number) => {
        setRevealedOrderNos((prev) => {
            if (prev.has(orderNo)) return prev;
            const next = new Set(prev);
            next.add(orderNo);
            return next;
        });
    }, []);

    const handleToggleFlag = useCallback((orderNo: number) => {
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

    const handlePrevStep = useCallback(() => {
        if (currentStepIndex <= 0) return;
        setFocusedOrderNo(null);
        setCurrentStepIndex((prev) => Math.max(0, prev - 1));
    }, [currentStepIndex]);

    const handleNextStep = useCallback(() => {
        if (currentStepIndex >= steps.length - 1) return;
        setFocusedOrderNo(null);
        setCurrentStepIndex((prev) => Math.min(steps.length - 1, prev + 1));
    }, [currentStepIndex, steps.length]);

    const handleSelectQuestionFromPalette = useCallback(
        (orderNo: number) => {
            const targetStep = questionToStepMap.get(orderNo);
            if (targetStep === undefined) return;
            setShowSummary(false);
            setFocusedOrderNo(orderNo);
            setCurrentStepIndex(targetStep);
        },
        [questionToStepMap]
    );

    const handleResetPractice = useCallback(() => {
        if (isValidUserId(userId) && Number.isFinite(numericLessonId)) {
            clearPracticeDraft(userId, numericLessonId);
        }
        setAnswers({});
        setRevealedOrderNos(new Set());
        setFlagged(new Set());
        setCurrentStepIndex(0);
        setFocusedOrderNo(null);
        setShowSummary(false);
    }, [userId, numericLessonId]);

    const firstOrderNo = currentStep?.questions[0]?.orderNo ?? 1;
    const lastOrderNo = currentStep?.questions[currentStep.questions.length - 1]?.orderNo ?? firstOrderNo;
    const questionLabel =
        currentStep && currentStep.questions.length > 1
            ? `Câu ${firstOrderNo}–${lastOrderNo} / ${data?.totalQuestions ?? 0}`
            : undefined;

    return {
        data,
        steps,
        currentStep,
        currentStepIndex,
        focusedOrderNo,
        answers,
        revealedOrderNos,
        flagged,
        activeOrderNos,
        reviewQuestionMap,
        reviewStatusMap,
        isPaletteCollapsed,
        showSummary,
        isLoading,
        errorState,
        questionLabel,
        firstOrderNo,
        isPrevDisabled: currentStepIndex <= 0,
        isLastStep: steps.length > 0 && currentStepIndex === steps.length - 1,
        togglePaletteCollapse: () => setIsPaletteCollapsed((prev) => !prev),
        openSummary: () => setShowSummary(true),
        closeSummary: () => setShowSummary(false),
        retryLoad: fetchPracticeRoom,
        handleSelectOption,
        handleCheckAnswer,
        handleToggleFlag,
        handlePrevStep,
        handleNextStep,
        handleSelectQuestionFromPalette,
        handleResetPractice,
    };
}
