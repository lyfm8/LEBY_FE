import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { authService } from './authService';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { loginSchema, type LoginFormValues } from './authSchema';
import './auth.css';

function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { setUser } = useAuth();

    // Redirect về trang user muốn vào trước khi bị đẩy ra login
    const from = (location.state as { from?: Location })?.from?.pathname ?? '/home';

    const [serverError, setServerError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema) as any,
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const onSubmit = async (data: LoginFormValues) => {
        setIsLoading(true);
        setServerError('');
        try {
            const res = await authService.login(data);
            if (res.success && res.data) {
                setUser(res.data);
                let target = from;
                if (res.data.role === 'ADMIN' && target === '/home') {
                    target = '/admin';
                }
                navigate(target, { replace: true });
            } else {
                setServerError(res.message ?? 'Đăng nhập thất bại. Vui lòng thử lại.');
            }
        } catch (error: any) {
            if (error?.response?.data?.message) {
                setServerError(error.response.data.message);
            } else {
                setServerError('Email hoặc mật khẩu không đúng.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-page" id="login-page">
            <div className="auth-card" role="main">
                {/* Logo */}
                <div className="auth-card__logo" aria-hidden="true">L</div>

                {/* Header */}
                <h1 className="auth-card__title">Đăng nhập vào LEBY</h1>
                <p className="auth-card__subtitle">Rèn luyện TOEIC nghiêm túc và bài bản</p>

                {/* Form */}
                <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
                    {/* Error banner */}
                    {serverError && <div className="auth-form__banner" role="alert">{serverError}</div>}

                    {/* Email */}
                    <div className="auth-form__group">
                        <label className="auth-form__label" htmlFor="login-email">
                            Địa chỉ Email
                        </label>
                        <input
                            id="login-email"
                            type="email"
                            autoComplete="email"
                            placeholder="email@example.com"
                            className={`auth-form__input${errors.email ? ' is-error' : ''}`}
                            {...register('email')}
                        />
                        {errors.email && <span className="auth-form__error">{errors.email.message}</span>}
                    </div>

                    {/* Password */}
                    <div className="auth-form__group">
                        <div className="auth-form__label-row">
                            <label className="auth-form__label" htmlFor="login-password">
                                Mật khẩu
                            </label>
                            <a href="#" className="auth-form__forgot">Quên mật khẩu?</a>
                        </div>
                        <input
                            id="login-password"
                            type="password"
                            autoComplete="current-password"
                            placeholder="••••••••••••"
                            className={`auth-form__input${errors.password ? ' is-error' : ''}`}
                            {...register('password')}
                        />
                        {errors.password && <span className="auth-form__error">{errors.password.message}</span>}
                    </div>

                    {/* Submit */}
                    <button
                        id="login-submit-btn"
                        type="submit"
                        className="auth-form__submit"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                    </button>
                </form>

                {/* Divider */}
                <div className="auth-divider">
                    <span className="auth-divider__text">Hoặc</span>
                </div>

                {/* Footer */}
                <p style={{ textAlign: 'center', margin: '14px 0 0 0', fontSize: '0.875rem' }}>
                    <Link to="/target-selection" style={{ color: '#ea580c', fontWeight: 600, textDecoration: 'none' }}>
                        🎯 Học viên mới? Bắt đầu chọn mục tiêu &amp; thi chẩn đoán →
                    </Link>
                </p>
                <p className="auth-card__footer">
                    Chưa có tài khoản?{' '}
                    <Link to="/register">Đăng ký tài khoản mới</Link>
                </p>
            </div>
        </div>
    );
}

export default LoginPage;
