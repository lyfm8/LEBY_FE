import type React from 'react';
import dashboardImg from '@/assets/dashboard.png';

/**
 * Presentational Component: Cột giới thiệu thương hiệu LEBY nằm ở nửa bên trái
 * của giao diện Split-Screen trên các trang xác thực (Login, Đăng ký, OTP, Quên mật khẩu).
 */
export const AuthBrandPanel: React.FC = () => {
    // Trả về khối giao diện nền tối navy căn giữa dọc, xếp nội dung và ảnh minh họa ngang hàng nhau
    return (
        <aside className="auth-brand" aria-label="Giới thiệu nền tảng LEBY">
            {/* Khung lưới 2 cột con đặt khối chữ bên trái và ảnh minh họa bên phải ngang hàng ở chính giữa */}
            <div className="auth-brand__inner">
                {/* Khối nội dung thông điệp chính bên trái */}
                <div className="auth-brand__content">
                    {/* Nhãn badge nhận diện nền tảng TOEIC Adaptive */}
                    <div className="auth-brand__badge" aria-hidden="true">
                        {/* Chấm tròn nhỏ tạo điểm nhấn thị giác cho nhãn */}
                        <span className="auth-brand__badge-dot" />
                        {/* Văn bản giới thiệu định vị sản phẩm */}
                        <span>Nền tảng luyện thi TOEIC Adaptive thông minh</span>
                    </div>

                    {/* Tiêu đề chính gồm chữ trắng tương phản cao và cụm nhấn màu cam thương hiệu */}
                    <h2 className="auth-brand__title">
                        {/* Phần chữ trắng giữ độ tương phản rõ nét trên nền navy tối */}
                        <span>Master TOEIC </span>
                        {/* Phần chữ cam giữ liền mạch trên một cụm không tách lẻ từ */}
                        <span className="auth-brand__title-accent">Your Way</span>
                    </h2>

                    {/* Đoạn mô tả ngắn gọn giá trị cốt lõi của AI Adaptive */}
                    <p className="auth-brand__subtitle">
                        Học thông minh hơn nhờ AI nhận diện lỗ hổng kiến thức, tối ưu lộ trình thi và cá nhân hóa câu hỏi theo thời gian thực.
                    </p>

                    {/* Hàng thống kê 3 chỉ số nổi bật của nền tảng */}
                    <div className="auth-brand__stats" aria-label="Thống kê nền tảng LEBY">
                        {/* Chỉ số 1: Tổng số lượng học viên */}
                        <div className="auth-brand__stat">
                            {/* Giá trị số liệu in đậm nổi bật */}
                            <span className="auth-brand__stat-number">10,000+</span>
                            {/* Nhãn mô tả bên dưới số liệu */}
                            <span className="auth-brand__stat-label">Học viên</span>
                        </div>

                        {/* Vạch chia dọc phân tách giữa hai chỉ số */}
                        <div className="auth-brand__stat-divider" aria-hidden="true" />

                        {/* Chỉ số 2: Điểm đánh giá trung bình */}
                        <div className="auth-brand__stat">
                            {/* Giá trị số sao đánh giá */}
                            <span className="auth-brand__stat-number">4.9★</span>
                            {/* Nhãn mô tả đánh giá */}
                            <span className="auth-brand__stat-label">Đánh giá</span>
                        </div>

                        {/* Vạch chia dọc phân tách giữa hai chỉ số */}
                        <div className="auth-brand__stat-divider" aria-hidden="true" />

                        {/* Chỉ số 3: Mức tăng điểm TOEIC trung bình */}
                        <div className="auth-brand__stat">
                            {/* Giá trị điểm tăng trung bình */}
                            <span className="auth-brand__stat-number">+180đ</span>
                            {/* Nhãn mô tả mức tăng */}
                            <span className="auth-brand__stat-label">Tăng trung bình</span>
                        </div>
                    </div>
                </div>

                {/* Khối ảnh minh họa học viên bên laptop đặt ngang hàng và căn giữa cùng khối chữ */}
                <div className="auth-brand__visual" aria-hidden="true">
                    {/* Ảnh PNG tách nền được làm mờ dịu mép đáy để hòa vào nền navy */}
                    <img
                        src={dashboardImg}
                        alt=""
                        className="auth-brand__image"
                        loading="eager"
                    />
                </div>
            </div>
        </aside>
    );
};
