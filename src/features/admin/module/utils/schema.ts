import { z } from 'zod';

export const moduleFormSchema = z.object({
  title: z.string().min(2, 'Tên module quá ngắn'),
  type: z.enum(['THEORY', 'PRACTICE', 'EXAM']),
  sequence: z.coerce.number().min(1, 'Thứ tự phải lớn hơn 0'),
  status: z.enum(['PUBLISHED', 'DRAFT', 'ARCHIVED']),
  partId: z.coerce.number().optional().nullable(),
});

export type ModuleFormValues = z.infer<typeof moduleFormSchema>;

export const lessonFormSchema = z.object({
  title: z.string().min(2, 'Tên bài học quá ngắn'),
  orderNo: z.number().min(1, 'Thứ tự phải lớn hơn 0'),
  status: z.enum(['PUBLISHED', 'DRAFT', 'ARCHIVED']),
  abilityId: z.number().nullable().optional(),
  descriptions: z.string().optional(),
  audioUrl: z.string().url('URL không hợp lệ').optional().or(z.literal('')),
  videoUrl: z.string().url('URL không hợp lệ').optional().or(z.literal('')),
  imageUrl: z.string().url('URL không hợp lệ').optional().or(z.literal('')),
});

export type LessonFormValues = z.infer<typeof lessonFormSchema>;
