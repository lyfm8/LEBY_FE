export interface PartEvaluation {
    partNo: number;
    name: string;
    section: 'LISTENING' | 'READING';
    scorePercent: number;
    status: 'PASS' | 'CONFIRM' | 'WEAK';
}

export interface RecentActivity {
    id: number;
    title: string;
    subtitle: string;
    type: 'PRACTICE' | 'VIDEO' | 'TEST';
}

export interface NextModuleItem {
    id: number;
    moduleId: number;
    sequence: number;
    title: string;
    description: string;
    section: 'Listening' | 'Reading';
    status: 'IN_PROGRESS' | 'UNLOCKED' | 'LOCKED';
    statusLabel: string;
}

export interface DashboardSummary {
    greeting: string;
    user: {
        fullName: string;
        targetScore: number;
        avatar: string | null;
        role: string;
    };
    stats: {
        predictedScore: number;
        scoreDiff: number;
        streakDays: number;
        weeklyHours: number;
        completedModules: number;
        totalModules: number;
    };
    partEvaluations: PartEvaluation[];
    recentActivities: RecentActivity[];
    nextModules: NextModuleItem[];
}
