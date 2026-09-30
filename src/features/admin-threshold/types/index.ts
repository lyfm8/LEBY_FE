export interface TargetPartThresholdResponse {
  id: number;
  partId: number;
  partName: string;
  targetProfileId: number;
  aimName: string;
  passThreshold: number;
  confirmThreshold: number;
  weakThreshold: number;
}

export interface CreatePartThresholdRequest {
  partId: number;
  targetProfileId: number;
  passThreshold: number;
  confirmThreshold: number;
  weakThreshold: number;
}

export interface AbilityEvaluationRuleResponse {
  id: number;
  abilityId: number;
  abilityName: string;
  stableThreshold: number;
  developingThreshold: number;
  status: 'DRAFT' | 'PUBLISHED';
}

export interface CreateAbilityRuleRequest {
  abilityId: number;
  stableThreshold: number;
  developingThreshold: number;
  status: 'DRAFT' | 'PUBLISHED';
}
