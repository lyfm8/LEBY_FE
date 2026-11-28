import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Compass,
    BookOpen,
    ClipboardCheck,
    Settings,
    Target,
    Shield,
    LogOut,
    ChevronDown,
    FileText,
} from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type { UserRole } from '@/features/auth/types/authTypes';
import '../roadmap.css';

const ROLE_LABELS: Record<UserRole, string> = {
    STUDENT: 'Học viên LEBY',
    TEACHER: 'Giảng viên',
    ADMIN: 'Quản trị viên',
};

/**
 * Thanh điều hướng ngang trên đầu (Top Navigation Bar) cho không gian học tập của người dùng (Học viên).
 * Giữ tên export `SidebarNav` để tương thích ngược 100% với tất cả các trang (Dashboard, Roadmap, Profile, ModuleTest)
 * mà không cần sửa đổi các file thuộc phạm vi đồng đội.
 *
 * Cấu trúc:
 * - Trái: Logo thương hiệu LEBY
 * - Giữa: Các mục tác vụ học tập nằm ngang (Tổng quan, Lộ trình học, Phòng thi, Kết quả)
 * - Phải: Nút chuyển nhanh Cổng Quản trị (nếu là ADMIN/TEACHER) + Dropdown tài khoản có nút Đăng xuất (UC03)
 * - Di động (<= 900px): Giữ Topbar gọn (Logo + Avatar/Đăng xuất) kết hợp thanh điều hướng dưới đáy
 */
