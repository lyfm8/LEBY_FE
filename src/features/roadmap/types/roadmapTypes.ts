/**
 * Định nghĩa kiểu dữ liệu cho tính năng Lộ trình học thích ứng (Roadmap & Module Detail).
 * Khớp 100% với cấu trúc Entity Backend: LearningPath, LearningPathItem, Module, Lesson, Part, Ability.
 */

export type ModuleStatus = 'COMPLETED' | 'IN_PROGRESS' | 'UNLOCKED' | 'LOCKED';

export type LearningPathStatus = 'ACTIVE' | 'ARCHIVED' | 'COMPLETED';

export type SectionType = 'LISTENING' | 'READING';

export type LessonType = 'VIDEO' | 'PRACTICE';

export interface ModuleItem {
    id: number;
    learningPathItemId?: number;
    orderNo: number;
    sequence: number;
    title: string;
    description: string;
    partId?: number;
    partName: string;
    section: SectionType;
    abilityId?: number | null;
    abilityName?: string | null;
    reason?: string | null;
    totalLessons: number;
    completedLessons: number;
    progressPercent: number;
    status: ModuleStatus;
    statusLabel: string;
}

export interface RoadmapData {
    learningPathId: number;
    version: number;
    status: LearningPathStatus;
    targetProfileId: number;
    targetScore: number;
    targetDescription?: string | null;
    diagnosticAttemptId?: number | null;
    progressPercent: number;
    totalModules: number;
    completedModules: number;
    modules: ModuleItem[];
}

export interface ModuleLessonItem {
    id: number;
    orderNo: number;
    title: string;
    type: LessonType;
    durationSeconds: number;
    durationText?: string;
    isFree: boolean;
    isCompleted: boolean;
    isLocked: boolean;
    abilityName?: string | null;
    uri?: string;
}

export interface ModuleDetailData {
    moduleId: number;
    title: string;
    partName: string;
    section: SectionType;
    description: string;
    abilityName?: string | null;
    status: ModuleStatus;
    statusLabel: string;
    totalLessons: number;
    completedLessons: number;
    progressPercent: number;
    requiredCompletionRate: number;
    lessons: ModuleLessonItem[];
    moduleTest: {
        id: number;
        title: string;
        description: string;
        passScore: number;
        targetScore: number;
        isUnlocked: boolean;
        totalQuestions: number;
        durationMinutes: number;
    };
}
