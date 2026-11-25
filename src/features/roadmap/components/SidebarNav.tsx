import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Compass, Award, Settings } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type { UserRole } from '@/features/auth/types/authTypes';
import '../roadmap.css';

const ROLE_LABELS: Record<UserRole, string> = {
    STUDENT: 'Học viên LEBY',
    TEACHER: 'Giảng viên',
    ADMIN: 'Quản trị viên',
};

/**
 * Thanh điều hướng trái (Desktop) và thanh điều hướng dưới (Mobile) dùng chung cho không gian học tập.
 * Hiển thị thông tin học viên thực tế từ AuthContext, không hardcode dữ liệu giả.
 */
export function SidebarNav() {
    const location = useLocation();
    const { user } = useAuth();

    const displayName = user?.fullName?.trim() || 'Học viên LEBY';
    const roleLabel = user?.role ? ROLE_LABELS[user.role] : 'Học viên LEBY';
    const avatarInitial = displayName.charAt(0).toUpperCase();

    // Xác định mục menu đang active theo URL hiện tại.
    // Lưu ý: isRoadmapActive phải loại trừ '/test' và '/result' để khi học viên vào trang kết quả thi vượt ải
    // (/modules/:id/test/result) thì tab "Kết quả" được highlight thay vì bị trùng với "Lộ trình học".
    const isDashboardActive = location.pathname === '/home' || location.pathname === '/dashboard';
    const isRoadmapActive =
        (location.pathname.startsWith('/learning-path') || location.pathname.startsWith('/modules')) &&
        !location.pathname.includes('/test') &&
        !location.pathname.includes('/result');
    const isResultsActive =
        location.pathname.startsWith('/results') ||
        location.pathname.startsWith('/learning-results') ||
        location.pathname.includes('/test/result');
    const isProfileActive = location.pathname === '/profile';

    return (
        <>
            <aside className="app-sidebar" aria-label="Điều hướng chính">
                <div className="app-sidebar__top">
                    <Link to="/dashboard" className="app-sidebar__logo">
                        <div className="app-sidebar__logo-badge">L</div>
                        <span className="app-sidebar__logo-text">LEBY</span>
                    </Link>

                    <nav className="app-sidebar__nav">
                        <Link
                            to="/dashboard"
                            className={`app-sidebar__nav-item ${isDashboardActive ? 'is-active' : ''}`}
                        >
                            <LayoutDashboard size={20} />
                            <span>Tổng quan</span>
                        </Link>

                        <Link
                            to="/learning-path"
                            className={`app-sidebar__nav-item ${isRoadmapActive ? 'is-active' : ''}`}
                        >
                            <Compass size={20} />
                            <span>Lộ trình học</span>
                        </Link>

                        <Link
                            to="/results"
                            className={`app-sidebar__nav-item ${isResultsActive ? 'is-active' : ''}`}
                        >
                            <Award size={20} />
                            <span>Kết quả</span>
                        </Link>

                        <Link
                            to="/profile"
                            className={`app-sidebar__nav-item ${isProfileActive ? 'is-active' : ''}`}
                        >
                            <Settings size={20} />
                            <span>Hồ sơ & Cài đặt</span>
                        </Link>
                    </nav>
                </div>

                <div className="app-sidebar__bottom">
                    <Link to="/profile" className="app-sidebar__user-card" title="Xem thông tin cá nhân">
                        {user?.avatar ? (
                            <img
                                src={user.avatar}
                                alt={displayName}
                                className="app-sidebar__avatar"
                            />
                        ) : (
                            <div className="app-sidebar__avatar-fallback" aria-hidden="true">
                                {avatarInitial}
                            </div>
                        )}
                        <div className="app-sidebar__user-info">
                            <span className="app-sidebar__user-name">{displayName}</span>
                            <span className="app-sidebar__user-badge">{roleLabel}</span>
                        </div>
                    </Link>
                </div>
            </aside>

            {/* Thanh điều hướng nhanh trên thiết bị di động (Responsive <= 900px) */}
            <nav className="app-mobile-nav" aria-label="Điều hướng di động">
                <Link
                    to="/dashboard"
                    className={`app-mobile-nav__item ${isDashboardActive ? 'is-active' : ''}`}
                >
                    <LayoutDashboard size={20} />
                    <span>Tổng quan</span>
                </Link>
                <Link
                    to="/learning-path"
                    className={`app-mobile-nav__item ${isRoadmapActive ? 'is-active' : ''}`}
                >
                    <Compass size={20} />
                    <span>Lộ trình</span>
                </Link>
                <Link
                    to="/results"
                    className={`app-mobile-nav__item ${isResultsActive ? 'is-active' : ''}`}
                >
                    <Award size={20} />
                    <span>Kết quả</span>
                </Link>
                <Link
                    to="/profile"
                    className={`app-mobile-nav__item ${isProfileActive ? 'is-active' : ''}`}
                >
                    <Settings size={20} />
                    <span>Hồ sơ</span>
                </Link>
            </nav>
        </>
    );
}
