import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, BookOpen, HelpCircle,
  FileText, Target, Settings, LogOut, Menu
} from 'lucide-react';
import './admin-layout.css';

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={20} />, exact: true },
  { path: '/admin/users', label: 'Quản lý User', icon: <Users size={20} /> },
  { path: '/admin/parts', label: 'Part & Ability', icon: <Settings size={20} /> },
  { path: '/admin/questions', label: 'Ngân hàng câu hỏi', icon: <HelpCircle size={20} /> },
  { path: '/admin/modules', label: 'Module & Lesson', icon: <BookOpen size={20} /> },
  { path: '/admin/targets', label: 'Target Profile', icon: <Target size={20} /> },
  { path: '/admin/thresholds', label: 'Threshold & Rule', icon: <Settings size={20} /> },
  { path: '/admin/diagnostic-tests', label: 'Diagnostic Test', icon: <FileText size={20} /> },
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
              <h2 className="admin-sidebar-subtitle">Admin Portal</h2>
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
              <span className="admin-user-email">admin@leby.edu.vn</span>
            </div>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="admin-main-wrapper">
        <main className="admin-main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
