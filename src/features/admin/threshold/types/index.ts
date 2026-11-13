/**
 * Type definitions cho Module Cấu hình Ngưỡng & Quy tắc Đánh giá (A08 & A10).
 * Tuân thủ quy chuẩn leby-anticonflict.md về chuẩn tên trường DTO.
 */

// =========================================================================
// A08: CẤU HÌNH NGƯỠNG ĐÁNH GIÁ PART THEO AIM
// =========================================================================

export interface PartThresholdRow {
  id: number | null;
  partId: number;
  partName: string;
  partNo: number;
  section: 'LISTENING' | 'READING' | null;
  passScore: number | null;        // Mốc 2: Đạt chuẩn (>= passScore -> Miễn học)
  confirmingScore: number | null;  // Mốc 1: Cận chuẩn (confirmingScore <= x < passScore -> Soi Ability)
                                   // < confirmingScore -> Mất gốc (Weak)
}

export interface AimPartThresholdMatrix {
  targetProfileId: number;
  aimScore: number;
  aimDescription?: string;
  rows: PartThresholdRow[];
}

export interface SavePartThresholdsBatchRequest {
  targetProfileId: number;
  thresholds: {
    partId: number;
    passScore: number | null;
    confirmingScore: number | null;
  }[];
}

// =========================================================================
// A10: CẤU HÌNH QUY TẮC ĐÁNH GIÁ NĂNG LỰC THEO AIM
// =========================================================================

export interface AbilityRuleRow {
  id: number | null;
  abilityId: number;
  abilityName: string;
  abilityDescription?: string;
  partId: number | null;
  partName: string | null;
  section: 'LISTENING' | 'READING' | null;
  stableMin: number | null;        // Mốc duy nhất: >= stableMin -> Stable (Miễn), < stableMin -> Weak (Bốc module)
}

export interface AimAbilityRuleMatrix {
  targetProfileId: number;
  aimScore: number;
  aimDescription?: string;
  rows: AbilityRuleRow[];
}

export interface SaveAbilityRulesBatchRequest {
  targetProfileId: number;
  rules: {
    abilityId: number;
    stableMin: number | null;
  }[];
}

// =========================================================================
// KIỂM TRA HỢP LỆ
// =========================================================================

export interface ThresholdValidationResult {
  valid: boolean;
  errors: string[];
}
