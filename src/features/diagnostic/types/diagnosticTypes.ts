export type OptionKey = 'A' | 'B' | 'C' | 'D';
export type SectionType = 'LISTENING' | 'READING';
export type DirectiveType = 'PASS' | 'CONFIRM' | 'ABILITY_DIAGNOSTIC' | 'FULL_PART';
export type AbilityStatus = 'WEAK' | 'DEVELOPING' | 'STABLE' | 'UNCERTAIN';

/** Phương án lựa chọn trắc nghiệm của một câu hỏi. */
export interface DiagnosticOption {
    key: OptionKey;
    text: string;
}

/** Dữ liệu câu hỏi trong phòng thi chẩn đoán (đã ẩn đáp án đúng). */
export interface DiagnosticQuestion {
    questionId: number;
    orderNo: number;
    parentId?: number | null;
    partId: number;
    partNo: number;
    partName: string;
    section: SectionType;
    title: string;
    instruction?: string | null;
    audioUrl?: string | null;
    imageUrl?: string | null;
    passage?: string | null;
    isGroupQuestion?: boolean;
    options: DiagnosticOption[];
}

/** Dữ liệu phòng thi chẩn đoán trả về từ Backend (UC06). */
export interface DiagnosticTest {
    testId: number;
    attemptId: number;
    targetProfileId?: number | null;
    title: string;
    description?: string | null;
    durationMinutes: number;
    startedAt?: string;
    remainingSeconds?: number;
    totalQuestions: number;
    questions: DiagnosticQuestion[];
}

/** Payload yêu cầu bắt đầu lượt thi chẩn đoán. */
export interface StartDiagnosticRequest {
    diagnosticTestId?: number;
    targetProfileId?: number;
}

/** Thông tin phiên làm bài trả về khi khởi tạo lượt thi. */
export interface StartDiagnosticResponse {
    attemptId: number;
    diagnosticTestId: number;
    targetProfileId?: number | null;
    startedAt: string;
    durationMinutes: number;
}

/** Đáp án một câu hỏi gửi kèm khi nộp bài chẩn đoán. */
export interface SubmitAnswerPayload {
    questionId: number;
    userAnswer: string | null;
    isFlagged: boolean;
}

/** Payload nộp bài kiểm tra chẩn đoán lên Backend. */
export interface SubmitDiagnosticRequest {
    attemptId: number;
    targetProfileId: number;
    durationSeconds: number;
    answers: SubmitAnswerPayload[];
}

/** Kết quả tóm tắt trả về ngay sau khi nộp bài thành công. */
export interface SubmitDiagnosticResponse {
    attemptId: number;
    totalCorrect: number;
    totalQuestions: number;
    learningPathId?: number | null;
}

/** Thống kê năng lực con thuộc một Part TOEIC (UC07 Luồng 5a). */
export interface PartAbilityBreakdown {
    abilityId: number;
    abilityName: string;
    partNo: number;
    partName: string;
    correctCount: number;
    totalCount: number;
    accuracyPercent: number;
    status: AbilityStatus;
}

/** Kết quả từng Part trong báo cáo UC07. */
export interface PartResult {
    partId: number;
    partNo: number;
    name: string;
    correctCount: number;
    totalQuestions: number;
    score: number;
    maxScore: number;
    directive: DirectiveType;
    directiveLabel: string;
    aiFeedback: string;
    abilities: PartAbilityBreakdown[];
}

/** Một trục trên Biểu đồ Radar 7 chiều (UC07). */
export interface AbilityRadar {
    partNo: number;
    code: string;
    name: string;
    score: number;
    status: AbilityStatus;
}

/** Điểm số quy đổi và tỷ lệ đúng theo hai kỹ năng Listening / Reading. */
export interface SectionScores {
    listening: number;
    reading: number;
    listeningCorrect: number;
    listeningTotal: number;
    readingCorrect: number;
    readingTotal: number;
    listeningPercent: number;
    readingPercent: number;
}

/** Tổng hợp khuyến nghị sư phạm và lộ trình theo AIM. */
export interface AiRoadmapSummary {
    radarInsight: string;
    focusParts: number[];
    moduleCount: number;
    recommendedAction: string;
    secondaryAction: string;
}

/** Báo cáo kết quả chẩn đoán chi tiết toàn diện phục vụ UC07. */
export interface DiagnosticResult {
    attemptId: number;
    testTitle: string;
    completedAt: string;
    learningPathId?: number | null;
    predictedScore: number;
    targetScore?: number | null;
    totalQuestions: number;
    correctAnswers: number;
    durationSeconds?: number | null;
    sectionScores: SectionScores;
    partResults: PartResult[];
    abilitiesRadar: AbilityRadar[];
    weakAbilities: PartAbilityBreakdown[];
    passedParts: string[];
    aiRoadmapSummary: AiRoadmapSummary;
}
