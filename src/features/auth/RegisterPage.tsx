import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './auth.css';

interface RegisterForm {
    fullName: string;
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    terms: boolean;
}

type FormErrors = Partial<Record<keyof RegisterForm, string>>;

function RegisterPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const saved = (location.state as { savedForm?: Partial<RegisterForm> })?.savedForm;

    const [form, setForm] = useState<RegisterForm>({
        fullName: saved?.fullName ?? '',
        username: saved?.username ?? '',
        email: saved?.email ?? '',
        password: saved?.password ?? '',
        confirmPassword: saved?.confirmPassword ?? '',
        terms: saved ? true : false,
    });

    const [errors, setErrors] = useState<FormErrors>({});

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        setErrors((prev) => ({ ...prev, [name]: '' }));
    }

    function validate(): boolean {
        const errs: FormErrors = {};
        if (!form.fullName.trim())
            errs.fullName = 'Vui lòng nhập họ và tên.';
        if (!form.username.trim())
            errs.username = 'Vui lòng nhập tên đăng nhập.';
        else if (form.username.length < 3)
            errs.username = 'Tên đăng nhập tối thiểu 3 ký tự.';
        if (!form.email)
            errs.email = 'Vui lòng nhập email.';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
            errs.email = 'Email không hợp lệ.';
        if (!form.password)
            errs.password = 'Vui lòng nhập mật khẩu.';
        else if (form.password.length < 8)
            errs.password = 'Mật khẩu tối thiểu 8 ký tự.';
        if (form.password !== form.confirmPassword)
            errs.confirmPassword = 'Mật khẩu xác nhận không khớp.';
        if (!form.terms)
            errs.terms = 'Bạn cần đồng ý với điều khoản dịch vụ.';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!validate()) return;

        // Chuyển sang trang xác thực OTP, kèm toàn bộ form data
        navigate('/verify-otp', {
            state: {
                pendingRegister: {
                    fullName: form.fullName,
                    username: form.username,
                    email: form.email,
                    password: form.password,
                    confirmPassword: form.confirmPassword,
                },
            },
        });
    }

    return (
        <div className="auth-page" id="register-page">
            <div className="auth-card" role="main">
                {/* Logo */}
                <div className="auth-card__logo" aria-hidden="true">L</div>

                {/* Header */}
                <h1 className="auth-card__title">Tạo tài khoản LEBY</h1>
                <p className="auth-card__subtitle">Trải nghiệm học tập tối ưu hóa ngay hôm nay</p>

                <form className="auth-form" onSubmit={handleSubmit} noValidate>
                    {/* Họ và tên */}
                    <div className="auth-form__group">
                        <label className="auth-form__label" htmlFor="reg-fullName">Họ và tên</label>
                        <input
                            id="reg-fullName"
                            name="fullName"
                            type="text"
                            autoComplete="name"
                            placeholder="Nguyễn Văn A"
                            className={`auth-form__input${errors.fullName ? ' is-error' : ''}`}
                            value={form.fullName}
                            onChange={handleChange}
                        />
                        {errors.fullName && <span className="auth-form__error">{errors.fullName}</span>}
                    </div>

                    {/* Tên đăng nhập */}
                    <div className="auth-form__group">
                        <label className="auth-form__label" htmlFor="reg-username">Tên đăng nhập</label>
                        <input
                            id="reg-username"
                            name="username"
                            type="text"
                            autoComplete="username"
                            placeholder="nguyenvana123"
                            className={`auth-form__input${errors.username ? ' is-error' : ''}`}
                            value={form.username}
                            onChange={handleChange}
                        />
                        {errors.username && <span className="auth-form__error">{errors.username}</span>}
                    </div>

                    {/* Email */}
                    <div className="auth-form__group">
                        <label className="auth-form__label" htmlFor="reg-email">Địa chỉ Email</label>
                        <input
                            id="reg-email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            placeholder="email@example.com"
                            className={`auth-form__input${errors.email ? ' is-error' : ''}`}
                            value={form.email}
                            onChange={handleChange}
                        />
                        {errors.email && <span className="auth-form__error">{errors.email}</span>}
                    </div>

                    {/* Mật khẩu */}
                    <div className="auth-form__group">
                        <label className="auth-form__label" htmlFor="reg-password">Mật khẩu</label>
                        <input
                            id="reg-password"
                            name="password"
                            type="password"
                            autoComplete="new-password"
                            placeholder="Nhập mật khẩu (ít nhất 8 ký tự)"
                            className={`auth-form__input${errors.password ? ' is-error' : ''}`}
                            value={form.password}
                            onChange={handleChange}
                        />
                        {errors.password && <span className="auth-form__error">{errors.password}</span>}
                    </div>

                    {/* Xác nhận mật khẩu */}
                    <div className="auth-form__group">
                        <label className="auth-form__label" htmlFor="reg-confirmPassword">Xác nhận mật khẩu</label>
                        <input
                            id="reg-confirmPassword"
                            name="confirmPassword"
                            type="password"
                            autoComplete="new-password"
                            placeholder="Nhập lại mật khẩu"
                            className={`auth-form__input${errors.confirmPassword ? ' is-error' : ''}`}
                            value={form.confirmPassword}
                            onChange={handleChange}
                        />
                        {errors.confirmPassword && <span className="auth-form__error">{errors.confirmPassword}</span>}
                    </div>

                    {/* Điều khoản */}
                    <div className="auth-form__group">
                        <label className="auth-form__terms">
                            <input
                                type="checkbox"
                                name="terms"
                                id="reg-terms"
                                className="auth-form__terms-checkbox"
                                checked={form.terms}
                                onChange={handleChange}
                            />
                            <span className="auth-form__terms-text">
                                Tôi đồng ý với các{' '}
                                <a href="#">Điều khoản Dịch vụ</a>
                                {' '}và{' '}
                                <a href="#">Chính sách Bảo mật</a>
                                {' '}của LEBY
                            </span>
                        </label>
                        {errors.terms && <span className="auth-form__error">{errors.terms}</span>}
                    </div>

                    {/* Submit */}
                    <button id="reg-submit-btn" type="submit" className="auth-form__submit">
                        Tiếp theo
                    </button>
                </form>

                <p className="auth-card__footer">
                    Đã có tài khoản?{' '}
                    <Link to="/login">Đăng nhập ngay</Link>
                </p>
            </div>
        </div>
    );
}

export default RegisterPage;
