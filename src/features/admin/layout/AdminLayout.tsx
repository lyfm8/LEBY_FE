import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, BookOpen, HelpCircle,
  FileText, Target, Settings
} from 'lucide-react';
import './admin-layout.css';

const navItems = [
  { path: '/admin', label: 'Tổng quan', icon: <LayoutDashboard size={20} />, exact: true },
  { path: '/admin/users', label: 'Quản lý học viên', icon: <Users size={20} /> },
  { path: '/admin/parts', label: 'Phần thi & Năng lực', icon: <Settings size={20} /> },
  { path: '/admin/questions', label: 'Ngân hàng câu hỏi', icon: <HelpCircle size={20} /> },
  { path: '/admin/modules', label: 'Mô-đun & Bài học', icon: <BookOpen size={20} /> },
  { path: '/admin/targets', label: 'Mục tiêu điểm số', icon: <Target size={20} /> },
  { path: '/admin/thresholds', label: 'Ngưỡng & Quy tắc', icon: <Settings size={20} /> },
  { path: '/admin/diagnostic-tests', label: 'Đề thi chẩn đoán', icon: <FileText size={20} /> },
];

export const AdminLayout: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="admin-layout-container">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <NavLink to="/admin" className="admin-sidebar-logo">
            <div className="admin-logo-icon">L</div>
            <div className="admin-sidebar-title-wrapper">
              <h1 className="admin-sidebar-title">LEBY</h1>
              <h2 className="admin-sidebar-subtitle">Cổng Quản Trị</h2>
            </div>
          </NavLink>
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
            <div className="admin-avatar" style={{ width: '32px', height: '32px' }}>A</div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span className="admin-username" style={{ color: 'white' }}>Quản trị viên</span>
              <span className="admin-user-role" style={{ color: '#9ca3af' }}>admin@leby.edu.vn</span>
            </div>
          </button>
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
