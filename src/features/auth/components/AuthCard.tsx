import type React from 'react';
import { useRef } from 'react';
import { AuthBrandPanel } from './AuthBrandPanel';
import { NotebookGridCanvas } from './NotebookGridCanvas';

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
    /** Mở rộng thẻ cho form đăng ký 2 cột */
    wide?: boolean;
}

/**
 * Presentational Component: Khung bố cục Split-Screen dùng chung cho toàn bộ các màn hình Auth
 * (Đăng nhập, Đăng ký, Xác thực OTP và Quên mật khẩu).
 * Nửa bên trái hiển thị nhận diện thương hiệu LEBY, nửa bên phải hiển thị nền vở ô ly tương tác
 * Antigravity kèm thẻ form nhập liệu.
 *
 * @param props Thuộc tính tiêu đề, mô tả, nội dung form và chế độ thẻ rộng
 */
export const AuthCard: React.FC<AuthCardProps> = ({ id, title, subtitle, children, wide = false }) => {
    // Tạo ref gắn vào cột bên phải để Canvas nền theo dõi tọa độ chuột trên toàn vùng form
    const formPaneRef = useRef<HTMLDivElement | null>(null);

    // Trả về bố cục Split-Screen 2 nửa (50/50 trên desktop, xếp dọc gọn trên mobile)
    return (
        <div className="auth-split" id={id}>
            {/* Nửa bên trái: Bảng giới thiệu nền tảng LEBY nền tối navy */}
            <AuthBrandPanel />

            {/* Nửa bên phải: Nền giấy vở ô ly tương tác kèm form nhập liệu */}
            <div ref={formPaneRef} className="auth-split__form-pane">
                {/* Lớp Canvas vẽ lưới ô ly đàn hồi theo con trỏ chuột (Biến thể B) */}
                <NotebookGridCanvas containerRef={formPaneRef} />

                {/* Thẻ form trắng nổi khối ở lớp trên để giữ độ tương phản sắc nét khi nhập liệu */}
                <main className={`auth-card${wide ? ' auth-card--wide' : ''}`}>
                    {/* Logo chữ L nhận diện thương hiệu LEBY */}
                    <div className="auth-card__logo" aria-hidden="true">
                        L
                    </div>

                    {/* Tiêu đề chính của màn hình xác thực */}
                    <h1 className="auth-card__title">{title}</h1>
                    {/* Mô tả phụ hoặc hướng dẫn ngắn dưới tiêu đề */}
                    <p className="auth-card__subtitle">{subtitle}</p>

                    {/* Nội dung form và liên kết điều hướng được truyền từ trang cha */}
                    {children}
                </main>
            </div>
        </div>
    );
};
