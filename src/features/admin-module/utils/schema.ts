import { z } from 'zod';

export const moduleFormSchema = z.object({
  title: z.string().min(2, 'Tên module quá ngắn'),
  type: z.enum(['THEORY', 'PRACTICE', 'EXAM']),
  sequence: z.coerce.number().min(1, 'Thứ tự phải lớn hơn 0'),
  status: z.enum(['PUBLISHED', 'DRAFT', 'ARCHIVED']),
  partId: z.coerce.number().optional().nullable(),
});

export type ModuleFormValues = z.infer<typeof moduleFormSchema>;

export const videoLessonFormSchema = z.object({
  title: z.string().min(2, 'Tên bài học quá ngắn'),
  orderNo: z.coerce.number().min(1),
  status: z.enum(['PUBLISHED', 'DRAFT', 'ARCHIVED']),
  abilityId: z.coerce.number().optional().nullable(),
  descriptions: z.string().optional(),
  uri: z.string().url('URL không hợp lệ'),
  durationSeconds: z.coerce.number().min(1, 'Thời lượng phải lớn hơn 0'),
});

export type VideoLessonFormValues = z.infer<typeof videoLessonFormSchema>;

export const practiceLessonFormSchema = z.object({
  title: z.string().min(2, 'Tên bài học quá ngắn'),
  orderNo: z.coerce.number().min(1),
  status: z.enum(['PUBLISHED', 'DRAFT', 'ARCHIVED']),
  abilityId: z.coerce.number().optional().nullable(),
  descriptions: z.string().optional(),
  instructions: z.string().optional(),
  questionIds: z.array(z.number()).min(1, 'Vui lòng chọn ít nhất 1 câu hỏi'),
});

export type PracticeLessonFormValues = z.infer<typeof practiceLessonFormSchema>;
