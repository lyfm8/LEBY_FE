export interface UserProfile {
    id: number;
    username: string;
    email: string;
    fullName: string;
    dob: string | null;
    avatar: string | null;
    learnerType: string;
    role: string;
    createdAt: string;
}

export interface UserTargetInfo {
    planId: number;
    targetTotalScore: number;
    level: string;
    createdAt: string;
}

export interface UserSkillStat {
    code: string;
    name: string;
    partNo: number;
    accuracyRate: number;
    evidenceCount: number;
    status: 'WEAK' | 'DEVELOPING' | 'STABLE';
}

export interface ProfileData {
    user: UserProfile;
    target: UserTargetInfo;
    skills: UserSkillStat[];
    learningSummary: {
        totalHours: number;
        streakDays: number;
        completedModules: number;
        totalModules: number;
    };
}

export interface UpdateProfileRequest {
    fullName?: string;
    dob?: string | null;
    learnerType?: string;
}

export interface ChangePasswordRequest {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
}
