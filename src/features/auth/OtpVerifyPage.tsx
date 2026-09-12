import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authService } from './authService';
import { useAuth } from '@/hooks/useAuth';
import type { RegisterRequest } from './authTypes';
import './auth.css';

/** Dữ liệu được truyền sang từ RegisterPage qua router state */
interface PendingRegister {
    fullName: string;
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
}

/** Ẩn một phần email để hiển thị cho user: abc***@gmail.com */
function maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    const visible = local.slice(0, 3);
    return `${visible}***@${domain}`;
}

function OtpVerifyPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { setUser } = useAuth();

    // Lấy dữ liệu đăng ký từ state
    const pending = (location.state as { pendingRegister?: PendingRegister })?.pendingRegister;

    // Nếu vào thẳng URL mà không có dữ liệu → redirect về register
    useEffect(() => {
        if (!pending) {
            navigate('/register', { replace: true });
        }
    }, [pending, navigate]);

    const [otp, setOtp] = useState('');
    const [otpError, setOtpError] = useState('');
    const [globalError, setGlobalError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // OTP cooldown
    const [otpSent, setOtpSent] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Cleanup timer on unmount
    useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

    function startCooldown() {
        setCooldown(60);
        timerRef.current = setInterval(() => {
            setCooldown((s) => {
                if (s <= 1) {
                    clearInterval(timerRef.current!);
                    return 0;
                }
                return s - 1;
            });
        }, 1000);
    }

    async function handleSendOtp() {
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
        } catch {
            setGlobalError('Không thể gửi OTP. Vui lòng kiểm tra kết nối.');
        }
    }

    function handleOtpChange(e: React.ChangeEvent<HTMLInputElement>) {
        const val = e.target.value.replace(/\D/g, '').slice(0, 6);
        setOtp(val);
        setOtpError('');
        setGlobalError('');
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!pending) return;

        if (!otpSent) {
            setOtpError('Vui lòng gửi OTP trước.');
            return;
        }
        if (otp.length !== 6) {
            setOtpError('Mã OTP gồm 6 chữ số.');
            return;
        }

        setIsSubmitting(true);
        setGlobalError('');
        setSuccessMessage('');
        try {
            const payload: RegisterRequest = { ...pending, otp };
            const res = await authService.register(payload);
            if (res.success && res.data) {
                setUser(res.data);
                navigate('/home', { replace: true });
            } else {
                setGlobalError(res.message ?? 'Xác thực thất bại. Vui lòng thử lại.');
            }
        } catch {
            setGlobalError('Đã xảy ra lỗi. Vui lòng thử lại.');
        } finally {
            setIsSubmitting(false);
        }
    }

    if (!pending) return null;

    return (
        <div className="auth-page" id="verify-otp-page">
            <div className="auth-card" role="main">
                {/* Logo */}
                <div className="auth-card__logo" aria-hidden="true">L</div>

                {/* Header */}
                <h1 className="auth-card__title">Xác thực email</h1>
                <p className="auth-card__subtitle">
                    Nhập mã OTP được gửi đến{' '}
                    <strong style={{ color: '#0f172a' }}>{maskEmail(pending.email)}</strong>
                </p>

                <form className="auth-form" onSubmit={handleSubmit} noValidate>
                    {/* Success banner */}
                    {successMessage && <div className="auth-form__banner auth-form__banner--success" role="status">{successMessage}</div>}

                    {/* Global error */}
                    {globalError && <div className="auth-form__banner" role="alert">{globalError}</div>}

                    {/* OTP input */}
                    <div className="auth-form__group">
                        <div className="auth-form__label-row">
                            <label className="auth-form__label" htmlFor="otp-input">
                                Mã OTP
                            </label>
                            {/* Gửi / Gửi lại OTP */}
                            <button
                                type="button"
                                id="otp-send-btn"
                                className="auth-form__forgot"
                                style={{ background: 'none', border: 'none', cursor: cooldown > 0 ? 'not-allowed' : 'pointer', padding: 0 }}
                                onClick={handleSendOtp}
                                disabled={cooldown > 0}
                                aria-label={otpSent ? 'Gửi lại mã OTP' : 'Gửi mã OTP'}
                            >
                                {cooldown > 0
                                    ? `Gửi lại (${cooldown}s)`
                                    : otpSent ? 'Gửi lại OTP' : 'Gửi OTP'}
                            </button>
                        </div>

                        <input
                            id="otp-input"
                            name="otp"
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            placeholder="Nhập mã 6 chữ số"
                            className={`auth-form__input${otpError ? ' is-error' : ''}`}
                            value={otp}
                            onChange={handleOtpChange}
                            autoFocus
                        />
                        {otpError && <span className="auth-form__error">{otpError}</span>}
                    </div>

                    {/* Submit */}
                    <button
                        id="otp-verify-btn"
                        type="submit"
                        className="auth-form__submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Đang xác thực...' : 'Xác nhận & Hoàn tất đăng ký'}
                    </button>
                </form>

                {/* Back link */}
                <p className="auth-card__footer">
                    Nhập sai thông tin?{' '}
                    <Link to="/register" state={{ savedForm: pending }}>Quay lại đăng ký</Link>
                </p>
            </div>
        </div>
    );
}

export default OtpVerifyPage;
