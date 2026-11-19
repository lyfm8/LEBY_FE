/**
 * Data contracts cho Quản lý Ngưỡng điểm đỗ Module, Quy tắc Đánh giá Năng lực (Ability)
 * và Ngưỡng điểm Part Diagnostic theo từng mốc AIM.
 */

// =============================================================================
// 1. MODULE TARGET THRESHOLD (MA TRẬN ĐIỂM ĐỖ MODULE THEO AIM)
// =============================================================================

export interface ModuleTargetThresholdResponse {
  id: number;
  moduleId: number;
  moduleTitle: string;
  targetProfileId: number;
  targetProfileScore: number;
  targetProfileName: string;
  passScore: number;
}

export interface ModuleThresholdMatrixRowResponse {
  moduleId: number;
  moduleTitle: string;
  moduleSequence: number;
  partId?: number | null;
  partName?: string | null;
  defaultPassScore: number;
  thresholds: Record<string, number>; // key: targetProfileId string, value: passScore
  isCustom: Record<string, boolean>;  // key: targetProfileId string, value: true nếu có bản ghi ghi đè
}

export interface ModuleThresholdMatrixResponse {
  profileIds: number[];
  profileScores: number[];
  profileNames: string[];
  rows: ModuleThresholdMatrixRowResponse[];
}

export interface ModuleThresholdItemDto {
  moduleId: number;
  targetProfileId: number;
  passScore: number | null;
}

export interface BatchUpdateModuleThresholdRequest {
  items: ModuleThresholdItemDto[];
}

// =============================================================================
// 2. ABILITY EVALUATION RULE (QUY TẮC ĐÁNH GIÁ NĂNG LỰC NHỊ PHÂN)
// =============================================================================

export interface AbilityEvaluationRuleResponse {
  id: number;
  abilityId: number;
  abilityName: string;
  partId?: number | null;
  partName?: string | null;
  stableMin: number;      // Mốc sàn vùng Vững vàng (mẫu 75.0%), dùng làm cutoff khi Part là WEAK
  developingMax: number;  // = stableMin (thuộc tính phái sinh)
  weakMax: number;        // Mốc trần vùng Yếu (mẫu 50.0%), dùng làm cutoff khi Part là CONFIRM
  minEvidenceCount: number;
}

export interface CreateAbilityEvaluationRuleRequest {
  abilityId: number;
  stableMin: number;
  weakMax: number;
  minEvidenceCount: number;
}

export interface UpdateAbilityEvaluationRuleRequest {
  stableMin: number;
  weakMax: number;
  minEvidenceCount: number;
}

// =============================================================================
// 3. TARGET PART THRESHOLD (NGƯỠNG ĐIỂM PART DIAGNOSTIC THEO AIM)
// =============================================================================

export interface TargetPartThresholdResponse {
  id: number;
  targetProfileId: number;
  targetProfileScore: number;
  targetProfileName: string;
  partId: number;
  partName: string;
  passScore: number;           // Level 3 - PASS: Miễn học cả Part (mẫu 80%)
  confirmingScore?: number | null; // Level 2 - CONFIRM: Soi Tầng 2 với developingThreshold (mẫu 60%)
  fullPartThreshold?: number | null; // Level 1 - FULL_PART: Mất gốc bốc cả Part (mẫu 35%)
}

export interface CreateTargetPartThresholdRequest {
  targetProfileId: number;
  partId: number;
  passScore: number;
  confirmingScore?: number | null;
  fullPartThreshold?: number | null;
}

export interface UpdateTargetPartThresholdRequest {
  passScore: number;
  confirmingScore?: number | null;
  fullPartThreshold?: number | null;
}
