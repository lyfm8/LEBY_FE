import { Link } from 'react-router-dom';

function LandingNavbar() {
    return (
        <header className="lby-navbar" role="banner">
            {/* Logo */}
            <Link to="/landing" className="lby-navbar__logo" aria-label="LEBY – Trang chủ">
                <div className="lby-navbar__logo-icon" aria-hidden="true">L</div>
                <span className="lby-navbar__logo-text">LEBY</span>
            </Link>

            {/* Nav links */}
            <nav aria-label="Điều hướng chính">
                <ul className="lby-navbar__nav">
                    <li><a href="#features">Tính năng</a></li>
                    <li><a href="#steps">Lộ trình học</a></li>
                    <li><a href="#pricing">Học phí</a></li>
                </ul>
            </nav>

            {/* Auth actions */}
            <div className="lby-navbar__actions">
                <Link to="/login" className="lby-btn-ghost" id="nav-login-btn">
                    Đăng nhập
                </Link>
                <Link to="/register" className="lby-btn-primary" id="nav-register-btn">
                    Bắt đầu miễn phí
                </Link>
            </div>
        </header>
    );
}

export default LandingNavbar;
