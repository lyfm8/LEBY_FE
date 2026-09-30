import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, BookOpen, HelpCircle,
  FileText, Target, Settings, LogOut, Menu
} from 'lucide-react';
import './admin-layout.css';

const navItems = [
  { path: '/admin', label: 'Tổng quan', icon: <LayoutDashboard size={20} />, exact: true },
  { path: '/admin/users', label: 'Quản lý Học viên', icon: <Users size={20} /> },
  { path: '/admin/parts', label: 'Quản lý Phần thi', icon: <Settings size={20} /> },
  { path: '/admin/questions', label: 'Ngân hàng Câu hỏi', icon: <HelpCircle size={20} /> },
  { path: '/admin/modules', label: 'Quản lý Khóa học', icon: <BookOpen size={20} /> },
  { path: '/admin/targets', label: 'Cấu hình Mục tiêu', icon: <Target size={20} /> },
  { path: '/admin/thresholds', label: 'Luật đánh giá', icon: <Settings size={20} /> },
  { path: '/admin/diagnostic-tests', label: 'Đề chẩn đoán', icon: <FileText size={20} /> },
];

export const AdminLayout: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="admin-layout-container">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h1 className="admin-sidebar-title">LEBY Admin</h1>
        </div>

        <nav className="admin-sidebar-nav">
          <ul className="admin-nav-list">
            {navItems.map((item) => (
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

        <div className="admin-sidebar-footer">
          <button onClick={() => navigate('/login')} className="admin-logout-btn">
            <LogOut size={20} />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="admin-main-wrapper">
        <header className="admin-header">
          <div className="admin-user-info">
            <div className="admin-avatar">A</div>
            <span className="admin-username">Admin</span>
          </div>
        </header>

        <main className="admin-main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
