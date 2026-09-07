export interface PracticeQuestion {
    id: number;
    orderNo: number;
    title: string;
    options: {
        key: 'A' | 'B' | 'C' | 'D';
        text: string;
    }[];
    correctAnswer: 'A' | 'B' | 'C' | 'D';
    explanation: string;
}

export interface LessonDetail {
    id: number;
    moduleId: number;
    moduleTitle: string;
    title: string;
    type: 'VIDEO' | 'PRACTICE';
    durationSeconds: number;
    videoUrl?: string;
    instructions?: string;
    description?: string;
    practiceQuestions?: PracticeQuestion[];
    nextLessonId?: number | null;
    prevLessonId?: number | null;
}

export interface CompleteLessonResponse {
    lessonId: number;
    isCompleted: boolean;
    nextLessonId?: number | null;
}
