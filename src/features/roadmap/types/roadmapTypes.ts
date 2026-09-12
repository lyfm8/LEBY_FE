export type ModuleStatus = 'COMPLETED' | 'IN_PROGRESS' | 'LOCKED';

export interface ModuleItem {
    id: number;
    orderNo: number;
    title: string;
    description: string;
    section: 'LISTENING' | 'READING';
    totalLessons: number;
    completedLessons: number;
    progressPercent: number;
    status: ModuleStatus;
    statusLabel: string;
}

export interface RoadmapData {
    learningPathId: number;
    version: number;
    targetScore: number;
    progressPercent: number;
    modules: ModuleItem[];
}

export interface ModuleLessonItem {
    id: number;
    orderNo: number;
    title: string;
    type: 'VIDEO' | 'PRACTICE';
    durationText: string;
    isCompleted: boolean;
    isLocked: boolean;
    uri?: string;
}

export interface ModuleDetailData {
    moduleId: number;
    title: string;
    partName: string;
    description: string;
    status: ModuleStatus;
    statusLabel: string;
    totalLessons: number;
    completedLessons: number;
    progressPercent: number;
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
