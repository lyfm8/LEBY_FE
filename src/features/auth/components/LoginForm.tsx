import type React from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Compass } from 'lucide-react';
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
    /** Thông báo thành công (VD: vừa đặt lại mật khẩu xong) */
    infoMessage?: string;
}

/**
 * Presentational Component: Form đăng nhập tài khoản người dùng.
 *
 * @param props Callback submit, trạng thái loading và thông báo phản hồi từ server
 */
export const LoginForm: React.FC<LoginFormProps> = ({
    onSubmit,
    isLoading,
    serverError,
    infoMessage,
}) => {
    // Khởi tạo React Hook Form tích hợp Zod validation cho email và mật khẩu
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

    // Render giao diện form đăng nhập cùng các liên kết điều hướng phụ
    return (
        <>
            {/* Biểu mẫu đăng nhập tắt validate mặc định của trình duyệt để dùng thông báo Zod */}
            <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
                {/* Banner thông báo thành công (VD: vừa đổi mật khẩu thành công từ UC04) */}
                {infoMessage && (
                    <div className="auth-form__banner auth-form__banner--success" role="status">
                        {infoMessage}
                    </div>
                )}

                {/* Banner hiển thị lỗi từ server */}
                {serverError && (
                    <div className="auth-form__banner" role="alert">
                        {serverError}
                    </div>
                )}

                {/* Ô nhập Email */}
                <div className="auth-form__group">
                    {/* Nhãn liên kết với ô input email */}
                    <label className="auth-form__label" htmlFor="login-email">
                        Địa chỉ Email
                    </label>
                    {/* Trường nhập email tài khoản */}
                    <input
                        id="login-email"
                        type="email"
                        autoComplete="email"
                        placeholder="email@example.com"
                        className={`auth-form__input${errors.email ? ' is-error' : ''}`}
                        {...register('email')}
                    />
                    {/* Hiển thị thông báo lỗi validation email ngay bên dưới input */}
                    {errors.email && <span className="auth-form__error">{errors.email.message}</span>}
                </div>

                {/* Ô nhập Mật khẩu */}
                <div className="auth-form__group">
                    {/* Hàng tiêu đề gồm nhãn mật khẩu và liên kết quên mật khẩu */}
                    <div className="auth-form__label-row">
                        {/* Nhãn liên kết với ô input mật khẩu */}
                        <label className="auth-form__label" htmlFor="login-password">
                            Mật khẩu
                        </label>
                        {/* Đường dẫn sang màn hình khôi phục mật khẩu bằng OTP */}
                        <Link to="/forgot-password" className="auth-form__forgot">
                            Quên mật khẩu?
                        </Link>
                    </div>
                    {/* Trường nhập mật khẩu đăng nhập */}
                    <input
                        id="login-password"
                        type="password"
                        autoComplete="current-password"
                        placeholder="••••••••••••"
                        className={`auth-form__input${errors.password ? ' is-error' : ''}`}
                        {...register('password')}
                    />
                    {/* Hiển thị thông báo lỗi validation mật khẩu ngay bên dưới input */}
                    {errors.password && <span className="auth-form__error">{errors.password.message}</span>}
                </div>

                {/* Nút Đăng nhập */}
                <button
                    id="login-submit-btn"
                    type="submit"
                    className="auth-form__submit"
                    disabled={isLoading}
                >
                    {/* Đổi nhãn nút khi đang chờ server phản hồi */}
                    {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                </button>
            </form>

            {/* Đường kẻ phân cách giữa form chính và luồng điều hướng phụ */}
            <div className="auth-divider">
                <span className="auth-divider__text">Hoặc</span>
            </div>

            {/* Điều hướng nhanh cho học viên mới muốn chọn mục tiêu & làm bài chẩn đoán */}
            <p className="auth-card__promo">
                <Link to="/target-selection" className="auth-card__promo-link">
                    {/* Biểu tượng la bàn đại diện cho định hướng lộ trình học */}
                    <Compass size={16} aria-hidden="true" />
                    {/* Nội dung kêu gọi hành động */}
                    <span>Học viên mới? Bắt đầu chọn mục tiêu &amp; thi chẩn đoán</span>
                    {/* Biểu tượng mũi tên chỉ hướng tiếp theo */}
                    <ArrowRight size={15} aria-hidden="true" />
                </Link>
            </p>

            {/* Chân thẻ chuyển sang màn hình đăng ký tài khoản mới */}
            <p className="auth-card__footer">
                Chưa có tài khoản?{' '}
                <Link to="/register">Đăng ký tài khoản mới</Link>
            </p>
        </>
    );
};
