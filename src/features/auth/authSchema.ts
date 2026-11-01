import { z } from 'zod';

/**
 * Schema xác thực dữ liệu Form Đăng nhập
 * Khớp với LoginRequest (Backend)
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Vui lòng nhập email.')
    .email('Email không đúng định dạng.'),
  password: z
    .string()
    .min(1, 'Vui lòng nhập mật khẩu.'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

/**
 * Schema xác thực dữ liệu Form Đăng ký
 * Khớp với RegisterRequest (Backend)
 */
export const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(1, 'Vui lòng nhập họ và tên.')
      .max(150, 'Họ và tên không được vượt quá 150 ký tự.'),
    email: z
      .string()
      .trim()
      .min(1, 'Vui lòng nhập email.')
      .email('Email không hợp lệ.'),
    password: z
      .string()
      .min(8, 'Mật khẩu phải từ 8 ký tự trở lên.')
      .regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Mật khẩu cần có chữ hoa, chữ thường và số.'),
    confirmPassword: z
      .string()
      .min(1, 'Vui lòng xác nhận mật khẩu.'),
    terms: z
      .boolean()
      .refine((val) => val === true, {
        message: 'Bạn cần đồng ý với Điều khoản dịch vụ.',
      }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp.',
    path: ['confirmPassword'],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

/**
 * Schema xác thực mã OTP
 */
export const otpSchema = z.object({
  otp: z
    .string()
    .length(6, 'Mã OTP gồm đúng 6 chữ số.')
    .regex(/^\d{6}$/, 'Mã OTP chỉ bao gồm chữ số.'),
});

export type OtpFormValues = z.infer<typeof otpSchema>;
