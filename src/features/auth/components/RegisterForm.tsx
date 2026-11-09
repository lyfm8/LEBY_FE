import React from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterFormValues } from '../schemas/authSchema';

/**
 * Props cho component RegisterForm
 */
export interface RegisterFormProps {
    /** Hàm callback được gọi khi submit form hợp lệ */
    onSubmit: (values: RegisterFormValues) => void;
    /** Dữ liệu khởi tạo (khôi phục từ bước trước nếu user quay lại) */
    defaultValues?: Partial<RegisterFormValues>;
}

/**
 * Presentational Component: Form đăng ký tài khoản học viên mới
 */
export const RegisterForm: React.FC<RegisterFormProps> = ({ onSubmit, defaultValues }) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            fullName: defaultValues?.fullName ?? '',
            email: defaultValues?.email ?? '',
            password: defaultValues?.password ?? '',
            confirmPassword: defaultValues?.confirmPassword ?? '',
            terms: defaultValues ? true : false,
        },
    });

    return (
        <>
            <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
                {/* Họ và tên */}
                <div className="auth-form__group">
                    <label className="auth-form__label" htmlFor="reg-fullName">
                        Họ và tên
                    </label>
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
                    <label className="auth-form__label" htmlFor="reg-email">
                        Địa chỉ Email
                    </label>
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
                    <label className="auth-form__label" htmlFor="reg-password">
                        Mật khẩu
                    </label>
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
                    <label className="auth-form__label" htmlFor="reg-confirmPassword">
                        Xác nhận mật khẩu
                    </label>
                    <input
                        id="reg-confirmPassword"
                        type="password"
                        autoComplete="new-password"
                        placeholder="Nhập lại mật khẩu"
                        className={`auth-form__input${errors.confirmPassword ? ' is-error' : ''}`}
                        {...register('confirmPassword')}
                    />
                    {errors.confirmPassword && (
                        <span className="auth-form__error">{errors.confirmPassword.message}</span>
                    )}
                </div>

                {/* Đồng ý Điều khoản & Chính sách */}
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

                {/* Nút Tiếp theo */}
                <button id="reg-submit-btn" type="submit" className="auth-form__submit">
                    Tiếp theo
                </button>
            </form>

            <p className="auth-card__footer">
                Đã có tài khoản?{' '}
                <Link to="/login">Đăng nhập ngay</Link>
            </p>
        </>
    );
};
