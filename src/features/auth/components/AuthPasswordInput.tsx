import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

type AuthPasswordInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> & {
    /** Đánh dấu trạng thái lỗi validation để viền đỏ */
    hasError?: boolean;
};

/**
 * Ô nhập mật khẩu dùng chung cho luồng xác thực, tích hợp nút bật/tắt hiển thị mật khẩu.
 */
export const AuthPasswordInput = React.forwardRef<HTMLInputElement, AuthPasswordInputProps>(
    ({ hasError = false, className = '', ...rest }, ref) => {
        const [isVisible, setIsVisible] = useState(false);

        return (
            <div className="auth-form__input-wrap">
                <input
                    ref={ref}
                    type={isVisible ? 'text' : 'password'}
                    className={`auth-form__input auth-form__input--with-action${hasError ? ' is-error' : ''}${
                        className ? ` ${className}` : ''
                    }`}
                    {...rest}
                />
                <button
                    type="button"
                    className="auth-form__toggle-btn"
                    onClick={() => setIsVisible((prev) => !prev)}
                    aria-label={isVisible ? 'Ẩn mật khẩu' : 'Xem mật khẩu'}
                    title={isVisible ? 'Ẩn mật khẩu' : 'Xem mật khẩu'}
                >
                    {isVisible ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
                </button>
            </div>
        );
    }
);

AuthPasswordInput.displayName = 'AuthPasswordInput';
