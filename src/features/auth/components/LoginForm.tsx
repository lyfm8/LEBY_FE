import React from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormValues } from '../schemas/authSchema';

/**
 * Props cho component LoginForm
 */
export interface LoginFormProps {
    /** Hàm callback được gọi khi submit form hợp lệ */
    onSubmit: (values: LoginFormValues) => Promise<void> | void;
    /** Trạng thái đang gửi request đăng nhập lên server */
    isLoading: boolean;
    /** Thông báo lỗi từ server nếu đăng nhập thất bại */
    serverError?: string;
}

/**
 * Presentational Component: Form đăng nhập tài khoản người dùng
 */
export const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, isLoading, serverError }) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    return (
        <>
            <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
                {/* Banner hiển thị lỗi từ server */}
                {serverError && (
                    <div className="auth-form__banner" role="alert">
                        {serverError}
                    </div>
                )}

                {/* Ô nhập Email */}
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

                {/* Ô nhập Mật khẩu */}
                <div className="auth-form__group">
                    <div className="auth-form__label-row">
                        <label className="auth-form__label" htmlFor="login-password">
                            Mật khẩu
                        </label>
                        <a href="#" className="auth-form__forgot">
                            Quên mật khẩu?
                        </a>
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

                {/* Nút Đăng nhập */}
                <button
                    id="login-submit-btn"
                    type="submit"
                    className="auth-form__submit"
                    disabled={isLoading}
                >
                    {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                </button>
            </form>

            {/* Phân cách */}
            <div className="auth-divider">
                <span className="auth-divider__text">Hoặc</span>
            </div>

            {/* Điều hướng học viên mới hoặc đăng ký */}
            <p style={{ textAlign: 'center', margin: '14px 0 0 0', fontSize: '0.875rem' }}>
                <Link to="/target-selection" style={{ color: '#ea580c', fontWeight: 600, textDecoration: 'none' }}>
                    🎯 Học viên mới? Bắt đầu chọn mục tiêu &amp; thi chẩn đoán →
                </Link>
            </p>
            <p className="auth-card__footer">
                Chưa có tài khoản?{' '}
                <Link to="/register">Đăng ký tài khoản mới</Link>
            </p>
        </>
    );
};
