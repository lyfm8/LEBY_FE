import { z } from 'zod';

/**
 * @file Cấu hình Zod Schema để validate form tạo/sửa Part & Ability
 */

export const partFormSchema = z.object({
  name: z.string().min(2, 'Tên phần thi phải từ 2 ký tự trở lên'),
  description: z.string().optional(),
  sections: z.enum(['LISTENING', 'READING'], {
    error: 'Vui lòng chọn kỹ năng (Listening hoặc Reading)'
  }),
});

export type PartFormValues = z.infer<typeof partFormSchema>;

export const abilityFormSchema = z.object({
  name: z.string().min(2, 'Tên năng lực phải từ 2 ký tự trở lên'),
  description: z.string().optional(),
});

export type AbilityFormValues = z.infer<typeof abilityFormSchema>;
