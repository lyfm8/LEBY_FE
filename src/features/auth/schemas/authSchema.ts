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

/** Kiểu dữ liệu form đăng nhập được suy luận từ Zod Schema */
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

/** Kiểu dữ liệu form đăng ký được suy luận từ Zod Schema */
export type RegisterFormValues = z.infer<typeof registerSchema>;

/**
 * Schema xác thực mã OTP gửi về email
 */
export const otpSchema = z.object({
    otp: z
        .string()
        .length(6, 'Mã OTP gồm đúng 6 chữ số.')
        .regex(/^\d{6}$/, 'Mã OTP chỉ bao gồm chữ số.'),
});

/** Kiểu dữ liệu form OTP được suy luận từ Zod Schema */
export type OtpFormValues = z.infer<typeof otpSchema>;

/**
 * Schema bước 1 Quên mật khẩu (UC04): nhập email để nhận mã OTP 6 chữ số.
 */
export const forgotPasswordEmailSchema = z.object({
    email: z
        .string()
        .trim()
        .min(1, 'Vui lòng nhập email.')
        .email('Email không đúng định dạng.'),
});

export type ForgotPasswordEmailValues = z.infer<typeof forgotPasswordEmailSchema>;

/**
 * Schema bước 2 Quên mật khẩu (UC04): nhập mã OTP 6 chữ số và thiết lập mật khẩu mới.
 * Khớp chặt với ResetPasswordRequest ở Backend.
 */
export const resetPasswordSchema = z
    .object({
        otp: z
            .string()
            .trim()
            .length(6, 'Mã OTP gồm đúng 6 chữ số.')
            .regex(/^\d{6}$/, 'Mã OTP chỉ bao gồm chữ số.'),
        newPassword: z
            .string()
            .min(8, 'Mật khẩu mới phải từ 8 ký tự trở lên.')
            .max(100, 'Mật khẩu mới không được vượt quá 100 ký tự.')
            .regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Mật khẩu cần có chữ hoa, chữ thường và số.'),
        confirmPassword: z
            .string()
            .min(1, 'Vui lòng xác nhận mật khẩu mới.'),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: 'Mật khẩu xác nhận không khớp.',
        path: ['confirmPassword'],
    });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
