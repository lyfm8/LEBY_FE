import type { ExamExplanation, ExamOption, OptionKey, SectionType } from '@/shared/exam/types/examTypes';

// Nguồn bài thi phát sinh câu hỏi làm sai khớp 100% với enum EMistakeSourceType của Backend
export type MistakeSourceType = 'DIAGNOSTIC' | 'MODULE_TEST' | 'FULL_MOCK_TEST';

// Bảng quy đổi mã nguồn sang nhãn tiếng Việt chuẩn giao diện sản phẩm
export const MISTAKE_SOURCE_LABELS: Record<MistakeSourceType, string> = {
    DIAGNOSTIC: 'Bài thi chẩn đoán',
    MODULE_TEST: 'Bài thi vượt ải',
    FULL_MOCK_TEST: 'Bài thi thử TOEIC',
};

// Nhãn kỹ năng gắn với từng câu hỏi làm sai
export interface MistakeAbilityTag {
    abilityId: number;
    abilityName: string;
}

// Dữ liệu chi tiết 1 câu hỏi làm sai ở chế độ Xem lại trong Sổ tay
export interface MistakeQuestionItem {
    questionId: number;
    parentId: number | null;
    partId: number | null;
    partNo: number;
    partName: string;
    section: SectionType;
    abilities: MistakeAbilityTag[];
    sourceType: MistakeSourceType;
    sourceLabel: string;
    wrongCount: number;
    lastWrongAt: string | null;
    title: string;
    instruction: string | null;
    passage: string | null;
    audioUrl: string | null;
    imageUrl: string | null;
    isGroupQuestion: boolean;
    options: ExamOption[];
    lastUserAnswer: OptionKey | null;
    correctAnswer: OptionKey | null;
    explanation: ExamExplanation | null;
}

// Bộ đếm câu sai theo từng Phần thi (Part 1 - Part 7)
export interface MistakePartCountItem {
    partId: number;
    partName: string;
    count: number;
}

// Bộ đếm câu sai theo từng Kỹ năng
export interface MistakeAbilityCountItem {
    abilityId: number;
    abilityName: string;
    partId: number | null;
    count: number;
}

// Bộ đếm câu sai theo từng Nguồn bài thi
export interface MistakeSourceCountItem {
    sourceType: MistakeSourceType;
    label: string;
    count: number;
}

// Tập tùy chọn bộ lọc trả về từ Backend theo dữ liệu thật của học viên
export interface MistakeFilterOptions {
    parts: MistakePartCountItem[];
    abilities: MistakeAbilityCountItem[];
    sources: MistakeSourceCountItem[];
}

// Dữ liệu phân trang toàn bộ Sổ tay câu hỏi làm sai
export interface MistakeNotebookData {
    totalWrongCount: number;
    filterOptions: MistakeFilterOptions;
    items: MistakeQuestionItem[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
}

// Tham số truy vấn lọc và phân trang gửi lên API Sổ tay câu sai
export interface MistakeQueryParams {
    partId?: number;
    abilityId?: number;
    sourceType?: MistakeSourceType;
    keyword?: string;
    page?: number;
    size?: number;
}

// Dữ liệu 1 câu hỏi trong phiên làm lại (đã ẩn đáp án đúng và lời giải)
export interface MistakeRetryQuestionItem {
    questionId: number;
    orderNo: number;
    parentId: number | null;
    partId: number | null;
    partNo: number;
    partName: string;
    section: SectionType;
    abilities: MistakeAbilityTag[];
    sourceType: MistakeSourceType;
    sourceLabel: string;
    wrongCount: number;
    title: string;
    instruction: string | null;
    passage: string | null;
    audioUrl: string | null;
    imageUrl: string | null;
    isGroupQuestion: boolean;
    options: ExamOption[];
}

// Dữ liệu khởi tạo phiên làm lại nguyên bộ câu hỏi làm sai
export interface MistakeRetrySetData {
    totalAvailable: number;
    sessionSize: number;
    questions: MistakeRetryQuestionItem[];
}

// Một câu trả lời gửi lên khi nộp phiên làm lại
export interface MistakeRetryAnswerPayload {
    questionId: number;
    selectedAnswer: OptionKey | null;
}

// Payload nộp toàn bộ phiên làm lại lên Backend để chấm điểm
export interface SubmitMistakeRetryPayload {
    answers: MistakeRetryAnswerPayload[];
}

// Kết quả chấm chi tiết cho từng câu hỏi sau khi nộp phiên làm lại
export interface MistakeRetryQuestionResult {
    questionId: number;
    selectedAnswer: OptionKey | null;
    correctAnswer: OptionKey | null;
    isCorrect: boolean;
    explanation: ExamExplanation | null;
}

// Kết quả tổng hợp sau khi nộp phiên làm lại bộ câu sai
export interface MistakeRetrySubmitData {
    totalQuestions: number;
    answeredCount: number;
    correctCount: number;
    accuracyPercent: number;
    results: MistakeRetryQuestionResult[];
}
