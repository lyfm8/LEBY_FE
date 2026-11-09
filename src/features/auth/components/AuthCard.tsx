import React from 'react';

/**
 * Props cho AuthCard component
 */
export interface AuthCardProps {
    /** Định danh id trang để hỗ trợ CSS selector và automation testing */
    id: string;
    /** Tiêu đề chính của thẻ xác thực */
    title: string;
    /** Mô tả phụ hoặc thông tin bổ sung dưới tiêu đề */
    subtitle: React.ReactNode;
    /** Nội dung form và liên kết điều hướng bên trong thẻ */
    children: React.ReactNode;
}

/**
 * Presentational Component: Khung thẻ Card dùng chung cho các màn hình Auth (Đăng nhập, Đăng ký, OTP).
 * Đóng gói logo nhận diện thương hiệu, tiêu đề, và căn chỉnh giao diện chuẩn mực.
 */
export const AuthCard: React.FC<AuthCardProps> = ({ id, title, subtitle, children }) => {
    return (
        <div className="auth-page" id={id}>
            <div className="auth-card" role="main">
                {/* Logo thương hiệu LEBY */}
                <div className="auth-card__logo" aria-hidden="true">
                    L
                </div>

                {/* Tiêu đề & phụ đề */}
                <h1 className="auth-card__title">{title}</h1>
                <p className="auth-card__subtitle">{subtitle}</p>

                {/* Nội dung bên trong card */}
                {children}
            </div>
        </div>
    );
};
