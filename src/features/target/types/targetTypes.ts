export interface TargetProfile {
    id: number;
    targetTotalScore: number;
    level: string;
    description: string;
    status: boolean;
    isRecommended?: boolean;
}

export interface SelectTargetRequest {
    targetProfileId: number;
}

export interface SelectTargetResponse {
    planId: number;
    userId: number;
    targetProfileId: number;
    targetTotalScore: number;
}