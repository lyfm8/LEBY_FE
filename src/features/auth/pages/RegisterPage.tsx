import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthCard } from '../components/AuthCard';
import { RegisterForm } from '../components/RegisterForm';
import { useAuth } from '../hooks/useAuth';
import { getDefaultRouteByRole } from '../utils/authRedirect';
import { formatIsoToDdMmYy, parseDdMmYyToIso } from '../utils/dateFormat';
import type { RegisterFormValues } from '../schemas/authSchema';
import type { RegisterRequest } from '../types/authTypes';
import '../auth.css';

type PendingRegister = Omit<RegisterRequest, 'otp'>;

/**
 * Smart / Container Component: Trang Đăng ký tài khoản học viên mới (UC01).
 * Ngay khi dữ liệu form hợp lệ, chuyển tức thì sang trang nhập OTP (/verify-otp) mà không cần chờ gửi email xong.
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

    // Dữ liệu & thông báo lỗi khôi phục khi học viên quay lại từ màn OTP (hoặc khi BE báo email đã tồn tại)
    const routerState = location.state as {
        savedForm?: Partial<PendingRegister>;
        serverError?: string;
    } | null;
    const rawSaved = routerState?.savedForm;
    const saved: Partial<RegisterFormValues> | undefined = rawSaved
        ? {
              fullName: rawSaved.fullName,
              email: rawSaved.email,
              dob: formatIsoToDdMmYy(rawSaved.dob) || rawSaved.dob || '',
              learnerType: rawSaved.learnerType,
              password: rawSaved.password,
              confirmPassword: rawSaved.confirmPassword,
          }
        : undefined;

    const [serverError, setServerError] = useState(routerState?.serverError ?? '');

    /**
     * Đóng gói dữ liệu đăng ký hợp lệ và chuyển ngay sang màn hình nhập OTP.
     * Quá trình gọi API /api/auth/send-otp sẽ được kích hoạt tự động tại OtpVerifyPage.
     */
    const handleRegisterSubmit = (data: RegisterFormValues) => {
        const isoDob = parseDdMmYyToIso(data.dob);
        if (!isoDob) {
            setServerError('Ngày sinh không hợp lệ (định dạng dd/mm/yy).');
            return;
        }

        setServerError('');

        navigate('/verify-otp', {
            state: {
                shouldAutoSendOtp: true,
                pendingRegister: {
                    fullName: data.fullName.trim(),
                    email: data.email.trim(),
                    dob: isoDob,
                    learnerType: data.learnerType,
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
            wide
        >
            <RegisterForm
                onSubmit={(data) => {
                    handleRegisterSubmit(data);
                }}
                defaultValues={saved}
                serverError={serverError}
            />
        </AuthCard>
    );
};

export default RegisterPage;
