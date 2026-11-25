import React, { useCallback, useEffect, useRef, useState } from 'react';
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
 */
function maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    if (!domain) return email;
    const visible = local.slice(0, 3);
    return `${visible}***@${domain}`;
}

/**
 * Smart / Container Component: Trang Xác thực mã OTP và hoàn tất đăng ký tài khoản (UC01).
 * Tự động kích hoạt gửi mã OTP ngay khi điều hướng từ trang Đăng ký, giúp người dùng không phải
 * chờ gửi mail xong mới chuyển trang, và vẫn có nút Gửi lại OTP nếu cần.
 */
export const OtpVerifyPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { setUser } = useAuth();

    const routerState = location.state as {
        pendingRegister?: PendingRegister;
        otpAlreadySent?: boolean;
        shouldAutoSendOtp?: boolean;
    } | null;
    const pending = routerState?.pendingRegister;
    const otpAlreadySent = Boolean(routerState?.otpAlreadySent);
    const shouldAutoSendOtp = Boolean(routerState?.shouldAutoSendOtp);

    // Nếu truy cập trực tiếp URL mà không qua form đăng ký → quay về /register
    useEffect(() => {
        if (!pending) {
            navigate('/register', { replace: true });
        }
    }, [pending, navigate]);

    const [globalError, setGlobalError] = useState('');
    const [successMessage, setSuccessMessage] = useState(
        otpAlreadySent
            ? 'Mã OTP 6 chữ số đã được gửi đến email của bạn (hiệu lực 10 phút).'
            : shouldAutoSendOtp
              ? 'Đang gửi mã OTP 6 chữ số đến email của bạn. Vui lòng kiểm tra hộp thư...'
              : ''
    );
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Trạng thái đếm ngược OTP: cooldown 60s gửi lại + hiệu lực 10 phút (600s theo BR01)
    const [otpSent, setOtpSent] = useState(otpAlreadySent || shouldAutoSendOtp);
    const [cooldown, setCooldown] = useState(otpAlreadySent || shouldAutoSendOtp ? 60 : 0);
    const [expirySeconds, setExpirySeconds] = useState(otpAlreadySent || shouldAutoSendOtp ? 600 : 0);
    // Chặn gọi trùng API sendOtp 2 lần khi React StrictMode mount lại component trong môi trường dev
    const initialSendTriggeredRef = useRef(false);

    const hasCooldown = cooldown > 0;
    const hasExpiry = expirySeconds > 0;

    useEffect(() => {
        if (!hasCooldown) return;
        const id = setInterval(() => {
            setCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
        }, 1000);
        return () => clearInterval(id);
    }, [hasCooldown]);

    useEffect(() => {
        if (!hasExpiry) return;
        const id = setInterval(() => {
            setExpirySeconds((prev) => (prev <= 1 ? 0 : prev - 1));
        }, 1000);
        return () => clearInterval(id);
    }, [hasExpiry]);

    const startCooldown = useCallback(() => {
        setCooldown(60);
        setExpirySeconds(600);
    }, []);

    /**
     * Gọi API gửi / gửi lại mã OTP.
     * Nếu lỗi nghiệp vụ (4xx như 409 email đã tồn tại) ở lần gửi đầu → quay lại /register kèm lỗi.
     */
    const dispatchSendOtp = useCallback(
        async (isInitialAutoSend: boolean) => {
            if (!pending) return;

            setIsSendingOtp(true);
            setGlobalError('');
            if (isInitialAutoSend) {
                setOtpSent(true);
                startCooldown();
                // Gỡ cờ shouldAutoSendOtp khỏi history state để F5 không tự gửi lại mã mới đè mã cũ
                navigate(location.pathname, {
                    replace: true,
                    state: { pendingRegister: pending, otpAlreadySent: true },
                });
            } else {
                setSuccessMessage('');
            }

            try {
                const res = await authService.sendOtp({ email: pending.email, purpose: 'REGISTER' });
                if (res.success) {
                    setOtpSent(true);
                    setSuccessMessage('Mã OTP 6 chữ số đã được gửi đến email của bạn (hiệu lực 10 phút).');
                    if (!isInitialAutoSend) {
                        startCooldown();
                    }
                } else {
                    const msg = res.message ?? 'Gửi OTP thất bại. Vui lòng thử lại.';
                    setSuccessMessage('');
                    if (isInitialAutoSend) {
                        navigate('/register', {
                            replace: true,
                            state: { savedForm: pending, serverError: msg },
                        });
                    } else {
                        setGlobalError(msg);
                    }
                }
            } catch (error: unknown) {
                setSuccessMessage('');
                const serverMessage = axios.isAxiosError(error)
                    ? (error.response?.data as { message?: unknown } | undefined)?.message
                    : undefined;
                const resolvedMessage =
                    typeof serverMessage === 'string' && serverMessage.trim().length > 0
                        ? serverMessage
                        : 'Không thể gửi OTP. Vui lòng kiểm tra kết nối.';

                // Nếu BE trả về lỗi nghiệp vụ cụ thể (vd 409 email đã tồn tại) ở lần tự gửi đầu → đưa về /register để sửa email
                if (
                    axios.isAxiosError(error) &&
                    error.response &&
                    error.response.status >= 400 &&
                    error.response.status < 500
                ) {
                    if (isInitialAutoSend) {
                        navigate('/register', {
                            replace: true,
                            state: { savedForm: pending, serverError: resolvedMessage },
                        });
                    } else {
                        setGlobalError(resolvedMessage);
                    }
                    return;
                }

                setGlobalError(resolvedMessage);
                setCooldown(0);
            } finally {
                setIsSendingOtp(false);
            }
        },
        [pending, location.pathname, navigate, startCooldown]
    );

    useEffect(() => {
        if (pending && shouldAutoSendOtp && !initialSendTriggeredRef.current) {
            initialSendTriggeredRef.current = true;
            void dispatchSendOtp(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSendOtp = async () => {
        await dispatchSendOtp(false);
    };

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
                // UC01 Bước 8 → UC05: Sau khi đăng ký tài khoản học viên mới thành công, dẫn thẳng sang chọn mục tiêu AIM
                navigate('/target-selection', { replace: true });
            } else {
                setGlobalError(res.message ?? 'Xác thực thất bại. Vui lòng thử lại.');
            }
        } catch (error: unknown) {
            if (axios.isAxiosError(error) && error.response?.data?.message) {
                setGlobalError(String(error.response.data.message));
            } else {
                setGlobalError('Đã xảy ra lỗi. Vui lòng thử lại.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!pending) return null;

    const formattedExpiry = `${String(Math.floor(expirySeconds / 60)).padStart(2, '0')}:${String(expirySeconds % 60).padStart(2, '0')}`;

    return (
        <AuthCard
            id="verify-otp-page"
            title="Xác thực email"
            subtitle={
                <>
                    Nhập mã OTP được gửi đến{' '}
                    <strong style={{ color: '#0f172a' }}>{maskEmail(pending.email)}</strong>
                    {otpSent && (
                        <>
                            <br />
                            <span style={{ fontSize: '0.82rem', color: expirySeconds > 0 ? '#64748b' : '#dc2626' }}>
                                {expirySeconds > 0
                                    ? `Mã có hiệu lực trong ${formattedExpiry}`
                                    : 'Mã OTP đã hết hạn 10 phút, vui lòng bấm Gửi lại OTP'}
                            </span>
                        </>
                    )}
                </>
            }
        >
            <OtpVerifyForm
                onSubmit={handleVerifyOtp}
                onSendOtp={handleSendOtp}
                isSubmitting={isSubmitting}
                isSendingOtp={isSendingOtp}
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
