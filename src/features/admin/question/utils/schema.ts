import { z } from 'zod';

/**
 * @file Schema validation cho Question form
 */

// Custom validator để kiểm tra chuỗi JSON hợp lệ
const jsonStringValidator = z.string().refine((val) => {
  try {
    JSON.parse(val);
    return true;
  } catch (e) {
    return false;
  }
}, { message: 'Chuỗi JSON không hợp lệ' });

export const questionFormSchema = z.object({
  name: z.string().min(2, 'Tên câu hỏi tối thiểu 2 ký tự'),
  type: z.enum(['SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'FILL_IN_BLANK']),
  difficulty: z.coerce.number().min(1).max(5),
  section: z.enum(['LISTENING', 'READING']),
  partId: z.coerce.number().min(1, 'Vui lòng chọn Part'),
  abilityIds: z.array(z.coerce.number()).min(1, 'Phải chọn ít nhất 1 năng lực'),
  descriptions: z.string().optional().default(''),
  questionData: jsonStringValidator,
  correctAnswer: jsonStringValidator,
});

export type QuestionFormValues = z.infer<typeof questionFormSchema>;
