import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ExamRevealedInfo, ExamStep, OptionKey } from '../../../shared/exam/types/examTypes';
import { parseExamApiError } from '../../../shared/exam/utils/examErrorUtils';
import {
    buildExamSteps,
    buildQuestionToStepMap,
} from '../../../shared/exam/utils/examStepUtils';
import { moduleTestService } from '../services/moduleTestService';
import type { ModuleTestReviewData, ModuleTestReviewQuestion } from '../types/moduleTestTypes';

/**
 * Hook điều phối Chế độ Xem lại bài thi vượt ải mô-đun (UC14 Luồng 6a):
 * - Tái sử dụng 100% logic chia bước & tô màu Palette từ Shared Exam.
 * - Mở tự do âm thanh và điều hướng câu hỏi, hỗ trợ hiển thị Flag & Giải thích chi tiết.
 */
export function useModuleTestReview(moduleIdParam?: string, attemptIdParam?: string) {
    const navigate = useNavigate();
    const numericModuleId = Number(moduleIdParam);
    const numericAttemptId = Number(attemptIdParam);

    const [reviewData, setReviewData] = useState<ModuleTestReviewData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
    const [focusedOrderNo, setFocusedOrderNo] = useState<number | null>(null);
    const [flagged, setFlagged] = useState<Set<number>>(new Set());
    const [isPaletteCollapsed, setIsPaletteCollapsed] = useState<boolean>(false);

    const fetchReview = useCallback(async () => {
        if (
            !moduleIdParam ||
            !attemptIdParam ||
            !Number.isFinite(numericModuleId) ||
            !Number.isFinite(numericAttemptId) ||
            numericModuleId <= 0 ||
            numericAttemptId <= 0
        ) {
            setIsLoading(false);
            setErrorMessage('Đường dẫn xem lại bài kiểm tra không hợp lệ.');
            return;
        }

        setIsLoading(true);
        setErrorMessage(null);

        try {
            const response = await moduleTestService.getTestReview(numericModuleId, numericAttemptId);
            const data = response.data;
            setReviewData(data);
            const initialFlagged = new Set<number>(
                data.questions.filter((q) => q.isFlagged).map((q) => q.orderNo)
            );
            setFlagged(initialFlagged);
            setCurrentStepIndex(0);
            setFocusedOrderNo(null);
        } catch (err) {
            const parsed = parseExamApiError(
                err,
                'Không thể tải dữ liệu xem lại bài kiểm tra.'
            );
            if (parsed.status === 401) {
                navigate('/login', { replace: true });
                return;
            }
            setErrorMessage(parsed.message);
        } finally {
            setIsLoading(false);
        }
    }, [moduleIdParam, attemptIdParam, numericModuleId, numericAttemptId, navigate]);

    useEffect(() => {
        void fetchReview();
    }, [fetchReview]);

    const steps: ExamStep<ModuleTestReviewQuestion>[] = useMemo(() => {
        if (!reviewData?.questions) return [];
        return buildExamSteps(reviewData.questions);
    }, [reviewData]);

    const questionToStepMap = useMemo(() => buildQuestionToStepMap(steps), [steps]);
    const currentStep = steps[currentStepIndex] ?? null;

    const activeOrderNos = useMemo(() => {
        if (!currentStep) return new Set<number>();
        return new Set(currentStep.questions.map((q) => q.orderNo));
    }, [currentStep]);

    const answers = useMemo<Record<number, OptionKey | null>>(() => {
        if (!reviewData?.questions) return {};
        const map: Record<number, OptionKey | null> = {};
        for (const q of reviewData.questions) {
            map[q.orderNo] = q.userAnswer;
        }
        return map;
    }, [reviewData]);

    const reviewQuestionMap = useMemo<Record<number, ExamRevealedInfo>>(() => {
        if (!reviewData?.questions) return {};
        const map: Record<number, ExamRevealedInfo> = {};
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

    const reviewStatusMap = useMemo<Record<number, boolean>>(() => {
        if (!reviewData?.questions) return {};
        const map: Record<number, boolean> = {};
        for (const q of reviewData.questions) {
            map[q.orderNo] = q.isCorrect;
        }
        return map;
    }, [reviewData]);

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

    const handleSelectQuestion = useCallback(
        (orderNo: number) => {
            const targetStep = questionToStepMap.get(orderNo);
            if (targetStep === undefined) return;
            setFocusedOrderNo(orderNo);
            setCurrentStepIndex(targetStep);
        },
        [questionToStepMap]
    );

    const firstOrderNo = currentStep?.questions[0]?.orderNo ?? 1;
    const lastOrderNo = currentStep?.questions[currentStep.questions.length - 1]?.orderNo ?? firstOrderNo;
    const questionLabel =
        currentStep && currentStep.questions.length > 1
            ? `Câu ${firstOrderNo}–${lastOrderNo} / ${reviewData?.totalQuestions ?? 0}`
            : undefined;

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
        questionLabel,
        firstOrderNo,
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
