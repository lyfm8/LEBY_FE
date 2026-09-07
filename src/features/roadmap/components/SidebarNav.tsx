import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Compass, Award, Settings } from 'lucide-react';
import '../roadmap.css';

export function SidebarNav() {
    const location = useLocation();

    return (
        <aside className="app-sidebar" aria-label="Điều hướng chính">
            <div className="app-sidebar__top">
                <Link to="/dashboard" className="app-sidebar__logo">
                    <div className="app-sidebar__logo-badge">L</div>
                    <span className="app-sidebar__logo-text">LEBY</span>
                </Link>

                <nav className="app-sidebar__nav">
                    <Link
                        to="/dashboard"
                        className={`app-sidebar__nav-item ${
                            location.pathname === '/home' || location.pathname === '/dashboard'
                                ? 'is-active'
                                : ''
                        }`}
                    >
                        <LayoutDashboard size={20} />
                        <span>Dashboard</span>
                    </Link>

                    <Link
                        to="/learning-path"
                        className={`app-sidebar__nav-item ${
                            (location.pathname.startsWith('/learning-path') ||
                                location.pathname.startsWith('/modules')) &&
                            !location.pathname.includes('/test') &&
                            !location.pathname.includes('/result')
                                ? 'is-active'
                                : ''
                        }`}
                    >
                        <Compass size={20} />
                        <span>Lộ trình học</span>
                    </Link>

                    <Link
                        to="/results"
                        className={`app-sidebar__nav-item ${
                            location.pathname.startsWith('/results') ||
                            location.pathname.includes('/test/result')
                                ? 'is-active'
                                : ''
                        }`}
                    >
                        <Award size={20} />
                        <span>Kết quả</span>
                    </Link>

                    <Link
                        to="/profile"
                        className={`app-sidebar__nav-item ${
                            location.pathname === '/profile' ? 'is-active' : ''
                        }`}
                    >
                        <Settings size={20} />
                        <span>Cài đặt</span>
                    </Link>
                </nav>
            </div>

            <div className="app-sidebar__bottom">
                <Link to="/profile" className="app-sidebar__user-card" title="Xem thông tin cá nhân">
                    <img
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                        alt="Nguyễn Nam"
                        className="app-sidebar__avatar"
                    />
                    <div className="app-sidebar__user-info">
                        <span className="app-sidebar__user-name">Nguyễn Nam</span>
                        <span className="app-sidebar__user-badge">Học viên Premium</span>
                    </div>
                </Link>
            </div>
        </aside>
    );
}
