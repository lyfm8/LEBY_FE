import { apiClient } from '@/core/api/apiClient';
import type { ApiResponse } from '@/core/api/apiResponse';
import type {
    SendOtpRequest,
    RegisterRequest,
    LoginRequest,
    AuthUser,
} from '../types/authTypes';

/**
 * Service xử lý các thao tác xác thực và quản lý tài khoản người dùng.
 *
 * NOTE: Token management (JWT) được Backend xử lý hoàn toàn qua HTTP-Only Cookie.
 * Frontend không cần lưu token trong localStorage/sessionStorage, chỉ cần gọi API
 * và đọc response body để lấy thông tin người dùng.
 */
export const authService = {
    /**
     * Gửi mã OTP 6 số đến địa chỉ email để xác minh trước khi đăng ký hoặc đặt lại mật khẩu.
     * Endpoint: POST /api/auth/register/send-otp
     *
     * @param data Đối tượng chứa email và mục đích (REGISTER / FORGOT_PASSWORD)
     * @returns Promise trả về ApiResponse rỗng (null) khi gửi mã thành công
     */
    sendOtp(data: SendOtpRequest): Promise<ApiResponse<null>> {
        return apiClient.post<ApiResponse<null>>('/api/auth/register/send-otp', data);
    },

    /**
     * Đăng ký tài khoản học viên mới kèm mã OTP đã xác thực.
     * Endpoint: POST /api/auth/register
     *
     * @param data Dữ liệu đăng ký gồm email, mật khẩu, họ tên và OTP
     * @returns Promise trả về thông tin user mới đăng ký và set HTTP-Only Cookie
     */
    register(data: RegisterRequest): Promise<ApiResponse<AuthUser>> {
        return apiClient.post<ApiResponse<AuthUser>>('/api/auth/register', data);
    },

    /**
     * Đăng nhập người dùng bằng email và mật khẩu.
     * Endpoint: POST /api/auth/login
     *
     * @param data Dữ liệu đăng nhập gồm email và password
     * @returns Promise trả về thông tin user đã xác thực và set HTTP-Only Cookie
     */
    login(data: LoginRequest): Promise<ApiResponse<AuthUser>> {
        return apiClient.post<ApiResponse<AuthUser>>('/api/auth/login', data);
    },

    /**
     * Lấy thông tin user hiện tại từ HTTP-Only Cookie (dùng để khôi phục session khi reload trang).
     * Endpoint: GET /api/auth/me
     *
     * @returns Promise trả về thông tin user hiện tại
     */
    me(): Promise<ApiResponse<AuthUser>> {
        return apiClient.get<ApiResponse<AuthUser>>('/api/auth/me');
    },

    /**
     * Đăng xuất người dùng khỏi hệ thống.
     * Endpoint: POST /api/auth/logout
     *
     * @returns Promise xóa Cookie phiên đăng nhập trên trình duyệt
     */
    logout(): Promise<ApiResponse<null>> {
        return apiClient.post<ApiResponse<null>>('/api/auth/logout');
    },
};
