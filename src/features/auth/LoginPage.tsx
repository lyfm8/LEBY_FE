import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from './authService';
import { useAuth } from '@/hooks/useAuth';
import './auth.css';

function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { setUser } = useAuth();

    // Redirect về trang user muốn vào trước khi bị đẩy ra login
    const from = (location.state as { from?: Location })?.from?.pathname ?? '/home';

    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setError('');
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!form.email || !form.password) {
            setError('Vui lòng nhập đầy đủ thông tin.');
            return;
        }
        setIsLoading(true);
        try {
            const res = await authService.login(form);
            if (res.success && res.data) {
                setUser(res.data);
                navigate(from, { replace: true });
            } else {
                setError(res.message ?? 'Đăng nhập thất bại. Vui lòng thử lại.');
            }
        } catch {
            setError('Email hoặc mật khẩu không đúng.');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="auth-page" id="login-page">
            <div className="auth-card" role="main">
                {/* Logo */}
                <div className="auth-card__logo" aria-hidden="true">L</div>

                {/* Header */}
                <h1 className="auth-card__title">Đăng nhập vào LEBY</h1>
                <p className="auth-card__subtitle">Rèn luyện TOEIC nghiêm túc và bài bản</p>

                {/* Form */}
                <form className="auth-form" onSubmit={handleSubmit} noValidate>
                    {/* Error banner */}
                    {error && <div className="auth-form__banner" role="alert">{error}</div>}

                    {/* Email */}
                    <div className="auth-form__group">
                        <label className="auth-form__label" htmlFor="login-email">
                            Địa chỉ Email
                        </label>
                        <input
                            id="login-email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            placeholder="username@email.com"
                            className="auth-form__input"
                            value={form.email}
                            onChange={handleChange}
                            required
                        />
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
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            placeholder="••••••••••••"
                            className="auth-form__input"
                            value={form.password}
                            onChange={handleChange}
                            required
                        />
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
                <p className="auth-card__footer">
                    Chưa có tài khoản?{' '}
                    <Link to="/register">Đăng ký tài khoản mới</Link>
                </p>
            </div>
        </div>
    );
}

export default LoginPage;
