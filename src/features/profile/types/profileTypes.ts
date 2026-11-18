/**
 * Định nghĩa kiểu dữ liệu cho tính năng Hồ sơ cá nhân (UC15 & UC16).
 * Khớp 100% với DTO của Backend LEBY_BE.
 */

export type ELearnerType =
    | 'PRIMARY_STUDENT'
    | 'SECONDARY_STUDENT'
    | 'HIGH_SCHOOL_STUDENT'
    | 'UNIVERSITY_STUDENT'
    | 'WORKING'
    | 'OTHER';

export const LEARNER_TYPE_LABELS: Record<ELearnerType, string> = {
    PRIMARY_STUDENT: 'Học sinh Tiểu học',
    SECONDARY_STUDENT: 'Học sinh THCS',
    HIGH_SCHOOL_STUDENT: 'Học sinh THPT',
    UNIVERSITY_STUDENT: 'Sinh viên Đại học',
    WORKING: 'Người đi làm',
    OTHER: 'Khác',
};

export interface UserInfoResponse {
    id: number;
    email: string;
    fullName: string;
    dob: string | null;
    avatar: string | null;
    learnerType: ELearnerType | null;
    role: string;
    createdAt: string;
}

export interface UserTargetResponse {
    targetProfileId: number;
    targetTotalScore: number;
    description: string | null;
    assignedAt: string;
}

export interface UserSkillStatResponse {
    abilityId: number;
    abilityName: string;
    partNo: number | null;
    accuracyRate: number;
    evidenceCount: number;
    status: 'WEAK' | 'DEVELOPING' | 'STABLE' | 'UNCERTAIN';
}

export interface ProfileResponse {
    user: UserInfoResponse;
    target: UserTargetResponse | null;
    skills: UserSkillStatResponse[];
}

export interface UpdateProfileRequest {
    fullName: string;
    dob: string | null;
    avatar?: string | null;
    learnerType?: ELearnerType | null;
}

export interface ChangePasswordRequest {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
}

// Bí danh để tương thích ngược
export type UserProfile = UserInfoResponse;
export type UserTargetInfo = UserTargetResponse;
export type UserSkillStat = UserSkillStatResponse;
export type ProfileData = ProfileResponse;
