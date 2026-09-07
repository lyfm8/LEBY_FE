import { Link, useLocation } from 'react-router-dom';

interface DashboardHeaderProps {
    targetScore?: number;
    userName?: string;
    avatarUrl?: string | null;
}

export function DashboardHeader({
    targetScore = 650,
    userName = 'Nguyễn Nam',
    avatarUrl,
}: DashboardHeaderProps) {
    const location = useLocation();

    return (
        <header className="db-header">
            <div className="db-header__container">
                <div className="db-header__left">
                    <Link to="/home" className="db-header__logo">
                        <div className="db-header__logo-badge">L</div>
                        <span className="db-header__logo-text">LEBY</span>
                    </Link>

                    <nav className="db-header__nav" aria-label="Điều hướng chính">
                        <Link
                            to="/home"
                            className={`db-header__nav-item ${location.pathname === '/home' || location.pathname === '/dashboard' ? 'is-active' : ''}`}
                        >
                            Dashboard
                        </Link>
                        <Link
                            to="/learning-path"
                            className={`db-header__nav-item ${location.pathname.startsWith('/learning-path') || location.pathname.startsWith('/modules') ? 'is-active' : ''}`}
                        >
                            Lộ trình
                        </Link>
                        <Link
                            to="/diagnostic/results/501"
                            className={`db-header__nav-item ${location.pathname.startsWith('/diagnostic') ? 'is-active' : ''}`}
                        >
                            Kết quả
                        </Link>
                        <Link
                            to="/profile"
                            className={`db-header__nav-item ${location.pathname === '/profile' ? 'is-active' : ''}`}
                        >
                            Cài đặt
                        </Link>
                    </nav>
                </div>

                <div className="db-header__right">
                    <Link to="/target-selection" className="db-header__target-badge" title="Đổi mục tiêu">
                        Mục tiêu: {targetScore}
                    </Link>

                    <Link to="/profile" className="db-header__user-pill">
                        {avatarUrl ? (
                            <img src={avatarUrl} alt={userName} className="db-header__avatar" />
                        ) : (
                            <div className="db-header__avatar-fallback">
                                {userName.charAt(0)}
                            </div>
                        )}
                        <span className="db-header__user-name">{userName}</span>
                    </Link>
                </div>
            </div>
        </header>
    );
}
