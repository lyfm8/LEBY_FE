import { z } from 'zod';

export const userFormSchema = z.object({
  username: z.string().min(3, 'Username phải từ 3 ký tự trở lên'),
  email: z.string().email('Email không đúng định dạng'),
  fullName: z.string().min(2, 'Họ tên phải từ 2 ký tự trở lên'),
  password: z.string().min(6, 'Mật khẩu phải từ 6 ký tự trở lên').optional().or(z.literal('')),
  role: z.string().min(1, 'Vui lòng chọn Role'),
  isActive: z.boolean(),
});

export type UserFormValues = z.infer<typeof userFormSchema>;
