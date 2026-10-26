import { z } from 'zod';

export const partThresholdSchema = z.object({
  partId: z.number({ required_error: 'Vui lòng chọn Part' }).min(1, 'Vui lòng chọn Part'),
  targetProfileId: z.number({ required_error: 'Vui lòng chọn Mục tiêu AIM' }).min(1, 'Vui lòng chọn Mục tiêu AIM'),
  passThreshold: z.number().min(0).max(100),
  confirmThreshold: z.number().min(0).max(100),
  weakThreshold: z.number().min(0).max(100),
}).refine(data => data.weakThreshold < data.confirmThreshold, {
  message: 'Ngưỡng Yếu phải nhỏ hơn ngưỡng Xác nhận',
  path: ['weakThreshold']
}).refine(data => data.confirmThreshold < data.passThreshold, {
  message: 'Ngưỡng Xác nhận phải nhỏ hơn ngưỡng Pass',
  path: ['confirmThreshold']
});

export type PartThresholdFormValues = z.infer<typeof partThresholdSchema>;

export const abilityRuleSchema = z.object({
  abilityId: z.number({ required_error: 'Vui lòng chọn Năng lực' }).min(1, 'Vui lòng chọn Năng lực'),
  stableThreshold: z.number().min(0).max(100),
  developingThreshold: z.number().min(0).max(100),
  status: z.enum(['DRAFT', 'PUBLISHED']),
}).refine(data => data.developingThreshold < data.stableThreshold, {
  message: 'Ngưỡng Đang phát triển phải nhỏ hơn ngưỡng Ổn định',
  path: ['developingThreshold']
});

export type AbilityRuleFormValues = z.infer<typeof abilityRuleSchema>;
