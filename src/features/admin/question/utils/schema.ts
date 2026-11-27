import { z } from 'zod';

export const optionSchema = z.object({
    key: z.string().min(1, 'Nhãn không được trống'),
    text: z.string().default(''),
});

export const vocabularySchema = z.object({
    word: z.string().default(''),
    type: z.string().default(''),
    meaning: z.string().default(''),
});

export const explanationSchema = z.object({
    transcript: z.string().default(''),
    translation: z.string().default(''),
    clue: z.string().default(''),
    analysis: z.string().default(''),
    vocabulary: z.array(vocabularySchema).default([]),
});

const defaultExplanation = {
    transcript: '',
    translation: '',
    clue: '',
    analysis: '',
    vocabulary: [],
};

export const standaloneQuestionSchema = z
    .object({
        name: z.string().min(2, 'Tên câu hỏi tối thiểu 2 ký tự').max(200, 'Tên tối đa 200 ký tự'),
        partId: z.coerce.number().min(1, 'Vui lòng chọn Part'),
        abilityIds: z.array(z.number()).min(1, 'Cần chọn ít nhất 1 kỹ năng (Ability)'),
        difficulty: z.coerce.number().min(1).max(5),
        text: z.string().default(''),
        options: z.array(optionSchema).min(3, 'Tối thiểu 3 đáp án').max(4, 'Tối đa 4 đáp án'),
        correctKey: z.string().min(1, 'Vui lòng chọn đáp án đúng'),
        explanation: explanationSchema.default(defaultExplanation),
        descriptions: z.string().default(''),
    })
    .refine((data) => data.options.some((opt) => opt.key.toUpperCase() === data.correctKey.toUpperCase()), {
        message: 'Đáp án đúng phải là một trong các phương án đã nhập',
        path: ['correctKey'],
    });

export type StandaloneQuestionFormValues = z.infer<typeof standaloneQuestionSchema>;

export const groupItemSchema = z
    .object({
        id: z.number().optional(),
        name: z.string().min(2, 'Tên câu con tối thiểu 2 ký tự').max(200),
        orderNo: z.number().optional(),
        text: z.string().default(''),
        options: z.array(optionSchema).min(3, 'Tối thiểu 3 đáp án').max(4, 'Tối đa 4 đáp án'),
        correctKey: z.string().min(1, 'Vui lòng chọn đáp án đúng cho câu hỏi này'),
        abilityIds: z.array(z.number()).min(1, 'Chọn ít nhất 1 kỹ năng'),
        difficulty: z.coerce.number().min(1).max(5),
        explanation: explanationSchema.default(defaultExplanation),
    })
    .refine((data) => data.options.some((opt) => opt.key.toUpperCase() === data.correctKey.toUpperCase()), {
        message: 'Đáp án đúng phải là một trong các lựa chọn',
        path: ['correctKey'],
    });

export const questionGroupSchema = z.object({
    name: z.string().min(2, 'Tên chùm tối thiểu 2 ký tự').max(200),
    partId: z.coerce.number().min(1, 'Vui lòng chọn Part'),
    instruction: z.string().default(''),
    passage: z.string().default(''),
    transcript: z.string().default(''),
    translation: z.string().default(''),
    descriptions: z.string().default(''),
    items: z.array(groupItemSchema).min(2, 'Chùm câu hỏi phải có tối thiểu 2 câu hỏi con').max(5, 'Tối đa 5 câu con'),
});

export type QuestionGroupFormValues = z.infer<typeof questionGroupSchema>;
