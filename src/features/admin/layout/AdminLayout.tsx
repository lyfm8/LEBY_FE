import React, { useMemo, useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, BookOpen, HelpCircle,
  FileText, Target, Settings, LogOut, ExternalLink
} from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type { UserRole } from '@/features/auth/types/authTypes';
import './admin-layout.css';

interface AdminNavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  exact?: boolean;
  allowedRoles: UserRole[];
}

const navItems: AdminNavItem[] = [
  { path: '/admin', label: 'Tổng quan', icon: <LayoutDashboard size={20} />, exact: true, allowedRoles: ['ADMIN'] },
  { path: '/admin/users', label: 'Quản lý học viên', icon: <Users size={20} />, allowedRoles: ['ADMIN'] },
  { path: '/admin/parts', label: 'Phần thi & Năng lực', icon: <Settings size={20} />, allowedRoles: ['ADMIN', 'TEACHER'] },
  { path: '/admin/questions', label: 'Ngân hàng câu hỏi', icon: <HelpCircle size={20} />, allowedRoles: ['ADMIN', 'TEACHER'] },
  { path: '/admin/modules', label: 'Mô-đun & Bài học', icon: <BookOpen size={20} />, allowedRoles: ['ADMIN', 'TEACHER'] },
  { path: '/admin/targets', label: 'Mục tiêu điểm số', icon: <Target size={20} />, allowedRoles: ['ADMIN', 'TEACHER'] },
  { path: '/admin/thresholds', label: 'Ngưỡng & Quy tắc', icon: <Settings size={20} />, allowedRoles: ['ADMIN', 'TEACHER'] },
  { path: '/admin/diagnostic-tests', label: 'Đề thi chẩn đoán', icon: <FileText size={20} />, allowedRoles: ['ADMIN', 'TEACHER'] },
];

export const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isTeacher = user?.role === 'TEACHER';

  // Lọc danh sách menu đúng theo quyền của vai trò đang đăng nhập (ADMIN thấy đủ, TEACHER ẩn Dashboard & Users)
  const visibleNavItems = useMemo(() => {
    const currentRole: UserRole = user?.role ?? 'ADMIN';
    return navItems.filter((item) => item.allowedRoles.includes(currentRole));
  }, [user?.role]);

  const displayName = user?.fullName || (isTeacher ? 'Giảng viên' : 'Quản trị viên');
  const displayEmail = user?.email || '';
  const avatarInitial = displayName.trim().charAt(0).toUpperCase() || 'A';

  /**
   * Xử lý đăng xuất chuẩn UC03 cho tài khoản ADMIN và TEACHER:
   * Gọi API /api/auth/logout tăng tokenVersion + xóa HTTP-Only Cookie, sau đó replace về /login.
   */
  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="admin-layout-container">
      {/* Sidebar dọc đặc trưng cho Cổng Quản trị / Giảng viên */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <NavLink to={isTeacher ? '/admin/modules' : '/admin'} className="admin-sidebar-logo">
            <div className="admin-logo-icon">L</div>
            <div className="admin-sidebar-title-wrapper">
              <h1 className="admin-sidebar-title">LEBY</h1>
              <h2 className="admin-sidebar-subtitle">
                {isTeacher ? 'Cổng Giảng Viên' : 'Cổng Quản Trị'}
              </h2>
            </div>
          </NavLink>
        </div>

        <nav className="admin-sidebar-nav">
          <ul className="admin-nav-list">
            {visibleNavItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.exact}
                  className={({ isActive }) =>
                    `admin-nav-item ${isActive ? 'active' : ''}`
                  }
                >
                  {item.icon}
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Chân Sidebar: Thông tin tài khoản + Phím xem giao diện học viên + Nút Đăng xuất rõ ràng */}
        <div className="admin-sidebar-footer">
          <div className="admin-user-card">
            <div className="admin-avatar" style={{ width: '36px', height: '36px', flexShrink: 0 }}>
              {avatarInitial}
            </div>
            <div className="admin-user-meta">
              <span className="admin-username">{displayName}</span>
              <span className="admin-user-role">{displayEmail}</span>
            </div>
          </div>

          <div className="admin-footer-actions">
            <NavLink to="/dashboard" className="admin-switch-view-btn">
              <ExternalLink size={15} />
              <span>Giao diện học viên</span>
            </NavLink>

            <button
              type="button"
              onClick={() => void handleLogout()}
              className="admin-logout-btn"
              disabled={isLoggingOut}
            >
              <LogOut size={16} />
              <span>{isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main-content">
        <div className="admin-content-wrapper">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
