export type OptionKey = 'A' | 'B' | 'C' | 'D';
export type SectionType = 'LISTENING' | 'READING';
export type ExamRoomMode = 'EXAM' | 'PRACTICE' | 'REVIEW';
export type ExamAudioPolicy = 'ONCE' | 'UNLIMITED';

/** Phương án lựa chọn trắc nghiệm của một câu hỏi TOEIC. */
export interface ExamOption {
    key: OptionKey;
    text: string;
}

/** Một mục từ vựng trọng tâm trong lời giải chi tiết câu hỏi TOEIC. */
export interface ExamVocabularyItem {
    word: string;
    type: string;
    meaning: string;
}

/** Nội dung giải thích chi tiết của một câu hỏi. */
export interface ExamExplanation {
    transcript?: string | null;
    translation?: string | null;
    clue?: string | null;
    analysis?: string | null;
    vocabulary?: ExamVocabularyItem[] | null;
}

/** Cấu trúc câu hỏi nền dùng chung cho Diagnostic, Module Test và Practice Room. */
export interface BaseExamQuestion {
    questionId: number;
    orderNo: number;
    parentId?: number | null;
    partId?: number | null;
    partNo: number;
    partName: string;
    section: SectionType;
    title: string;
    instruction?: string | null;
    audioUrl?: string | null;
    imageUrl?: string | null;
    passage?: string | null;
    isGroupQuestion?: boolean;
    options: ExamOption[];
}

/** Dữ liệu đáp án đúng và lời giải cho câu hỏi đã được chấm / kiểm tra. */
export interface ExamRevealedInfo {
    userAnswer: OptionKey | null;
    correctAnswer: OptionKey | null;
    isCorrect: boolean;
    explanation: ExamExplanation | null;
}

/** Một màn hình hiển thị trong phòng thi/luyện tập (1 câu đơn hoặc 1 chùm câu cùng parentId). */
export interface ExamStep<TQuestion extends BaseExamQuestion = BaseExamQuestion> {
    stepIndex: number;
    section: SectionType;
    partNo: number;
    partName: string;
    audioKey: string | null;
    audioUrl: string | null;
    imageUrl: string | null;
    passage: string | null;
    instruction: string | null;
    questions: TQuestion[];
}
