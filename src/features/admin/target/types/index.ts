export interface TargetProfileResponse {
  id: number;
  aimScore: number;
  description: string;
  totalUsers: number;
}

export interface CreateTargetProfileRequest {
  aimScore: number;
  description?: string;
}

export interface ThresholdMatrixRow {
  moduleId: number;
  moduleTitle: string;
  thresholds: Record<string, number>;
}

export interface ThresholdMatrixResponse {
  profileIds: number[];
  profileScores: number[];
  rows: ThresholdMatrixRow[];
}

export interface BatchUpdateThresholdItem {
  moduleId: number;
  targetProfileId: number;
  passThreshold: number;
}

export interface BatchUpdateThresholdRequest {
  items: BatchUpdateThresholdItem[];
}
