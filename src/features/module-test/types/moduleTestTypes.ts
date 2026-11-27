import type {
    BaseExamQuestion,
    ExamExplanation,
    OptionKey,
    SectionType,
} from '../../../shared/exam/types/examTypes';

export type { OptionKey, SectionType };

export interface ModuleTestRoomQuestion extends BaseExamQuestion {
    moduleTestQuestionId: number | null;
}

export interface ModuleTestDraftAnswer {
    orderNo: number;
    questionId: number;
    selectedOption: OptionKey | null;
    isFlagged: boolean;
}

export interface StartModuleTestResponse {
    attemptId: number;
    moduleId: number;
    startedAt: string;
    durationMinutes: number;
}

export interface ModuleTestRoomData {
    attemptId: number;
    moduleId: number;
    moduleTitle: string;
    partName: string;
    section: SectionType | string;
    topic: string | null;
    passScore: number;
    targetScore: number | null;
    durationMinutes: number;
    startedAt: string;
    remainingSeconds: number;
    totalQuestions: number;
    questions: ModuleTestRoomQuestion[];
    draftAnswers: ModuleTestDraftAnswer[];
}

export interface SaveModuleTestDraftAnswerItem {
    questionId: number;
    selectedOption: OptionKey | null;
    isFlagged: boolean;
}

export interface SaveModuleTestDraftRequest {
    attemptId: number;
    answers: SaveModuleTestDraftAnswerItem[];
}

export interface SyncModuleTestTimerRequest {
    attemptId: number;
    remainingSeconds: number;
}

export interface SubmitModuleTestAnswerItem {
    questionId: number;
    userAnswer: string | null;
    isFlagged: boolean;
}

export interface SubmitModuleTestRequest {
    attemptId: number;
    durationSeconds: number;
    isTimedOut: boolean;
    answers: SubmitModuleTestAnswerItem[];
}

export interface SubmitModuleTestResponse {
    attemptId: number;
    moduleId: number;
    score: number;
    passScore: number;
    isPassed: boolean;
    correctCount: number;
    totalQuestions: number;
    nextModuleId: number | null;
    isRoadmapCompleted: boolean;
}

export interface ModuleTestReviewQuestion extends BaseExamQuestion {
    userAnswer: OptionKey | null;
    correctAnswer: OptionKey | null;
    isCorrect: boolean;
    isFlagged: boolean;
    explanation: ExamExplanation | null;
}

export interface ModuleTestReviewData {
    attemptId: number;
    moduleId: number;
    moduleTitle: string;
    testTitle: string;
    completedAt: string | null;
    score: number;
    passScore: number;
    isPassed: boolean;
    totalQuestions: number;
    correctCount: number;
    questions: ModuleTestReviewQuestion[];
}

export interface AiFeedback {
    title: string;
    content: string;
}

export interface MetricSummary {
    accuracyRate: number;
    correctAnswers: number;
    totalQuestions: number;
    durationFormatted: string;
    speedComparison: string;
    competencyStatus: string;
    gapResolvedPercent: number;
}

export interface AttemptHistoryItem {
    attemptNumber: number;
    attemptId: number;
    isLatest: boolean;
    completedAt: string;
    score: number;
    maxScore: number;
    isPassed: boolean;
    durationFormatted: string;
}

export interface ModuleTestPerformanceReport {
    attemptId: number;
    moduleId: number;
    moduleTitle: string;
    completedAt: string;
    score: number;
    maxScore: number;
    passScore: number;
    isPassed: boolean;
    diffFromPass: number;
    aiFeedback: AiFeedback;
    metrics: MetricSummary;
    history: AttemptHistoryItem[];
    nextModuleId: number | null;
    isRoadmapCompleted: boolean;
}

export type ModuleTestBlockedKind =
    | 'PREREQUISITE'
    | 'NOT_CONFIGURED'
    | 'CONTENT_LOCKED'
    | 'ALREADY_SUBMITTED'
    | 'NOT_FOUND'
    | 'GENERIC';

export interface ModuleTestBlockedState {
    kind: ModuleTestBlockedKind;
    code?: string;
    message: string;
    status?: number;
}
