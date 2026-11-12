import { z } from 'zod';

export const moduleFormSchema = z.object({
  title: z.string().min(2, 'Tên Module tối thiểu 2 ký tự').max(200, 'Tên Module tối đa 200 ký tự'),
  type: z.enum(['THEORY', 'PRACTICE', 'EXAM']),
  sequence: z.number().min(1, 'Thứ tự phải lớn hơn hoặc bằng 1'),
  status: z.enum(['PUBLISHED', 'DRAFT', 'ARCHIVED']),
  defaultPassScore: z.number().min(50, 'Điểm đỗ tối thiểu là 50').max(100, 'Điểm đỗ tối đa là 100'),
  requiredCompletionRate: z.number().min(50, 'Tỷ lệ hoàn thành tối thiểu là 50%').max(100, 'Tỷ lệ hoàn thành tối đa là 100%'),
  descriptions: z.string().optional(),
  partId: z.number().nullable().optional(),
  abilityIds: z.array(z.number()).optional(),
});

export type ModuleFormValues = z.infer<typeof moduleFormSchema>;

export const lessonFormSchema = z.object({
  title: z.string().min(2, 'Tên bài học tối thiểu 2 ký tự').max(200, 'Tên bài học tối đa 200 ký tự'),
  orderNo: z.number().min(1, 'Thứ tự phải lớn hơn hoặc bằng 1'),
  status: z.enum(['PUBLISHED', 'DRAFT', 'ARCHIVED']),
  lessonType: z.enum(['VIDEO', 'PRACTICE']),
  durationSeconds: z.number().min(0, 'Thời lượng không được âm').max(86400, 'Tối đa 24 giờ'),
  abilityId: z.number().nullable().optional(),
  isFree: z.boolean().optional(),
  descriptions: z.string().optional(),
  audioUrl: z.string().optional(),
  videoUrl: z.string().optional(),
  imageUrl: z.string().optional(),
});

export type LessonFormValues = z.infer<typeof lessonFormSchema>;

export const scriptItemSchema = z.object({
  id: z.number().optional(),
  orderNo: z.number().min(1),
  startTime: z.string().min(1, 'Thời điểm bắt đầu không được để trống'),
  endTime: z.string().min(1, 'Thời điểm kết thúc không được để trống'),
  speaker: z.string().optional(),
  contentEn: z.string().min(1, 'Nội dung tiếng Anh không được để trống'),
  contentVi: z.string().optional(),
});

export type ScriptItemValues = z.infer<typeof scriptItemSchema>;
