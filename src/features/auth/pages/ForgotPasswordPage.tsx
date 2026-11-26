import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { AuthCard } from '../components/AuthCard';
import { authService } from '../services/authService';
import { useAuth } from '../hooks/useAuth';
import { getDefaultRouteByRole } from '../utils/authRedirect';
import {
    forgotPasswordEmailSchema,
    resetPasswordSchema,
    type ForgotPasswordEmailValues,
    type ResetPasswordFormValues,
} from '../schemas/authSchema';
import '../auth.css';

const RESEND_COOLDOWN_SECONDS = 60;
const OTP_EXPIRY_SECONDS = 600; // BR01: Mã OTP có hiệu lực chính xác 10 phút

function formatCountdown(totalSeconds: number): string {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/**
 * Smart / Container Component: Trang Quên mật khẩu & Khôi phục mật khẩu qua OTP (UC04).
 * Luồng 2 bước chuẩn BR01:
 * - Bước 1: Nhập email tài khoản → BE gửi mã OTP 6 chữ số (hiệu lực 10 phút)
 * - Bước 2: Nhập mã OTP + mật khẩu mới → BE xác minh OTP, đổi mật khẩu, thu hồi JWT cũ → quay về /login
 */
export const ForgotPasswordPage: React.FC = () => {
    const navigate = useNavigate();
    const { user, isLoading: isAuthLoading } = useAuth();

    // Nếu người dùng đã đăng nhập sẵn, không cho ở lại trang quên mật khẩu mà đưa về trang chủ đúng vai trò
    useEffect(() => {
        if (!isAuthLoading && user) {
            navigate(getDefaultRouteByRole(user.role, user.hasSelectedTarget), { replace: true });
        }
    }, [isAuthLoading, user, navigate]);

    const [step, setStep] = useState<'EMAIL' | 'RESET'>('EMAIL');
    const [targetEmail, setTargetEmail] = useState('');
    const [serverError, setServerError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Bộ đếm cooldown gửi lại OTP (60s) và thời hạn hiệu lực OTP (10 phút theo BR01)
    const [cooldown, setCooldown] = useState(0);
    const [expirySeconds, setExpirySeconds] = useState(0);
    const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const expiryRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        return () => {
            if (cooldownRef.current) clearInterval(cooldownRef.current);
            if (expiryRef.current) clearInterval(expiryRef.current);
        };
    }, []);

    const startTimers = () => {
        if (cooldownRef.current) clearInterval(cooldownRef.current);
        if (expiryRef.current) clearInterval(expiryRef.current);

        setCooldown(RESEND_COOLDOWN_SECONDS);
        setExpirySeconds(OTP_EXPIRY_SECONDS);

        cooldownRef.current = setInterval(() => {
            setCooldown((prev) => {
                if (prev <= 1) {
                    if (cooldownRef.current) clearInterval(cooldownRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        expiryRef.current = setInterval(() => {
            setExpirySeconds((prev) => {
                if (prev <= 1) {
                    if (expiryRef.current) clearInterval(expiryRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const emailForm = useForm<ForgotPasswordEmailValues>({
        resolver: zodResolver(forgotPasswordEmailSchema),
        defaultValues: { email: '' },
    });

    const resetForm = useForm<ResetPasswordFormValues>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: { otp: '', newPassword: '', confirmPassword: '' },
    });

    const extractErrorMessage = (error: unknown, fallback: string): string => {
        if (axios.isAxiosError(error) && error.response?.data?.message) {
            return String(error.response.data.message);
        }
        return fallback;
    };

    // Bước 1: Gửi mã OTP đặt lại mật khẩu về email
    const handleSendOtp = async (values: ForgotPasswordEmailValues) => {
        setIsSubmitting(true);
        setServerError('');
        setSuccessMessage('');

        try {
            const cleanEmail = values.email.trim();
            const res = await authService.sendOtp({
                email: cleanEmail,
                purpose: 'FORGOT_PASSWORD',
            });

            if (res.success) {
                setTargetEmail(cleanEmail);
                setStep('RESET');
                setSuccessMessage(`Mã OTP 6 chữ số đã được gửi tới ${cleanEmail}. Mã có hiệu lực trong 10 phút.`);
                startTimers();
            } else {
                setServerError(res.message ?? 'Không thể gửi mã OTP. Vui lòng thử lại.');
            }
        } catch (error: unknown) {
            setServerError(extractErrorMessage(error, 'Không thể gửi mã OTP. Vui lòng kiểm tra email và thử lại.'));
        } finally {
            setIsSubmitting(false);
        }
    };

    // Gửi lại OTP khi hết cooldown 60 giây (hủy mã cũ, cấp mã mới có hiệu lực 10 phút)
    const handleResendOtp = async () => {
        if (!targetEmail || cooldown > 0) return;

        setServerError('');
        setSuccessMessage('');
        try {
            const res = await authService.sendOtp({
                email: targetEmail,
                purpose: 'FORGOT_PASSWORD',
            });
            if (res.success) {
                setSuccessMessage('Mã OTP mới đã được gửi. Mã cũ trước đó đã bị hủy.');
                startTimers();
            } else {
                setServerError(res.message ?? 'Gửi lại mã OTP thất bại.');
            }
        } catch (error: unknown) {
            setServerError(extractErrorMessage(error, 'Không thể gửi lại mã OTP. Vui lòng thử lại sau.'));
        }
    };

    // Bước 2: Xác minh OTP và lưu mật khẩu mới
    const handleResetPassword = async (values: ResetPasswordFormValues) => {
        setIsSubmitting(true);
        setServerError('');

        try {
            const res = await authService.resetPassword({
                email: targetEmail,
                otp: values.otp.trim(),
                newPassword: values.newPassword,
                confirmPassword: values.confirmPassword,
            });

            if (res.success) {
                // Chuyển về trang Đăng nhập kèm thông báo thành công để học viên đăng nhập bằng mật khẩu mới
                navigate('/login', {
                    replace: true,
                    state: {
                        successMessage: 'Đặt lại mật khẩu thành công! Vui lòng đăng nhập bằng mật khẩu mới.',
                    },
                });
            } else {
                setServerError(res.message ?? 'Đặt lại mật khẩu thất bại. Vui lòng kiểm tra lại mã OTP.');
            }
        } catch (error: unknown) {
            setServerError(extractErrorMessage(error, 'Mã OTP không chính xác hoặc đã hết hạn.'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AuthCard
            id="forgot-password-page"
            title={step === 'EMAIL' ? 'Quên mật khẩu' : 'Đặt lại mật khẩu mới'}
            subtitle={
                step === 'EMAIL'
                    ? 'Nhập email đã đăng ký để nhận mã xác thực OTP 6 chữ số'
                    : `Nhập mã OTP đã gửi về ${targetEmail} và thiết lập mật khẩu mới`
            }
        >
            {step === 'EMAIL' ? (
                <form className="auth-form" onSubmit={emailForm.handleSubmit(handleSendOtp)} noValidate>
                    {serverError && (
                        <div className="auth-form__banner" role="alert">
                            {serverError}
                        </div>
                    )}

                    <div className="auth-form__group">
                        <label className="auth-form__label" htmlFor="forgot-email">
                            Địa chỉ Email
                        </label>
                        <input
                            id="forgot-email"
                            type="email"
                            autoComplete="email"
                            placeholder="email@example.com"
                            className={`auth-form__input${emailForm.formState.errors.email ? ' is-error' : ''}`}
                            {...emailForm.register('email')}
                        />
                        {emailForm.formState.errors.email && (
                            <span className="auth-form__error">{emailForm.formState.errors.email.message}</span>
                        )}
                    </div>

                    <button
                        id="forgot-send-otp-btn"
                        type="submit"
                        className="auth-form__submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Đang gửi mã OTP...' : 'Gửi mã OTP khôi phục'}
                    </button>

                    <p className="auth-card__footer">
                        Đã nhớ mật khẩu? <Link to="/login">Quay lại đăng nhập</Link>
                    </p>
                </form>
            ) : (
                <form className="auth-form" onSubmit={resetForm.handleSubmit(handleResetPassword)} noValidate>
                    {successMessage && (
                        <div className="auth-form__banner auth-form__banner--success" role="status">
                            {successMessage}
                        </div>
                    )}
                    {serverError && (
                        <div className="auth-form__banner" role="alert">
                            {serverError}
                        </div>
                    )}

                    {/* Nhập mã OTP kèm đồng hồ hiệu lực 10 phút & nút gửi lại sau 60s */}
                    <div className="auth-form__group">
                        <div className="auth-form__label-row">
                            <label className="auth-form__label" htmlFor="reset-otp">
                                Mã OTP {expirySeconds > 0 ? `(hiệu lực ${formatCountdown(expirySeconds)})` : '(đã hết hạn)'}
                            </label>
                            <button
                                type="button"
                                className="auth-form__link-btn"
                                onClick={() => void handleResendOtp()}
                                disabled={cooldown > 0}
                            >
                                {cooldown > 0 ? `Gửi lại (${cooldown}s)` : 'Gửi lại OTP'}
                            </button>
                        </div>
                        <input
                            id="reset-otp"
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            placeholder="Nhập mã 6 chữ số"
                            className={`auth-form__input${resetForm.formState.errors.otp ? ' is-error' : ''}`}
                            {...resetForm.register('otp')}
                            autoFocus
                        />
                        {resetForm.formState.errors.otp && (
                            <span className="auth-form__error">{resetForm.formState.errors.otp.message}</span>
                        )}
                    </div>

                    {/* Mật khẩu mới */}
                    <div className="auth-form__group">
                        <label className="auth-form__label" htmlFor="reset-new-password">
                            Mật khẩu mới
                        </label>
                        <input
                            id="reset-new-password"
                            type="password"
                            autoComplete="new-password"
                            placeholder="Ít nhất 8 ký tự (chữ hoa, chữ thường, số)"
                            className={`auth-form__input${resetForm.formState.errors.newPassword ? ' is-error' : ''}`}
                            {...resetForm.register('newPassword')}
                        />
                        {resetForm.formState.errors.newPassword && (
                            <span className="auth-form__error">{resetForm.formState.errors.newPassword.message}</span>
                        )}
                    </div>

                    {/* Xác nhận mật khẩu mới */}
                    <div className="auth-form__group">
                        <label className="auth-form__label" htmlFor="reset-confirm-password">
                            Xác nhận mật khẩu mới
                        </label>
                        <input
                            id="reset-confirm-password"
                            type="password"
                            autoComplete="new-password"
                            placeholder="Nhập lại mật khẩu mới"
                            className={`auth-form__input${resetForm.formState.errors.confirmPassword ? ' is-error' : ''}`}
                            {...resetForm.register('confirmPassword')}
                        />
                        {resetForm.formState.errors.confirmPassword && (
                            <span className="auth-form__error">{resetForm.formState.errors.confirmPassword.message}</span>
                        )}
                    </div>

                    <button
                        id="reset-password-submit-btn"
                        type="submit"
                        className="auth-form__submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Đang cập nhật mật khẩu...' : 'Xác nhận đặt lại mật khẩu'}
                    </button>

                    <div className="auth-card__footer auth-card__footer-actions">
                        {/* Nút quay lại bước 1 để nhập địa chỉ email khác */}
                        <button
                            type="button"
                            className="auth-form__link-btn"
                            onClick={() => {
                                setStep('EMAIL');
                                setServerError('');
                                setSuccessMessage('');
                            }}
                        >
                            Đổi địa chỉ email khác
                        </button>
                        {/* Dấu phân cách giữa hai tùy chọn điều hướng */}
                        <span className="auth-card__footer-sep" aria-hidden="true">|</span>
                        {/* Liên kết quay lại trang đăng nhập */}
                        <Link to="/login">Quay lại đăng nhập</Link>
                    </div>
                </form>
            )}
        </AuthCard>
    );
};

export default ForgotPasswordPage;
