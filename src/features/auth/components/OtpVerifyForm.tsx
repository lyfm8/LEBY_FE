import React from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { otpSchema, type OtpFormValues } from '../schemas/authSchema';
import type { RegisterRequest } from '../types/authTypes';

/**
 * Props cho component OtpVerifyForm
 */
export interface OtpVerifyFormProps {
    /** Hàm xử lý xác nhận mã OTP */
    onSubmit: (values: OtpFormValues) => Promise<void> | void;
    /** Hàm kích hoạt gửi hoặc gửi lại OTP về email */
    onSendOtp: () => Promise<void> | void;
    /** Trạng thái đang gửi request xác thực */
    isSubmitting: boolean;
    /** Trạng thái đã gửi OTP ít nhất 1 lần hay chưa */
    otpSent: boolean;
    /** Thời gian đếm ngược (giây) trước khi được phép gửi lại */
    cooldown: number;
    /** Thông báo lỗi hệ thống/server */
    globalError?: string;
    /** Thông báo thành công khi gửi OTP */
    successMessage?: string;
    /** Dữ liệu form đăng ký tạm thời để quay lại nếu cần chỉnh sửa */
    pendingRegister: Omit<RegisterRequest, 'otp'>;
}

/**
 * Presentational Component: Form nhập mã OTP và gửi lại mã OTP
 */
export const OtpVerifyForm: React.FC<OtpVerifyFormProps> = ({
    onSubmit,
    onSendOtp,
    isSubmitting,
    otpSent,
    cooldown,
    globalError,
    successMessage,
    pendingRegister,
}) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<OtpFormValues>({
        resolver: zodResolver(otpSchema),
        defaultValues: {
            otp: '',
        },
    });

    return (
        <>
            <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
                {/* Banner thông báo thành công */}
                {successMessage && (
                    <div className="auth-form__banner auth-form__banner--success" role="status">
                        {successMessage}
                    </div>
                )}

                {/* Banner thông báo lỗi */}
                {globalError && (
                    <div className="auth-form__banner" role="alert">
                        {globalError}
                    </div>
                )}

                {/* Nhóm nhập mã OTP */}
                <div className="auth-form__group">
                    <div className="auth-form__label-row">
                        <label className="auth-form__label" htmlFor="otp-input">
                            Mã OTP
                        </label>
                        {/* Nút gửi / gửi lại mã OTP */}
                        <button
                            type="button"
                            id="otp-send-btn"
                            className="auth-form__forgot"
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: cooldown > 0 ? 'not-allowed' : 'pointer',
                                padding: 0,
                            }}
                            onClick={onSendOtp}
                            disabled={cooldown > 0}
                            aria-label={otpSent ? 'Gửi lại mã OTP' : 'Gửi mã OTP'}
                        >
                            {cooldown > 0
                                ? `Gửi lại (${cooldown}s)`
                                : otpSent
                                  ? 'Gửi lại OTP'
                                  : 'Gửi OTP'}
                        </button>
                    </div>

                    <input
                        id="otp-input"
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="Nhập mã 6 chữ số"
                        className={`auth-form__input${errors.otp ? ' is-error' : ''}`}
                        {...register('otp')}
                        autoFocus
                    />
                    {errors.otp && <span className="auth-form__error">{errors.otp.message}</span>}
                </div>

                {/* Nút hoàn tất xác thực */}
                <button
                    id="otp-verify-btn"
                    type="submit"
                    className="auth-form__submit"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Đang xác thực...' : 'Xác nhận & Hoàn tất đăng ký'}
                </button>
            </form>

            {/* Điều hướng quay lại bước đăng ký để chỉnh sửa thông tin */}
            <p className="auth-card__footer">
                Nhập sai thông tin?{' '}
                <Link to="/register" state={{ savedForm: pendingRegister }}>
                    Quay lại đăng ký
                </Link>
            </p>
        </>
    );
};
