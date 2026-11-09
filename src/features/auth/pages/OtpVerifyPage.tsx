import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthCard } from '../components/AuthCard';
import { OtpVerifyForm } from '../components/OtpVerifyForm';
import { authService } from '../services/authService';
import { useAuth } from '../hooks/useAuth';
import type { OtpFormValues } from '../schemas/authSchema';
import type { RegisterRequest } from '../types/authTypes';
import '../auth.css';

/** Dữ liệu đăng ký tạm thời được chuyển từ RegisterPage */
type PendingRegister = Omit<RegisterRequest, 'otp'>;

/**
 * Hàm tiện ích ẩn một phần ký tự email nhằm bảo vệ quyền riêng tư người dùng
 * Ví dụ: user123@gmail.com -> use***@gmail.com
 *
 * @param email Địa chỉ email gốc
 * @returns Email đã được che bớt ký tự
 */
function maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    if (!domain) return email;
    const visible = local.slice(0, 3);
    return `${visible}***@${domain}`;
}

/**
 * Smart / Container Component: Trang Xác thực mã OTP và hoàn tất đăng ký tài khoản.
 * Luồng nghiệp vụ:
 * - Bước 1: Kiểm tra dữ liệu đăng ký pending (nếu không có → redirect về /register)
 * - Bước 2: Quản lý bộ đếm thời gian (cooldown) gửi lại OTP
 * - Bước 3: Gửi OTP tới email học viên qua authService.sendOtp
 * - Bước 4: Xác thực OTP và tạo tài khoản qua authService.register
 * - Bước 5: Cập nhật thông tin vào AuthContext và chuyển hướng về /home
 */
export const OtpVerifyPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { setUser } = useAuth();

    // Lấy thông tin đăng ký tạm từ router state
    const pending = (location.state as { pendingRegister?: PendingRegister })?.pendingRegister;

    // Bước 1: Kiểm tra hợp lệ. Nếu truy cập trực tiếp URL mà không qua form đăng ký → quay về /register
    useEffect(() => {
        if (!pending) {
            navigate('/register', { replace: true });
        }
    }, [pending, navigate]);

    const [globalError, setGlobalError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Trạng thái đếm ngược OTP
    const [otpSent, setOtpSent] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Dọn dẹp timer khi component unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, []);

    /**
     * Bắt đầu đếm ngược 60 giây trước khi cho phép gửi lại OTP
     */
    const startCooldown = () => {
        setCooldown(60);
        timerRef.current = setInterval(() => {
            setCooldown((prev) => {
                if (prev <= 1) {
                    if (timerRef.current) clearInterval(timerRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    /**
     * Kích hoạt gửi mã xác thực OTP về email học viên
     */
    const handleSendOtp = async () => {
        if (!pending) return;

        setGlobalError('');
        setSuccessMessage('');

        try {
            const res = await authService.sendOtp({ email: pending.email, purpose: 'REGISTER' });
            if (res.success) {
                setOtpSent(true);
                setSuccessMessage('Mã OTP đã được gửi thành công đến email của bạn.');
                startCooldown();
            } else {
                setGlobalError(res.message ?? 'Gửi OTP thất bại. Vui lòng thử lại.');
            }
        } catch (error: unknown) {
            if (axios.isAxiosError(error) && error.response?.data?.message) {
                setGlobalError(error.response.data.message);
            } else {
                setGlobalError('Không thể gửi OTP. Vui lòng kiểm tra kết nối.');
            }
        }
    };

    /**
     * Gửi yêu cầu hoàn tất đăng ký với mã OTP đã nhập
     *
     * @param data Dữ liệu chứa mã OTP 6 số
     */
    const handleVerifyOtp = async (data: OtpFormValues) => {
        if (!pending) return;

        if (!otpSent) {
            setGlobalError('Vui lòng bấm gửi mã OTP trước khi xác nhận.');
            return;
        }

        setIsSubmitting(true);
        setGlobalError('');
        setSuccessMessage('');

        try {
            const payload: RegisterRequest = { ...pending, otp: data.otp };
            const res = await authService.register(payload);

            if (res.success && res.data) {
                setUser(res.data);
                navigate('/home', { replace: true });
            } else {
                setGlobalError(res.message ?? 'Xác thực thất bại. Vui lòng thử lại.');
            }
        } catch (error: unknown) {
            if (axios.isAxiosError(error) && error.response?.data?.message) {
                setGlobalError(error.response.data.message);
            } else {
                setGlobalError('Đã xảy ra lỗi. Vui lòng thử lại.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!pending) return null;

    return (
        <AuthCard
            id="verify-otp-page"
            title="Xác thực email"
            subtitle={
                <>
                    Nhập mã OTP được gửi đến{' '}
                    <strong style={{ color: '#0f172a' }}>{maskEmail(pending.email)}</strong>
                </>
            }
        >
            <OtpVerifyForm
                onSubmit={handleVerifyOtp}
                onSendOtp={handleSendOtp}
                isSubmitting={isSubmitting}
                otpSent={otpSent}
                cooldown={cooldown}
                globalError={globalError}
                successMessage={successMessage}
                pendingRegister={pending}
            />
        </AuthCard>
    );
};

export default OtpVerifyPage;
