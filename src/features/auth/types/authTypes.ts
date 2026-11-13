// ─── Request types (khớp với BE DTO) ─────────────────────────────────────────

/**
 * Request gửi mã xác thực OTP qua email.
 */
export interface SendOtpRequest {
    /** Email người nhận mã OTP */
    email: string;
    /** Mục đích gửi mã: "REGISTER" | "FORGOT_PASSWORD" */
    purpose: string;
}

/**
 * Request hoàn tất đăng ký tài khoản mới kèm mã OTP.
 */
export interface RegisterRequest {
    /** Địa chỉ email đăng ký */
    email: string;
    /** Họ và tên học viên */
    fullName: string;
    /** Mật khẩu tài khoản */
    password: string;
    /** Xác nhận mật khẩu */
    confirmPassword: string;
    /** Mã OTP 6 chữ số đã gửi qua email */
    otp: string;
}

/**
 * Request đăng nhập tài khoản.
 */
export interface LoginRequest {
    /** Địa chỉ email đã đăng ký */
    email: string;
    /** Mật khẩu tài khoản */
    password: string;
}

// ─── Response types (khớp với AuthResponse.java) ─────────────────────────────

/**
 * Phân quyền tài khoản trong hệ thống LEBY (khớp với ERole bên Backend).
 */
export type UserRole = 'STUDENT' | 'TEACHER' | 'ADMIN';

/**
 * Thông tin học viên / người dùng đã xác thực thành công.
 */
export interface AuthUser {
    /** ID định danh người dùng */
    id: number;
    /** Địa chỉ email */
    email: string;
    /** Họ và tên hiển thị */
    fullName: string;
    /** Ngày sinh (YYYY-MM-DD hoặc null nếu chưa cập nhật) */
    dob: string | null;
    /** URL ảnh đại diện */
    avatar: string | null;
    /** Vai trò / quyền hạn trong hệ thống */
    role: UserRole;
}
