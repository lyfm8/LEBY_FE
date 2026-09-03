import { apiClient } from '@/core/api/apiClient';
import type { ApiResponse } from '@/core/api/apiResponse';
import type {
    SendOtpRequest,
    RegisterRequest,
    LoginRequest,
    AuthUser,
} from './types';

/**
 * Auth API service.
 *
 * Token management (JWT) được BE xử lý hoàn toàn qua HTTP-Only Cookie.
 * FE không cần lưu token, chỉ cần gọi API và đọc response body.
 */
export const authService = {
    /**
     * POST /api/auth/register/send-otp
     * Gửi OTP 6 số đến email để xác minh trước khi đăng ký.
     */
    sendOtp(data: SendOtpRequest): Promise<ApiResponse<null>> {
        return apiClient.post<ApiResponse<null>>('/api/auth/register/send-otp', data);
    },

    /**
     * POST /api/auth/register
     * Đăng ký tài khoản mới. BE trả về user info + set Cookie.
     */
    register(data: RegisterRequest): Promise<ApiResponse<AuthUser>> {
        return apiClient.post<ApiResponse<AuthUser>>('/api/auth/register', data);
    },

    /**
     * POST /api/auth/login
     * Đăng nhập. BE trả về user info + set Cookie.
     */
    login(data: LoginRequest): Promise<ApiResponse<AuthUser>> {
        return apiClient.post<ApiResponse<AuthUser>>('/api/auth/login', data);
    },

    /**
     * GET /api/auth/me
     * Lấy thông tin user hiện tại từ Cookie (dùng để restore session khi reload).
     */
    me(): Promise<ApiResponse<AuthUser>> {
        return apiClient.get<ApiResponse<AuthUser>>('/api/auth/me');
    },

    /**
     * POST /api/auth/logout
     * Đăng xuất. BE xóa Cookie và vô hiệu hóa token.
     */
    logout(): Promise<ApiResponse<null>> {
        return apiClient.post<ApiResponse<null>>('/api/auth/logout');
    },
};
