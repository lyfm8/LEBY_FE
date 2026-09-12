import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Route, Award, Settings } from 'lucide-react';

export function ModuleTestResultSidebar() {
    const location = useLocation();

    const navItems = [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { label: 'Lộ trình học', path: '/learning-path', icon: Route },
        { label: 'Kết quả', path: '/results', icon: Award },
        { label: 'Cài đặt', path: '/profile', icon: Settings },
    ];

    return (
        <aside className="report-sidebar" aria-label="Điều hướng chính">
            {/* Logo */}
            <Link to="/dashboard" className="report-sidebar-logo">
                <div className="report-logo-icon">L</div>
                <span className="report-logo-text">LEBY</span>
            </Link>

            {/* Nav Menu */}
            <nav className="report-sidebar-nav">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname.startsWith(item.path);
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`report-nav-item ${isActive ? 'report-nav-item--active' : ''}`}
                        >
                            <Icon size={18} />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Mini User Profile Card */}
            <div className="report-sidebar-footer">
                <Link to="/profile" className="report-user-card">
                    <img
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                        alt="Nguyễn Nam"
                        className="report-user-avatar"
                    />
                    <div className="report-user-info">
                        <div className="report-user-name">Nguyễn Nam</div>
                        <div className="report-user-role">Học viên Premium</div>
                    </div>
                </Link>
            </div>
        </aside>
    );
}
