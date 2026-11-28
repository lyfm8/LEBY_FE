import type {
    BaseExamQuestion,
    ExamExplanation,
    OptionKey,
    SectionType,
} from '../../../shared/exam/types/examTypes';

/** Một câu hỏi trong Phòng luyện tập tức thì (UC12). */
export interface PracticeRoomQuestion extends BaseExamQuestion {
    practiceQuestionId: number;
    correctAnswer: OptionKey;
    explanation: ExamExplanation | null;
}

/** Toàn bộ payload Phòng luyện tập trả về từ GET /api/users/practice/lessons/:lessonId. */
export interface PracticeRoomData {
    lessonId: number;
    lessonTitle: string;
    moduleId: number;
    moduleTitle: string;
    partName: string;
    section: SectionType;
    abilityName: string | null;
    totalQuestions: number;
    isEmpty: boolean;
    questions: PracticeRoomQuestion[];
}

/** Trạng thái nháp phiên luyện tập lưu cục bộ theo userId + lessonId (hỗ trợ Flag & F5 không mất bài). */
export interface PracticeLocalDraft {
    userId: number;
    answers: Record<number, OptionKey | null>;
    revealedOrderNos: number[];
    flaggedOrderNos: number[];
    currentStepIndex: number;
}

export type PracticeErrorKind =
    | 'NOT_FOUND'
    | 'FORBIDDEN'
    | 'INVALID_TYPE'
    | 'UNAUTHORIZED'
    | 'GENERIC';

export interface PracticeErrorState {
    kind: PracticeErrorKind;
    code?: string;
    message: string;
    status?: number;
}
