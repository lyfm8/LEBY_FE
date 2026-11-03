import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterFormValues } from './authSchema';
import './auth.css';

function RegisterPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const saved = (location.state as { savedForm?: Partial<RegisterFormValues> })?.savedForm;

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema) as any,
        defaultValues: {
            fullName: saved?.fullName ?? '',
            email: saved?.email ?? '',
            password: saved?.password ?? '',
            confirmPassword: saved?.confirmPassword ?? '',
            terms: saved ? true : false,
        },
    });

    const onSubmit = (data: RegisterFormValues) => {
        // Chuyển sang trang xác thực OTP, kèm toàn bộ form data
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
        <div className="auth-page" id="register-page">
            <div className="auth-card" role="main">
                {/* Logo */}
                <div className="auth-card__logo" aria-hidden="true">L</div>

                {/* Header */}
                <h1 className="auth-card__title">Tạo tài khoản LEBY</h1>
                <p className="auth-card__subtitle">Trải nghiệm học tập tối ưu hóa ngay hôm nay</p>

                <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
                    {/* Họ và tên */}
                    <div className="auth-form__group">
                        <label className="auth-form__label" htmlFor="reg-fullName">Họ và tên</label>
                        <input
                            id="reg-fullName"
                            type="text"
                            autoComplete="name"
                            placeholder="Nguyễn Văn A"
                            className={`auth-form__input${errors.fullName ? ' is-error' : ''}`}
                            {...register('fullName')}
                        />
                        {errors.fullName && <span className="auth-form__error">{errors.fullName.message}</span>}
                    </div>

                    {/* Email */}
                    <div className="auth-form__group">
                        <label className="auth-form__label" htmlFor="reg-email">Địa chỉ Email</label>
                        <input
                            id="reg-email"
                            type="email"
                            autoComplete="email"
                            placeholder="email@example.com"
                            className={`auth-form__input${errors.email ? ' is-error' : ''}`}
                            {...register('email')}
                        />
                        {errors.email && <span className="auth-form__error">{errors.email.message}</span>}
                    </div>

                    {/* Mật khẩu */}
                    <div className="auth-form__group">
                        <label className="auth-form__label" htmlFor="reg-password">Mật khẩu</label>
                        <input
                            id="reg-password"
                            type="password"
                            autoComplete="new-password"
                            placeholder="Nhập mật khẩu (ít nhất 8 ký tự)"
                            className={`auth-form__input${errors.password ? ' is-error' : ''}`}
                            {...register('password')}
                        />
                        {errors.password && <span className="auth-form__error">{errors.password.message}</span>}
                    </div>

                    {/* Xác nhận mật khẩu */}
                    <div className="auth-form__group">
                        <label className="auth-form__label" htmlFor="reg-confirmPassword">Xác nhận mật khẩu</label>
                        <input
                            id="reg-confirmPassword"
                            type="password"
                            autoComplete="new-password"
                            placeholder="Nhập lại mật khẩu"
                            className={`auth-form__input${errors.confirmPassword ? ' is-error' : ''}`}
                            {...register('confirmPassword')}
                        />
                        {errors.confirmPassword && <span className="auth-form__error">{errors.confirmPassword.message}</span>}
                    </div>

                    {/* Điều khoản */}
                    <div className="auth-form__group">
                        <label className="auth-form__terms">
                            <input
                                type="checkbox"
                                id="reg-terms"
                                className="auth-form__terms-checkbox"
                                {...register('terms')}
                            />
                            <span className="auth-form__terms-text">
                                Tôi đồng ý với các{' '}
                                <a href="#">Điều khoản Dịch vụ</a>
                                {' '}và{' '}
                                <a href="#">Chính sách Bảo mật</a>
                                {' '}của LEBY
                            </span>
                        </label>
                        {errors.terms && <span className="auth-form__error">{errors.terms.message}</span>}
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
