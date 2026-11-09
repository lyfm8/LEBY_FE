import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { AuthCard } from '../components/AuthCard';
import { LoginForm } from '../components/LoginForm';
import { authService } from '../services/authService';
import { useAuth } from '../hooks/useAuth';
import type { LoginFormValues } from '../schemas/authSchema';
import '../auth.css';

/**
 * Smart / Container Component: Trang Đăng nhập tài khoản LEBY.
 * Đảm nhiệm điều phối luồng nghiệp vụ xác thực:
 * - Bước 1: Thu nhận thông tin đăng nhập từ LoginForm
 * - Bước 2: Gọi API authService.login
 * - Bước 3: Cập nhật thông tin User vào AuthContext
 * - Bước 4: Điều hướng người dùng về trang mong muốn (hoặc /admin nếu là ADMIN)
 */
export const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { setUser } = useAuth();

    // Redirect về trang user muốn truy cập trước khi bị intercept đẩy ra login
    const from = (location.state as { from?: Location })?.from?.pathname ?? '/home';

    const [serverError, setServerError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    /**
     * Xử lý xác thực người dùng khi gửi form đăng nhập
     *
     * @param data Dữ liệu email và password từ form
     */
    const handleLogin = async (data: LoginFormValues) => {
        setIsLoading(true);
        setServerError('');

        try {
            // Bước 1: Gửi request đăng nhập lên Backend
            const res = await authService.login(data);

            // Bước 2: Kiểm tra kết quả phản hồi và cập nhật session
            if (res.success && res.data) {
                setUser(res.data);

                let target = from;
                // Nếu tài khoản có vai trò ADMIN và đích đến mặc định là /home, chuyển thẳng tới /admin
                if (res.data.role === 'ADMIN' && target === '/home') {
                    target = '/admin';
                }

                navigate(target, { replace: true });
            } else {
                setServerError(res.message ?? 'Đăng nhập thất bại. Vui lòng thử lại.');
            }
        } catch (error: unknown) {
            // Bước 3: Bắt và phân loại lỗi hệ thống an toàn (chống any)
            if (axios.isAxiosError(error) && error.response?.data?.message) {
                setServerError(error.response.data.message);
            } else {
                setServerError('Email hoặc mật khẩu không đúng.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthCard
            id="login-page"
            title="Đăng nhập vào LEBY"
            subtitle="Rèn luyện TOEIC nghiêm túc và bài bản"
        >
            <LoginForm
                onSubmit={handleLogin}
                isLoading={isLoading}
                serverError={serverError}
            />
        </AuthCard>
    );
};

export default LoginPage;
