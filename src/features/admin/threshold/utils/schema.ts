import { z } from 'zod';

/**
 * Schema validation cho Form Quy tắc đánh giá Năng lực (AbilityEvaluationRule).
 * Tuân thủ mô hình nhị phân 2 mốc cắt: weakMax (CONFIRM) và stableMin (WEAK).
 */
export const abilityRuleSchema = z.object({
  abilityId: z.number({ message: 'Vui lòng chọn Năng lực' }).min(1, 'Vui lòng chọn Năng lực'),
  weakMax: z.number({ message: 'Vui lòng nhập ngưỡng Yếu' })
    .min(0, 'Ngưỡng Yếu tối thiểu là 0%')
    .max(100, 'Ngưỡng Yếu tối đa là 100%'),
  stableMin: z.number({ message: 'Vui lòng nhập ngưỡng Vững vàng' })
    .min(0, 'Ngưỡng Vững vàng tối thiểu là 0%')
    .max(100, 'Ngưỡng Vững vàng tối đa là 100%'),
  minEvidenceCount: z.number({ message: 'Vui lòng nhập số câu hỏi kiểm chứng' })
    .min(1, 'Tối thiểu 1 câu hỏi kiểm chứng')
    .max(50, 'Tối đa 50 câu hỏi kiểm chứng'),
}).refine(data => data.weakMax <= data.stableMin, {
  message: 'Ngưỡng Yếu (weakMax) không được vượt quá ngưỡng Vững vàng (stableMin)',
  path: ['weakMax'],
});

export type AbilityRuleFormValues = z.infer<typeof abilityRuleSchema>;

/**
 * Schema validation cho Form Ngưỡng điểm phần thi (TargetPartThreshold).
 * Ràng buộc thứ tự sư phạm: fullPartThreshold <= confirmingScore <= passScore.
 */
export const partThresholdSchema = z.object({
  partId: z.number({ message: 'Vui lòng chọn Part' }).min(1, 'Vui lòng chọn Part'),
  targetProfileId: z.number({ message: 'Vui lòng chọn Mục tiêu AIM' }).min(1, 'Vui lòng chọn Mục tiêu AIM'),
  passScore: z.number({ message: 'Vui lòng nhập điểm đạt chuẩn' })
    .min(0, 'Điểm đạt chuẩn tối thiểu là 0%')
    .max(100, 'Điểm đạt chuẩn tối đa là 100%'),
  confirmingScore: z.number({ message: 'Vui lòng nhập điểm cận chuẩn' })
    .min(0, 'Điểm cận chuẩn tối thiểu là 0%')
    .max(100, 'Điểm cận chuẩn tối đa là 100%')
    .nullable()
    .optional(),
  fullPartThreshold: z.number({ message: 'Vui lòng nhập điểm mất gốc' })
    .min(0, 'Điểm mất gốc tối thiểu là 0%')
    .max(100, 'Điểm mất gốc tối đa là 100%')
    .nullable()
    .optional(),
}).refine(data => {
  if (data.confirmingScore != null && data.passScore != null) {
    return data.confirmingScore <= data.passScore;
  }
  return true;
}, {
  message: 'Điểm cận chuẩn (confirmingScore) không được lớn hơn điểm đạt chuẩn (passScore)',
  path: ['confirmingScore'],
}).refine(data => {
  if (data.fullPartThreshold != null && data.confirmingScore != null) {
    return data.fullPartThreshold <= data.confirmingScore;
  }
  return true;
}, {
  message: 'Điểm mất gốc (fullPartThreshold) không được lớn hơn điểm cận chuẩn (confirmingScore)',
  path: ['fullPartThreshold'],
}).refine(data => {
  if (data.fullPartThreshold != null && data.passScore != null) {
    return data.fullPartThreshold <= data.passScore;
  }
  return true;
}, {
  message: 'Điểm mất gốc (fullPartThreshold) không được lớn hơn điểm đạt chuẩn (passScore)',
  path: ['fullPartThreshold'],
});

export type PartThresholdFormValues = z.infer<typeof partThresholdSchema>;
