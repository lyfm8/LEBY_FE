export type OptionKey = 'A' | 'B' | 'C' | 'D';
export type SectionType = 'LISTENING' | 'READING';
export type DirectiveType = 'PASS' | 'CONFIRM' | 'WEAK' | 'FULL_PART';
export type AbilityStatus = 'WEAK' | 'DEVELOPING' | 'STABLE';

export interface DiagnosticOption {
    key: OptionKey;
    text: string;
}

export interface DiagnosticQuestion {
    questionId: number;
    orderNo: number;
    partId: number;
    partNo: number;
    partName: string;
    section: SectionType;
    title: string;
    audioUrl?: string | null;
    imageUrl?: string | null;
    passage?: string | null;
    options: DiagnosticOption[];
}

export interface DiagnosticTest {
    testId: number;
    attemptId: number;
    title: string;
    description: string;
    durationMinutes: number;
    totalQuestions: number;
    questions: DiagnosticQuestion[];
}

export interface AnswerItem {
    questionId: number;
    selectedOption: OptionKey | null;
    isFlagged: boolean;
}

export interface SubmitDiagnosticRequest {
    attemptId: number;
    durationSeconds: number;
    answers: {
        questionId: number;
        selectedOption: string | null;
        isFlagged: boolean;
    }[];
}

export interface SubmitDiagnosticResponse {
    attemptId: number;
    redirectUrl: string;
}

export interface PartResult {
    partNo: number;
    name: string;
    score: number;
    maxScore: number;
    directive: DirectiveType;
    directiveLabel: string;
    aiFeedback: string;
}

export interface AbilityRadar {
    code: string;
    name: string;
    score: number; // 0 -> 100
    status: AbilityStatus;
}

export interface SectionScores {
    listening: number;
    reading: number;
    listeningPercent: number;
    readingPercent: number;
}

export interface AiRoadmapSummary {
    radarInsight: string;
    roadmapDays: number;
    focusParts: number[];
    recommendedAction: string;
    secondaryAction: string;
}

export interface DiagnosticResult {
    attemptId: number;
    testTitle: string;
    completedAt: string;
    predictedScore: number;
    targetScore: number;
    totalQuestions: number;
    correctAnswers: number;
    sectionScores: SectionScores;
    partResults: PartResult[];
    abilitiesRadar: AbilityRadar[];
    aiRoadmapSummary: AiRoadmapSummary;
}