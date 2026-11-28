import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import dashboardImg from '@/assets/dashboard.png';

function HeroSection() {
    return (
        <section className="lby-hero" id="hero" aria-labelledby="hero-heading">
            {/* Left: Content */}
            <div className="lby-hero__content">
                {/* Badge */}
                <div className="lby-hero__badge" aria-hidden="true">
                    <span className="lby-hero__badge-dot" />
                    Nền tảng luyện thi TOEIC Adaptive thông minh
                </div>

                {/* Heading */}
                <h1 className="lby-hero__title" id="hero-heading">
                    Master TOEIC{' '}
                    <span className="lby-hero__title-accent">Your Way</span>
                </h1>

                {/* Subtitle */}
                <p className="lby-hero__subtitle">
                    Học thông minh hơn nhờ AI nhận diện lỗ hổng kiến thức,
                    tối ưu lộ trình thi và cá nhân hoá câu hỏi theo thời gian thực.
                </p>

                {/* Social proof stats */}
                <div className="lby-hero__stats" aria-label="Thống kê">
                    <div className="lby-hero__stat">
                        <span className="lby-hero__stat-number">10,000+</span>
                        <span className="lby-hero__stat-label">Học viên</span>
                    </div>
                    <div className="lby-hero__stat-divider" />
                    <div className="lby-hero__stat">
                        <span className="lby-hero__stat-number">4.9★</span>
                        <span className="lby-hero__stat-label">Đánh giá</span>
                    </div>
                    <div className="lby-hero__stat-divider" />
                    <div className="lby-hero__stat">
                        <span className="lby-hero__stat-number">+180đ</span>
                        <span className="lby-hero__stat-label">Tăng trung bình</span>
                    </div>
                </div>

                {/* CTA buttons */}
                <div className="lby-hero__cta">
                    <Link to="/register" className="lby-hero__btn-primary" id="hero-cta-primary">
                        Bắt đầu miễn phí
                        <ArrowRight size={18} aria-hidden="true" />
                    </Link>
    
                </div>
            </div>

            {/* Right: Dashboard screenshot */}
            <div className="lby-hero__visual" aria-hidden="true">
                <img
                    src={dashboardImg}
                    alt="Giao diện dashboard LEBY"
                    className="lby-hero__image"
                    loading="eager"
                    width={1200}
                    height={800}
                />
            </div>
        </section>
    );
}

export default HeroSection;