export function SidebarNav() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    // Trạng thái mở menu thả xuống của tài khoản cá nhân
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    // Trạng thái mở menu thả xuống của mục Phòng thi (Chẩn đoán vs Đề thi thật ETS)
    const [isExamMenuOpen, setIsExamMenuOpen] = useState(false);
    // Trạng thái khóa nút trong lúc chờ API đăng xuất hoàn tất
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    // Ref gắn vào khối dropdown tài khoản để phát hiện click bên ngoài
    const menuRef = useRef<HTMLDivElement | null>(null);
    // Ref gắn vào khối dropdown Phòng thi để tự đóng khi click ra ngoài
    const examMenuRef = useRef<HTMLDivElement | null>(null);

    const displayName = user?.fullName?.trim() || 'Học viên LEBY';
    const displayEmail = user?.email || '';
    const roleLabel = user?.role ? ROLE_LABELS[user.role] : 'Học viên LEBY';
    const avatarInitial = displayName.charAt(0).toUpperCase();
    const isAdminOrTeacher = user?.role === 'ADMIN' || user?.role === 'TEACHER';
    const adminPortalPath = user?.role === 'TEACHER' ? '/admin/modules' : '/admin';

    // Tự động đóng dropdown tài khoản hoặc Phòng thi khi người dùng click ra ngoài hoặc nhấn Escape
    useEffect(() => {
        // Không cần gắn listener nếu cả hai menu đều đang đóng
        if (!isMenuOpen && !isExamMenuOpen) return;

        // Xử lý click ngoài phạm vi ref của từng dropdown để đóng menu tương ứng
        const handleClickOutside = (event: MouseEvent) => {
            // Chuyển target sang Node phục vụ hàm contains
            const targetNode = event.target as Node;
            // Đóng dropdown tài khoản nếu click nằm ngoài khối menuRef
            if (isMenuOpen && menuRef.current && !menuRef.current.contains(targetNode)) {
                setIsMenuOpen(false);
            }
            // Đóng dropdown Phòng thi nếu click nằm ngoài khối examMenuRef
            if (isExamMenuOpen && examMenuRef.current && !examMenuRef.current.contains(targetNode)) {
                setIsExamMenuOpen(false);
            }
        };

        // Đóng toàn bộ dropdown đang mở khi nhấn phím Escape
        const handleKeyDown = (event: KeyboardEvent) => {
            // Kiểm tra đúng phím Escape trước khi cập nhật state
            if (event.key === 'Escape') {
                setIsMenuOpen(false);
                setIsExamMenuOpen(false);
            }
        };

        // Đăng ký sự kiện chuột và bàn phím lên document
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);
        // Dọn dẹp listener khi effect unmount hoặc dependencies thay đổi
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isMenuOpen, isExamMenuOpen]);

    // Tự đóng tất cả dropdown khi điều hướng sang route mới
    useEffect(() => {
        // Đặt lại state đóng cho dropdown tài khoản
        setIsMenuOpen(false);
        // Đặt lại state đóng cho dropdown Phòng thi
        setIsExamMenuOpen(false);
    }, [location.pathname]);

    // Xác định mục menu đang active theo URL hiện tại.
    // Lưu ý: isRoadmapActive loại trừ '/test' và '/result' để khi học viên xem kết quả thi vượt ải
    // (/modules/:id/test/result) thì mục "Kết quả" được highlight thay vì trùng với "Lộ trình học".
    const isDashboardActive = location.pathname === '/home' || location.pathname === '/dashboard';
    const isRoadmapActive =
        (location.pathname.startsWith('/learning-path') || location.pathname.startsWith('/modules')) &&
        !location.pathname.includes('/test') &&
        !location.pathname.includes('/result');
    // Kiểm tra người dùng có đang ở màn hình Thư viện khóa học 7 Part hay không
    const isCatalogActive = location.pathname.startsWith('/catalog');
    // Kiểm tra người dùng đang ở nhánh thi chẩn đoán đầu vào hay chọn mục tiêu
    const isDiagnosticRoomActive =
        location.pathname.startsWith('/diagnostic') || location.pathname.startsWith('/target-selection');
    // Kiểm tra người dùng đang ở nhánh phòng thi thử ETS 200 câu
    const isMockExamActive = location.pathname.startsWith('/mock-exam');
    // Highlight mục Phòng thi khi học viên truy cập một trong hai nhánh thi
    const isDiagnosticActive = isDiagnosticRoomActive || isMockExamActive;
    const isProfileActive = location.pathname === '/profile';

    /**
     * Xử lý đăng xuất an toàn (UC03): gọi BE thu hồi tokenVersion + xóa HTTP-Only Cookie,
     * xóa AuthContext phía FE và chuyển hướng replace về trang /login.
     */
    const handleLogout = async () => {
        if (isLoggingOut) return;
        setIsLoggingOut(true);
        try {
            await logout();
        } finally {
            setIsLoggingOut(false);
            setIsMenuOpen(false);
            navigate('/login', { replace: true });
        }
    };

    return (
        <>
            <header className="app-topbar" aria-label="Thanh điều hướng chính">
                <div className="app-topbar__inner">
                    {/* 1. Khối Trái: Logo thương hiệu LEBY */}
                    <Link to="/dashboard" className="app-topbar__brand">
                        <div className="app-topbar__logo-badge">L</div>
                        <div className="app-topbar__brand-text">
                            <span className="app-topbar__logo-name">LEBY</span>
                            <span className="app-topbar__logo-tag">TOEIC Adaptive</span>
                        </div>
                    </Link>

                    {/* 2. Khối Giữa: Thanh tác vụ nằm ngang (Desktop) */}
                    <nav className="app-topbar__nav" aria-label="Điều hướng học tập">
                        <Link
                            to="/dashboard"
                            className={`app-topbar__nav-item ${isDashboardActive ? 'is-active' : ''}`}
                        >
                            <LayoutDashboard size={18} />
                            <span>Tổng quan</span>
                        </Link>

                        <Link
                            to="/learning-path"
                            className={`app-topbar__nav-item ${isRoadmapActive ? 'is-active' : ''}`}
                        >
                            <Compass size={18} />
                            <span>Lộ trình học</span>
                        </Link>

                        {/* Liên kết sang Thư viện toàn bộ khóa học 7 Part TOEIC */}
                        <Link
                            to="/catalog"
                            className={`app-topbar__nav-item ${isCatalogActive ? 'is-active' : ''}`}
                        >
                            <BookOpen size={18} />
                            <span>Thư viện</span>
                        </Link>

                        {/* Mục Phòng thi xổ xuống chọn giữa Thi chẩn đoán và Đề thi thật ETS */}
                        <div className="app-topbar__nav-dropdown-wrap" ref={examMenuRef}>
                            <button
                                type="button"
                                className={`app-topbar__nav-item app-topbar__nav-trigger ${isDiagnosticActive ? 'is-active' : ''}`}
                                onClick={() => setIsExamMenuOpen((prev) => !prev)}
                                aria-expanded={isExamMenuOpen}
                                aria-haspopup="menu"
                            >
                                <ClipboardCheck size={18} />
                                <span>Phòng thi</span>
                                <ChevronDown
                                    size={15}
                                    className={`app-topbar__nav-chevron ${isExamMenuOpen ? 'is-rotated' : ''}`}
                                />
                            </button>

                            {isExamMenuOpen && (
                                <div
                                    className="app-topbar__nav-dropdown"
                                    role="menu"
                                    aria-label="Chọn loại phòng thi"
                                >
                                    <Link
                                        to="/diagnostic/room"
                                        className={`app-topbar__nav-subitem ${isDiagnosticRoomActive ? 'is-active' : ''}`}
                                        role="menuitem"
                                    >
                                        <span className="app-topbar__nav-subicon is-diagnostic">
                                            <ClipboardCheck size={16} />
                                        </span>
                                        <span className="app-topbar__nav-subbody">
                                            <span className="app-topbar__nav-subtitle">Thi chẩn đoán đầu vào</span>
                                            <span className="app-topbar__nav-subdesc">
                                                Đánh giá năng lực 7 Part (48 câu)
                                            </span>
                                        </span>
                                    </Link>

                                    <Link
                                        to="/mock-exam"
                                        className={`app-topbar__nav-subitem ${isMockExamActive ? 'is-active' : ''}`}
                                        role="menuitem"
                                    >
                                        <span className="app-topbar__nav-subicon is-mock">
                                            <FileText size={16} />
                                        </span>
                                        <span className="app-topbar__nav-subbody">
                                            <span className="app-topbar__nav-subtitle">Đề thi thật ETS</span>
                                            <span className="app-topbar__nav-subdesc">
                                                Đề luyện tập &amp; Thi đầu ra (200 câu)
                                            </span>
                                        </span>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </nav>

                    {/* 3. Khối Phải: Phím tắt Quản trị (nếu có quyền) & Menu tài khoản + Đăng xuất */}
                    <div className="app-topbar__actions">
                        {isAdminOrTeacher && (
                            <Link
                                to={adminPortalPath}
                                className="app-topbar__portal-btn"
                                title="Quay lại giao diện quản trị nội dung"
                            >
                                <Shield size={15} />
                                <span>{user?.role === 'TEACHER' ? 'Cổng Giảng viên' : 'Cổng Quản trị'}</span>
                            </Link>
                        )}

                        <div className="app-topbar__account" ref={menuRef}>
                            <button
                                type="button"
                                className={`app-topbar__user-trigger ${isMenuOpen ? 'is-open' : ''}`}
                                onClick={() => setIsMenuOpen((prev) => !prev)}
                                aria-expanded={isMenuOpen}
                                aria-haspopup="menu"
                            >
                                {user?.avatar ? (
                                    <img
                                        src={user.avatar}
                                        alt={displayName}
                                        className="app-topbar__avatar"
                                    />
                                ) : (
                                    <div className="app-topbar__avatar-fallback" aria-hidden="true">
                                        {avatarInitial}
                                    </div>
                                )}
                                <span className="app-topbar__user-name">{displayName}</span>
                                <ChevronDown
                                    size={16}
                                    className={`app-topbar__chevron ${isMenuOpen ? 'is-rotated' : ''}`}
                                />
                            </button>

                            {isMenuOpen && (
                                <div className="app-topbar__dropdown" role="menu">
                                    <div className="app-topbar__dropdown-header">
                                        <span className="app-topbar__dropdown-name">{displayName}</span>
                                        {displayEmail && (
                                            <span className="app-topbar__dropdown-email">{displayEmail}</span>
                                        )}
                                        <span className="app-topbar__dropdown-role">{roleLabel}</span>
                                    </div>

                                    <div className="app-topbar__dropdown-list">
                                        <Link
                                            to="/profile"
                                            className={`app-topbar__dropdown-item ${isProfileActive ? 'is-active' : ''}`}
                                            role="menuitem"
                                        >
                                            <Settings size={16} />
                                            <span>Hồ sơ &amp; Cài đặt</span>
                                        </Link>

                                        <Link
                                            to="/target-selection"
                                            className="app-topbar__dropdown-item"
                                            role="menuitem"
                                        >
                                            <Target size={16} />
                                            <span>Mục tiêu điểm TOEIC (AIM)</span>
                                        </Link>

                                        {isAdminOrTeacher && (
                                            <Link
                                                to={adminPortalPath}
                                                className="app-topbar__dropdown-item"
                                                role="menuitem"
                                            >
                                                <Shield size={16} />
                                                <span>
                                                    {user?.role === 'TEACHER'
                                                        ? 'Vào Cổng Giảng viên'
                                                        : 'Vào Cổng Quản trị'}
                                                </span>
                                            </Link>
                                        )}
                                    </div>

                                    <div className="app-topbar__dropdown-divider" />

                                    <button
                                        type="button"
                                        className="app-topbar__dropdown-item is-danger"
                                        onClick={() => void handleLogout()}
                                        disabled={isLoggingOut}
                                        role="menuitem"
                                    >
                                        <LogOut size={16} />
                                        <span>{isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

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
                {/* Mục Thư viện khóa học trên thanh điều hướng nhanh di động */}
                <Link
                    to="/catalog"
                    className={`app-mobile-nav__item ${isCatalogActive ? 'is-active' : ''}`}
                >
                    <BookOpen size={20} />
                    <span>Thư viện</span>
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
