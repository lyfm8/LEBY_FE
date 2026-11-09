import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthCard } from '../components/AuthCard';
import { RegisterForm } from '../components/RegisterForm';
import type { RegisterFormValues } from '../schemas/authSchema';
import '../auth.css';

/**
 * Smart / Container Component: Trang Đăng ký tài khoản học viên mới.
 * Chịu trách nhiệm:
 * - Bước 1: Khôi phục dữ liệu đã nhập nếu người dùng quay lại từ màn OTP
 * - Bước 2: Nhận dữ liệu hợp lệ từ RegisterForm
 * - Bước 3: Điều hướng sang màn hình xác thực OTP (/verify-otp) kèm payload đăng ký
 */
export const RegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Dữ liệu khôi phục nếu học viên ấn "Quay lại đăng ký" từ màn hình OTP
    const saved = (location.state as { savedForm?: Partial<RegisterFormValues> })?.savedForm;

    /**
     * Xử lý chuyển bước khi học viên hoàn tất điền form đăng ký
     *
     * @param data Dữ liệu hợp lệ từ form đăng ký
     */
    const handleRegisterSubmit = (data: RegisterFormValues) => {
        // Chuyển sang màn hình xác thực OTP kèm toàn bộ thông tin đăng ký tạm
        navigate('/verify-otp', {
            state: {
                pendingRegister: {
                    fullName: data.fullName,
                    email: data.email,
                    password: data.password,
                    confirmPassword: data.confirmPassword,
                },
            },
        });
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
            />
        </AuthCard>
    );
};

export default RegisterPage;
