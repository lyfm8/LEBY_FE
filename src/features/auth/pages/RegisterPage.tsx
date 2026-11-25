import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthCard } from '../components/AuthCard';
import { RegisterForm } from '../components/RegisterForm';
import { authService } from '../services/authService';
import { useAuth } from '../hooks/useAuth';
import { getDefaultRouteByRole } from '../utils/authRedirect';
import type { RegisterFormValues } from '../schemas/authSchema';
import '../auth.css';

/**
 * Smart / Container Component: Trang Đăng ký tài khoản học viên mới (UC01).
 * Đúng quy trình UC01 Bước 3-5:
 * - Kiểm tra email & gửi ngay mã OTP 6 chữ số (hiệu lực 10 phút) khi học viên bấm "Đăng ký tài khoản"
 * - Nếu email đã tồn tại → báo lỗi ngay tại trang Đăng ký (không đẩy sang màn OTP vô ích)
 * - Nếu gửi thành công → chuyển sang /verify-otp kèm trạng thái otpAlreadySent = true
 */
export const RegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isLoading: isAuthLoading } = useAuth();

    // Nếu người dùng đã đăng nhập, tự động chuyển về trang chủ theo vai trò
    useEffect(() => {
        if (!isAuthLoading && user) {
            navigate(getDefaultRouteByRole(user.role, user.hasSelectedTarget), { replace: true });
        }
    }, [isAuthLoading, user, navigate]);

    // Dữ liệu khôi phục nếu học viên ấn "Quay lại đăng ký" từ màn hình OTP
    const saved = (location.state as { savedForm?: Partial<RegisterFormValues> })?.savedForm;

    const [isLoading, setIsLoading] = useState(false);
    const [serverError, setServerError] = useState('');

    /**
     * Gọi BE gửi mã OTP đăng ký và chuyển sang màn hình xác thực OTP.
     */
    const handleRegisterSubmit = async (data: RegisterFormValues) => {
        setIsLoading(true);
        setServerError('');

        try {
            const cleanEmail = data.email.trim();
            const res = await authService.sendOtp({
                email: cleanEmail,
                purpose: 'REGISTER',
            });

            if (res.success) {
                navigate('/verify-otp', {
                    state: {
                        otpAlreadySent: true,
                        pendingRegister: {
                            fullName: data.fullName.trim(),
                            email: cleanEmail,
                            password: data.password,
                            confirmPassword: data.confirmPassword,
                        },
                    },
                });
            } else {
                setServerError(res.message ?? 'Không thể gửi mã OTP đăng ký. Vui lòng thử lại.');
            }
        } catch (error: unknown) {
            if (axios.isAxiosError(error) && error.response?.data?.message) {
                setServerError(String(error.response.data.message));
            } else {
                setServerError('Không thể gửi mã OTP. Vui lòng kiểm tra email và kết nối mạng.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthCard
            id="register-page"
            title="Tạo tài khoản LEBY"
            subtitle="Trải nghiệm học tập tối ưu hóa ngay hôm nay"
        >
            <RegisterForm
                onSubmit={handleRegisterSubmit}
                defaultValues={saved}
                isLoading={isLoading}
                serverError={serverError}
            />
        </AuthCard>
    );
};

export default RegisterPage;
