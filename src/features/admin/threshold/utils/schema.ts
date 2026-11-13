import { z } from 'zod';

/**
 * Validation schema cho từng dòng Ngưỡng Part (A08).
 * Quy tắc: 0 <= confirmingScore < passScore <= 100
 */
export const partThresholdRowSchema = z
  .object({
    partId: z.number().min(1, 'Part không hợp lệ'),
    passScore: z
      .number({ message: 'Vui lòng nhập số' })
      .min(0, 'Ngưỡng Đạt chuẩn tối thiểu 0%')
      .max(100, 'Ngưỡng Đạt chuẩn tối đa 100%'),
    confirmingScore: z
      .number({ message: 'Vui lòng nhập số' })
      .min(0, 'Ngưỡng Cận chuẩn tối thiểu 0%')
      .max(100, 'Ngưỡng Cận chuẩn tối đa 100%'),
  })
  .refine((data) => data.confirmingScore < data.passScore, {
    message: 'Ngưỡng Cận chuẩn (Confirm) phải nhỏ hơn Ngưỡng Đạt chuẩn (Pass)',
    path: ['confirmingScore'],
  });

export type PartThresholdRowValues = z.infer<typeof partThresholdRowSchema>;

/**
 * Validation schema cho từng dòng Quy tắc Năng lực (A10).
 * Quy tắc: 0 < stableMin <= 100
 */
export const abilityRuleRowSchema = z.object({
  abilityId: z.number().min(1, 'Năng lực không hợp lệ'),
  stableMin: z
    .number({ message: 'Vui lòng nhập số' })
    .min(1, 'Ngưỡng tối thiểu là 1%')
    .max(100, 'Ngưỡng tối đa là 100%'),
});

export type AbilityRuleRowValues = z.infer<typeof abilityRuleRowSchema>;
