export type TestOptionKey = 'A' | 'B' | 'C' | 'D';

export interface ModuleTestOption {
    key: TestOptionKey;
    text: string;
}

export interface ModuleTestQuestion {
    questionId: number;
    orderNo: number;
    partNo: number;
    title: string;
    options: ModuleTestOption[];
}

export interface ModuleTestData {
    testId: number;
    moduleId: number;
    moduleTitle: string;
    topic: string;
    currentAIM: number;
    passScore: number;
    durationMinutes: number;
    totalQuestions: number;
    questions: ModuleTestQuestion[];
}

export interface SubmitModuleTestRequest {
    attemptId?: number;
    moduleId: number;
    durationSeconds: number;
    answers: {
        questionId: number;
        selectedOption: TestOptionKey | null;
    }[];
}

export interface DetailedAnswerReview {
    questionId: number;
    orderNo: number;
    questionTitle: string;
    selectedOption: TestOptionKey | null;
    correctOption: TestOptionKey;
    isCorrect: boolean;
    explanation: string;
    options: ModuleTestOption[];
}

export interface ModuleTestResult {
    attemptId: number;
    moduleId: number;
    moduleTitle: string;
    score: number;
    passScore: number;
    isPassed: boolean;
    correctCount: number;
    totalQuestions: number;
    completedAt: string;
    detailedAnswers: DetailedAnswerReview[];
    nextModuleId?: number | null;
}

// ── Báo cáo kết quả kiểm tra học tập (Learning Performance Report) ──
export interface AttemptHistoryItem {
    attemptNumber: number;
    isLatest: boolean;
    completedAt: string;
    score: number;
    maxScore: number;
    isPassed: boolean;
    durationFormatted: string;
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

export interface AIFeedback {
    title: string;
    content: string;
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
    aiFeedback: AIFeedback;
    metrics: MetricSummary;
    history: AttemptHistoryItem[];
    nextModuleId?: number | null;
}
