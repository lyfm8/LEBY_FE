import { z } from 'zod';

export const diagnosticTestSchema = z.object({
  title: z.string().min(1, 'Tiêu đề không được để trống'),
  description: z.string().optional(),
  status: z.boolean(),
  questionIds: z.array(z.number()).min(1, 'Đề thi phải có ít nhất 1 câu hỏi'),
});

export type DiagnosticTestFormValues = z.infer<typeof diagnosticTestSchema>;
