import { Link } from 'react-router-dom';

function LandingFooter() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="lby-footer" role="contentinfo">
            <div className="lby-footer__main">
                {/* Brand */}
                <div>
                    <Link to="/landing" className="lby-navbar__logo" style={{ marginBottom: 0 }} aria-label="LEBY – Trang chủ">
                        <div className="lby-navbar__logo-icon" aria-hidden="true">L</div>
                        <span className="lby-navbar__logo-text">LEBY</span>
                    </Link>
                    <p className="lby-footer__brand-text">
                        Nền tảng thi thử và thích ứng TOEIC giúp tối ưu hoá điểm số thông qua
                        các thuật toán thông minh và lộ trình tối giản.
                    </p>
                </div>

                {/* Products */}
                <div>
                    <div className="lby-footer__col-title">Sản phẩm</div>
                    <ul className="lby-footer__links" aria-label="Liên kết sản phẩm">
                        <li><a href="#features">Luyện Listening</a></li>
                        <li><a href="#features">Luyện Reading</a></li>
                        <li><a href="#features">Hệ thống Adaptive</a></li>
                        <li><a href="#features">Đề thi thử</a></li>
                    </ul>
                </div>

                {/* Info */}
                <div>
                    <div className="lby-footer__col-title">Thông tin</div>
                    <ul className="lby-footer__links" aria-label="Liên kết thông tin">
                        <li><a href="#steps">Về LEBY</a></li>
                        <li><a href="#pricing">Bảng giá</a></li>
                        <li><a href="#pricing">Điều khoản dịch vụ</a></li>
                        <li><a href="#pricing">Chính sách bảo mật</a></li>
                    </ul>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="lby-footer__bottom">
                <span>© {currentYear} LEBY. All rights reserved.</span>
                <span className="lby-footer__tagline">Made for serious academic pursuits.</span>
            </div>
        </footer>
    );
}

export default LandingFooter;
