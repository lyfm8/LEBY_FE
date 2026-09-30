import { z } from 'zod';

export const targetProfileSchema = z.object({
  name: z.string().min(1, 'Tên mục tiêu không được để trống'),
  aimScore: z.number().min(0, 'Điểm mục tiêu phải lớn hơn hoặc bằng 0').max(990, 'Điểm tối đa là 990'),
  description: z.string().optional(),
});

export type TargetProfileFormValues = z.infer<typeof targetProfileSchema>;
