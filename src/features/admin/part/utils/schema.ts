import { z } from 'zod';

/**
 * @file Cấu hình Zod Schema để validate form tạo/sửa Ability
 */

export const abilityFormSchema = z.object({
  name: z.string().min(3, 'Tên năng lực phải từ 3 ký tự trở lên'),
  description: z.string().min(5, 'Mô tả quá ngắn'),
  status: z.enum(['PUBLISHED', 'DRAFT', 'ARCHIVED']),
});

export type AbilityFormValues = z.infer<typeof abilityFormSchema>;
